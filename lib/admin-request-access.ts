type AdminRequestAccessInput = {
    hasSessionCookie: boolean;
    hasToken: boolean;
    tokenRole?: string;
};

export type AdminRequestAccessDecision =
    | {
          kind: 'allow';
          reason: 'admin_token' | 'ambiguous_session';
      }
    | {
          kind: 'reject';
          reason: 'unauthorized' | 'admin_required';
      };

function normalizeRole(tokenRole?: string) {
    const normalized = tokenRole?.trim();
    return normalized ? normalized : undefined;
}

export function resolveAdminRequestAccess({
    hasSessionCookie,
    hasToken,
    tokenRole,
}: AdminRequestAccessInput): AdminRequestAccessDecision {
    const role = normalizeRole(tokenRole);

    if (role === 'admin') {
        return {
            kind: 'allow',
            reason: 'admin_token',
        };
    }

    if (role) {
        return {
            kind: 'reject',
            reason: 'admin_required',
        };
    }

    if (hasToken || hasSessionCookie) {
        return {
            kind: 'allow',
            reason: 'ambiguous_session',
        };
    }

    return {
        kind: 'reject',
        reason: 'unauthorized',
    };
}
