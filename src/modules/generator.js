// generator.js
// Advanced password generator with multiple options

// Character sets
const CHAR_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O',
    ambiguous: '{}[]()/\'"`~,;.<>'
};

// Password strength levels
const STRENGTH_PRESETS = {
    weak: { length: 8, includeUppercase: false, includeNumbers: false, includeSymbols: false },
    medium: { length: 12, includeUppercase: true, includeNumbers: true, includeSymbols: false },
    strong: { length: 16, includeUppercase: true, includeNumbers: true, includeSymbols: true },
    very_strong: { length: 24, includeUppercase: true, includeNumbers: true, includeSymbols: true }
};

// Generate cryptographically secure random bytes
function generateSecureRandom(length) {
    if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return array;
    }
    throw new Error('Secure random number generation not available');
}

// Build character pool based on options
function buildCharPool(options) {
    let pool = '';
    
    if (options.includeLowercase) {
        pool += CHAR_SETS.lowercase;
    }
    
    if (options.includeUppercase) {
        pool += CHAR_SETS.uppercase;
    }
    
    if (options.includeNumbers) {
        pool += CHAR_SETS.numbers;
    }
    
    if (options.includeSymbols) {
        pool += CHAR_SETS.symbols;
    }
    
    if (options.excludeSimilar) {
        pool = pool.replace(new RegExp(`[${CHAR_SETS.similar}]`, 'g'), '');
    }
    
    if (options.excludeAmbiguous) {
        pool = pool.replace(new RegExp(`[${CHAR_SETS.ambiguous.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g'), '');
    }
    
    return pool;
}

// Generate password using secure random
function generatePasswordFromPool(length, charPool) {
    const randomBytes = generateSecureRandom(length);
    let password = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = randomBytes[i] % charPool.length;
        password += charPool[randomIndex];
    }
    
    return password;
}

// Ensure password contains at least one character from each required set
function ensureCharacterRequirements(password, options) {
    const requirements = [];
    
    if (options.includeLowercase) {
        requirements.push(/[a-z]/);
    }
    
    if (options.includeUppercase) {
        requirements.push(/[A-Z]/);
    }
    
    if (options.includeNumbers) {
        requirements.push(/[0-9]/);
    }
    
    if (options.includeSymbols) {
        requirements.push(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/);
    }
    
    // Check if password meets all requirements
    const meetsRequirements = requirements.every(regex => regex.test(password));
    
    if (meetsRequirements) {
        return password;
    }
    
    // If not, regenerate
    return null;
}

// Main password generation function
export function generatePassword(options = {}) {
    // Default options
    const defaults = {
        length: 16,
        includeLowercase: true,
        includeUppercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: false,
        excludeAmbiguous: false,
        strength: 'strong'
    };
    
    const config = { ...defaults, ...options };
    
    // Apply strength preset if specified
    if (STRENGTH_PRESETS[config.strength]) {
        Object.assign(config, STRENGTH_PRESETS[config.strength]);
    }
    
    // Validate length
    if (config.length < 4) {
        throw new Error('Password length must be at least 4 characters');
    }
    
    if (config.length > 128) {
        throw new Error('Password length cannot exceed 128 characters');
    }
    
    // Build character pool
    const charPool = buildCharPool(config);
    
    if (charPool.length === 0) {
        throw new Error('No characters available for password generation');
    }
    
    // Generate password with requirements
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        const password = generatePasswordFromPool(config.length, charPool);
        const validPassword = ensureCharacterRequirements(password, config);
        
        if (validPassword) {
            return {
                password: validPassword,
                strength: calculateStrength(validPassword),
                entropy: calculateEntropy(validPassword),
                options: config
            };
        }
        
        attempts++;
    }
    
    throw new Error('Failed to generate password with required constraints');
}

// Calculate password strength
function calculateStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length bonus
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (password.length >= 16) score += 25;
    
    // Character variety
    if (/[a-z]/.test(password)) {
        score += 10;
    } else {
        feedback.push('Add lowercase letters');
    }
    
    if (/[A-Z]/.test(password)) {
        score += 10;
    } else {
        feedback.push('Add uppercase letters');
    }
    
    if (/[0-9]/.test(password)) {
        score += 10;
    } else {
        feedback.push('Add numbers');
    }
    
    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 20;
    } else {
        feedback.push('Add special characters');
    }
    
    // Determine strength level
    let strength;
    if (score < 30) strength = 'weak';
    else if (score < 60) strength = 'medium';
    else if (score < 80) strength = 'strong';
    else strength = 'very_strong';
    
    return {
        score,
        level: strength,
        feedback,
        crackTime: estimateCrackTime(password)
    };
}

// Calculate password entropy
function calculateEntropy(password) {
    let charsetSize = 0;
    
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
    
    const entropy = password.length * Math.log2(charsetSize);
    return Math.round(entropy * 100) / 100;
}

// Estimate crack time (simplified)
function estimateCrackTime(password) {
    const entropy = calculateEntropy(password);
    const guessesPerSecond = 1e12; // 1 trillion guesses per second (modern hardware)
    const totalGuesses = Math.pow(2, entropy);
    const seconds = totalGuesses / guessesPerSecond;
    
    if (seconds < 1) return 'instant';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return `${Math.round(seconds / 3153600000)} centuries`;
}

// Generate multiple passwords
export function generateMultiplePasswords(count, options = {}) {
    const passwords = [];
    
    for (let i = 0; i < count; i++) {
        try {
            const result = generatePassword(options);
            passwords.push(result);
        } catch (error) {
            console.error(`Failed to generate password ${i + 1}:`, error);
        }
    }
    
    return passwords;
}

// Generate passphrase
export function generatePassphrase(options = {}) {
    const defaults = {
        wordCount: 4,
        separator: '-',
        capitalize: false,
        includeNumbers: false
    };
    
    const config = { ...defaults, ...options };
    
    // Common words for passphrases (simplified list)
    const words = [
        'apple', 'banana', 'coffee', 'dragon', 'elephant', 'forest', 'garden', 'house',
        'island', 'jungle', 'kitchen', 'lemon', 'mountain', 'nature', 'ocean',
        'planet', 'queen', 'river', 'sunset', 'tiger', 'umbrella', 'village',
        'water', 'yellow', 'zebra', 'butterfly', 'crystal', 'diamond', 'eagle',
        'flame', 'galaxy', 'horizon', 'infinity', 'journey', 'kingdom', 'lighthouse',
        'meadow', 'nebula', 'orchard', 'paradise', 'quantum', 'rainbow', 'sapphire',
        'thunder', 'universe', 'volcano', 'whisper', 'xenon', 'yesterday', 'zenith'
    ];
    
    const passphrase = [];
    const randomBytes = generateSecureRandom(config.wordCount);
    
    for (let i = 0; i < config.wordCount; i++) {
        const randomIndex = randomBytes[i] % words.length;
        let word = words[randomIndex];
        
        if (config.capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        
        if (config.includeNumbers) {
            word += Math.floor(Math.random() * 100);
        }
        
        passphrase.push(word);
    }
    
    const result = passphrase.join(config.separator);
    
    return {
        passphrase: result,
        strength: calculateStrength(result),
        entropy: calculateEntropy(result),
        options: config
    };
}

// Password generator logic and UI events
export function initGenerator() {
    // Get all DOM elements
    const lengthInput = document.getElementById("length");
    const lowercase = document.getElementById("lowercase");
    const uppercase = document.getElementById("uppercase");
    const numbers = document.getElementById("numbers");
    const symbols = document.getElementById("symbols");
    const excludeSimilar = document.getElementById("exclude-similar");
    const excludeAmbiguous = document.getElementById("exclude-ambiguous");
    const output = document.getElementById("password");
    const generateBtn = document.getElementById("generate-btn");
    const copyBtn = document.getElementById("copy-password");

    // Mode elements
    const modeButtons = document.querySelectorAll(".mode-btn");
    const passphraseOptions = document.getElementById("passphrase-options");
    const multipleOptions = document.getElementById("multiple-options");
    const wordCount = document.getElementById("word-count");
    const separator = document.getElementById("separator");
    const capitalizeWords = document.getElementById("capitalize-words");
    const includeNumbers = document.getElementById("include-numbers");
    const generateCount = document.getElementById("generate-count");

    // Security analysis elements
    const securityAnalysis = document.getElementById("security-analysis");
    const strengthFill = document.getElementById("strength-fill");
    const strengthText = document.getElementById("strength-text");
    const entropyValue = document.getElementById("entropy-value");
    const crackTime = document.getElementById("crack-time");
    const feedbackList = document.getElementById("feedback-list");

    // Preset buttons
    const presetButtons = document.querySelectorAll(".preset-btn");

    // Current generation mode
    let currentMode = 'password';

    if (!generateBtn) return;

    // Mode switching
    modeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            modeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            currentMode = btn.dataset.mode;
            
            // Show/hide appropriate options
            passphraseOptions.style.display = currentMode === "passphrase" ? "flex" : "none";
            multipleOptions.style.display = currentMode === "multiple" ? "flex" : "none";
            
            // Update button text
            generateBtn.textContent = currentMode === "passphrase" ? "Gerar Passphrase" : 
                                     currentMode === "multiple" ? "Gerar Múltiplas" : "Gerar Senha";
        });
    });

    // Preset buttons
    presetButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const strength = btn.dataset.strength;
            
            // Update UI based on preset
            switch(strength) {
                case 'weak':
                    lengthInput.value = 8;
                    uppercase.checked = false;
                    numbers.checked = false;
                    symbols.checked = false;
                    break;
                case 'medium':
                    lengthInput.value = 12;
                    uppercase.checked = true;
                    numbers.checked = true;
                    symbols.checked = false;
                    break;
                case 'strong':
                    lengthInput.value = 16;
                    uppercase.checked = true;
                    numbers.checked = true;
                    symbols.checked = true;
                    break;
                case 'very_strong':
                    lengthInput.value = 24;
                    uppercase.checked = true;
                    numbers.checked = true;
                    symbols.checked = true;
                    break;
            }
        });
    });

    // Copy button functionality
    if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
            if (!output.value) return;
            
            try {
                await navigator.clipboard.writeText(output.value);
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✓ Copiado!';
                copyBtn.style.background = 'var(--accent)';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '';
                }, 2000);
            } catch (error) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = output.value;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = '✓ Copiado!';
                    copyBtn.style.background = 'var(--accent)';
                    
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.style.background = '';
                    }, 2000);
                } catch (fallbackError) {
                    console.error('Failed to copy:', fallbackError);
                }
                
                document.body.removeChild(textArea);
            }
        });
    }

    // Main generate button
    generateBtn.addEventListener("click", () => {
        try {
            let results = [];
            
            // Build options object
            const options = {
                length: parseInt(lengthInput.value),
                includeLowercase: lowercase.checked,
                includeUppercase: uppercase.checked,
                includeNumbers: numbers.checked,
                includeSymbols: symbols.checked,
                excludeSimilar: excludeSimilar.checked,
                excludeAmbiguous: excludeAmbiguous.checked
            };

            // Generate based on mode
            switch(currentMode) {
                case 'password':
                    const result = generatePassword(options);
                    results = [result];
                    output.value = result.password;
                    updateSecurityAnalysis(result);
                    break;
                    
                case 'passphrase':
                    const passphraseOptions = {
                        wordCount: parseInt(wordCount.value),
                        separator: separator.value,
                        capitalize: capitalizeWords.checked,
                        includeNumbers: includeNumbers.checked
                    };
                    const passphraseResult = generatePassphrase(passphraseOptions);
                    results = [passphraseResult];
                    output.value = passphraseResult.passphrase;
                    updateSecurityAnalysis(passphraseResult);
                    break;
                    
                case 'multiple':
                    const count = parseInt(generateCount.value);
                    results = generateMultiplePasswords(count, options);
                    
                    // Display multiple passwords
                    output.value = results.map((r, i) => `${i + 1}. ${r.password}`).join('\n');
                    
                    // Show analysis for first password
                    if (results.length > 0) {
                        updateSecurityAnalysis(results[0]);
                    }
                    break;
            }
            
            console.log(`Generated ${currentMode}:`, results);
            
        } catch (error) {
            console.error('Generation error:', error);
            alert('Erro ao gerar senha: ' + error.message);
        }
    });

    // Update security analysis display
    function updateSecurityAnalysis(result) {
        if (!result || !result.strength) return;
        
        const strength = result.strength;
        const entropy = result.entropy || 0;
        
        // Update strength bar
        strengthFill.className = `strength-fill ${strength.level}`;
        strengthText.textContent = strength.level.replace('_', ' ').toUpperCase();
        
        // Update entropy
        entropyValue.textContent = entropy.toFixed(1);
        
        // Update crack time
        crackTime.textContent = strength.crackTime || 'Unknown';
        
        // Update feedback list
        feedbackList.innerHTML = '';
        if (strength.feedback && strength.feedback.length > 0) {
            const ul = document.createElement('ul');
            strength.feedback.forEach(feedback => {
                const li = document.createElement('li');
                li.textContent = feedback;
                ul.appendChild(li);
            });
            feedbackList.appendChild(ul);
        }
        
        // Show security analysis
        securityAnalysis.style.display = 'block';
    }

    // Initialize with password mode
    const passwordModeBtn = document.querySelector('[data-mode="password"]');
    if (passwordModeBtn) {
        passwordModeBtn.click();
    }
}
