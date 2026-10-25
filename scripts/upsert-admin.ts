import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

type CliOptions = {
    envFile?: string;
    dryRun: boolean;
};

function parseArgs(argv: string[]): CliOptions {
    const options: CliOptions = { dryRun: false };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];

        if (arg === '--env') {
            options.envFile = argv[index + 1];
            index += 1;
        } else if (arg === '--dry-run') {
            options.dryRun = true;
        }
    }

    return options;
}

function resolveEnvFile(explicitPath?: string) {
    const candidates = explicitPath
        ? [explicitPath]
        : [
              process.env.ENV_FILE,
              '.env.local',
              '.env.production',
              '.env',
          ].filter(Boolean) as string[];

    for (const candidate of candidates) {
        const absolutePath = path.resolve(process.cwd(), candidate);
        if (fs.existsSync(absolutePath)) {
            return absolutePath;
        }
    }

    throw new Error(
        explicitPath
            ? `Environment file not found: ${explicitPath}`
            : 'No environment file found. Checked .env.local, .env.production, and .env.'
    );
}

const cliOptions = parseArgs(process.argv.slice(2));
const envFile = resolveEnvFile(cliOptions.envFile);
dotenv.config({ path: envFile });

const rawMongoUri = process.env.MONGODB_URI;
const rawAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const rawAdminPassword = process.env.ADMIN_PASSWORD?.trim();
const ADMIN_NAME = process.env.ADMIN_NAME?.trim() || 'Almina Couture Admin';

if (!rawMongoUri) {
    throw new Error(`MONGODB_URI is missing in ${path.basename(envFile)}`);
}

if (!rawAdminEmail) {
    throw new Error(`ADMIN_EMAIL is missing in ${path.basename(envFile)}`);
}

if (!rawAdminPassword) {
    throw new Error(`ADMIN_PASSWORD is missing in ${path.basename(envFile)}`);
}

const MONGODB_URI = rawMongoUri;
const ADMIN_EMAIL = rawAdminEmail;
const ADMIN_PASSWORD = rawAdminPassword;

const AdminSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        name: { type: String, default: 'Admin' },
        role: { type: String, default: 'admin', enum: ['admin'] },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },
        lastLogin: { type: Date, default: null },
    },
    {
        timestamps: true,
    }
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function main() {
    await mongoose.connect(MONGODB_URI);

    const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL }).lean();
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (cliOptions.dryRun) {
        console.log(`ENV_FILE:${path.basename(envFile)}`);
        console.log(`TARGET_ADMIN:${ADMIN_EMAIL}`);
        console.log(`ACTION:${existingAdmin ? 'update-existing' : 'create-new'}`);
        await mongoose.disconnect();
        return;
    }

    await Admin.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        {
            $set: {
                email: ADMIN_EMAIL,
                passwordHash,
                name: (existingAdmin as any)?.name || ADMIN_NAME,
                role: 'admin',
            },
            $setOnInsert: {
                createdAt: new Date(),
            },
        },
        {
            upsert: true,
            new: true,
        }
    );

    console.log(`Admin upserted for ${ADMIN_EMAIL} using ${path.basename(envFile)}`);
    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error('Admin upsert failed:', error);
    try {
        await mongoose.disconnect();
    } catch {}
    process.exit(1);
});
