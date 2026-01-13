// vault-storage.js
// Handles vault CRUD operations (add, edit, delete entries)

import { encryptData, decryptData, deriveKey } from "./vault-crypto.js";

const VAULT_KEY = "secure_vault";

// Convert ArrayBuffer <-> Base64 helpers
function arrToB64(arr) {
    return btoa(String.fromCharCode(...arr));
}

function b64ToArr(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

// Load vault from localStorage (encrypted)
export function loadEncryptedVault() {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
}

// Save encrypted vault back to localStorage
export function saveEncryptedVault(data) {
    localStorage.setItem(VAULT_KEY, JSON.stringify(data));
}

// Decrypt vault with user key
export async function loadVault(key) {
    const saved = loadEncryptedVault();
    if (!saved) return null;

    const salt = b64ToArr(saved.salt);
    const iv = b64ToArr(saved.iv);
    const ciphertext = b64ToArr(saved.ciphertext);

    const decrypted = await decryptData(key, { iv, ciphertext });
    return decrypted;
}

// Save vault encrypted again
export async function saveVault(key, vaultObj) {
    const encrypted = await encryptData(key, vaultObj);

    const newData = {
        salt: arrToB64(vaultObj.salt ? vaultObj.salt : b64ToArr(JSON.parse(localStorage.getItem(VAULT_KEY)).salt)),
        iv: arrToB64(encrypted.iv),
        ciphertext: arrToB64(new Uint8Array(encrypted.ciphertext))
    };

    saveEncryptedVault(newData);
}

// Generate ID for entries
function uuid() {
    return crypto.randomUUID();
}

// Add new password entry
export async function addEntry(key, title, username, password, tags = []) {
    const vault = await loadVault(key);
    vault.entries.push({
        id: uuid(),
        title,
        username,
        password,
        tags
    });
    await saveEncryptedVault(await encryptVault(key, vault));
}

// Delete entry
export async function deleteEntry(key, id) {
    const vault = await loadVault(key);
    vault.entries = vault.entries.filter(e => e.id !== id);
    await saveEncryptedVault(await encryptVault(key, vault));
}

// Edit entry
export async function updateEntry(key, id, updates) {
    const vault = await loadVault(key);
    const entry = vault.entries.find(e => e.id === id);

    if (!entry) return false;

    Object.assign(entry, updates);

    await saveEncryptedVault(await encryptVault(key, vault));
    return true;
}

// Internal: encrypt vault object
async function encryptVault(key, vault) {
    const encrypted = await encryptData(key, vault);
    return {
        salt: arrToB64(new Uint8Array(16)), // reused salt (placeholder)
        iv: arrToB64(encrypted.iv),
        ciphertext: arrToB64(new Uint8Array(encrypted.ciphertext))
    };
}
