// security-advanced.js
// Advanced security analysis and interactive features

export function initSecurityAdvanced() {
    updateSecurityMetrics();
    setupQuiz();
    setupSecurityMonitoring();
    console.log('Advanced security features initialized');
}

// Update security metrics from current password
function updateSecurityMetrics() {
    const passwordField = document.getElementById('password');
    if (!passwordField) return;

    // Monitor password changes
    passwordField.addEventListener('input', () => {
        const password = passwordField.value;
        if (password) {
            const analysis = analyzePassword(password);
            updateSecurityDisplay(analysis);
        } else {
            clearSecurityDisplay();
        }
    });
}

function analyzePassword(password) {
    // Calculate entropy
    const entropy = calculateEntropy(password);
    
    // Calculate strength score (0-100)
    const strengthScore = calculateStrengthScore(password);
    
    // Estimate crack time
    const crackTime = estimateCrackTime(password);
    
    // Generate feedback
    const feedback = generatePasswordFeedback(password);
    
    return {
        password,
        entropy,
        strengthScore,
        crackTime,
        feedback,
        level: getStrengthLevel(strengthScore)
    };
}

function calculateEntropy(password) {
    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/[0-9]/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
    
    return password.length * Math.log2(charset);
}

function calculateStrengthScore(password) {
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 4, 40);
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    
    // Pattern penalty
    if (/(.)\1{2,}/.test(password)) score -= 20; // Repeated characters
    if (/^[a-zA-Z]+$/.test(password)) score -= 15; // Only letters
    if (/^[0-9]+$/.test(password)) score -= 15; // Only numbers
    
    // Common patterns penalty
    const commonPatterns = ['123', 'abc', 'qwe', 'password', 'senha', 'admin'];
    commonPatterns.forEach(pattern => {
        if (password.toLowerCase().includes(pattern)) score -= 10;
    });
    
    return Math.max(0, Math.min(100, score));
}

function estimateCrackTime(password) {
    const entropy = calculateEntropy(password);
    const guessesPerSecond = 1e12; // Modern supercomputer
    const totalGuesses = Math.pow(2, entropy);
    const seconds = totalGuesses / guessesPerSecond;
    
    return formatTime(seconds);
}

function formatTime(seconds) {
    if (seconds < 1) return 'Instantâneo';
    if (seconds < 60) return `${Math.round(seconds)} segundos`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutos`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} horas`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} dias`;
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} meses`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} anos`;
    return 'Séculos';
}

function getStrengthLevel(score) {
    if (score < 30) return 'muito_fraca';
    if (score < 50) return 'fraca';
    if (score < 70) return 'media';
    if (score < 85) return 'forte';
    return 'muito_forte';
}

function generatePasswordFeedback(password) {
    const feedback = [];
    
    if (password.length < 12) {
        feedback.push('Considere usar pelo menos 12 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
        feedback.push('Adicione letras maiúsculas');
    }
    
    if (!/[0-9]/.test(password)) {
        feedback.push('Inclua números para aumentar a força');
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
        feedback.push('Use símbolos especiais (!@#$%)');
    }
    
    if (/(.)\1{2,}/.test(password)) {
        feedback.push('Evite caracteres repetidos');
    }
    
    if (/^[a-zA-Z]+$/.test(password)) {
        feedback.push('Misture letras com números e símbolos');
    }
    
    const commonPatterns = ['123', 'abc', 'qwe', 'password', 'senha'];
    commonPatterns.forEach(pattern => {
        if (password.toLowerCase().includes(pattern)) {
            feedback.push(`Evite padrões comuns como "${pattern}"`);
        }
    });
    
    if (feedback.length === 0) {
        feedback.push('Excelente! Sua senha é muito forte.');
    }
    
    return feedback;
}

function updateSecurityDisplay(analysis) {
    // Update security score
    const scoreElement = document.getElementById('security-score');
    if (scoreElement) {
        scoreElement.textContent = `${analysis.strengthScore}/100`;
        scoreElement.style.color = getScoreColor(analysis.strengthScore);
    }
    
    // Update crack time
    const crackTimeElement = document.getElementById('security-crack-time');
    if (crackTimeElement) {
        crackTimeElement.textContent = analysis.crackTime;
    }
    
    // Update entropy
    const entropyElement = document.getElementById('security-entropy');
    if (entropyElement) {
        entropyElement.textContent = `${analysis.entropy.toFixed(1)} bits`;
    }
}

function getScoreColor(score) {
    if (score < 30) return 'var(--danger)';
    if (score < 50) return 'var(--warning)';
    if (score < 70) return '#ffa500';
    if (score < 85) return 'var(--accent)';
    return 'var(--primary)';
}

function clearSecurityDisplay() {
    const scoreElement = document.getElementById('security-score');
    const crackTimeElement = document.getElementById('security-crack-time');
    const entropyElement = document.getElementById('security-entropy');
    
    if (scoreElement) scoreElement.textContent = '-';
    if (crackTimeElement) crackTimeElement.textContent = '-';
    if (entropyElement) entropyElement.textContent = '-';
}

// Quiz functionality
function setupQuiz() {
    const quizContainer = document.getElementById('security-quiz');
    if (!quizContainer) return;
    
    // Add more questions
    const questions = [
        {
            question: "Qual é a prática mais segura para criar senhas?",
            options: [
                "Usar o nome do pet + ano de nascimento",
                "Usar a mesma senha em todos os sites",
                "Usar senhas únicas e aleatórias para cada conta"
            ],
            correct: 2
        },
        {
            question: "O que é 2FA (Two-Factor Authentication)?",
            options: [
                "Uma senha muito longa",
                "Uma camada extra de segurança além da senha",
                "Um tipo de antivírus",
                "Um backup de senhas"
            ],
            correct: 1
        },
        {
            question: "Com que frequência você deve trocar suas senhas?",
            options: [
                "Todos os dias",
                "Apenas se suspeitar de vazamento",
                "Uma vez por ano",
                "Nunca"
            ],
            correct: 1
        }
    ];
    
    let currentQuestion = 0;
    
    // Make checkQuizAnswer global
    window.checkQuizAnswer = function() {
        const selected = document.querySelector('input[name="q1"]:checked');
        const feedback = document.getElementById('quiz-feedback');
        
        if (!selected) {
            feedback.textContent = 'Por favor, selecione uma resposta.';
            feedback.className = 'quiz-feedback incorrect';
            feedback.style.display = 'block';
            return;
        }
        
        const isCorrect = selected.value === 'correct';
        feedback.textContent = isCorrect 
            ? '✅ Correto! Você entendeu bem sobre segurança de senhas.'
            : '❌ Incorreto. A resposta correta é: Usar senhas únicas e aleatórias para cada conta.';
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.style.display = 'block';
    };
}

// Security monitoring
function setupSecurityMonitoring() {
    // Monitor for password field changes globally
    document.addEventListener('input', (e) => {
        if (e.target.type === 'password' && e.target.id !== 'password') {
            // Warn about insecure password fields
            console.warn('Insecure password field detected:', e.target);
        }
    });
    
    // Check for common security issues
    checkSecurityIssues();
}

function checkSecurityIssues() {
    const issues = [];
    
    // Check if running on HTTP
    if (window.location.protocol === 'http:') {
        issues.push('Site não está usando HTTPS - suas senhas podem ser interceptadas');
    }
    
    // Check for mixed content
    const mixedContent = document.querySelectorAll('img[src^="http:"], script[src^="http:"]');
    if (mixedContent.length > 0) {
        issues.push('Conteúdo misto detectado - alguns recursos não são seguros');
    }
    
    if (issues.length > 0) {
        console.warn('Security issues detected:', issues);
    }
}

// Export functions for global access
window.updateSecurityMetrics = updateSecurityMetrics;
window.analyzePassword = analyzePassword;
