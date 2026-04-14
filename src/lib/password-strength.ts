/**
 * Password strength checking via zxcvbn.
 *
 * Replaces the old regex-based rules (length + uppercase + digit + symbol) which
 * allowed trivially-weak passwords like "Password1!" (zxcvbn score 1).
 *
 * Policy:
 *   - length ≥ 12
 *   - zxcvbn score ≥ 3 (takes > 10^8 guesses)
 *
 * zxcvbn also detects common patterns, dictionary words, dates, repeated
 * characters, keyboard walks, and names — things a regex cannot.
 */

import zxcvbn from "zxcvbn";

export const MIN_LENGTH = 12;
export const MIN_SCORE = 3;

export interface PasswordCheck {
    valid: boolean;
    score: number;
    reason?: string;
}

/**
 * Extra inputs help zxcvbn flag obvious leaks (e.g. password = user's name or email).
 * Accepts a plain object so the caller can pass any combination of these.
 */
export function checkPasswordStrength(
    password: string,
    userInputs: string[] = []
): PasswordCheck {
    if (password.length < MIN_LENGTH) {
        return {
            valid: false,
            score: 0,
            reason: `Password must be at least ${MIN_LENGTH} characters.`,
        };
    }

    // zxcvbn caps per-input complexity; truncate to avoid catastrophic runtime on huge inputs
    const sample = password.slice(0, 128);
    const result = zxcvbn(sample, userInputs.filter(Boolean));

    if (result.score < MIN_SCORE) {
        const reason =
            result.feedback.warning ||
            result.feedback.suggestions[0] ||
            "Password is too weak. Try a longer, less predictable password.";
        return { valid: false, score: result.score, reason };
    }

    return { valid: true, score: result.score };
}
