# 🔐 Cryptivault - Gerador de Senhas Seguras e Cofre Digital

**Cryptivault** é uma aplicação web profissional que combina:

- **🔐 Gerador de senhas fortes e personalizáveis**
- **🛡️ Cofre criptografado localmente (IndexedDB + AES-256)**
- **🔑 Armazenamento seguro (AES-GCM + PBKDF2)**
- **📱 CRUD completo de senhas (add / edit / delete / search)**
- **🌐 100% client-side, sem backend**
- **⚡ WebCrypto API nativa**
- **🎨 UI moderna, responsiva e profissional**
- **🌓 Tema claro/escuro/automático**
- **📱 Design mobile-first**

Este projeto foi desenvolvido com foco em **segurança máxima**, **privacidade total**, **experiência profissional**, e **arquitetura modular enterprise-ready**.

---

## 📌 Índice

1. [🔥 Características](#-características)
2. [🛠 Tecnologias](#-tecnologias)
3. [🔐 Segurança do Cofre](#-segurança-do-cofre)
4. [📁 Estrutura de Pastas](#-estrutura-de-pastas)
5. [▶ Como Rodar o Projeto](#-como-rodar-o-projeto)
6. [🔑 Gerador de Senhas](#-gerador-de-senhas)
7. [🛡️ Cofre de Senhas](#-cofre-de-senhas)
8. [🎨 Interface e Design](#-interface-e-design)
9. [📱 Screenshots](#-screenshots)
10. [📌 To-Do / Melhorias Futuras](#-to-do--melhorias-futuras)
11. [📄 Licença](#-licença)

---

## 🔥 Características

### 🎯 **Gerador de Senhas**
✔ Geração de senhas criptograficamente seguras  
✔ Personalização completa (tamanho, tipos de caracteres)  
✔ Presets de força (Fraca, Média, Forte, Muito Forte)  
✔ Cálculo de entropia e tempo de quebra  
✔ Botão de copiar com feedback visual  
✔ Geração de múltiplas senhas  
✔ Geração de passphrases memoráveis  
✔ Análise de força em tempo real  

### 🛡️ **Cofre Digital**
✔ Armazenamento em IndexedDB (persistência real)  
✔ Criptografia AES-256 com salt único  
✔ Palavra-passe mestra com PBKDF2 (150.000 iterações)  
✔ CRUD completo: adicionar, editar, excluir, buscar  
✔ Interface intuitiva com modais modernos  
✔ Busca instantânea de senhas  
✔ Tags e categorias organizáveis  
✔ Exportação/importação segura  
✔ Auto-lock após inatividade  

### 🎨 **Interface Profissional**
✔ Design moderno e minimalista  
✔ Tema claro/escuro/automático  
✔ Totalmente responsivo (mobile-first)  
✔ Animações suaves e micro-interações  
✔ Acessibilidade completa (ARIA labels)  
✔ Favicon profissional (🔐)  
✔ Footer com links profissionais  
✔ Atalhos de teclado (Ctrl+/)  

### 🔒 **Segurança Enterprise**
✔ Zero-knowledge architecture  
✔ Nada é enviado para servidores  
✔ Criptografia client-side only  
✔ Proteção contra side-channel attacks  
✔ Secure random generation (WebCrypto)  
✔ Memory-safe operations  
✔ Auto-destruição de dados sensíveis  

---

## 🛠 Tecnologias

### **Frontend Core**
- **HTML5 Semântico** (SEO-friendly)
- **CSS3 Modular** (BEM methodology)
- **JavaScript ES6+ Modules** (tree-shaking ready)
- **WebCrypto API** (native cryptography)

### **Criptografia**
- **AES-GCM** (256-bit encryption)
- **PBKDF2** (key derivation, 150k iterations)
- **SHA-256** (hashing)
- **Crypto.getRandomValues** (secure random)

### **Armazenamento**
- **IndexedDB** (persistent storage)
- **SessionStorage** (temporary keys)
- **LocalStorage** (preferences only)

### **UI/UX**
- **CSS Variables** (theming system)
- **Flexbox/Grid** (modern layout)
- **CSS Transitions** (smooth animations)
- **SVG Icons** (scalable graphics)

---

## 🔐 Segurança do Cofre

### 🛡️ **Arquitetura Zero-Knowledge**
Todo o conteúdo salvo no cofre é protegido por múltiplas camadas de segurança:

### 🔑 **Derivação de Chave**
- **Algoritmo**: PBKDF2
- **Iterações**: 150.000 (configurável)
- **Hash**: SHA-256
- **Salt**: 16 bytes aleatórios por vault
- **Output**: 256-bit derived key

### 🔐 **Criptografia Simétrica**
- **Algoritmo**: AES-GCM
- **Key Size**: 256 bits
- **IV**: 12 bytes aleatórios por operação
- **Authentication**: GCM tag (integrity verification)

### 🚫 **Princípios de Segurança**
❌ **NUNCA** salvamos:
- Senha-mestra em texto puro
- Chaves de criptografia
- Senhas descriptografadas
- Dados sensíveis em memória

✅ **SEMPRE** usamos:
- Salt aleatório por vault
- IV único por operação
- Zero-knowledge architecture
- Secure memory cleanup

---

## 📁 Estrutura de Pastas

```bash
cryptivault/
├── 📄 index.html                 # Página principal
├── 📄 main.js                   # Entry point da aplicação
├── 📁 css/                      # Stylesheets modulares
│   ├── colors.css              # Variáveis de cores
│   ├── layout.css              # Grid e layout
│   ├── components.css          # Componentes UI
│   ├── generator.css           # Estilos do gerador
│   ├── vault.css               # Estilos do cofre
│   ├── vault-advanced.css      # Features avançadas
│   ├── security.css            # Centro de segurança
│   ├── theme.css               # Sistema de temas
│   └── footer.css              # Footer profissional
├── 📁 src/
│   └── 📁 modules/             # Módulos JavaScript
│       ├── generator.js        # Lógica do gerador
│       ├── clipboard.js        # Copiar para clipboard
│       ├── shortcuts.js        # Atalhos de teclado
│       ├── theme.js            # Sistema de temas
│       ├── security.js         # Análise de segurança
│       ├── security-advanced.js # Features avançadas
│       ├── vault-advanced.js    # UI do cofre avançado
│       └── 📁 vault/           # Módulos do cofre
│           ├── vault-ui.js      # Interface do cofre
│           ├── vault-crypto.js  # Criptografia
│           └── vault-storage.js # IndexedDB operations
└── 📁 assets/                  # Recursos estáticos
    └── 📁 images/              # Imagens e ícones
```

---

## ▶ Como Rodar o Projeto

### 🚀 **Setup Rápido**

Por segurança, o WebCrypto API precisa de **contexto seguro (HTTPS ou localhost)**:

```bash
# Clone o repositório
git clone <repository-url>
cd cryptivault

# Inicie o servidor local
python3 -m http.server 8000 --bind 127.0.0.1

# Acesse a aplicação
🌐 http://127.0.0.1:8000
```

### 📱 **Acesso**
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome Mobile, Safari Mobile
- **Tablet**: iPadOS, Android Tablets
- **PWA Ready**: Instalável como app nativo

---

## 🔑 Gerador de Senhas

### ⚙️ **Funcionalidades Principais**

#### **🎯 Personalização Completa**
- **Tamanho**: 4-128 caracteres
- **Character Sets**: 
  - Letras minúsculas (a-z)
  - Letras maiúsculas (A-Z)
  - Números (0-9)
  - Símbolos (!@#$%^&*)
  - Excluir similares (il1Lo0O)
  - Excluir ambíguos ({}[]())

#### **🔥 Presets de Força**
- **🟢 Fraca**: 8 chars, lowercase only
- **🟡 Média**: 12 chars, lowercase + uppercase + numbers
- **🟠 Forte**: 16 chars, all character types
- **🔴 Muito Forte**: 24 chars, maximum entropy

#### **📊 Análise em Tempo Real**
- **Entropia**: Cálculo em bits
- **Força**: Classificação visual
- **Tempo de Quebra**: Estimativa realista
- **Feedback**: Sugestões de melhoria

#### **🎲 Modos de Geração**
- **Password Mode**: Senha tradicional
- **Passphrase Mode**: Frases memoráveis
- **Bulk Mode**: Múltiplas senhas

---

## 🛡️ Cofre de Senhas

### 🔐 **Funcionalidades Completas**

#### **🚀 Setup Inicial**
1. **Criar Vault**: Definir senha-mestra forte
2. **Configurar**: Parâmetros de segurança
3. **Backup**: Exportar chave de recuperação

#### **🔓 Operações do Vault**
- **🔐 Desbloquear**: Verificação de senha-mestra
- **➕ Adicionar**: Novas entradas com metadados
- **✏️ Editar**: Modificar entradas existentes
- **🗑️ Excluir**: Remover entradas permanentemente
- **🔍 Buscar**: Pesquisa instantânea
- **📋 Exportar**: Backup seguro criptografado

#### **📱 Campos por Entrada**
- **📝 Título**: Nome do serviço/website
- **👤 Usuário**: Email ou username
- **🔑 Senha**: Password gerenciado
- **🏷️ Tags**: Categorias personalizadas
- **📝 Notas**: Informações adicionais
- **🔗 URL**: Link do serviço

#### **⚡ Features Avançadas**
- **🔄 Auto-sync**: Sincronização automática
- **🔒 Auto-lock**: Bloqueio por inatividade
- **📊 Estatísticas**: Análise do vault
- **🛡️ Health Check**: Verificação de segurança
- **📱 Mobile Optimized**: Interface touch-friendly

---

## 🎨 Interface e Design

### 🌈 **Sistema de Temas**
- **☀️ Tema Claro**: Cores vibrantes e modernas
- **🌙 Tema Escuro**: Modo noturno para conforto visual
- **🌓 Tema Automático**: Segue preferência do sistema

### 📱 **Design Responsivo**
- **📱 Mobile**: 320px+ (touch-optimized)
- **📱 Tablet**: 768px+ (landscape support)
- **💻 Desktop**: 1024px+ (full features)

### ✨ **Micro-interações**
- **🎯 Hover States**: Feedback visual
- **⚡ Transições**: Animações suaves (300ms)
- **🔄 Loading States**: Indicadores de progresso
- **✅ Success States**: Confirmações visuais
- **❌ Error States**: Tratamento amigável de erros

### ♿ **Acessibilidade**
- **🎯 Keyboard Navigation**: Tab navigation completo
- **🔊 Screen Reader**: ARIA labels e descrições
- **🎨 Color Contrast**: WCAG 2.1 AA compliance
- **⚡ Focus Management**: Indicadores visuais de foco

---

## 📱 Screenshots

### 🎯 **Interface Principal**
![Cryptivault Main Interface](./screenshots/main-interface.png)

### 🔐 **Gerador de Senhas**
![Password Generator](./screenshots/generator.png)

### 🛡️ **Cofre Bloqueado**
![Vault Locked](./screenshots/vault-locked.png)

### 🔓 **Cofre Desbloqueado**
![Vault Unlocked](./screenshots/vault-open.png)

### 🎨 **Tema Escuro**
![Dark Theme](./screenshots/dark-theme.png)

### 📱 **Mobile View**
![Mobile Interface](./screenshots/mobile.png)

---

## 📌 To-Do / Melhorias Futuras

### 🚀 **Features em Desenvolvimento**
- [ ] **🔐 Biometric Auth**: Suporte a fingerprint/face ID
- [ ] **☁️ Cloud Sync**: Sincronização criptografada
- [ ] **🔗 Password Generator Integration**: Gerar e salvar em 1 clique
- [ ] **📊 Security Dashboard**: Dashboard de segurança avançado
- [ ] **🔄 Auto-fill**: Browser extension integration
- [ ] **📱 PWA Full Support**: Installable app com offline mode

### 🎯 **Melhorias de UX**
- [ ] **🔍 Advanced Search**: Filtros e busca avançada
- [ ] **📁 Categories/Collections**: Organização hierárquica
- [ ] **📊 Usage Analytics**: Estatísticas de uso
- [ ] **🎨 Custom Themes**: Temas personalizáveis
- [ ] **🌐 Multi-language**: Suporte a múltiplos idiomas

### 🔒 **Enhancements de Segurança**
- [ ] **🔐 2FA Integration**: Google Authenticator, Authy
- [ ] **🛡️ Security Audit**: Auditoria automática de senhas
- [ ] **🔄 Password Rotation**: Rotação automática de senhas
- [ ] **📊 Breach Monitoring**: Monitoramento de vazamentos
- [ ] **🔑 Emergency Access**: Acesso de emergência seguro

---

## 📄 Licença

Este projeto é **software livre** para fins educacionais e pessoais.

### 📋 **Termos de Uso**
✅ **Livre uso** pessoal e educacional  
✅ **Modificação permitida** (mantenha créditos)  
✅ **Distribuição livre** (não comercial)  
❌ **Uso comercial** sem autorização  
❌ **Remoção de créditos** do desenvolvedor  

### 👨‍💻 **Desenvolvedor**
- **👤 Eduardo Martins**
- **🔗 LinkedIn**: [https://www.linkedin.com/in/eduardomartins2/](https://www.linkedin.com/in/eduardomartins2/)
- **📧 Contato**: Disponível via LinkedIn

### 🛡️ **Disclaimer**
Este software é fornecido "como está", sem garantias. O usuário é responsável pela segurança de suas senhas. Use por sua conta e risco.

---

## 🎯 **Resumo do Projeto**

**Cryptivault** é a solução definitiva para gestão de senhas com:
- 🔐 **Segurança enterprise-grade**
- 🎨 **Interface profissional moderna**
- 📱 **Experiência mobile-first**
- 🌐 **100% client-side e privado**
- ⚡ **Performance otimizada**
- 🛡️ **Zero-knowledge architecture**

**Pronto para uso profissional e pessoal!** 🚀
