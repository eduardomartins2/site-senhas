import { generateSalt, deriveKey, encryptData, decryptData } from "./vault-crypto.js";
import { loadVault, addEntry, updateEntry, deleteEntry, exportVault, importVault, mergeVault } from "./vault-storage.js";

const VAULT_KEY = "secure_vault";
const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutos
const MAX_ATTEMPTS = 5; // Máximo de tentativas
const ATTEMPT_TIMEOUT = 15 * 60 * 1000; // 15 minutos de bloqueio após falhas

let autoLockTimer = null;
let lastActivity = Date.now();
let failedAttempts = 0;
let lockoutUntil = 0;

export function initVaultUI() {
    console.log("Vault UI initialized");

    // Elementos da interface
    const startScreen = document.getElementById("vault-start-screen");
    const createScreen = document.getElementById("vault-create-screen");
    const unlockScreen = document.getElementById("vault-unlock-screen");
    const unlockedSection = document.getElementById("vault-unlocked-section");

    // Botões
    const btnStartCreate = document.getElementById("vault-start-create");
    const btnStartUnlock = document.getElementById("vault-start-unlock");
    const btnBackFromCreate = document.getElementById("vault-back-from-create");
    const btnBackFromUnlock = document.getElementById("vault-back-from-unlock");
    const btnCreateVault = document.getElementById("vault-create-btn");
    const btnUnlockVault = document.getElementById("vault-unlock-btn");
    const btnAddEntry = document.getElementById("vault-add-entry-btn");

    // Inputs
    const inputCreatePass = document.getElementById("vault-create-pass");
    const inputCreateConfirm = document.getElementById("vault-create-pass-confirm");
    const inputUnlockPass = document.getElementById("vault-unlock-pass");

    const inputNewName = document.getElementById("new-entry-name");
    const inputNewUser = document.getElementById("new-entry-username");
    const inputNewPass = document.getElementById("new-entry-password");
    const inputNewTags = document.getElementById("new-entry-tags");

    // Botão de exportação
    const btnExportVault = document.getElementById("vault-export-btn");
    const btnImportVault = document.getElementById("vault-import-btn");

    // Campo de busca
    const searchInput = document.getElementById("vault-search");

    // Auto-lock functions
    function resetAutoLockTimer() {
        lastActivity = Date.now();
        if (autoLockTimer) {
            clearTimeout(autoLockTimer);
        }
        autoLockTimer = setTimeout(lockVault, AUTO_LOCK_TIMEOUT);
    }

    function clearVaultKey() {
        if (window.__vault_key) {
            try {
                // Limpar chave criptográfica da memória de forma segura
                if (window.__vault_key && typeof window.__vault_key === 'object') {
                    // Para CryptoKey objects, não podemos modificar diretamente
                    // Mas podemos remover a referência para garbage collection
                }
                window.__vault_key = null;
                
                // Forçar garbage collection se disponível (apenas em desenvolvimento)
                if (window.gc && typeof window.gc === 'function') {
                    window.gc();
                }
            } catch (error) {
                console.warn('Error clearing vault key:', error);
                window.__vault_key = null;
            }
        }
    }

    function isLockedOut() {
        return Date.now() < lockoutUntil;
    }

    function getRemainingLockoutTime() {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
        return remaining > 0 ? remaining : 0;
    }

    function handleFailedAttempt() {
        failedAttempts++;
        
        if (failedAttempts >= MAX_ATTEMPTS) {
            lockoutUntil = Date.now() + ATTEMPT_TIMEOUT;
            const minutes = ATTEMPT_TIMEOUT / 1000 / 60;
            alert(`Muitas tentativas falhas. Cofre bloqueado por ${minutes} minutos.`);
            return true; // indica que foi bloqueado
        }
        
        const remaining = MAX_ATTEMPTS - failedAttempts;
        alert(`Senha incorreta. ${remaining} tentativa(s) restante(s).`);
        return false;
    }

    function resetFailedAttempts() {
        failedAttempts = 0;
        lockoutUntil = 0;
    }

    function validateMasterPassword(password) {
        const minLength = 12;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
        const noCommonPatterns = !/(123|abc|qwe|password|senha)/i.test(password);
        
        const issues = [];
        
        if (password.length < minLength) {
            issues.push(`Mínimo ${minLength} caracteres`);
        }
        if (!hasUpperCase) {
            issues.push("Letra maiúscula");
        }
        if (!hasLowerCase) {
            issues.push("Letra minúscula");
        }
        if (!hasNumbers) {
            issues.push("Número");
        }
        if (!hasSpecialChars) {
            issues.push("Caractere especial");
        }
        if (!noCommonPatterns) {
            issues.push("Evite padrões comuns");
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    function lockVault() {
        if (window.__vault_key) {
            clearVaultKey();
            hideAll();
            unlockScreen.style.display = "block";
            inputUnlockPass.value = "";
            alert("Cofre bloqueado automaticamente por inatividade.");
        }
    }

    // Activity monitoring
    function setupActivityMonitoring() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, resetAutoLockTimer, true);
        });
    }

    // Adicionar evento de busca
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadAndRenderVault();
            }, 300); // Debounce de 300ms
        });
        
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                loadAndRenderVault();
            }
        });
    }

    setupActivityMonitoring();

    // Navegação
    function hideAll() {
        startScreen.style.display = "none";
        createScreen.style.display = "none";
        unlockScreen.style.display = "none";
        unlockedSection.style.display = "none";
    }

    btnStartCreate.addEventListener("click", () => {
        hideAll();
        createScreen.style.display = "block";
    });

    btnStartUnlock.addEventListener("click", () => {
        hideAll();
        unlockScreen.style.display = "block";
    });

    btnBackFromCreate.addEventListener("click", () => {
        clearVaultKey(); // Limpar chave ao voltar
        hideAll();
        startScreen.style.display = "block";
    });

    btnBackFromUnlock.addEventListener("click", () => {
        clearVaultKey(); // Limpar chave ao voltar
        hideAll();
        startScreen.style.display = "block";
    });

    // Criar Cofre
    btnCreateVault.addEventListener("click", async () => {
        clearVaultKey(); // Limpar qualquer chave existente antes de criar novo cofre
        
        const pass = inputCreatePass.value.trim();
        const pass2 = inputCreateConfirm.value.trim();

        if (pass.length < 6) {
            alert("A palavra-passe deve ter no mínimo 6 caracteres.");
            return;
        }

        if (pass !== pass2) {
            alert("As palavras-passe não coincidem.");
            return;
        }

        // Validação forte da senha mestra
        const validation = validateMasterPassword(pass);
        if (!validation.isValid) {
            const message = "Senha mestra muito fraca. Requisitos:\n• " + validation.issues.join("\n• ");
            alert(message);
            return;
        }

        const salt = await generateSalt();
        const key = await deriveKey(pass, salt);

        const initialVault = {
            entries: []
        };

        const encrypted = await encryptData(key, initialVault);

        const vaultToSave = {
            salt: arrayToBase64(salt),
            iv: arrayToBase64(encrypted.iv),
            ciphertext: arrayToBase64(new Uint8Array(encrypted.ciphertext))
        };

        localStorage.setItem(VAULT_KEY, JSON.stringify(vaultToSave));

        alert("Cofre criado com sucesso!");

        clearVaultKey(); // Limpar chave temporária após criação
        hideAll();
        unlockScreen.style.display = "block";
    });

    // Desbloquear Cofre
    btnUnlockVault.addEventListener("click", async () => {
        // Verificar se está bloqueado por tentativas falhas
        if (isLockedOut()) {
            const remainingMinutes = getRemainingLockoutTime();
            alert(`Cofre bloqueado. Tente novamente em ${remainingMinutes} minuto(s).`);
            return;
        }

        clearVaultKey(); // Limpar qualquer chave existente antes de desbloquear
        
        const pass = inputUnlockPass.value.trim();

        const saved = localStorage.getItem(VAULT_KEY);
        if (!saved) {
            alert("Nenhum cofre existente. Crie um novo.");
            return;
        }

        const vaultData = JSON.parse(saved);

        const salt = base64ToArray(vaultData.salt);
        const iv = base64ToArray(vaultData.iv);
        const ciphertext = base64ToArray(vaultData.ciphertext);

        const key = await deriveKey(pass, salt);

        const decrypted = await decryptData(key, { iv, ciphertext });

        if (!decrypted) {
            clearVaultKey(); // Limpar chave incorreta
            const wasLockedOut = handleFailedAttempt();
            
            if (wasLockedOut) {
                inputUnlockPass.value = "";
            }
            return;
        }

        resetFailedAttempts(); // Resetar contador em sucesso
        alert("Cofre desbloqueado!");

        hideAll();
        unlockedSection.style.display = "block";

        window.__vault_key = key;
        const searchTerm = searchInput?.value || '';
        renderVaultEntries(decrypted.entries, searchTerm);
        resetAutoLockTimer(); // Iniciar timer ao desbloquear
    });

    // Adicionar nova entrada
    btnAddEntry.addEventListener("click", async () => {
        const name = inputNewName.value.trim();
        const user = inputNewUser.value.trim();
        const pass = inputNewPass.value.trim();
        const tags = inputNewTags.value.split(",").map(t => t.trim()).filter(Boolean);

        if (!name || !user || !pass) {
            alert("Preencha título, usuário e senha.");
            return;
        }

        await addEntry(window.__vault_key, name, user, pass, tags);

        const updated = await loadVault(window.__vault_key);
        const searchTerm = searchInput?.value || '';
        renderVaultEntries(updated.entries, searchTerm);

        inputNewName.value = "";
        inputNewUser.value = "";
        inputNewPass.value = "";
        inputNewTags.value = "";
    });

    // Exportar Cofre
    if (btnExportVault) {
        btnExportVault.addEventListener("click", async () => {
            if (!window.__vault_key) {
                alert("Cofre não está desbloqueado.");
                return;
            }

            const exportPassword = prompt("Digite uma senha para criptografar o arquivo de exportação:");
            if (!exportPassword) {
                return; // Usuário cancelou
            }

            if (exportPassword.length < 8) {
                alert("A senha de exportação deve ter no mínimo 8 caracteres.");
                return;
            }

            try {
                const exportData = await exportVault(window.__vault_key, exportPassword);
                
                // Criar e baixar arquivo
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `password-vault-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                alert("Cofre exportado com sucesso! Guarde o arquivo e a senha de exportação em local seguro.");
            } catch (error) {
                alert("Erro ao exportar cofre: " + error.message);
            }
        });
    }

    // Importar Cofre
    if (btnImportVault) {
        btnImportVault.addEventListener("click", async () => {
            if (!window.__vault_key) {
                alert("Cofre não está desbloqueado.");
                return;
            }

            // Criar input de arquivo
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            
            fileInput.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                try {
                    const fileContent = await file.text();
                    
                    const exportPassword = prompt("Digite a senha do arquivo de exportação:");
                    if (!exportPassword) {
                        return; // Usuário cancelou
                    }

                    // Importar e validar dados
                    const importedData = await importVault(exportPassword, fileContent);
                    
                    // Confirmar importação
                    const confirmMessage = `Importar ${importedData.metadata.entriesCount} senhas do cofre?\n\n` +
                        `Data de exportação: ${new Date(importedData.metadata.originalExportDate).toLocaleDateString()}\n` +
                        `Esta ação irá adicionar as senhas ao seu cofre atual.`;
                    
                    if (!confirm(confirmMessage)) {
                        return;
                    }

                    // Mesclar com cofre atual
                    const mergeResult = await mergeVault(window.__vault_key, importedData.vaultData);
                    
                    // Atualizar interface
                    const updatedVault = await loadVault(window.__vault_key);
                    renderVaultEntries(updatedVault.entries);

                    const successMessage = `Importação concluída!\n\n` +
                        `Total importado: ${mergeResult.totalImported}\n` +
                        `Conflitos resolvidos: ${mergeResult.conflictsResolved}\n` +
                        `Novas entradas: ${mergeResult.newEntriesAdded}\n` +
                        `Total no cofre: ${mergeResult.totalEntries}`;
                    
                    alert(successMessage);
                    resetAutoLockTimer();

                } catch (error) {
                    alert("Erro ao importar cofre: " + error.message);
                }
            };

            fileInput.click();
        });
    }
}

// Helpers Base64
function arrayToBase64(arr) {
    return btoa(String.fromCharCode(...arr));
}

function base64ToArray(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

// Renderizar itens
function renderVaultEntries(entries, searchTerm = '') {
    const list = document.getElementById("vault-entries");
    list.innerHTML = "";

    // Filtrar entradas baseado no termo de busca
    let filteredEntries = entries;
    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filteredEntries = entries.filter(entry => {
            return entry.title.toLowerCase().includes(term) ||
                   entry.username.toLowerCase().includes(term) ||
                   entry.tags.some(tag => tag.toLowerCase().includes(term));
        });
    }

    // Mostrar mensagem se não houver resultados
    if (filteredEntries.length === 0 && searchTerm.trim()) {
        list.innerHTML = `
            <div class="vault-no-results">
                <p>Nenhuma senha encontrada para "${searchTerm}"</p>
                <button class="btn-secondary" onclick="clearSearch()">Limpar busca</button>
            </div>
        `;
        return;
    }

    // Renderizar entradas filtradas
    filteredEntries.forEach(item => {
        const div = document.createElement("div");
        div.className = "vault-item";

        // Destacar termo de busca no texto
        const highlightText = (text, term) => {
            if (!term) return text;
            const regex = new RegExp(`(${term})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        };

        const highlightedTitle = highlightText(item.title, searchTerm);
        const highlightedUsername = highlightText(item.username, searchTerm);
        const highlightedTags = item.tags.map(tag => highlightText(tag, searchTerm)).join(", ");

        div.innerHTML = `
            <h4>${highlightedTitle}</h4>
            <p><b>Usuário:</b> ${highlightedUsername}</p>
            <p><b>Senha:</b> 
                <span class="vault-password-container">
                    <span class="vault-password-text" data-password="${item.password}">${item.password}</span>
                    <button class="vault-copy-btn" data-password="${item.password}" title="Copiar senha">📋</button>
                </span>
            </p>
            <p><b>Tags:</b> ${highlightedTags}</p>
            <div class="vault-item-actions">
                <button class="vault-edit-btn" data-id="${item.id}">Editar</button>
                <button class="vault-delete-btn" data-id="${item.id}">Excluir</button>
            </div>
        `;

        list.appendChild(div);
    });

    // Adicionar eventos de edição
    list.querySelectorAll(".vault-edit-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;
            await openEditModal(id);
        });
    });

    // Adicionar eventos de cópia de senha
    list.querySelectorAll(".vault-copy-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const password = e.target.dataset.password;
            await copyToClipboard(password, e.target);
        });
    });

    // Adicionar eventos de exclusão (existente)
    list.querySelectorAll(".vault-delete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;

            if (confirm("Tem certeza que deseja excluir esta senha?")) {
                await deleteEntry(window.__vault_key, id);

                const updated = await loadVault(window.__vault_key);
                renderVaultEntries(updated.entries, searchTerm);
            }
        });
    });
}

// Limpar busca
function clearSearch() {
    const searchInput = document.getElementById("vault-search");
    if (searchInput) {
        searchInput.value = '';
        // Re-renderizar todas as entradas
        loadAndRenderVault();
    }
}

// Copiar para clipboard com feedback
async function copyToClipboard(text, buttonElement) {
    try {
        // Usar a API moderna de clipboard
        await navigator.clipboard.writeText(text);
        
        // Feedback visual
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '✓ Copiado!';
        buttonElement.style.background = 'var(--accent)';
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.background = '';
        }, 2000);
        
        resetAutoLockTimer();
    } catch (error) {
        // Fallback para browsers mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            
            // Feedback visual
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✓ Copiado!';
            buttonElement.style.background = 'var(--accent)';
            
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.background = '';
            }, 2000);
        } catch (fallbackError) {
            console.error('Failed to copy to clipboard:', fallbackError);
            alert('Falha ao copiar senha. Copie manualmente.');
        }
        
        document.body.removeChild(textArea);
        resetAutoLockTimer();
    }
}

// Carregar e renderizar cofre
async function loadAndRenderVault() {
    try {
        const vault = await loadVault(window.__vault_key);
        if (vault) {
            const searchTerm = document.getElementById("vault-search")?.value || '';
            renderVaultEntries(vault.entries, searchTerm);
        }
    } catch (error) {
        console.error('Failed to load vault:', error);
    }
}

// Abrir modal de edição
async function openEditModal(entryId) {
    try {
        const vault = await loadVault(window.__vault_key);
        const entry = vault.entries.find(e => e.id === entryId);
        
        if (!entry) {
            alert("Entrada não encontrada.");
            return;
        }

        // Criar modal de edição
        const modal = document.createElement("div");
        modal.className = "vault-edit-modal";
        modal.innerHTML = `
            <div class="vault-edit-content">
                <h3>Editar Senha</h3>
                <form id="edit-form">
                    <label for="edit-title">Título:</label>
                    <input type="text" id="edit-title" value="${entry.title}" required>
                    
                    <label for="edit-username">Usuário:</label>
                    <input type="text" id="edit-username" value="${entry.username}" required>
                    
                    <label for="edit-password">Senha:</label>
                    <input type="password" id="edit-password" value="${entry.password}" required>
                    
                    <label for="edit-tags">Tags (separadas por vírgula):</label>
                    <input type="text" id="edit-tags" value="${entry.tags.join(', ')}">
                    
                    <div class="vault-edit-actions">
                        <button type="button" class="btn-secondary" id="cancel-edit">Cancelar</button>
                        <button type="submit" class="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Adicionar eventos
        const form = document.getElementById("edit-form");
        const cancelBtn = document.getElementById("cancel-edit");

        cancelBtn.addEventListener("click", () => {
            document.body.removeChild(modal);
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const updatedEntry = {
                title: document.getElementById("edit-title").value.trim(),
                username: document.getElementById("edit-username").value.trim(),
                password: document.getElementById("edit-password").value.trim(),
                tags: document.getElementById("edit-tags").value.split(",").map(t => t.trim()).filter(Boolean)
            };

            if (!updatedEntry.title || !updatedEntry.username || !updatedEntry.password) {
                alert("Preencha título, usuário e senha.");
                return;
            }

            try {
                await updateEntry(window.__vault_key, entryId, updatedEntry);
                
                const updated = await loadVault(window.__vault_key);
                renderVaultEntries(updated.entries);
                
                document.body.removeChild(modal);
                alert("Senha atualizada com sucesso!");
                resetAutoLockTimer();
            } catch (error) {
                alert("Erro ao atualizar senha: " + error.message);
            }
        });

        // Focar no primeiro campo
        document.getElementById("edit-title").focus();

    } catch (error) {
        alert("Erro ao abrir edição: " + error.message);
    }
}
