// vault-storage.js
// Handles vault CRUD operations (add, edit, delete entries)

import { encryptData, decryptData, deriveKey } from "./vault-crypto.js";

// Importar funções de criptografia necessárias
async function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
}

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

// Export vault encrypted with export password
export async function exportVault(vaultKey, exportPassword) {
    try {
        // Load current vault data
        const vault = await loadVault(vaultKey);
        if (!vault) {
            throw new Error('No vault data to export');
        }

        // Generate new salt for export encryption
        const exportSalt = await generateSalt();
        
        // Derive key from export password
        const exportKey = await deriveKey(exportPassword, exportSalt);
        
        // Create export package with metadata
        const exportPackage = {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            vaultData: vault,
            metadata: {
                entries: vault.entries.length,
                description: "Password Vault Export"
            }
        };

        // Encrypt with export password
        const encrypted = await encryptData(exportKey, exportPackage);
        
        // Create export file structure
        const exportFile = {
            salt: arrToB64(exportSalt),
            iv: arrToB64(encrypted.iv),
            ciphertext: arrToB64(new Uint8Array(encrypted.ciphertext)),
            checksum: arrToB64(encrypted.checksum),
            version: "1.0",
            type: "password-vault-export"
        };

        return JSON.stringify(exportFile, null, 2);
    } catch (error) {
        console.error('Export error:', error);
        throw new Error('Failed to export vault: ' + error.message);
    }
}

// Import vault from encrypted export file
export async function importVault(exportPassword, importData) {
    try {
        // Parse and validate export file structure
        let exportFile;
        try {
            exportFile = JSON.parse(importData);
        } catch (parseError) {
            throw new Error('Invalid export file format');
        }

        // Validate required fields
        if (!exportFile.salt || !exportFile.iv || !exportFile.ciphertext || 
            exportFile.type !== "password-vault-export" || exportFile.version !== "1.0") {
            throw new Error('Invalid or unsupported export file');
        }

        // Derive key from export password
        const importSalt = b64ToArr(exportFile.salt);
        const importKey = await deriveKey(exportPassword, importSalt);

        // Decrypt export data
        const encryptedData = {
            iv: b64ToArr(exportFile.iv),
            ciphertext: b64ToArr(exportFile.ciphertext),
            checksum: exportFile.checksum ? b64ToArr(exportFile.checksum) : null
        };

        const decryptedPackage = await decryptData(importKey, encryptedData);
        if (!decryptedPackage) {
            throw new Error('Invalid export password or corrupted data');
        }

        // Validate decrypted package structure
        if (!decryptedPackage.version || !decryptedPackage.vaultData || 
            !decryptedPackage.metadata || !decryptedPackage.exportedAt) {
            throw new Error('Invalid export package structure');
        }

        // Validate vault data structure
        const vaultData = decryptedPackage.vaultData;
        if (!Array.isArray(vaultData.entries)) {
            throw new Error('Invalid vault entries format');
        }

        // Validate each entry
        for (const entry of vaultData.entries) {
            if (!entry.id || !entry.title || !entry.username || !entry.password) {
                throw new Error(`Invalid entry format: ${entry.title || 'unknown'}`);
            }
        }

        return {
            vaultData: vaultData,
            metadata: {
                importedAt: new Date().toISOString(),
                originalExportDate: decryptedPackage.exportedAt,
                entriesCount: vaultData.entries.length,
                version: decryptedPackage.version
            }
        };

    } catch (error) {
        console.error('Import error:', error);
        throw new Error('Failed to import vault: ' + error.message);
    }
}

// Merge imported vault with existing vault
export async function mergeVault(currentKey, importedVaultData) {
    try {
        // Load current vault
        const currentVault = await loadVault(currentKey);
        if (!currentVault) {
            throw new Error('No current vault found');
        }

        // Create map of existing IDs to detect conflicts
        const existingIds = new Set(currentVault.entries.map(e => e.id));
        let conflicts = 0;
        let added = 0;

        // Process imported entries
        for (const importedEntry of importedVaultData.entries) {
            if (existingIds.has(importedEntry.id)) {
                // Generate new ID for conflicting entry
                importedEntry.id = uuid();
                conflicts++;
            }
            currentVault.entries.push(importedEntry);
            added++;
        }

        // Save merged vault
        await saveEncryptedVault(await encryptVault(currentKey, currentVault));

        return {
            totalImported: importedVaultData.entries.length,
            conflictsResolved: conflicts,
            newEntriesAdded: added,
            totalEntries: currentVault.entries.length
        };

    } catch (error) {
        console.error('Merge error:', error);
        throw new Error('Failed to merge vault: ' + error.message);
    }
}
