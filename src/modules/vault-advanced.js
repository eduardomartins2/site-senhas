// vault-advanced.js
// Advanced vault UI interactions and setup

export function initVaultAdvanced() {
    setupVaultButton();
    setupVaultStatus();
    console.log('Advanced vault features initialized');
}

function setupVaultButton() {
    const setupBtn = document.getElementById('setup-vault-btn');
    if (!setupBtn) return;
    
    setupBtn.addEventListener('click', () => {
        showVaultSetupModal();
    });
}

function showVaultSetupModal() {
    // Remove existing modal
    const existingModal = document.getElementById('vault-setup-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'vault-setup-modal';
    modal.className = 'vault-setup-modal';
    modal.innerHTML = `
        <div class="vault-setup-content">
            <div class="vault-setup-header">
                <h2>🔐 Configurar Cofre de Senhas</h2>
                <button class="vault-setup-close" aria-label="Fechar">×</button>
            </div>
            
            <div class="vault-setup-body">
                <div class="setup-step active" id="setup-step-1">
                    <div class="step-header">
                        <span class="step-number">1</span>
                        <h3>Criar Palavra-passe Mestra</h3>
                        <p>Esta será a única senha que você precisará lembrar.</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="master-password">Palavra-passe Mestra</label>
                        <input type="password" id="master-password" class="input-field" placeholder="Digite uma senha forte...">
                        <div class="password-strength" id="master-strength">
                            <div class="strength-bar"></div>
                            <span class="strength-text">Força: -</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm-password">Confirmar Palavra-passe</label>
                        <input type="password" id="confirm-password" class="input-field" placeholder="Digite novamente...">
                        <div class="password-match" id="password-match">
                            <span class="match-indicator">⚠️</span>
                            <span class="match-text">As senhas não coincidem</span>
                        </div>
                    </div>
                    
                    <div class="password-tips">
                        <h4>💡 Dicas para uma palavra-passe forte:</h4>
                        <ul>
                            <li>Use pelo menos 16 caracteres</li>
                            <li>Misture letras maiúsculas, minúsculas, números e símbolos</li>
                            <li>Avoid informações pessoais ou palavras comuns</li>
                            <li>Considere usar uma frase de senha (ex: "MeuGatoPreferidoComePães!2024")</li>
                        </ul>
                    </div>
                </div>
                
                <div class="setup-step" id="setup-step-2">
                    <div class="step-header">
                        <span class="step-number">2</span>
                        <h3>Configurar Recuperação</h3>
                        <p>Opções para recuperar acesso caso esqueça sua palavra-passe.</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="recovery-hint">Dica de Recuperação</label>
                        <input type="text" id="recovery-hint" class="input-field" placeholder="Uma dica que só você entenda...">
                        <small>Não inclua informações da palavra-passe na dica</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="security-question">Pergunta de Segurança</label>
                        <select id="security-question" class="input-field">
                            <option value="">Selecione uma pergunta...</option>
                            <option value="pet">Qual o nome do seu primeiro pet?</option>
                            <option value="school">Em que escola você estudou?</option>
                            <option value="city">Em que cidade você nasceu?</option>
                            <option value="mother">Qual o nome de solteira da sua mãe?</option>
                            <option value="custom">Pergunta personalizada...</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="custom-question-group" style="display: none;">
                        <label for="custom-question">Pergunta Personalizada</label>
                        <input type="text" id="custom-question" class="input-field" placeholder="Digite sua pergunta...">
                    </div>
                    
                    <div class="form-group">
                        <label for="security-answer">Resposta de Segurança</label>
                        <input type="text" id="security-answer" class="input-field" placeholder="Digite a resposta...">
                    </div>
                </div>
                
                <div class="setup-step" id="setup-step-3">
                    <div class="step-header">
                        <span class="step-number">3</span>
                        <h3>Configurações Adicionais</h3>
                        <p>Personalize seu cofre de senhas.</p>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="auto-lock" checked>
                            <span>Bloquear automaticamente após inatividade</span>
                        </label>
                        <select id="auto-lock-time" class="input-field">
                            <option value="5">5 minutos</option>
                            <option value="10" selected>10 minutos</option>
                            <option value="15">15 minutos</option>
                            <option value="30">30 minutos</option>
                            <option value="60">1 hora</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="clear-clipboard" checked>
                            <span>Limpar área de transferência automaticamente</span>
                        </label>
                        <select id="clear-time" class="input-field">
                            <option value="30">30 segundos</option>
                            <option value="60" selected>1 minuto</option>
                            <option value="120">2 minutos</option>
                            <option value="300">5 minutos</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="backup-reminder" checked>
                            <span>Lembrar de fazer backup mensalmente</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="vault-setup-footer">
                <div class="step-indicators">
                    <span class="step-indicator active" data-step="1">1</span>
                    <span class="step-indicator" data-step="2">2</span>
                    <span class="step-indicator" data-step="3">3</span>
                </div>
                
                <div class="setup-actions">
                    <button class="btn-secondary" id="prev-step" style="display: none;">Anterior</button>
                    <button class="btn-primary" id="next-step">Próximo</button>
                    <button class="btn-primary" id="finish-setup" style="display: none;">Finalizar Configuração</button>
                </div>
            </div>
        </div>
        
        <div class="vault-setup-backdrop"></div>
    `;
    
    // Add styles
    modal.innerHTML += `
        <style>
            .vault-setup-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .vault-setup-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }
            
            .vault-setup-content {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 16px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: var(--shadow);
                position: relative;
                z-index: 1;
            }
            
            .vault-setup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid var(--border);
            }
            
            .vault-setup-header h2 {
                margin: 0;
                color: var(--text);
                font-size: 1.5rem;
            }
            
            .vault-setup-close {
                background: none;
                border: none;
                font-size: 24px;
                color: var(--text-muted);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .vault-setup-close:hover {
                background: var(--bg-soft);
                color: var(--text);
            }
            
            .vault-setup-body {
                padding: 24px;
            }
            
            .setup-step {
                display: none;
            }
            
            .setup-step.active {
                display: block;
                animation: fadeInUp 0.3s ease;
            }
            
            .step-header {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .step-number {
                display: inline-block;
                width: 40px;
                height: 40px;
                background: var(--primary);
                color: white;
                border-radius: 50%;
                line-height: 40px;
                text-align: center;
                font-weight: 600;
                margin-bottom: 16px;
            }
            
            .step-header h3 {
                margin: 0 0 8px 0;
                color: var(--text);
                font-size: 1.3rem;
            }
            
            .step-header p {
                margin: 0;
                color: var(--text-muted);
                font-size: 1rem;
            }
            
            .form-group {
                margin-bottom: 24px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: var(--text);
                font-weight: 500;
            }
            
            .form-group small {
                display: block;
                margin-top: 4px;
                color: var(--text-muted);
                font-size: 0.85rem;
            }
            
            .password-strength,
            .password-match {
                margin-top: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.9rem;
            }
            
            .password-strength {
                background: var(--bg-soft);
                border: 1px solid var(--border);
            }
            
            .strength-bar {
                height: 4px;
                background: var(--border);
                border-radius: 2px;
                margin-bottom: 4px;
                overflow: hidden;
            }
            
            .strength-bar::after {
                content: '';
                display: block;
                height: 100%;
                width: 0%;
                background: var(--danger);
                transition: all 0.3s ease;
            }
            
            .password-match {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .password-match.valid {
                background: rgba(59, 210, 127, 0.1);
                border-color: rgba(59, 210, 127, 0.3);
                color: var(--primary);
            }
            
            .password-match.invalid {
                background: rgba(255, 107, 107, 0.1);
                border-color: rgba(255, 107, 107, 0.3);
                color: var(--danger);
            }
            
            .password-tips {
                background: var(--bg-soft);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 16px;
                margin-top: 16px;
            }
            
            .password-tips h4 {
                margin: 0 0 12px 0;
                color: var(--text);
                font-size: 1rem;
            }
            
            .password-tips ul {
                margin: 0;
                padding-left: 20px;
                color: var(--text-muted);
            }
            
            .password-tips li {
                margin-bottom: 8px;
            }
            
            .checkbox-label {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .checkbox-label input[type="checkbox"] {
                margin-top: 2px;
            }
            
            .vault-setup-footer {
                padding: 24px;
                border-top: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .step-indicators {
                display: flex;
                gap: 8px;
            }
            
            .step-indicator {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--bg-soft);
                border: 2px solid var(--border);
                color: var(--text-muted);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .step-indicator.active {
                background: var(--primary);
                border-color: var(--primary);
                color: white;
            }
            
            .step-indicator.completed {
                background: var(--accent);
                border-color: var(--accent);
                color: white;
            }
            
            .setup-actions {
                display: flex;
                gap: 12px;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @media (max-width: 768px) {
                .vault-setup-modal {
                    padding: 10px;
                }
                
                .vault-setup-content {
                    max-height: 95vh;
                }
                
                .vault-setup-header,
                .vault-setup-body,
                .vault-setup-footer {
                    padding: 16px;
                }
                
                .vault-setup-footer {
                    flex-direction: column;
                    gap: 16px;
                }
                
                .setup-actions {
                    width: 100%;
                }
                
                .setup-actions button {
                    flex: 1;
                }
            }
        </style>
    `;
    
    document.body.appendChild(modal);
    
    // Setup modal interactions
    setupModalInteractions(modal);
}

function setupModalInteractions(modal) {
    let currentStep = 1;
    const totalSteps = 3;
    
    const prevBtn = modal.querySelector('#prev-step');
    const nextBtn = modal.querySelector('#next-step');
    const finishBtn = modal.querySelector('#finish-setup');
    const closeBtn = modal.querySelector('.vault-setup-close');
    const backdrop = modal.querySelector('.vault-setup-backdrop');
    
    // Password strength checking
    const masterPassword = modal.querySelector('#master-password');
    const confirmPassword = modal.querySelector('#confirm-password');
    const strengthBar = modal.querySelector('.strength-bar::after');
    const strengthText = modal.querySelector('.strength-text');
    const passwordMatch = modal.querySelector('#password-match');
    
    masterPassword.addEventListener('input', () => {
        const password = masterPassword.value;
        const strength = calculatePasswordStrength(password);
        updatePasswordStrength(strength);
        
        if (confirmPassword.value) {
            checkPasswordMatch();
        }
    });
    
    confirmPassword.addEventListener('input', checkPasswordMatch);
    
    function calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 16) score += 25;
        else if (password.length >= 12) score += 15;
        else if (password.length >= 8) score += 10;
        
        if (/[a-z]/.test(password)) score += 15;
        if (/[A-Z]/.test(password)) score += 15;
        if (/[0-9]/.test(password)) score += 15;
        if (/[^a-zA-Z0-9]/.test(password)) score += 20;
        
        if (/(.)\1{2,}/.test(password)) score -= 20;
        
        return Math.max(0, Math.min(100, score));
    }
    
    function updatePasswordStrength(score) {
        const strengthBar = modal.querySelector('.strength-bar');
        const strengthText = modal.querySelector('.strength-text');
        
        let color, width, text;
        
        if (score < 30) {
            color = 'var(--danger)';
            width = '25%';
            text = 'Muito Fraca';
        } else if (score < 50) {
            color = 'var(--warning)';
            width = '50%';
            text = 'Fraca';
        } else if (score < 70) {
            color = '#ffa500';
            width = '75%';
            text = 'Média';
        } else {
            color = 'var(--primary)';
            width = '100%';
            text = 'Forte';
        }
        
        strengthBar.style.setProperty('--strength-width', width);
        strengthBar.innerHTML = `<div style="width: ${width}; height: 100%; background: ${color}; transition: all 0.3s ease;"></div>`;
        strengthText.textContent = `Força: ${text}`;
    }
    
    function checkPasswordMatch() {
        const match = masterPassword.value === confirmPassword.value && masterPassword.value.length > 0;
        const matchIndicator = modal.querySelector('.match-indicator');
        const matchText = modal.querySelector('.match-text');
        
        if (match) {
            passwordMatch.className = 'password-match valid';
            matchIndicator.textContent = '✅';
            matchText.textContent = 'As senhas coincidem';
        } else {
            passwordMatch.className = 'password-match invalid';
            matchIndicator.textContent = '⚠️';
            matchText.textContent = 'As senhas não coincidem';
        }
    }
    
    // Step navigation
    function showStep(step) {
        // Hide all steps
        modal.querySelectorAll('.setup-step').forEach(s => s.classList.remove('active'));
        
        // Show current step
        modal.querySelector(`#setup-step-${step}`).classList.add('active');
        
        // Update indicators
        modal.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 < step) {
                indicator.classList.add('completed');
            } else if (index + 1 === step) {
                indicator.classList.add('active');
            }
        });
        
        // Update buttons
        prevBtn.style.display = step === 1 ? 'none' : 'block';
        nextBtn.style.display = step === totalSteps ? 'none' : 'block';
        finishBtn.style.display = step === totalSteps ? 'block' : 'none';
        
        currentStep = step;
    }
    
    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            // Validate current step
            if (validateStep(currentStep, modal)) {
                showStep(currentStep + 1);
            }
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });
    
    finishBtn.addEventListener('click', () => {
        if (validateStep(currentStep, modal)) {
            completeVaultSetup(modal);
        }
    });
    
    closeBtn.addEventListener('click', () => modal.remove());
    backdrop.addEventListener('click', () => modal.remove());
    
    // Custom question handling
    const securityQuestion = modal.querySelector('#security-question');
    const customQuestionGroup = modal.querySelector('#custom-question-group');
    
    securityQuestion.addEventListener('change', () => {
        if (securityQuestion.value === 'custom') {
            customQuestionGroup.style.display = 'block';
        } else {
            customQuestionGroup.style.display = 'none';
        }
    });
}

function validateStep(step, modal) {
    if (step === 1) {
        const masterPassword = modal.querySelector('#master-password').value;
        const confirmPassword = modal.querySelector('#confirm-password').value;
        
        if (masterPassword.length < 12) {
            alert('A palavra-passe deve ter pelo menos 12 caracteres.');
            return false;
        }
        
        if (masterPassword !== confirmPassword) {
            alert('As senhas não coincidem.');
            return false;
        }
        
        const strength = calculatePasswordStrength(masterPassword);
        if (strength < 50) {
            alert('Por favor, escolha uma palavra-passe mais forte.');
            return false;
        }
    }
    
    return true;
}

function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 16) score += 25;
    else if (password.length >= 12) score += 15;
    else if (password.length >= 8) score += 10;
    
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    
    if (/(.)\1{2,}/.test(password)) score -= 20;
    
    return Math.max(0, Math.min(100, score));
}

function completeVaultSetup(modal) {
    // Collect form data
    const formData = {
        masterPassword: modal.querySelector('#master-password').value,
        recoveryHint: modal.querySelector('#recovery-hint').value,
        securityQuestion: modal.querySelector('#security-question').value,
        customQuestion: modal.querySelector('#custom-question').value,
        securityAnswer: modal.querySelector('#security-answer').value,
        autoLock: modal.querySelector('#auto-lock').checked,
        autoLockTime: modal.querySelector('#auto-lock-time').value,
        clearClipboard: modal.querySelector('#clear-clipboard').checked,
        clearTime: modal.querySelector('#clear-time').value,
        backupReminder: modal.querySelector('#backup-reminder').checked
    };
    
    // Here you would normally save this data and initialize the vault
    console.log('Vault setup completed:', formData);
    
    // Show success message
    modal.remove();
    showVaultSetupSuccess();
}

function showVaultSetupSuccess() {
    const successModal = document.createElement('div');
    successModal.className = 'vault-success-modal';
    successModal.innerHTML = `
        <div class="success-content">
            <div class="success-icon">🎉</div>
            <h2>Cofre Configurado com Sucesso!</h2>
            <p>Seu cofre de senhas está pronto para uso. Todas as suas senhas serão criptografadas com segurança militar.</p>
            <button class="btn-primary" onclick="this.closest('.vault-success-modal').remove()">Começar a Usar</button>
        </div>
        
        <style>
            .vault-success-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                padding: 20px;
            }
            
            .success-content {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
                animation: fadeInUp 0.5s ease;
            }
            
            .success-icon {
                font-size: 4rem;
                margin-bottom: 24px;
            }
            
            .success-content h2 {
                margin: 0 0 16px 0;
                color: var(--text);
                font-size: 1.5rem;
            }
            
            .success-content p {
                margin: 0 0 32px 0;
                color: var(--text-muted);
                line-height: 1.6;
            }
        </style>
    `;
    
    document.body.appendChild(successModal);
    
    // Update vault status
    updateVaultStatus('unlocked');
}

function setupVaultStatus() {
    // This would normally check if vault is already configured
    // For now, we'll keep it locked until setup is completed
}

function updateVaultStatus(status) {
    const statusElement = document.getElementById('vault-status');
    const statusIndicator = statusElement.querySelector('.status-indicator');
    const statusText = statusElement.querySelector('.status-text');
    
    if (status === 'unlocked') {
        statusElement.classList.add('unlocked');
        statusIndicator.textContent = '🔓';
        statusIndicator.classList.remove('locked');
        statusText.textContent = 'Desbloqueado';
    }
}

// Export for global access
window.initVaultAdvanced = initVaultAdvanced;
