import assert from 'node:assert/strict';

import { resolveAdminRequestAccess } from '../lib/admin-request-access.ts';

const runCase = (name: string, assertion: () => void) => {
    try {
        assertion();
        console.log(`PASS ${name}`);
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
};

runCase('allows confirmed admin tokens', () => {
    assert.deepEqual(
        resolveAdminRequestAccess({
            hasSessionCookie: true,
            hasToken: true,
            tokenRole: 'admin',
        }),
        { kind: 'allow', reason: 'admin_token' }
    );
});

runCase('rejects authenticated non-admin tokens', () => {
    assert.deepEqual(
        resolveAdminRequestAccess({
            hasSessionCookie: true,
            hasToken: true,
            tokenRole: 'customer',
        }),
        { kind: 'reject', reason: 'admin_required' }
    );
});

runCase('defers ambiguous session cookies to server-side verification', () => {
    assert.deepEqual(
        resolveAdminRequestAccess({
            hasSessionCookie: true,
            hasToken: false,
        }),
        { kind: 'allow', reason: 'ambiguous_session' }
    );
});

runCase('rejects anonymous requests', () => {
    assert.deepEqual(
        resolveAdminRequestAccess({
            hasSessionCookie: false,
            hasToken: false,
        }),
        { kind: 'reject', reason: 'unauthorized' }
    );
});
