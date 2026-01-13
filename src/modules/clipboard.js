// clipboard.js
// Guaranteed cross-browser copy method (no navigator.clipboard)

export function initCopyButton() {
    const btn = document.getElementById("copy-password");
    const passwordField = document.getElementById("password");

    if (!btn || !passwordField) {
        console.error("Copy button or password field not found");
        return;
    }

    btn.addEventListener("click", (e) => {
        e.preventDefault();

        const text = passwordField.value;
        if (!text) return;

        // Create invisible textarea
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);

        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (successful) {
            btn.innerText = "Copiado!";
            btn.style.background = "var(--primary-dark)";
            setTimeout(() => {
                btn.innerText = "Copiar";
                btn.style.background = "";
            }, 1200);
        } else {
            alert("Não foi possível copiar a senha.");
        }
    });
}
