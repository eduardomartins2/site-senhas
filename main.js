// main.js
// Initializes modules and loads views

import { initGenerator } from "./src/modules/generator.js";
import { loadVaultView } from "./src/views/vault.html";
import { loadSecurityInfo } from "./src/views/security.html";

// Basic initialization (will expand later)
document.addEventListener("DOMContentLoaded", () => {
    initGenerator();
});
