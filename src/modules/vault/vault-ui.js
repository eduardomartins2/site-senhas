// vault-ui.js
// Controla telas de criação, desbloqueio e navegação do Cofre

export function initVaultUI() {
    console.log("Vault UI initialized");

    // Elementos principais
    const startScreen = document.getElementById("vault-start-screen");
    const createScreen = document.getElementById("vault-create-screen");
    const unlockScreen = document.getElementById("vault-unlock-screen");
    const unlockedSection = document.getElementById("vault-unlocked-section");

    // Botões principais
    const btnStartCreate = document.getElementById("vault-start-create");
    const btnStartUnlock = document.getElementById("vault-start-unlock");

    const btnBackFromCreate = document.getElementById("vault-back-from-create");
    const btnBackFromUnlock = document.getElementById("vault-back-from-unlock");

    // Controle de telas
    if (btnStartCreate) {
        btnStartCreate.addEventListener("click", () => {
            hideAll();
            createScreen.style.display = "block";
        });
    }

    if (btnStartUnlock) {
        btnStartUnlock.addEventListener("click", () => {
            hideAll();
            unlockScreen.style.display = "block";
        });
    }

    if (btnBackFromCreate) {
        btnBackFromCreate.addEventListener("click", () => {
            hideAll();
            startScreen.style.display = "block";
        });
    }

    if (btnBackFromUnlock) {
        btnBackFromUnlock.addEventListener("click", () => {
            hideAll();
            startScreen.style.display = "block";
        });
    }

    // Função auxiliar
    function hideAll() {
        startScreen.style.display = "none";
        createScreen.style.display = "none";
        unlockScreen.style.display = "none";
        unlockedSection.style.display = "none";
    }

    // Por enquanto, sem lógica real de criação/desbloqueio
    // Só para testar a navegação
}
