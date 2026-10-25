const AUTH_ROUTE_BASE_PATH = '/api/auth';

export const AUTH_SESSION_COOKIE_NAMES = [
    '__Secure-authjs.session-token',
    'authjs.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.session-token',
] as const;

type AuthEnvironment = {
    secret?: string;
    url?: string;
    useDynamicHost: boolean;
    warnings: string[];
};

const emittedWarnings = new Set<string>();

function normalizeEnvValue(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
}

function normalizeUrlForComparison(value?: string) {
    if (!value) {
        return undefined;
    }

    try {
        const url = new URL(value);
        const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
        return `${url.origin}${normalizedPath}`;
    } catch {
        return value;
    }
}

function isLoopbackUrl(value?: string) {
    if (!value) {
        return false;
    }

    try {
        const url = new URL(value);
        return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    } catch {
        return false;
    }
}

export function resolveAuthEnvironment(env: {
    AUTH_SECRET?: string;
    NEXTAUTH_SECRET?: string;
    AUTH_URL?: string;
    NEXTAUTH_URL?: string;
}): AuthEnvironment {
    const authSecret = normalizeEnvValue(env.AUTH_SECRET);
    const nextAuthSecret = normalizeEnvValue(env.NEXTAUTH_SECRET);
    const authUrl = normalizeEnvValue(env.AUTH_URL);
    const nextAuthUrl = normalizeEnvValue(env.NEXTAUTH_URL);

    const warnings: string[] = [];

    if (authSecret && nextAuthSecret && authSecret !== nextAuthSecret) {
        warnings.push(
            'AUTH_SECRET and NEXTAUTH_SECRET do not match. Using AUTH_SECRET as the canonical session secret.'
        );
    }

    const normalizedAuthUrl = normalizeUrlForComparison(authUrl);
    const normalizedNextAuthUrl = normalizeUrlForComparison(nextAuthUrl);
    const configuredUrl = authUrl ?? nextAuthUrl;
    const useDynamicHost = isLoopbackUrl(configuredUrl);

    if (
        normalizedAuthUrl &&
        normalizedNextAuthUrl &&
        normalizedAuthUrl !== normalizedNextAuthUrl
    ) {
        warnings.push(
            `AUTH_URL (${normalizedAuthUrl}) and NEXTAUTH_URL (${normalizedNextAuthUrl}) do not match. Using AUTH_URL as the canonical auth URL.`
        );
    }

    if (useDynamicHost) {
        warnings.push(
            'Ignoring loopback AUTH_URL/NEXTAUTH_URL so auth can use the current request host. This keeps mobile and alternate local ports working.'
        );
    }

    return {
        secret: authSecret ?? nextAuthSecret,
        url: useDynamicHost ? undefined : configuredUrl,
        useDynamicHost,
        warnings,
    };
}

export function normalizeAuthEnvironment() {
    const resolved = resolveAuthEnvironment({
        AUTH_SECRET: process.env.AUTH_SECRET,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        AUTH_URL: process.env.AUTH_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    });

    if (resolved.secret) {
        process.env.AUTH_SECRET = resolved.secret;
        process.env.NEXTAUTH_SECRET = resolved.secret;
    }

    if (resolved.url) {
        process.env.AUTH_URL = resolved.url;
        process.env.NEXTAUTH_URL = resolved.url;
    } else if (resolved.useDynamicHost) {
        delete process.env.AUTH_URL;
        delete process.env.NEXTAUTH_URL;
    }

    for (const warning of resolved.warnings) {
        if (!emittedWarnings.has(warning)) {
            emittedWarnings.add(warning);
            console.warn(`[auth] ${warning}`);
        }
    }

    return resolved;
}

export function getAuthSecret() {
    return normalizeAuthEnvironment().secret;
}

export function getAuthBasePath() {
    return AUTH_ROUTE_BASE_PATH;
}
