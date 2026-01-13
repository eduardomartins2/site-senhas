// vault-auth.js
// Authentication logic for vault master password

// Storage keys
const HASH_KEY = "vault_master_hash";
const SALT_KEY = "vault_master_salt";
const LOCK_KEY = "vault_lock_until";
const FAIL_COUNT_KEY = "vault_fail_count";

// PBKDF2 settings
const PBKDF2_ITER = 150000;
const HASH_ALGO = "SHA-256";

// Generate random salt
function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
}

// Convert ArrayBuffer to Base64
function bufToBase64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

// Convert Base64 to ArrayBuffer
function base64ToBuf(base64) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
}

// Derive PBKDF2 hash
async function deriveHash(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    return await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: PBKDF2_ITER,
            hash: HASH_ALGO
        },
        keyMaterial,
        256
    );
}

// Create master password
export async function createMasterPassword(password) {
    const salt = generateSalt();
    const hash = await deriveHash(password, salt);

    localStorage.setItem(SALT_KEY, bufToBase64(salt));
    localStorage.setItem(HASH_KEY, bufToBase64(hash));

    return true;
}

// Check if master password exists
export function masterExists() {
    return localStorage.getItem(HASH_KEY) !== null;
}

// Lockout control
function getLockUntil() {
    return parseInt(localStorage.getItem(LOCK_KEY) || "0", 10);
}

export function isLocked() {
    return Date.now() < getLockUntil();
}

// Validate master password
export async function validateMasterPassword(password) {
    if (isLocked()) return { ok: false, reason: "locked" };

    const storedHash = localStorage.getItem(HASH_KEY);
    const storedSalt = localStorage.getItem(SALT_KEY);

    if (!storedHash || !storedSalt) {
        return { ok: false, reason: "no-master" };
    }

    const salt = base64ToBuf(storedSalt);
    const hash = await deriveHash(password, salt);
    const hash64 = bufToBase64(hash);

    if (hash64 === storedHash) {
        localStorage.setItem(FAIL_COUNT_KEY, "0");
        return { ok: true };
    }

    // Wrong password: increase fail count
    let fails = parseInt(localStorage.getItem(FAIL_COUNT_KEY) || "0", 10);
    fails++;
    localStorage.setItem(FAIL_COUNT_KEY, String(fails));

    const blockTime = Math.min(fails * 5000, 30000); // max 30s
    localStorage.setItem(LOCK_KEY, String(Date.now() + blockTime));

    return { ok: false, reason: "wrong", blockTime };
}
