import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ──────────────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
    findFirstToken: vi.fn(),
    findUniqueUser: vi.fn(),
    updateUser: vi.fn(),
    deleteManyTokens: vi.fn(),
    transaction: vi.fn(),
    createAuditLog: vi.fn().mockResolvedValue(undefined),
    rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 4 }),
    hash: vi.fn().mockResolvedValue('hashed-password'),
    checkPasswordStrength: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        passwordResetToken: {
            findFirst: mocks.findFirstToken,
            deleteMany: mocks.deleteManyTokens,
        },
        user: {
            findUnique: mocks.findUniqueUser,
            update: mocks.updateUser,
        },
        $transaction: mocks.transaction,
    },
}));
vi.mock('@/lib/rate-limit', () => ({ rateLimit: mocks.rateLimit }));
vi.mock('@/lib/audit', () => ({
    createAuditLog: mocks.createAuditLog,
    AuditAction: { PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE' },
}));
vi.mock('@/lib/password-strength', () => ({
    checkPasswordStrength: mocks.checkPasswordStrength,
}));
vi.mock('bcryptjs', () => ({ hash: mocks.hash }));

import { POST } from './route';

function makeRequest(body: unknown, ip = '9.9.9.9') {
    return new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
        body: JSON.stringify(body),
    }) as unknown as Parameters<typeof POST>[0];
}

describe('POST /api/auth/reset-password', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.rateLimit.mockResolvedValue({ success: true, remaining: 4 });
        mocks.checkPasswordStrength.mockReturnValue({ valid: true, score: 4 });
        mocks.transaction.mockResolvedValue([{}, {}]);
    });

    it('returns 429 when rate-limited', async () => {
        mocks.rateLimit.mockResolvedValueOnce({ success: false, remaining: 0 });
        const res = await POST(makeRequest({ token: 't', email: 'a@b.co', password: 'x' }));
        expect(res.status).toBe(429);
    });

    it('rejects malformed input with 400', async () => {
        const res = await POST(makeRequest({ token: '', email: 'not-an-email', password: '' }));
        expect(res.status).toBe(400);
    });

    it('rejects weak passwords with 400 and the strength reason', async () => {
        mocks.checkPasswordStrength.mockReturnValueOnce({ valid: false, score: 1, reason: 'too weak' });
        const res = await POST(makeRequest({ token: 'abc', email: 'a@b.co', password: 'weak' }));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('too weak');
    });

    it('returns invalid_token when the token does not exist', async () => {
        mocks.findFirstToken.mockResolvedValueOnce(null);
        const res = await POST(makeRequest({ token: 'abc', email: 'a@b.co', password: 'CorrectHorseBatteryStaple!' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('invalid_token');
    });

    it('returns expired_token and cleans up when the token has expired', async () => {
        mocks.findFirstToken.mockResolvedValueOnce({
            identifier: 'a@b.co',
            token: 'abc',
            expires: new Date(Date.now() - 1_000),
        });
        const res = await POST(makeRequest({ token: 'abc', email: 'a@b.co', password: 'CorrectHorseBatteryStaple!' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('expired_token');
        expect(mocks.deleteManyTokens).toHaveBeenCalledWith({ where: { identifier: 'a@b.co' } });
    });

    it('updates the password, clears lockout, deletes the token, and audits on success', async () => {
        mocks.findFirstToken.mockResolvedValueOnce({
            identifier: 'a@b.co',
            token: 'abc',
            expires: new Date(Date.now() + 60_000),
        });
        mocks.findUniqueUser.mockResolvedValueOnce({ id: 'user-1' });

        const res = await POST(makeRequest({ token: 'abc', email: 'a@b.co', password: 'CorrectHorseBatteryStaple!' }));

        expect(res.status).toBe(200);
        expect(mocks.hash).toHaveBeenCalledWith('CorrectHorseBatteryStaple!', 12);
        expect(mocks.transaction).toHaveBeenCalledOnce();
        expect(mocks.createAuditLog).toHaveBeenCalledWith(
            'user-1',
            'PASSWORD_RESET_COMPLETE',
            expect.any(String),
            '9.9.9.9',
        );
    });
});
