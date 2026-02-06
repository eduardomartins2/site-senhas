// vault-storage.js
// Handles vault CRUD operations (add, edit, delete entries)

import { encryptData, decryptData, deriveKey, CryptoError } from "./vault-crypto.js";

// Importar funções de criptografia necessárias
async function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
}

// Safe logging without sensitive data
function safeLog(message, data = {}) {
    const safeData = { ...data };
    
    // Remove sensitive fields
    delete safeData.vault;
    delete safeData.key;
    delete safeData.salt;
    delete safeData.iv;
    delete safeData.ciphertext;
    delete safeData.checksum;
    delete safeData.data;
    delete safeData.encrypted;
    delete safeData.decrypted;
    delete safeData.pass;
    delete safeData.password;
    delete safeData.exportPassword;
    delete safeData.fileContent;
    
    // Sanitize object properties
    if (safeData.vaultData) {
        safeData.vaultData = {
            entriesCount: safeData.vaultData.entries?.length || 0,
            hasData: !!safeData.vaultData.entries
        };
    }
    
    console.log(`[VaultStorage] ${message}`, safeData);
}

function safeError(message, error, context = {}) {
    const safeContext = { ...context };
    
    // Remove sensitive fields from error context
    delete safeContext.password;
    delete safeContext.key;
    delete safeContext.data;
    delete safeContext.vault;
    delete safeContext.encryptedData;
    delete safeContext.fileContent;
    
    console.error(`[VaultStorage] ${message}`, {
        error: error.message || error,
        code: error.code || 'UNKNOWN',
        context: safeContext,
        timestamp: new Date().toISOString()
    });
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
            
            request.onerror = () => {
                safeError('Failed to load from IndexedDB', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    safeLog('Loaded encrypted vault from IndexedDB', { 
                        hasData: true,
                        dataKeys: Object.keys(result.data || {})
                    });
                } else {
                    safeLog('No vault data found in IndexedDB');
                }
                resolve(result ? result.data : null);
            };
        });
    } catch (error) {
        safeError('Failed to access IndexedDB', error);
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
            
            request.onerror = () => {
                safeError('Failed to save to IndexedDB', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                safeLog('Saved encrypted vault to IndexedDB', { 
                    success: true,
                    dataKeys: Object.keys(data || {})
                });
                resolve();
            };
        });
    } catch (error) {
        safeError('Failed to access IndexedDB for saving', error);
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
        safeLog('Starting vault export process');
        
        // Load current vault data
        const vault = await loadVault(vaultKey);
        if (!vault) {
            throw new CryptoError('No vault data to export', 'NO_VAULT_DATA');
        }

        safeLog('Vault loaded for export', { 
            entriesCount: vault.entries?.length || 0 
        });

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

        safeLog('Created export package', { 
            version: exportPackage.version,
            entriesCount: exportPackage.metadata.entries 
        });

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

        safeLog('Export file created successfully', { 
            version: exportFile.version,
            type: exportFile.type,
            hasChecksum: !!exportFile.checksum
        });

        return JSON.stringify(exportFile, null, 2);
    } catch (error) {
        safeError('Export error', error, { 
            operation: 'vault_export',
            hasVaultKey: !!vaultKey,
            hasExportPassword: !!exportPassword
        });
        throw new CryptoError('Failed to export vault: ' + error.message, 'EXPORT_FAILED', error);
    }
}

// Import vault from encrypted export file
export async function importVault(exportPassword, importData) {
    try {
        safeLog('Starting vault import process');
        
        // Parse and validate export file structure
        let exportFile;
        try {
            exportFile = JSON.parse(importData);
        } catch (parseError) {
            throw new CryptoError('Invalid export file format', 'INVALID_FILE_FORMAT', parseError);
        }

        safeLog('Export file parsed', { 
            version: exportFile.version,
            type: exportFile.type,
            hasRequiredFields: !!(exportFile.salt && exportFile.iv && exportFile.ciphertext)
        });

        // Validate required fields
        if (!exportFile.salt || !exportFile.iv || !exportFile.ciphertext || 
            exportFile.type !== "password-vault-export" || exportFile.version !== "1.0") {
            throw new CryptoError('Invalid or unsupported export file', 'INVALID_EXPORT_FILE');
        }

        // Derive key from export password
        const importSalt = b64ToArr(exportFile.salt);
        const importKey = await deriveKey(exportPassword, importSalt);

        safeLog('Import key derived successfully', { 
            saltLength: importSalt.length 
        });

        // Decrypt export data
        const encryptedData = {
            iv: b64ToArr(exportFile.iv),
            ciphertext: b64ToArr(exportFile.ciphertext),
            checksum: exportFile.checksum ? b64ToArr(exportFile.checksum) : null
        };

        const decryptedPackage = await decryptData(importKey, encryptedData);
        if (!decryptedPackage) {
            throw new CryptoError('Invalid export password or corrupted data', 'DECRYPTION_FAILED');
        }

        safeLog('Export data decrypted successfully', { 
            hasVersion: !!decryptedPackage.version,
            hasVaultData: !!decryptedPackage.vaultData,
            hasMetadata: !!decryptedPackage.metadata
        });

        // Validate decrypted package structure
        if (!decryptedPackage.version || !decryptedPackage.vaultData || 
            !decryptedPackage.metadata || !decryptedPackage.exportedAt) {
            throw new CryptoError('Invalid export package structure', 'INVALID_PACKAGE_STRUCTURE');
        }

        // Validate vault data structure
        const vaultData = decryptedPackage.vaultData;
        if (!Array.isArray(vaultData.entries)) {
            throw new CryptoError('Invalid vault entries format', 'INVALID_ENTRIES_FORMAT');
        }

        safeLog('Validating vault entries', { 
            entriesCount: vaultData.entries.length 
        });

        // Validate each entry
        for (const entry of vaultData.entries) {
            if (!entry.id || !entry.title || !entry.username || !entry.password) {
                throw new CryptoError(`Invalid entry format: ${entry.title || 'unknown'}`, 'INVALID_ENTRY_FORMAT');
            }
        }

        safeLog('All entries validated successfully', { 
            validEntriesCount: vaultData.entries.length 
        });

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
        safeError('Import error', error, { 
            operation: 'vault_import',
            hasExportPassword: !!exportPassword,
            hasImportData: !!importData,
            importDataLength: importData?.length || 0
        });
        throw new CryptoError('Failed to import vault: ' + error.message, 'IMPORT_FAILED', error);
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
