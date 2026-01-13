// clipboard.js
// Handles password copying to clipboard

export function initCopyButton() {
    const btn = document.getElementById("copy-password");
    const passwordField = document.getElementById("password");

    if (!btn) return;

    btn.addEventListener("click", async () => {
        if (!passwordField.value) return;

        try {
            await navigator.clipboard.writeText(passwordField.value);
            btn.innerText = "Copiado!";
            setTimeout(() => (btn.innerText = "Copiar"), 1200);
        } catch (err) {
            console.error("Clipboard error:", err);
        }
    });
}
