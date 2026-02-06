// vault-storage.js
// Handles vault CRUD operations (add, edit, delete entries)

import { encryptData, decryptData, deriveKey } from "./vault-crypto.js";

const VAULT_KEY = "secure_vault";
const DB_NAME = "PasswordVaultDB";
const DB_VERSION = 1;
const STORE_NAME = "vault";

// IndexedDB initialization
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };
    });
}

// Convert ArrayBuffer <-> Base64 helpers
function arrToB64(arr) {
    return btoa(String.fromCharCode(...arr));
}

function b64ToArr(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

// Load vault from IndexedDB (encrypted)
export async function loadEncryptedVault() {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(VAULT_KEY);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result ? request.result.data : null);
        });
    } catch (error) {
        console.error("Failed to load from IndexedDB:", error);
        return null;
    }
}

// Save encrypted vault back to IndexedDB
export async function saveEncryptedVault(data) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ id: VAULT_KEY, data });
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (error) {
        console.error("Failed to save to IndexedDB:", error);
        throw error;
    }
}

// Decrypt vault with user key
export async function loadVault(key) {
    const saved = await loadEncryptedVault();
    if (!saved) return null;

    const salt = b64ToArr(saved.salt);
    const iv = b64ToArr(saved.iv);
    const ciphertext = b64ToArr(saved.ciphertext);
    const checksum = saved.checksum ? b64ToArr(saved.checksum) : null;

    const decrypted = await decryptData(key, { iv, ciphertext, checksum });
    return decrypted;
}

// Save vault encrypted again
export async function saveVault(key, vaultObj) {
    const encrypted = await encryptData(key, vaultObj);

    const newData = {
        salt: arrToB64(vaultObj.salt ? vaultObj.salt : b64ToArr((await loadEncryptedVault()).salt)),
        iv: arrToB64(encrypted.iv),
        ciphertext: arrToB64(new Uint8Array(encrypted.ciphertext)),
        checksum: arrToB64(encrypted.checksum)
    };

    await saveEncryptedVault(newData);
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
        ciphertext: arrToB64(new Uint8Array(encrypted.ciphertext)),
        checksum: arrToB64(encrypted.checksum)
    };
}
