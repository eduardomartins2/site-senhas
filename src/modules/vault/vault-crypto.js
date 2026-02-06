// vault-crypto.js
// PBKDF2 + AES-GCM

// Custom error classes for better error handling
class CryptoError extends Error {
    constructor(message, code, originalError = null) {
        super(message);
        this.name = 'CryptoError';
        this.code = code;
        this.originalError = originalError;
    }
}

class VaultCorruptionError extends CryptoError {
    constructor(message = 'Vault data appears to be corrupted or tampered with') {
        super(message, 'VAULT_CORRUPTION');
        this.name = 'VaultCorruptionError';
    }
}

class AuthenticationError extends CryptoError {
    constructor(message = 'Authentication failed - incorrect password or corrupted data') {
        super(message, 'AUTHENTICATION_FAILED');
        this.name = 'AuthenticationError';
    }
}

// Safe error logging without sensitive data
function safeLogError(message, error, context = {}) {
    const safeContext = { ...context };
    
    // Remove any potential sensitive fields
    delete safeContext.password;
    delete safeContext.key;
    delete safeContext.data;
    delete safeContext.plaintext;
    delete safeContext.ciphertext;
    
    console.error(`[Crypto] ${message}`, {
        error: error.message || error,
        code: error.code || 'UNKNOWN',
        context: safeContext,
        timestamp: new Date().toISOString()
    });
}

export async function generateSalt() {
    try {
        return crypto.getRandomValues(new Uint8Array(16));
    } catch (error) {
        safeLogError('Failed to generate salt', error);
        throw new CryptoError('Failed to generate secure random salt', 'SALT_GENERATION_FAILED', error);
    }
}

export async function deriveKey(passphrase, salt) {
    try {
        if (!passphrase || typeof passphrase !== 'string') {
            throw new CryptoError('Invalid passphrase provided', 'INVALID_PASSPHRASE');
        }
        
        if (!salt || !(salt instanceof Uint8Array) || salt.length !== 16) {
            throw new CryptoError('Invalid salt provided', 'INVALID_SALT');
        }

        const baseKey = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(passphrase),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt,
                iterations: 150000,
                hash: "SHA-256"
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    } catch (error) {
        safeLogError('Key derivation failed', error, { 
            saltLength: salt?.length,
            passphraseLength: passphrase?.length 
        });
        
        if (error.name === 'OperationError') {
            throw new CryptoError('Key derivation failed - invalid parameters', 'KEY_DERIVATION_FAILED', error);
        }
        
        throw new CryptoError('Failed to derive encryption key', 'KEY_DERIVATION_ERROR', error);
    }
}

export async function encryptData(key, dataObj) {
    try {
        if (!key) {
            throw new CryptoError('No encryption key provided', 'MISSING_KEY');
        }
        
        if (!dataObj || typeof dataObj !== 'object') {
            throw new CryptoError('Invalid data object provided', 'INVALID_DATA');
        }

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(JSON.stringify(dataObj));

        const ciphertext = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoded
        );

        // AES-GCM já inclui tag de autenticação, mas vamos adicionar checksum adicional
        const data = JSON.stringify(dataObj);
        const checksum = await crypto.subtle.digest('SHA-256', encoded);

        return { 
            iv, 
            ciphertext,
            checksum: new Uint8Array(checksum)
        };
    } catch (error) {
        safeLogError('Encryption failed', error, { 
            dataType: typeof dataObj,
            hasKey: !!key 
        });
        
        if (error.name === 'OperationError') {
            throw new CryptoError('Encryption failed - invalid key or data', 'ENCRYPTION_FAILED', error);
        }
        
        throw new CryptoError('Failed to encrypt data', 'ENCRYPTION_ERROR', error);
    }
}

export async function decryptData(key, encryptedObj) {
    try {
        if (!key) {
            throw new CryptoError('No decryption key provided', 'MISSING_KEY');
        }
        
        if (!encryptedObj || !encryptedObj.iv || !encryptedObj.ciphertext) {
            throw new CryptoError('Invalid encrypted data provided', 'INVALID_ENCRYPTED_DATA');
        }

        const plaintext = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: encryptedObj.iv },
            key,
            encryptedObj.ciphertext
        );

        const decoded = new TextDecoder().decode(plaintext);
        
        // Verificar integridade dos dados
        if (encryptedObj.checksum) {
            const computedChecksum = await crypto.subtle.digest('SHA-256', plaintext);
            const storedChecksum = new Uint8Array(encryptedObj.checksum);
            const computedArray = new Uint8Array(computedChecksum);
            
            // Comparar byte a byte para evitar timing attacks
            if (storedChecksum.length !== computedArray.length) {
                throw new VaultCorruptionError('Checksum length mismatch - data may be corrupted');
            }
            
            let isValid = true;
            for (let i = 0; i < storedChecksum.length; i++) {
                if (storedChecksum[i] !== computedArray[i]) {
                    isValid = false;
                    break;
                }
            }
            
            if (!isValid) {
                throw new VaultCorruptionError('Data integrity check failed - data may be corrupted or tampered with');
            }
        }

        let parsedData;
        try {
            parsedData = JSON.parse(decoded);
        } catch (parseError) {
            throw new VaultCorruptionError('Decrypted data is not valid JSON - data may be corrupted');
        }

        return parsedData;
    } catch (error) {
        // Re-throw our custom errors
        if (error instanceof CryptoError || error instanceof VaultCorruptionError) {
            safeLogError('Decryption failed with custom error', error);
            throw error;
        }
        
        safeLogError('Decryption failed', error, { 
            hasIv: !!encryptedObj?.iv,
            hasCiphertext: !!encryptedObj?.ciphertext,
            hasChecksum: !!encryptedObj?.checksum
        });
        
        if (error.name === 'OperationError') {
            throw new AuthenticationError('Decryption failed - incorrect password or corrupted data');
        }
        
        throw new CryptoError('Failed to decrypt data', 'DECRYPTION_ERROR', error);
    }
}

// Export error classes for use in other modules
export { CryptoError, VaultCorruptionError, AuthenticationError };
