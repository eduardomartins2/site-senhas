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

    return { iv, ciphertext };
}

export async function decryptData(key, encryptedObj) {
    try {
        const plaintext = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: encryptedObj.iv },
            key,
            encryptedObj.ciphertext
        );

        return JSON.parse(new TextDecoder().decode(plaintext));
    } catch (err) {
        return null; // senha incorreta
    }
}
