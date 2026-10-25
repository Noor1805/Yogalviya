import assert from 'node:assert/strict';

import { resolveAuthEnvironment } from '../lib/auth-env.ts';

const runCase = (name: string, assertion: () => void) => {
  try {
    assertion();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

runCase('prefers AUTH_SECRET and AUTH_URL when both legacy and canonical vars exist', () => {
  const resolved = resolveAuthEnvironment({
    AUTH_SECRET: 'primary-secret',
    NEXTAUTH_SECRET: 'legacy-secret',
    AUTH_URL: 'https://store.example.com/api/auth',
    NEXTAUTH_URL: 'https://legacy.example.com/api/auth',
  });

  assert.equal(resolved.secret, 'primary-secret');
  assert.equal(resolved.url, 'https://store.example.com/api/auth');
  assert.equal(resolved.warnings.length, 2);
});

runCase('accepts matching auth URLs even when one has a trailing slash', () => {
  const resolved = resolveAuthEnvironment({
    AUTH_SECRET: 'shared-secret',
    NEXTAUTH_SECRET: 'shared-secret',
    AUTH_URL: 'https://store.example.com/api/auth/',
    NEXTAUTH_URL: 'https://store.example.com/api/auth',
  });

  assert.equal(resolved.warnings.length, 0);
});

runCase('falls back to NEXTAUTH variables when AUTH variables are missing', () => {
  const resolved = resolveAuthEnvironment({
    AUTH_SECRET: '',
    NEXTAUTH_SECRET: 'legacy-secret',
    AUTH_URL: '',
    NEXTAUTH_URL: 'https://store.example.com/api/auth',
  });

  assert.equal(resolved.secret, 'legacy-secret');
  assert.equal(resolved.url, 'https://store.example.com/api/auth');
  assert.equal(resolved.warnings.length, 0);
});

runCase('treats loopback auth URLs as dynamic host configuration', () => {
  const resolved = resolveAuthEnvironment({
    AUTH_SECRET: 'shared-secret',
    NEXTAUTH_SECRET: 'shared-secret',
    AUTH_URL: 'http://localhost:3000/api/auth',
    NEXTAUTH_URL: 'http://localhost:3000/api/auth',
  });

  assert.equal(resolved.secret, 'shared-secret');
  assert.equal(resolved.url, undefined);
  assert.equal(resolved.useDynamicHost, true);
  assert.equal(
    resolved.warnings.includes(
      'Ignoring loopback AUTH_URL/NEXTAUTH_URL so auth can use the current request host. This keeps mobile and alternate local ports working.'
    ),
    true
  );
});
