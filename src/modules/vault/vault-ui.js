import { generateSalt, deriveKey, encryptData, decryptData } from "./vault-crypto.js";

// Nome do item no localStorage
const VAULT_KEY = "secure_vault";

export function initVaultUI() {
    console.log("Vault UI initialized");

    // Elementos de tela
    const startScreen = document.getElementById("vault-start-screen");
    const createScreen = document.getElementById("vault-create-screen");
    const unlockScreen = document.getElementById("vault-unlock-screen");
    const unlockedSection = document.getElementById("vault-unlocked-section");

    // Botões
    const btnStartCreate = document.getElementById("vault-start-create");
    const btnStartUnlock = document.getElementById("vault-start-unlock");

    const btnBackFromCreate = document.getElementById("vault-back-from-create");
    const btnBackFromUnlock = document.getElementById("vault-back-from-unlock");

    const btnCreateVault = document.getElementById("vault-create-btn");
    const btnUnlockVault = document.getElementById("vault-unlock-btn");

    // Inputs
    const inputCreatePass = document.getElementById("vault-create-pass");
    const inputCreateConfirm = document.getElementById("vault-create-pass-confirm");
    const inputUnlockPass = document.getElementById("vault-unlock-pass");

    // ----- Navegação -----

    function hideAll() {
        startScreen.style.display = "none";
        createScreen.style.display = "none";
        unlockScreen.style.display = "none";
        unlockedSection.style.display = "none";
    }

    btnStartCreate.addEventListener("click", () => {
        hideAll();
        createScreen.style.display = "block";
    });

    btnStartUnlock.addEventListener("click", () => {
        hideAll();
        unlockScreen.style.display = "block";
    });

    btnBackFromCreate.addEventListener("click", () => {
        hideAll();
        startScreen.style.display = "block";
    });

    btnBackFromUnlock.addEventListener("click", () => {
        hideAll();
        startScreen.style.display = "block";
    });

    // ----- Criar Cofre -----

    btnCreateVault.addEventListener("click", async () => {
        const pass = inputCreatePass.value.trim();
        const pass2 = inputCreateConfirm.value.trim();

        if (pass.length < 6) {
            alert("A palavra-passe deve ter no mínimo 6 caracteres.");
            return;
        }

        if (pass !== pass2) {
            alert("As palavras-passe não coincidem.");
            return;
        }

        // Criar salt
        const salt = await generateSalt();

        // Derivar chave
        const key = await deriveKey(pass, salt);

        // Criar cofre vazio
        const initialVault = {
            entries: []
        };

        // Criptografar
        const encrypted = await encryptData(key, initialVault);

        // Salvar no localStorage
        const vaultToSave = {
            salt: arrayToBase64(salt),
            iv: arrayToBase64(encrypted.iv),
            ciphertext: arrayToBase64(new Uint8Array(encrypted.ciphertext))
        };

        localStorage.setItem(VAULT_KEY, JSON.stringify(vaultToSave));

        alert("Cofre criado com sucesso!");

        hideAll();
        unlockScreen.style.display = "block";
    });

    // ----- Desbloquear Cofre -----

    btnUnlockVault.addEventListener("click", async () => {
        const pass = inputUnlockPass.value.trim();

        const saved = localStorage.getItem(VAULT_KEY);
        if (!saved) {
            alert("Nenhum cofre existente. Crie um novo.");
            return;
        }

        const vaultData = JSON.parse(saved);

        const salt = base64ToArray(vaultData.salt);
        const iv = base64ToArray(vaultData.iv);
        const ciphertext = base64ToArray(vaultData.ciphertext);

        const key = await deriveKey(pass, salt);

        const decrypted = await decryptData(key, { iv, ciphertext });

        if (!decrypted) {
            alert("Palavra-passe incorreta.");
            return;
        }

        alert("Cofre desbloqueado!");

        hideAll();
        unlockedSection.style.display = "block";

        console.log("Conteúdo do cofre:", decrypted);
    });
}

// Helpers de Base64

function arrayToBase64(arr) {
    return btoa(String.fromCharCode(...arr));
}

function base64ToArray(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}
