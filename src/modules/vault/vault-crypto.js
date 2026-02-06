// vault-crypto.js
// PBKDF2 + AES-GCM

export async function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
}

export async function deriveKey(passphrase, salt) {
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
}

export async function encryptData(key, dataObj) {
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
}

export async function decryptData(key, encryptedObj) {
    try {
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
                throw new Error('Checksum length mismatch');
            }
            
            let isValid = true;
            for (let i = 0; i < storedChecksum.length; i++) {
                if (storedChecksum[i] !== computedArray[i]) {
                    isValid = false;
                    break;
                }
            }
            
            if (!isValid) {
                throw new Error('Data integrity check failed');
            }
        }

        return JSON.parse(decoded);
    } catch (err) {
        console.error('Decryption error:', err.message);
        return null; // senha incorreta ou dados corrompidos
    }
}
