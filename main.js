// main.js
// Handles UI collapse behavior + generator initialization

import { initGenerator } from "./src/modules/generator.js";

document.addEventListener("DOMContentLoaded", () => {
    initGenerator();

    const secBtn = document.getElementById("toggle-security");
    const secContent = document.getElementById("security-content");

    const vBtn = document.getElementById("toggle-vault");
    const vContent = document.getElementById("vault-content");

    secBtn.addEventListener("click", () => {
        secContent.classList.toggle("active");
    });

    vBtn.addEventListener("click", () => {
        vContent.classList.toggle("active");
    });
});
