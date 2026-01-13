// main.js
// Initialize UI collapse + generator + clipboard

import { initGenerator } from "./src/modules/generator.js";
import { initCopyButton } from "./src/modules/clipboard.js";

document.addEventListener("DOMContentLoaded", () => {
    // Generator + Copy
    initGenerator();
    initCopyButton();

    // Collapsible Sections
    const secBtn = document.getElementById("toggle-security");
    const secContent = document.getElementById("security-content");

    const vBtn = document.getElementById("toggle-vault");
    const vContent = document.getElementById("vault-content");

    if (secBtn) {
        secBtn.addEventListener("click", () => {
            secContent.classList.toggle("active");
        });
    }

    if (vBtn) {
        vBtn.addEventListener("click", () => {
            vContent.classList.toggle("active");
        });
    }
});
