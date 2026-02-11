// main.js
// Initialize UI collapse + generator + clipboard + vault view loading + theme + shortcuts

import { initGenerator } from "./src/modules/generator.js";
import { initCopyButton } from "./src/modules/clipboard.js";
import { initVaultUI } from "./src/modules/vault/vault-ui.js";
import { initTheme } from "./src/modules/theme.js";
import { initShortcuts } from "./src/modules/shortcuts.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Main loaded");

    // Initialize theme first
    initTheme();
    initShortcuts();
    initGenerator();
    initCopyButton();

    // Load vault HTML view before attaching events
    fetch("./src/views/vault.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("vault-content").innerHTML = html;

            setupCollapsibles();

            // IMPORTANT: vault UI only exists AFTER the HTML is injected
            initVaultUI();
        })
        .catch(err => {
            console.error("Failed to load vault view:", err);
        });

    const secBtn = document.getElementById("toggle-security");
    const secContent = document.getElementById("security-content");

    if (secBtn) {
        secBtn.addEventListener("click", () => {
            secContent.classList.toggle("active");
        });
    }
});

function setupCollapsibles() {
    const vBtn = document.getElementById("toggle-vault");
    const vContent = document.getElementById("vault-content");

    if (!vBtn || !vContent) {
        console.warn("Vault toggles not found yet");
        return;
    }

    vBtn.addEventListener("click", () => {
        vContent.classList.toggle("active");
    });
}
