import '@/lib/auth-bootstrap';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
import Customer from '@/lib/models/Customer';
import { getAuthBasePath, getAuthSecret } from '@/lib/auth-env';

const PERSISTENT_SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const authSecret = getAuthSecret();

function normalizeEmail(email?: string | null) {
    return typeof email === 'string' ? email.toLowerCase().trim() : '';
}

async function rehydrateSessionToken(token: JWT) {
    const normalizedEmail = normalizeEmail(token.email);
    const subject = typeof token.sub === 'string' && token.sub.trim() ? token.sub : '';

    await dbConnect();

    if (subject) {
        const admin = await Admin.findById(subject).select('_id email name role').lean();

        if (admin) {
            token.sub = String(admin._id);
            token.email = admin.email;
            token.name = admin.name;
            token.role = admin.role;
            return token;
        }

        const customer = await Customer.findById(subject).select('_id email name').lean();

        if (customer) {
            token.sub = String(customer._id);
            token.email = customer.email;
            token.name = customer.name;
            token.role = 'customer';
            return token;
        }
    }

    if (!normalizedEmail) {
        return token;
    }

    const [adminByEmail, customerByEmail] = await Promise.all([
        Admin.findOne({ email: normalizedEmail }).select('_id email name role').lean(),
        Customer.findOne({ email: normalizedEmail }).select('_id email name').lean(),
    ]);

    if (adminByEmail && !customerByEmail) {
        token.sub = String(adminByEmail._id);
        token.email = adminByEmail.email;
        token.name = adminByEmail.name;
        token.role = adminByEmail.role;
        return token;
    }

    if (customerByEmail && !adminByEmail) {
        token.sub = String(customerByEmail._id);
        token.email = customerByEmail.email;
        token.name = customerByEmail.name;
        token.role = 'customer';
    }

    return token;
}

const providers: NonNullable<NextAuthConfig['providers']> = [
    Credentials({
            id: 'admin-login',
            name: 'Admin Login',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await dbConnect();

                const admin = await Admin.findOne({
                    email: (credentials.email as string).toLowerCase(),
                });

                if (!admin) {
                    return null;
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    admin.passwordHash
                );

                if (!isValid) {
                    return null;
                }

                // Update last login
                admin.lastLogin = new Date();
                await admin.save();

                return {
                    id: String(admin._id),
                    email: admin.email,
                    name: admin.name,
                    role: admin.role,
                };
            },
        }),
    Credentials({
            id: 'customer-login',
            name: 'Customer Login',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                
                await dbConnect();
                
                const customer = await Customer.findOne({
                    email: (credentials.email as string).toLowerCase(),
                });
                
                if (!customer) return null;
                
                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    customer.passwordHash
                );
                
                if (!isValid) return null;
                
                customer.lastLogin = new Date();
                await customer.save();
                
                return {
                    id: String(customer._id),
                    email: customer.email,
                    name: customer.name,
                    role: 'customer',
                };
            },
        }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: 'select_account',
                },
            },
        })
    );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers,
    secret: authSecret,
    basePath: getAuthBasePath(),
    trustHost: true,
    session: {
        strategy: 'jwt',
        maxAge: PERSISTENT_SESSION_MAX_AGE,
    },
    jwt: {
        maxAge: PERSISTENT_SESSION_MAX_AGE,
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider !== 'google' || !user.email) {
                return true;
            }

            await dbConnect();

            const normalizedEmail = user.email.toLowerCase();
            let customer = await Customer.findOne({ email: normalizedEmail });

            if (!customer) {
                customer = await Customer.create({
                    email: normalizedEmail,
                    name: user.name?.trim() || normalizedEmail.split('@')[0],
                    passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
                    addresses: [],
                    wishlist: [],
                    savedPaymentMethods: [],
                });
            } else if (user.name && customer.name !== user.name.trim()) {
                customer.name = user.name.trim();
                await customer.save();
            }

            (user as { id?: string; role?: string; name?: string }).id = String(customer._id);
            (user as { id?: string; role?: string; name?: string }).role = 'customer';
            user.name = customer.name;

            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.role = (user as { role?: string }).role;
                if ((user as { id?: string }).id) {
                    token.sub = (user as { id?: string }).id;
                }
            }

            if ((account?.provider === 'google' || (!token.role && token.email)) && token.email) {
                await dbConnect();
                const customer = await Customer.findOne({
                    email: normalizeEmail(token.email),
                }).select('_id name');

                if (customer) {
                    token.role = 'customer';
                    token.sub = String(customer._id);
                    token.name = customer.name;
                }
            }

            if (!token.role || !token.sub) {
                return rehydrateSessionToken(token);
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { role?: string }).role = token.role as string;
                (session.user as { id?: string }).id = token.sub;
            }
            return session;
        },
    },
});
