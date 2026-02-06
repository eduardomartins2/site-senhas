// generator.js
// Password generator logic and UI events

export function initGenerator() {
    const lengthInput = document.getElementById("length");
    const uppercase = document.getElementById("uppercase");
    const numbers = document.getElementById("numbers");
    const symbols = document.getElementById("symbols");
    const output = document.getElementById("password");
    const generateBtn = document.getElementById("generate-btn");

    if (!generateBtn) return;

    generateBtn.addEventListener("click", () => {
        const length = parseInt(lengthInput.value);

        let chars = "abcdefghijklmnopqrstuvwxyz";

        if (uppercase.checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (numbers.checked) chars += "0123456789";
        if (symbols.checked)
            chars += "!@#$%^&*()_+-=[]{}|;:',.<>?/";

        let password = "";
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);
        
        for (let i = 0; i < length; i++) {
            const rand = randomValues[i] % chars.length;
            password += chars[rand];
        }

        output.value = password;
    });
}
