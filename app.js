import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getVertexAI, getGenerativeModel } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-vertexai.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyDfLLHd8tUYj6wG9c6lNCHCs5yxUyqRWWw",
  authDomain: "gen-lang-client-0344873040.firebaseapp.com",
  projectId: "gen-lang-client-0344873040",
  storageBucket: "gen-lang-client-0344873040.firebasestorage.app",
  messagingSenderId: "670847723180",
  appId: "1:670847723180:web:015f34e7c549945ab6e109"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const vertexAI = getVertexAI(app);
const db = getFirestore(app);
const model = getGenerativeModel(vertexAI, { model: "gemini-2.5-pro" });

// API Keys are now derived automatically for Google Picker
let GOOGLE_API_KEY = firebaseConfig.apiKey;
let GOOGLE_CLIENT_ID = firebaseConfig.messagingSenderId;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';


// --- I18N LOGIC ---
let currentLang = localStorage.getItem('talktree_lang') || 'ja';
const i18nDict = {
    ja: {
        loginDesc: "ログインしてセキュアに接続します。<br>Geminiによる推論およびGoogle Driveへのアクセス権がアプリに付与されます。",
        welcomeMsg: "こんにちは。何について話しましょうか？会話から概念を自動抽出し、右側にツリーとして構築します。",
        dndOverlay: "ここにテキストをドロップして新規作成",
        dropText: "[ DROP TEXT HERE TO CREATE CONCEPT ]",
        settingsTitle: "SYSTEM_CONFIGURATION",
        settingsDesc: "GraphTerminalの各種設定を行います。(情報はブラウザにのみ保存されます)",
        settingsTemplateLabel: "エクスポート時のフォーマットルール (メタデータ)",
        settingsTemplateDesc: "※空で保存するとデフォルトに戻ります。MDファイルの末尾等に付加されRAG時にメタデータとして使われます。",
        btnLogout: "[ LOG OUT ACCOUNT ]",
        btnClose: "[ CLOSE ]",
        btnSave: "[ SAVE ]",
        llmRec: "LLM Recommended Contexts:",
        btnFolderUp: "[ ⬅ UP ]",
        treeToggleTitle: "ツリーを開閉",
        configTitle: "API設定",
        knowledgeToggleTitle: "ナレッジを開閉",
        folderChangeTitle: "保存先フォルダを変更",
        exportTitle: "ツリー全体をMD保存",
        undoTitle: "一つ前の状態に戻す",
        importTitle: "過去のMDファイルをインポート",
        attachTitle: "ファイル/画像を添付",
        knowledgeSetTitle: "ナレッジフォルダを設定",
        tabChat: "チャット",
        tabTree: "ツリー",
        btnNewChat: "＋新規会話",
        btnMenu: "[ メニュー ]",
        btnConfig: "[ 設定 ]",
        btnKnowledge: "[ ナレッジ ]",
        btnTree: "[ ツリー ]",
        btnExport: "[ エクスポート ]",
        btnUndo: "[ 取り消し ]",
        btnRedo: "[ やり直し ]",
        redoTitle: "やり直し",
        btnImport: "[ インポート ]",
        btnFile: "[ ＋ファイル ]",
        btnSend: "[ 送信 ]",
        btnStop: "[ 停止 ]",
        btnSync: "[ ドライブ同期 ]",
        btnApply: "[ 文脈に適用 ]",
        btnCancel: "[ キャンセル ]",
        btnCreateFolder: "[ ＋新規フォルダ作成 ]",
        loadingFolders: "読み込み中...",
        selectExport: "保存先フォルダの選択",
        selectKnowledge: "ナレッジフォルダの選択",
        noFolders: "フォルダがありません",
        noFoldersAccessible: "このアプリ用のフォルダがまだありません",
        enterFolderName: "新しいフォルダ名を入力してください:",
        createFolderError: "フォルダの作成に失敗しました"

    },
    en: {
        loginDesc: "Login to connect securely.<br>Gemini reasoning and Google Drive access will be granted to the app.",
        welcomeMsg: "Hello. What would you like to talk about? I will extract concepts from our conversation and build a tree.",
        dndOverlay: "Drop text here to create a node",
        dropText: "[ DROP TEXT HERE TO CREATE CONCEPT ]",
        settingsTitle: "SYSTEM_CONFIGURATION",
        settingsDesc: "Configure GraphTerminal globally. (Stored only in your browser)",
        settingsTemplateLabel: "Export Format Rules (Metadata)",
        settingsTemplateDesc: "* If saved empty, returns to default. Attached at EOF of MD for RAG indexing.",
        btnLogout: "[ LOG OUT ACCOUNT ]",
        btnClose: "[ CLOSE ]",
        btnSave: "[ SAVE ]",
        llmRec: "LLM Recommended Contexts:",
        btnFolderUp: "[ ⬅ UP ]",
        treeToggleTitle: "Toggle Tree",
        configTitle: "API Config",
        knowledgeToggleTitle: "Toggle Knowledge",
        folderChangeTitle: "Change Export Folder",
        exportTitle: "Export entire tree as MD",
        undoTitle: "Undo previous state",
        importTitle: "Import previous MD files",
        attachTitle: "Attach file/image",
        knowledgeSetTitle: "Set Knowledge base folder",
        tabChat: "CHAT",
        tabTree: "TREE",
        btnNewChat: "+ New Chat",
        btnMenu: "[ MENU ]",
        btnConfig: "[ CONFIG ]",
        btnKnowledge: "[ KNOWLEDGE ]",
        btnTree: "[ TREE ]",
        btnExport: "[ EXPORT ]",
        btnUndo: "[ UNDO ]",
        btnRedo: "[ REDO ]",
        redoTitle: "Redo",
        btnImport: "[ IMPORT ]",
        btnFile: "[ + FILE ]",
        btnSend: "[ SEND ]",
        btnStop: "[ STOP ]",
        btnSync: "[ SYNC DRIVE ]",
        btnApply: "[ APPLY TO CHAT ]",
        btnCancel: "[ CANCEL ]",
        btnCreateFolder: "[ + CREATE NEW FOLDER ]",
        loadingFolders: "LOADING...",
        selectExport: "SELECT MD EXPORT FOLDERS",
        selectKnowledge: "SELECT KNOWLEDGE BASE",
        noFolders: "NO FOLDERS FOUND",
        noFoldersAccessible: "NO FOLDERS ACCESSIBLE BY APP",
        enterFolderName: "Enter new folder name:",
        createFolderError: "Failed to create folder"

    }
};

function t(key) {
    return i18nDict[currentLang][key] || key;
}

function applyLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nDict[currentLang][key]) {
            el.innerHTML = i18nDict[currentLang][key];
        }
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (i18nDict[currentLang][key]) {
            el.title = i18nDict[currentLang][key];
        }
    });
    const btnLang = document.getElementById('btn-toggle-lang');
    if (btnLang) btnLang.textContent = currentLang === 'en' ? '[ EN ]' : '[ JA ]';
    
    const chatInput = document.getElementById('chat-input');
    if(chatInput) {
        chatInput.placeholder = currentLang === 'en' 
            ? "> Input query... (Enter to send, Shift+Enter for newline)"
            : "> クエリを入力... (Enterで送信、Shift+Enterで改行)";
    }
}

const DEFAULT_MD_TEMPLATE = `---
> 【SYSTEM_META】
> 概要: これはこのファイルの内容サマリーです。
> タグ: #Example
`;
let MD_EXPORT_TEMPLATE = localStorage.getItem('talktree_md_template') || DEFAULT_MD_TEMPLATE;

let accessToken = localStorage.getItem('talktree_drive_token') || null;
let tokenExpiry = localStorage.getItem('talktree_drive_token_expiry') || null;
let currentDriveFolderId = 'root';
let currentDriveFolderName = 'マイドライブ';

let currentKnowledgeFolderId = localStorage.getItem('talktree_knowledge_folder_id') || null;
let currentKnowledgeFolderName = localStorage.getItem('talktree_knowledge_folder_name') || 'None';
let knowledgeCache = JSON.parse(localStorage.getItem('talktree_knowledge_cache') || '[]');


// --- Session & History State ---
let sessions = []; // [{ id, title, treeNodes:[], chatHistoryData:[], lastModified }]
let currentSessionId = null;
let selectedContextNode = null;
let treeNodes = [];
let chatHistoryData = [];
let pendingAttachments = []; // 送信待ちファイル [{type: 'image'|'text', data: ..., mime: ..., name: ...}]

// --- Knowledge Agent State ---
let pendingUserMessageText = "";


// --- Queue, Abort & Undo ---
const extractionQueue = [];
let isExtracting = false;
let currentAbortController = null;
let extractAbortController = null;
let treeHistoryStack = [];
let redoHistoryStack = []; // Undo用の状態履歴

const dom = {
    sidebar: document.getElementById('sidebar'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
    btnNewChat: document.getElementById('btn-new-chat'),
    sessionList: document.getElementById('session-list'),

    chatHistory: document.getElementById('chat-history'),
    chatInput: document.getElementById('chat-input'),
    chatSubmit: document.getElementById('chat-submit'),
    chatStop: document.getElementById('chat-stop'),

    btnAttach: document.getElementById('btn-attach'),
    fileInput: document.getElementById('file-input'),
    attachmentPreview: document.getElementById('attachment-preview'),

    treeContent: document.getElementById('tree-content'),
    contextBadge: document.getElementById('context-badge'),
    treeLoading: document.getElementById('tree-loading'),

    btnUndo: document.getElementById('btn-undo'),
    btnRedo: document.getElementById('btn-redo'),
    btnImport: document.getElementById('btn-import'),
    importFileInput: document.getElementById('import-file-input'),
    btnExportAll: document.getElementById('btn-export-all'),

    btnSettings: document.getElementById('btn-settings'),
    settingsModal: document.getElementById('settings-modal'),
    inputMdTemplate: document.getElementById('setting-md-template'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
    btnCloseSettings: document.getElementById('btn-close-settings'),

    knowledgeSidebar: document.getElementById('knowledge-sidebar'),
    mobileOverlay: document.getElementById('mobile-overlay'),
    btnToggleKnowledge: document.getElementById('btn-toggle-knowledge'),
    treePanel: document.getElementById('tree-panel'),
    btnToggleTree: document.getElementById('btn-toggle-tree'),
};

function checkAndShowSettings() {
    // API key check is handled by auth
}
function openSettingsModal() {
    dom.inputMdTemplate.value = MD_EXPORT_TEMPLATE;
    dom.settingsModal.classList.remove('hidden');
}
function saveSettings() {
    let tempTemplate = dom.inputMdTemplate.value.trim();
    if (!tempTemplate) {
        alert("メタデータフォーマットは空にできません。デフォルトを自動適用します。");
        tempTemplate = DEFAULT_MD_TEMPLATE;
        dom.inputMdTemplate.value = tempTemplate;
    }
    MD_EXPORT_TEMPLATE = tempTemplate;
    localStorage.setItem('talktree_md_template', MD_EXPORT_TEMPLATE);
    dom.settingsModal.classList.add('hidden');
}

// --- Session Management ---
function saveSession() {
    if (!currentSessionId) return;
    const session = sessions.find(s => s.id === currentSessionId);
    if (session) {
        session.treeNodes = JSON.parse(JSON.stringify(treeNodes));
        session.chatHistoryData = JSON.parse(JSON.stringify(chatHistoryData));
        session.lastModified = Date.now();
        if (chatHistoryData.length > 0 && session.title.startsWith('New Chat')) {
            const firstUserText = chatHistoryData[0].parts.find(p => p.text)?.text || 'New Chat';
            session.title = firstUserText.replace(/\[回答は.*?\]\n/g, '').slice(0, 15) + '...';
        }
        localStorage.setItem('talktree_sessions', JSON.stringify(sessions));
        renderSidebar();
    }
}

function loadSessions() {
    const saved = localStorage.getItem('talktree_sessions');
    if (saved) {
        sessions = JSON.parse(saved);
        if (sessions.length > 0) {
            switchSession(sessions[0].id);
            return;
        }
    }
    createNewSession();
}

function createNewSession() {
    const newId = 'session_' + Date.now();
    const newSession = {
        id: newId,
        title: 'New Chat',
        treeNodes: [],
        chatHistoryData: [],
        lastModified: Date.now()
    };
    sessions.unshift(newSession);
    switchSession(newId);

    // 新規作成時はメイン画面に集中するため両サイドバーとツリーを閉じる
    if (dom.sidebar) dom.sidebar.classList.add('closed');
    if (dom.knowledgeSidebar) dom.knowledgeSidebar.classList.add('closed');
    if (dom.treePanel) dom.treePanel.classList.add('closed');

    // ナレッジベースがある場合はボタンを点滅させてアテンションを引く
    if (knowledgeCache && knowledgeCache.length > 0 && dom.btnToggleKnowledge) {
        dom.btnToggleKnowledge.classList.add('blink-attention');
    }
}

function switchSession(id) {
    currentSessionId = id;
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    // データ復元
    treeNodes = JSON.parse(JSON.stringify(session.treeNodes || []));
    chatHistoryData = JSON.parse(JSON.stringify(session.chatHistoryData || []));
    treeHistoryStack = [];
    selectedContextNode = null;
    dom.contextBadge.classList.remove('active');
    dom.contextBadge.textContent = 'Context: None';

    // UI復元
    updateUndoButtonState();
    dom.chatHistory.innerHTML = '';
    chatHistoryData.forEach(msg => {
        const role = msg.role === 'user' ? 'user' : 'ai';
        // プレフィックスを取り除いて表示
        let text = msg.parts.map(p => p.text || '[📎 ファイル添付]').join('\n');
        text = text.replace(/\[回答は.*?\]\n/g, '');
        appendChatMessage(role, text);
    });
    renderTree();
    renderSidebar();
}

function renderSidebar() {
    dom.sessionList.innerHTML = '';
    sessions.forEach(session => {
        const li = document.createElement('li');
        li.className = `session-item ${session.id === currentSessionId ? 'active' : ''}`;
        // li にタイトルと削除用ボタンを設置
        const titleSpan = document.createElement('span');
        titleSpan.className = 'session-title';
        titleSpan.textContent = session.title;

        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn-delete-session';
        btnDelete.innerHTML = '[ DEL ]';
        btnDelete.title = 'トークを削除';
        btnDelete.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`会話「${session.title}」を削除しますか？`)) {
                deleteSession(session.id);
            }
        };

        li.appendChild(titleSpan);
        li.appendChild(btnDelete);

        li.onclick = (e) => {
            if (e.target !== btnDelete && currentSessionId !== session.id) switchSession(session.id);
        };
        dom.sessionList.appendChild(li);
    });
}

function deleteSession(id) {
    sessions = sessions.filter(s => s.id !== id);
    localStorage.setItem('talktree_sessions', JSON.stringify(sessions));
    if (currentSessionId === id) {
        if (sessions.length > 0) {
            switchSession(sessions[0].id);
        } else {
            createNewSession();
        }
    } else {
        renderSidebar();
    }
}

// --- Undo Management ---
function saveTreeStateForUndo() {
    treeHistoryStack.push(JSON.parse(JSON.stringify(treeNodes)));
    redoHistoryStack = [];
    if (treeHistoryStack.length > 20) treeHistoryStack.shift();
    updateUndoButtonState();
}

function updateUndoButtonState() {
    dom.btnUndo.disabled = treeHistoryStack.length === 0;
    if (dom.btnRedo) dom.btnRedo.disabled = redoHistoryStack.length === 0;
}

function undoTreeState() {
    if (treeHistoryStack.length > 0) {
        redoHistoryStack.push(JSON.parse(JSON.stringify(treeNodes)));
        treeNodes = treeHistoryStack.pop();
        renderTree();
        updateUndoButtonState();
        saveSession();
    }
}

function redoTreeState() {
    if (redoHistoryStack.length > 0) {
        treeHistoryStack.push(JSON.parse(JSON.stringify(treeNodes)));
        treeNodes = redoHistoryStack.pop();
        renderTree();
        updateUndoButtonState();
        saveSession();
    }
}

// --- Initial Render ---

function updateMobileOverlay() {
    if (window.innerWidth <= 800) {
        const isLeftOpen = !dom.sidebar.classList.contains('closed');
        const isRightOpen = !dom.knowledgeSidebar.classList.contains('closed');
        if (isLeftOpen || isRightOpen) {
            dom.mobileOverlay.classList.remove('hidden');
            dom.mobileOverlay.classList.add('active');
        } else {
            dom.mobileOverlay.classList.add('hidden');
            dom.mobileOverlay.classList.remove('active');
        }
    } else {
        dom.mobileOverlay.classList.add('hidden');
        dom.mobileOverlay.classList.remove('active');
    }
}

// Close sidebars on overlay click
dom.mobileOverlay.addEventListener('click', () => {
    dom.sidebar.classList.add('closed');
    dom.knowledgeSidebar.classList.add('closed');
    updateMobileOverlay();
});

function init() {
    // -- Firebase Auth Observer --
    onAuthStateChanged(auth, (user) => {
        const overlay = document.getElementById('login-overlay');
        if (user) {
            if (overlay) overlay.classList.add('hidden');
        } else {
            if (overlay) overlay.classList.remove('hidden');
        }
    });

    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            try {
                const provider = new GoogleAuthProvider();
                provider.addScope('https://www.googleapis.com/auth/drive.file');
                const result = await signInWithPopup(auth, provider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (credential) {
                    accessToken = credential.accessToken;
                    if (window.gapi && window.gapi.client) gapi.client.setToken({ access_token: accessToken });
                }
            } catch (e) {
                console.error(e);
                alert("Googleログインに失敗しました: " + e.message);
            }
        });
    }

    // Load GAPI
    if (window.gapi) {
        gapi.load('client', async () => {
            await gapi.client.init({});
            gapi.client.load('drive', 'v3');
        });
    }

    loadSessions();

    document.getElementById('btn-apply-knowledge').addEventListener('click', async () => {
        document.getElementById('knowledge-apply-zone').classList.add('hidden');
        await proceedWithChat(pendingUserMessageText);
    });

    const knowledgeSearch = document.getElementById('knowledge-search');
    if (knowledgeSearch) {
        knowledgeSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('#knowledge-list .session-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) item.style.display = 'block';
                else item.style.display = 'none';
            });
        });
    }

    // initial settings
    document.getElementById('knowledge-folder-name').textContent = currentKnowledgeFolderName;
    if (knowledgeCache.length > 0) renderKnowledgeList();

    dom.btnToggleSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.sidebar.classList.toggle('closed');
    });
    if (dom.btnToggleKnowledge) {
        dom.btnToggleKnowledge.addEventListener('click', (e) => {
            e.stopPropagation();
            dom.knowledgeSidebar.classList.toggle('closed');
            dom.btnToggleKnowledge.classList.remove('blink-attention');
        });
    }
    if (dom.btnToggleTree) {
        dom.btnToggleTree.addEventListener('click', () => {
            dom.treePanel.classList.toggle('closed');
        });
    }
    dom.btnNewChat.addEventListener('click', () => {
        createNewSession();
    });
    dom.btnUndo.addEventListener('click', undoTreeState);
    if (dom.btnRedo) dom.btnRedo.addEventListener('click', redoTreeState);
    dom.btnExportAll.addEventListener('click', exportAllToMarkdown);

    // --- Close sidebar when clicking main chat area ---
    const mainChatPanel = document.getElementById('chat-panel');
    if (mainChatPanel) {
        mainChatPanel.addEventListener('click', () => {
            if (dom.sidebar && !dom.sidebar.classList.contains('closed')) {
                dom.sidebar.classList.add('closed');
            }
            if (dom.knowledgeSidebar && !dom.knowledgeSidebar.classList.contains('closed')) {
                dom.knowledgeSidebar.classList.add('closed');
            }
        });
    }

    // --- Resizer Logic ---
    {
        const resizer = document.getElementById('resizer');
        const chatPanel = document.getElementById('chat-panel');
        let isResizing = false;

        if (resizer && chatPanel) {
            resizer.addEventListener('mousedown', (e) => {
                isResizing = true;
                document.body.style.cursor = 'col-resize';
                resizer.classList.add('dragging');
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                const containerRect = chatPanel.parentElement.getBoundingClientRect();
                let newWidth = e.clientX - containerRect.left;
                // 右サイドバー等がある場合の幅補正（flex の代わりに固定幅にする）
                if (dom.sidebar && !dom.sidebar.classList.contains('closed')) {
                    newWidth -= dom.sidebar.offsetWidth;
                }
                if (newWidth < 200) newWidth = 200; // 最小幅
                chatPanel.style.flex = 'none';
                chatPanel.style.width = newWidth + 'px';
            });

            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    document.body.style.cursor = 'default';
                    resizer.classList.remove('dragging');
                }
            });
        }
    } // End of Resizer bloc

    // Settings events
    const tabChat = document.getElementById('tab-chat');
    const tabTree = document.getElementById('tab-tree');
    const chatPanel = document.getElementById('chat-panel');
    const treePanel = document.querySelector('.tree-panel');
    if (tabChat && tabTree) {
        tabChat.addEventListener('click', () => {
            tabChat.classList.add('active');
            tabTree.classList.remove('active');
            chatPanel.classList.add('active-tab');
            treePanel.classList.remove('active-tab');
        });
        tabTree.addEventListener('click', () => {
            tabTree.classList.add('active');
            tabChat.classList.remove('active');
            treePanel.classList.add('active-tab');
            chatPanel.classList.remove('active-tab');
        });
    }

    // Settings events
    dom.btnSettings.addEventListener('click', openSettingsModal);
    dom.btnCloseSettings.addEventListener('click', () => dom.settingsModal.classList.add('hidden'));
    dom.btnSaveSettings.addEventListener('click', saveSettings);

    // Lang Change
    const btnToggleLang = document.getElementById('btn-toggle-lang');
    if (btnToggleLang) {
        btnToggleLang.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'ja' : 'en';
            localStorage.setItem('talktree_lang', currentLang);
            applyLanguage();
        });
    }

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            if(confirm(currentLang === 'en' ? "Are you sure you want to log out?" : "本当にログアウトしますか？")) {
                try {
                    await signOut(auth);
                    accessToken = null;
                    localStorage.removeItem('talktree_drive_token');
                    window.location.reload();
                } catch (e) {
                    console.error("Logout Error:", e);
                }
            }
        });
    }

    const btnClosePicker = document.getElementById('btn-close-folder-picker');
    if (btnClosePicker) {
        btnClosePicker.addEventListener('click', () => {
            document.getElementById('folder-picker-modal').classList.add('hidden');
        });
    }

    // Textarea: Enterで送信、Shift+Enterで改行
    let isComposing = false;
    dom.chatInput.addEventListener('compositionstart', () => { isComposing = true; });
    dom.chatInput.addEventListener('compositionend', () => { 
        // 変換確定時のEnterと送信のEnterが被らないように微小な遅延を入れる
        setTimeout(() => { isComposing = false; }, 10); 
    });

    dom.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            // IME変換中のEnterは無視する (Mac特有の挙動対策含む)
            if (e.isComposing || isComposing || e.keyCode === 229) return;

            if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
            // Shift+Enterの場合はデフォルトの改行動作を行わせるため何もしない
        }
    });

    // 高さの自動リサイズ
    dom.chatInput.addEventListener('input', function () {
        this.style.height = '48px'; // Base min-height (including padding) to reset scrollHeight calculation
        this.style.height = this.scrollHeight + 'px';
    });

    // --- File Attachment Logic ---
    function handleIncomingFiles(files) {
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    pendingAttachments.push({ type: 'image', name: file.name, mime: file.type, data: ev.target.result.split(',')[1] });
                    renderAttachmentPreview();
                };
                reader.readAsDataURL(file);
            } else if (file.name.match(/\.(txt|csv|md|py|js|json|html|css)$/i) || file.type.startsWith('text/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    pendingAttachments.push({ type: 'text', name: file.name, data: ev.target.result });
                    renderAttachmentPreview();
                };
                reader.readAsText(file);
            }
        }
    }

    dom.btnAttach.addEventListener('click', () => dom.fileInput.click());
    dom.fileInput.addEventListener('change', (e) => {
        handleIncomingFiles(Array.from(e.target.files));
        dom.fileInput.value = '';
    });

    // 全結合して一度に出力
    async function exportAllToMarkdown() {
        if (treeNodes.length === 0) {
            alert("ツリーにデータがありません。");
            return;
        }

        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `GraphTerminal_All_${dateStr}.md`;

        let content = `# GraphTerminal 全体エクスポート (${new Date().toLocaleString()})\n\n`;

        treeNodes.forEach(node => {
            content += `## ${node.label}\n\n`;
            node.notes.forEach(nn => {
                if (nn.text === '---') content += `---\n\n`;
                else content += `${nn.text}\n\n`;
            });
            content += `---\n\n`;
        });

        content += `\n${MD_EXPORT_TEMPLATE}\n`;

        // 保存（Google Drive またはローカル）
        if (accessToken) {
            uploadToGoogleDrive(filename, content);
        } else {
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    // -- File Drag & Drop on App Body ---
    const dragPanel = document.getElementById('chat-panel');
    dragPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragPanel.classList.add('drag-over-chat');
    });
    dragPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragPanel.classList.remove('drag-over-chat');
    });
    dragPanel.addEventListener('drop', (e) => {
        e.preventDefault();
        dragPanel.classList.remove('drag-over-chat');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleIncomingFiles(Array.from(e.dataTransfer.files));
        }
    });

    // --- Text Drag & Drop on Tree Panel ---
    const treeDropZone = document.getElementById('tree-drop-zone');
    if (treeDropZone) {
        treeDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            treeDropZone.classList.add('drag-over');
        });
        treeDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            treeDropZone.classList.remove('drag-over');
        });
        treeDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            treeDropZone.classList.remove('drag-over');

            const text = e.dataTransfer.getData('text/plain');
            if (text) {
                saveTreeStateForUndo();
                // 最初の15文字でタイトルを自動生成
                const title = text.replace(/\n/g, ' ').substring(0, 15) + (text.length > 15 ? '...' : '');
                addOrUpdateTreeNode(title, text, true);
                renderTree();
                saveSession();
            }
        });
    }

    // --- MD Import Logic ---
    dom.btnImport.addEventListener('click', () => dom.importFileInput.click());
    dom.importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            parseImportedMD(ev.target.result);
            dom.importFileInput.value = '';
        };
        reader.readAsText(file);
    });

    // 送信ボタン
    if (dom.chatSubmit) {
        dom.chatSubmit.addEventListener('click', handleSend);
    }

    // 中断ボタン
    dom.chatStop.addEventListener('click', () => {
        if (currentAbortController) currentAbortController.abort();
    });
}

// --- Chat Logic ---
async function handleSend() {
    const text = dom.chatInput.value.trim();
    if (!text && pendingAttachments.length === 0) return;

    dom.chatInput.value = '';
    dom.chatInput.style.height = 'auto';

    // ナレッジの自動選択（Phase 1）は廃止し、いつでもユーザーの任意タイミングでのみ使用させる
    await proceedWithChat(text);
}

// ナレッジのサジェスト処理 (LLM Phase 1)
async function proposeKnowledgeContext(userMessage) {
    dom.knowledgeSidebar.classList.remove('closed');
    const applyZone = document.getElementById('knowledge-apply-zone');
    applyZone.classList.remove('hidden');

    const btnApply = document.getElementById('btn-apply-knowledge');
    btnApply.textContent = '> SELECTING RELEVANT FILES...';
    btnApply.disabled = true;

    // ナレッジリストを文字列化してGeminiに投げる
    const listText = knowledgeCache.map(k => `ID: ${k.id} | NAME: ${k.name} | SUM: ${k.summary}`).join('\n');
    const prompt = `以下の[ユーザーの入力]に回答するために、[ナレッジリスト]の中から最も関連しそうなファイルのIDを**最大10個まで**抽出してください。
抽出結果は "ID1, ID2, ID3" のようにカンマ区切りのIDのみ出力し、その他の説明文は一切含めないでください。関連するものがない場合は "NONE" と出力してください。

[ユーザーの入力]:
${userMessage}

[ナレッジリスト]:
${listText}
    `;

    try {
        const payload = [{ role: 'user', parts: [{ text: prompt }] }];
        const resultText = await fetchGeminiAPI(payload);

        const returnedIds = resultText.split(',').map(s => s.trim()).filter(s => s.length > 5);

        // チェックボックスの状態を更新
        let checkedCount = 0;
        const checkboxes = document.querySelectorAll('.knowledge-checkbox');
        checkboxes.forEach(cb => {
            if (returnedIds.includes(cb.dataset.id)) {
                cb.checked = true;
                checkedCount++;
            } else {
                cb.checked = false;
            }
        });

        btnApply.textContent = t('btnApply') || '[ APPLY TO CHAT ]';
        btnApply.disabled = (checkedCount === 0);

    } catch (e) {
        console.error("Propose error", e);
        btnApply.textContent = '[ ERROR: SKIP TO CHAT ]';
        btnApply.disabled = false; // エラー時はスキップできるようにする
    }
}

// 実質的なチャット送信＆返答生成 (LLM Phase 2)
async function proceedWithChat(text) {
    if (!auth.currentUser) return;
    
    // Trial logic
    const DEV_ADMIN_EMAIL = 'bfty.719@gmail.com';
    const uid = auth.currentUser.uid;
    const email = auth.currentUser.email;
    
    if (email !== DEV_ADMIN_EMAIL) {
        try {
            const userRef = doc(db, "users", uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                await setDoc(userRef, { trial_count: 1 });
            } else {
                const data = userDoc.data();
                if (data.trial_count >= 3) {
                    alert(currentLang === 'en' ? "Free trial limit (3 times) reached." : "無料トライアルの上限（3回）に達しました。");
                    return;
                } else {
                    await updateDoc(userRef, { trial_count: increment(1) });
                }
            }
        } catch (e) {
            console.error("Firestore trial logic error:", e);
            alert("通信量制限の確認に失敗しました。データベースが有効になっていない可能性があります。");
            return;
        }
    }

    const parts = [];

    // --- コンテキスト機能 1: 手動ツリーのコンテキスト ---
    if (selectedContextNode) {
        const contextNodeProps = treeNodes.find(n => n.label === selectedContextNode);
        if (contextNodeProps) {
            const contextText = contextNodeProps.notes.filter(n => n.text !== '---').map(n => n.text).join('\n');
            parts.push({ text: `【前提コンテキスト: 「${selectedContextNode}」に関する現在の知識】\n${contextText}\n\n上記の知識を踏まえて、以下のユーザーの入力に応答してください。\n` });
        }
    }

    // --- コンテキスト機能 2: KNOWLEDGE BASE による学習前提の注入 ---
    // ここでチェックされたチェックボックスの中身（ファイル）を API 経由で取得してプロンプトに結合する
    const checkedBoxes = Array.from(document.querySelectorAll('.knowledge-checkbox:checked'));
    if (checkedBoxes.length > 0) {
        let knowledgeContextStr = "【ユーザーの既知ナレッジリスト】\n以下の情報はユーザーがすでに理解・認識済みの知識です。これらを強力な前提とし、新しい情報の付加や統合を行って回答してください。\n---\n";

        const typingIndicator = showTypingIndicator(dom.chatHistory);
        typingIndicator.textContent = "> READING LOCAL KNOWLEDGE...";

        try {
            await authenticateGoogleDrive();
            for (const cb of checkedBoxes) {
                const fId = cb.dataset.id;
                const fRes = await gapi.client.drive.files.get({ fileId: fId, alt: 'media' });
                knowledgeContextStr += `## FILE: ${cb.dataset.name}\n${fRes.body}\n\n`;
            }
            parts.push({ text: knowledgeContextStr });
        } catch (e) {
            console.error("Knowledge fetch error", e);
            knowledgeContextStr += "ナレッジの読み込みに失敗しました。\n";
        }
        removeElement(typingIndicator);
    }

    // --- 添付ファイル ---
    pendingAttachments.forEach(att => {
        if (att.type === 'image') {
            parts.push({ inlineData: { mimeType: att.mime, data: att.data } });
        } else if (att.type === 'text') {
            parts.push({ text: `[ファイル添付: ${att.name}]\n${att.data}\n` });
        }
    });

    // --- ユーザテキスト ---
    if (text) {
        parts.push({ text: text });
    }

    // 表示用のチャット履歴
    let displayUserText = text;
    if (pendingAttachments.length > 0) {
        displayUserText += `\n(📎 ${pendingAttachments.length} attachments)`;
    }
    if (checkedBoxes.length > 0) {
        displayUserText += `\n(🧠 +${checkedBoxes.length} knowledge context)`;
    }
    appendChatMessage('user', displayUserText);

    // API送信用に履歴に保存
    chatHistoryData.push({ role: "user", parts: parts });

    // 添付ファイルをクリアして表示リセット
    pendingAttachments = [];
    renderAttachmentPreview();

    currentAbortController = new AbortController();
    dom.chatSubmit.classList.add('hidden');
    dom.chatStop.classList.remove('hidden');

    const typingIndicator = showTypingIndicator(dom.chatHistory);

    try {
        const payload = [...chatHistoryData];
        // キャッシュ起因などで万が一 currentAbortController が初期化されていなくても動くように安全策を入れる
        const signal = currentAbortController ? currentAbortController.signal : null;

        removeElement(typingIndicator);
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = `chat-message ai`;
        dom.chatHistory.appendChild(aiMessageDiv);

        const onChunk = (chunkText, fullText) => {
            aiMessageDiv.innerHTML = fullText.replace(/\n/g, '<br>');
            dom.chatHistory.scrollTop = dom.chatHistory.scrollHeight;
        };

        const chatResText = await fetchGeminiAPI(payload, signal, onChunk);

        // 履歴に追加
        chatHistoryData.push({ role: "model", parts: [{ text: chatResText }] });

        // API 2: 概念抽出タスクを非同期キューに追加
        queueExtractionTask(text, chatResText);

    } catch (e) {
        removeElement(typingIndicator);
        if (e.name === 'AbortError') {
            appendChatMessage('ai', '（通信がユーザーによりキャンセルされました）');
            chatHistoryData.pop(); // user追加分を取り消すなど必要に応じて
        } else {
            appendChatMessage('ai', `Error: ${e.message}`);
        }
    } finally {
        currentAbortController = null;
        dom.chatSubmit.classList.remove('hidden');
        dom.chatStop.classList.add('hidden');
        saveSession(); // チャット終了時にもセッションを保存
    }
}

// 概念抽出・ツリー更新ロジック (Geminiで完結)
async function extractConcepts(userText, aiText, signal = null) {
    // ツリーローディング表示
    dom.treeLoading.classList.remove('hidden');

    const existingLabels = treeNodes.map(n => n.label).join(', ') || "なし";

    const extractQuery = `
以下の対話から、主要な概念（トピック）を抽出し、概念に関連するAIの回答部分を抜粋してJSONで出力してください。

【重要ルール】
- 会話の中に複数の異なるトピック・概念が含まれている場合は、遠慮せずに**複数（複数要素）抽出して**リスト化してください。
- 現在、ツリーには以下の概念がすでに存在しています: [${existingLabels}]
- 既存の概念の深掘りや追加説明である場合は、**全く同じ概念名（label）**を使用してください。
- 全く新しい概念の場合は、新しい概念名を付けてください。

フォーマット例: 
{"children": [
  {"label": "概念名1", "relevant_text": "AIが回答した内容の中で、概念名1に関係する説明文の抜粋"},
  {"label": "概念名2", "relevant_text": "概念名2に関係する部分の抜粋"}
]}

---
User: ${userText}
AI: ${aiText}
    `;

    try {
        const payload = [{ role: "user", parts: [{ text: extractQuery }] }];
        const resText = await fetchGeminiAPI(payload, signal);

        let jsonStr = resText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // --- すべての既存ノートの isLatest を false にリセット ---
        treeNodes.forEach(node => {
            node.notes.forEach(noteObj => { noteObj.isLatest = false; });
        });

        if (data.children && Array.isArray(data.children)) {
            // 自動抽出で変更が加わるのでUndo用のスナップショットを撮る
            if (data.children.length > 0) {
                saveTreeStateForUndo();
            }

            data.children.forEach(child => {
                const noteContent = child.relevant_text || "解説テキストが抽出できませんでした。";
                addOrUpdateTreeNode(child.label, noteContent, true); // true=青色にする
            });
            renderTree();
            saveSession(); // ツリー更新後に保存
        }
    } catch (e) {
        console.warn("Concept extraction failed or parsed JSON was invalid:", e);
    } finally {
        dom.treeLoading.classList.add('hidden');
    }
}

// 抽出完了を待機して1つずつ処理するキューロジック
async function queueExtractionTask(userText, aiText) {
    extractionQueue.push({ userText, aiText });
    processExtractionQueue();
}

async function processExtractionQueue() {
    if (isExtracting || extractionQueue.length === 0) return;

    isExtracting = true;
    extractAbortController = new AbortController();

    const task = extractionQueue.shift();
    try {
        await extractConcepts(task.userText, task.aiText, extractAbortController.signal);
    } catch (e) { /* キャンセル等のハンドリング */ }

    extractAbortController = null;
    isExtracting = false;
    processExtractionQueue(); // 全て空になるまで続ける
}

// ツリーノードの追加・更新
function addOrUpdateTreeNode(label, contextNote, isLatestFlag = false) {
    const existingNode = treeNodes.find(n => n.label === label);

    if (existingNode) {
        if (existingNode.notes.length > 0) {
            existingNode.notes.push({ text: '---', isLatest: false });
        }
        existingNode.notes.push({ text: contextNote, isLatest: isLatestFlag });
        existingNode.isOpen = true; // 追加情報が入ったので強制的に開いた状態にする

        // （既存更新した場合、そのノードを一番上に持ち上げることで視認性を高めることも可能だが現行維持）
    } else {
        const newNode = {
            id: 'node-' + Date.now() + Math.floor(Math.random() * 1000),
            label: label,
            notes: [{ text: contextNote, isLatest: isLatestFlag }],
            isOpen: true // 新規作成されたノードも開いた状態にする
        };
        treeNodes.push(newNode);
    }
}

// 要約リクエストロジック
async function summarizeNode(nodeId) {
    const node = treeNodes.find(n => n.id === nodeId);
    if (!node) return;

    const allNotes = node.notes.filter(n => n.text !== '---').map(n => n.text).join('\n');
    const summarizeQuery = `
以下のテキストを要約してください。

【重要ルール】
- 「提供された内容の要約は以下の通りです」のような前置きや挨拶、無駄なシステムトークは一切記述しないでください。
- すぐに要約本文の第一文から書き出してください。
- 元のテキストが持つ情報量や専門用語は極力維持し、抜け漏れがないように整理してください。

元テキスト:
${allNotes}
    `;

    // ツリー再描画
    node.notes = [{ text: "要約中...", isLatest: false }];
    renderTree();

    try {
        // 要約もGeminiで実行
        const payload = [{ role: "user", parts: [{ text: summarizeQuery }] }];
        const resText = await fetchGeminiAPI(payload);
        node.notes = [{ text: resText, isLatest: true }]; // 要約結果で上書き
        renderTree();
    } catch (e) {
        node.notes = [{ text: "要約に失敗しました: " + e.message, isLatest: false }, ...node.notes];
        renderTree();
    }
}

// --- API Wrappers ---

// 1. Gemini API (Vertex AI for Firebase)
async function fetchGeminiAPI(contents, signal = null, onChunk = null) {
    if (!auth.currentUser) throw new Error("ログインしていません。");
    
    // Check if the contents only have text, as required by generateContent.
    // Vertex AI format requires identical structure as we built.
    const request = { contents: contents };
    
    try {
        if (onChunk) {
            const resultStream = await model.generateContentStream(request);
            let fullText = "";
            for await (const chunk of resultStream.stream) {
                if (signal && signal.aborted) throw new DOMException("Aborted", "AbortError");
                const chunkText = chunk.text();
                fullText += chunkText;
                onChunk(chunkText, fullText);
            }
            return fullText;
        } else {
            const result = await model.generateContent(request);
            return result.response.text();
        }
    } catch(e) {
        console.error("Gemini API Error details:", e);
        throw new Error(`Gemini API Error: ${e.message}`);
    }
}

// --- UI Rendering ---
function appendChatMessage(role, text) {
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    // 改行をbrに変換
    div.innerHTML = text.replace(/\n/g, '<br>');
    dom.chatHistory.appendChild(div);
    scrollToBottom(dom.chatHistory);
}

function showTypingIndicator(parent) {
    const div = document.createElement('div');
    div.className = 'chat-message ai styling-indicator';
    div.innerHTML = `
        <div class="typing-indicator">
            <span class="typing-dot">.</span>
            <span class="typing-dot">.</span>
            <span class="typing-dot">.</span>
        </div>
    `;
    parent.appendChild(div);
    scrollToBottom(parent);
    return div;
}

function removeElement(elem) {
    if (elem && elem.parentNode) {
        elem.parentNode.removeChild(elem);
    }
}

function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
}

function renderTree() {
    dom.treeContent.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'tree';

    treeNodes.forEach(node => {
        const li = document.createElement('li');

        const container = document.createElement('div');
        container.className = 'node-container';

        // Node Header
        const header = document.createElement('div');
        header.className = `node-header ${selectedContextNode === node.label ? 'active' : ''}`;

        // === header への D&D ===
        header.addEventListener('dragover', (e) => {
            e.preventDefault();
            header.classList.add('drag-over');
            e.stopPropagation(); // 親(新規作成)へ伝播させない
        });
        header.addEventListener('dragleave', (e) => {
            header.classList.remove('drag-over');
        });
        header.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation(); // 親へ伝播させない
            header.classList.remove('drag-over');

            const text = e.dataTransfer.getData('text/plain');
            if (text) {
                saveTreeStateForUndo();
                addOrUpdateTreeNode(node.label, text, true);
                renderTree();
                saveSession();
            }
        });
        // ============================

        // Custom Arrow (ASCII)
        const iconSpan = `<span class="icon-chevron">[ + ]</span>`;

        header.innerHTML = `
            <div class="node-title">
                ${iconSpan}
                <span>${node.label}</span>
            </div>
            <div class="node-actions">
                <button class="btn-small btn-summarize">[ SUMMARIZE ]</button>
                <button class="btn-small btn-context">[ CTX_ON ]</button>
            </div>
        `;

        // Action Events
        const btnSummarize = header.querySelector('.btn-summarize');
        btnSummarize.addEventListener('click', (e) => {
            e.stopPropagation();
            summarizeNode(node.id);
        });

        const btnContext = header.querySelector('.btn-context');
        btnContext.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleContext(node.label);
        });

        if (selectedContextNode === node.label) {
            btnContext.textContent = '[ CTX_OFF ]';
            dom.contextBadge.textContent = `CTX: ${node.label}`;
        } else {
            btnContext.textContent = '[ CTX_ON ]';
        }

        // Node Body (Notes)
        const bodyWrap = document.createElement('div');
        bodyWrap.className = 'node-body';
        if (node.isOpen) bodyWrap.classList.add('open');

        node.notes.forEach((noteObj) => {
            if (noteObj.text === '---') {
                const sep = document.createElement('div');
                sep.className = 'note-divider';
                sep.textContent = '---';
                bodyWrap.appendChild(sep);
            } else {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'note-item';
                // 最新フラグが立っている部分のみ青色(.latest)にする
                if (noteObj.isLatest) {
                    noteDiv.classList.add('latest');
                }
                noteDiv.innerHTML = noteObj.text.replace(/\n/g, '<br>');
                bodyWrap.appendChild(noteDiv);
            }
        });

        // Toggle Expanding
        header.onclick = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            node.isOpen = !node.isOpen;
            bodyWrap.classList.toggle('open', node.isOpen);
            const arrow = header.querySelector('.icon-chevron');
            arrow.textContent = node.isOpen ? '[ - ]' : '[ + ]';
        };

        // 初期ロード時のアイコン補正
        if (node.isOpen) {
            const arrow = header.querySelector('.icon-chevron');
            arrow.textContent = '[ - ]';
        }

        container.appendChild(header);
        container.appendChild(bodyWrap);
        li.appendChild(container);
        ul.appendChild(li);
    });

    dom.treeContent.appendChild(ul);
}

function toggleContext(label) {
    if (selectedContextNode === label) {
        selectedContextNode = null; // 解除
        dom.contextBadge.classList.remove('active');
        dom.contextBadge.textContent = 'CTX: NONE';
    } else {
        selectedContextNode = label;
        dom.contextBadge.textContent = `CTX: ${label}`;
        dom.contextBadge.classList.add('active');
    }
    renderTree(); // activeクラスを更新するため
}

// --- Google Drive API & Markdown Export Logic ---

// Promiseラップ版の認証関数
async function authenticateGoogleDrive() {
    if (accessToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        if (window.gapi && window.gapi.client) gapi.client.setToken({ access_token: accessToken });
        return;
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    
    // UI反映
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) btnLogin.textContent = '[ WAITING FOR POPUP... ]';
    
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    accessToken = credential.accessToken;
    
    // Save to localStorage to avoid login loop over SPA refresh
    localStorage.setItem('talktree_drive_token', accessToken);
    tokenExpiry = Date.now() + 55 * 60 * 1000;
    localStorage.setItem('talktree_drive_token_expiry', tokenExpiry); // 55 mins

    if (window.gapi && window.gapi.client) gapi.client.setToken({ access_token: accessToken });
}

// --- Custom Folder Picker Logic ---
let folderPickerHistory = ['root'];

async function showCustomFolderPicker(targetType, resetHistory = true) {
    try {
        await authenticateGoogleDrive();
        
        const modal = document.getElementById('folder-picker-modal');
        const listDiv = document.getElementById('folder-picker-list');
        const titleEl = document.getElementById('folder-picker-title');
        const btnUp = document.getElementById('btn-folder-up');
        
        if (resetHistory) folderPickerHistory = ['root'];
        const currentParent = folderPickerHistory[folderPickerHistory.length - 1];
        
        modal.classList.remove('hidden');
        listDiv.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">${t('loadingFolders')}</div>`;
        
        if (targetType === 'export') {
            titleEl.textContent = t('selectExport');
        } else {
            titleEl.textContent = t('selectKnowledge');
        }

        if (folderPickerHistory.length > 1) {
            btnUp.classList.remove('hidden');
            btnUp.onclick = () => {
                folderPickerHistory.pop();
                showCustomFolderPicker(targetType, false);
            };
        } else {
            btnUp.classList.add('hidden');
        }

        // Search for folders inside the current parent
        const response = await gapi.client.drive.files.list({
            q: `'${currentParent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            pageSize: 1000,
            orderBy: "folder,name",
            fields: 'files(id, name)'
        });

        const folders = response.result.files || [];
        listDiv.innerHTML = '';
        
        // Add [ + NEW FOLDER ] button always at the top of the list
        const createItem = document.createElement('div');
        createItem.className = 'folder-list-item';
        createItem.style.justifyContent = 'center';
        createItem.style.background = 'var(--bg-color-alt)';
        createItem.innerHTML = `<button class="btn-send" style="width:100%; border:1px dashed var(--text-secondary);" data-i18n="btnCreateFolder">${t("btnCreateFolder")}</button>`;
        createItem.onclick = async () => {
            const folderName = prompt(t('enterFolderName'));
            if (!folderName) return;
            try {
                const fileMetadata = {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: currentParent === 'root' ? undefined : [currentParent]
                };
                await gapi.client.request({
                    path: 'https://www.googleapis.com/drive/v3/files',
                    method: 'POST',
                    body: JSON.stringify(fileMetadata)
                });
                // Reload picker
                showCustomFolderPicker(targetType, false);
            } catch(e) {
                console.error("Create folder failed", e);
                alert(t("createFolderError"));
            }
        };
        listDiv.appendChild(createItem);

        if (folders.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style = "padding: 20px; text-align: center; color: var(--text-secondary);";
            emptyMsg.innerHTML = t('noFoldersAccessible');
            listDiv.appendChild(emptyMsg);
        }

        folders.forEach(folder => {
            const item = document.createElement('div');
            item.className = 'folder-list-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'folder-list-name';
            nameSpan.innerHTML = `📁 ${folder.name}`;
            nameSpan.onclick = () => {
                folderPickerHistory.push(folder.id);
                showCustomFolderPicker(targetType, false);
            };
            
            const btnSelect = document.createElement('button');
            btnSelect.className = 'btn-folder-select';
            btnSelect.textContent = '[ SELECT ]';
            btnSelect.onclick = () => {
                const prevExport = currentDriveFolderId;
                const prevKnowledge = currentKnowledgeFolderId;

                if (targetType === 'export') {
                    currentDriveFolderId = folder.id;
                    currentDriveFolderName = folder.name;
                    document.getElementById('current-folder-name').textContent = currentDriveFolderName;
                    
                    if (prevExport === 'root' && (prevKnowledge === null || prevKnowledge === 'root')) {
                        currentKnowledgeFolderId = folder.id;
                        currentKnowledgeFolderName = folder.name;
                        localStorage.setItem('talktree_knowledge_folder_id', folder.id);
                        localStorage.setItem('talktree_knowledge_folder_name', folder.name);
                        document.getElementById('knowledge-folder-name').textContent = folder.name;
                    }
                } else {
                    currentKnowledgeFolderId = folder.id;
                    currentKnowledgeFolderName = folder.name;
                    localStorage.setItem('talktree_knowledge_folder_id', folder.id);
                    localStorage.setItem('talktree_knowledge_folder_name', folder.name);
                    document.getElementById('knowledge-folder-name').textContent = folder.name;
                    
                    if (prevExport === 'root' && (prevKnowledge === null || prevKnowledge === 'root')) {
                        currentDriveFolderId = folder.id;
                        currentDriveFolderName = folder.name;
                        document.getElementById('current-folder-name').textContent = folder.name;
                    }
                }
                modal.classList.add('hidden');
            };
            
            item.appendChild(nameSpan);
            item.appendChild(btnSelect);
            listDiv.appendChild(item);
        });

    } catch (e) {
        console.error("Folder fetch failed", e);
        document.getElementById('folder-picker-list').innerHTML = `<div style="padding: 20px; text-align: center; color: red;">ERROR: ${e.message}</div>`;
    }
}

// Global binds for inline HTML onclick="showPicker()"
window.showPicker = () => showCustomFolderPicker('export');
window.showKnowledgePicker = () => showCustomFolderPicker('knowledge');

// ナレッジフォルダ同期処理
document.getElementById('btn-sync-knowledge').addEventListener('click', syncKnowledgeBase);

async function syncKnowledgeBase() {
    if (!currentKnowledgeFolderId) {
        alert("先にKNOWLEDGE_BASE対象のフォルダをDIrから選択してください。");
        return;
    }
    try {
        dom.knowledgeSidebar.classList.remove('closed');
        document.getElementById('knowledge-list').innerHTML = '<li class="session-item" style="color:var(--text-primary);">> FETCHING KNOWLEDGE...</li>';

        await authenticateGoogleDrive();

        // 直下のMarkdownファイル情報を一括取得
        const response = await gapi.client.drive.files.list({
            q: `'${currentKnowledgeFolderId}' in parents and (mimeType='text/markdown' or mimeType='text/plain') and trashed=false`, // MAX考慮
            pageSize: 50,
            fields: 'files(id, name, modifiedTime)'
        });

        const files = response.result.files;
        if (!files || files.length === 0) {
            knowledgeCache = [];
            localStorage.setItem('talktree_knowledge_cache', JSON.stringify(knowledgeCache));
            renderKnowledgeList();
            return;
        }

        // 順番に中身（サマリー部分）を取得してキャッシュ構築
        const newCache = [];
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const fileRes = await gapi.client.drive.files.get({
                fileId: f.id,
                alt: 'media'
            });
            const content = fileRes.body || "";
            // システムメタデータがあれば抽出、無ければ冒頭100文字
            let summary = '';
            const metaMatch = content.match(/> 【SYSTEM_META】([\s\S]*?)(\n\n|$)/);
            if (metaMatch) {
                summary = metaMatch[1].trim();
            } else {
                summary = content.slice(0, 80).replace(/\n/g, ' ') + '...';
            }
            newCache.push({ id: f.id, name: f.name, summary: summary });
            document.getElementById('knowledge-list').innerHTML = `<li class="session-item" style="color:var(--text-primary);">> INDEXING... ${i + 1}/${files.length}</li>`;
        }

        knowledgeCache = newCache;
        localStorage.setItem('talktree_knowledge_cache', JSON.stringify(knowledgeCache));
        renderKnowledgeList();

    } catch (err) {
        console.error("Sync Knowledge Base Error:", err);
        alert("同期に失敗しました。詳細をコンソールで確認してください。");
        renderKnowledgeList();
    }
}

function renderKnowledgeList() {
    const list = document.getElementById('knowledge-list');
    list.innerHTML = '';

    if (knowledgeCache.length === 0) {
        list.innerHTML = '<li class="session-item" style="opacity:0.5; font-style:italic;">No active knowledge found.</li>';
        return;
    }

    knowledgeCache.forEach(k => {
        const li = document.createElement('li');
        li.className = 'session-item';
        // チェックボックスを追加し、LLM等に選ばれた時に判定できるようにする
        li.innerHTML = `
            <div style="display:flex; align-items:flex-start; gap:8px;">
                <input type="checkbox" class="knowledge-checkbox" data-id="${k.id}" data-name="${k.name}">
                <div>
                    <div style="font-family:var(--font-mono); font-weight:700; font-size:0.8rem;">${k.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">${k.summary}</div>
                </div>
            </div>
        `;
        list.appendChild(li);
    });
}

// Driveへのアップロード関数 (個別ノード)
async function exportToMarkdown(nodeId) {
    const node = treeNodes.find(n => n.id === nodeId);
    if (!node) return;

    let mdContent = `# ${node.label}\n\n`;
    mdContent += `## メモ・抽出テキスト\n`;

    node.notes.forEach(noteObj => {
        if (noteObj.text === '---') { mdContent += `\n---\n\n`; }
        else { mdContent += `${noteObj.text}\n\n`; }
    });

    mdContent += `\n${MD_EXPORT_TEMPLATE}\n`;

    try {
        await authenticateGoogleDrive();

        // 2. Google Drive に Markdown ファイルをアップロード (保存先=currentDriveFolderId)
        const fileMetadata = {
            name: `${node.label}.md`,
            mimeType: 'text/markdown',
            parents: currentDriveFolderId === 'root' ? undefined : [currentDriveFolderId]
        };
        const boundary = 'foo_bar_baz';
        const delimiter = `\r\n--${boundary}\r\n`;
        const close_delim = `\r\n--${boundary}--`;

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: text/markdown\r\n\r\n' +
            mdContent +
            close_delim;

        const request = gapi.client.request({
            path: 'https://www.googleapis.com/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
            body: multipartRequestBody
        });

        request.execute((file) => {
            if (file && file.id) {
                alert(`✅ Google Driveに保存されました！\nファイル名: ${node.label}.md`);
            } else {
                alert("保存に失敗しました。詳細をコンソールで確認してください。");
            }
        });

    } catch (err) {
        console.error("Google Drive API Error:", err);
        alert("認証エラー、またはアップロードに失敗しました。");
    }
}

// Driveへのアップロード関数 (全体用)
async function uploadToGoogleDrive(filename, content) {
    try {
        await authenticateGoogleDrive();

        const fileMetadata = {
            name: filename,
            mimeType: 'text/markdown',
            parents: currentDriveFolderId === 'root' ? undefined : [currentDriveFolderId]
        };
        const boundary = 'foo_bar_baz';
        const delimiter = `\r\n--${boundary}\r\n`;
        const close_delim = `\r\n--${boundary}--`;

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: text/markdown\r\n\r\n' +
            content +
            close_delim;

        const request = gapi.client.request({
            path: 'https://www.googleapis.com/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
            body: multipartRequestBody
        });

        request.execute((file) => {
            if (file && file.id) {
                alert(`✅ Google Driveに保存されました！\nファイル名: ${filename}`);
            } else {
                alert("保存に失敗しました。詳細をコンソールで確認してください。");
            }
        });

    } catch (err) {
        console.error("Google Drive API Error:", err);
        alert("認証エラー、またはアップロードに失敗しました。");
    }
}

// --- File & MD Parsers ---
function renderAttachmentPreview() {
    dom.attachmentPreview.innerHTML = '';
    if (pendingAttachments.length === 0) {
        dom.attachmentPreview.classList.add('hidden');
        return;
    }
    dom.attachmentPreview.classList.remove('hidden');

    pendingAttachments.forEach((att, idx) => {
        const badge = document.createElement('div');
        badge.className = 'file-badge';
        if (att.type === 'image') {
            badge.innerHTML = `<img src="data:${att.mime};base64,${att.data}"> ${att.name}`;
        } else {
            badge.innerHTML = `📄 ${att.name}`;
        }
        const rm = document.createElement('span');
        rm.className = 'file-remove';
        rm.textContent = '×';
        rm.onclick = () => {
            pendingAttachments.splice(idx, 1);
            renderAttachmentPreview();
        };
        badge.appendChild(rm);
        dom.attachmentPreview.appendChild(badge);
    });
}

function parseImportedMD(mdText) {
    saveTreeStateForUndo();

    const lines = mdText.split('\n');
    let currentLabel = "Imported Concept";
    let isParsingNotes = false;

    lines.forEach(line => {
        if (line.startsWith('# ')) {
            currentLabel = line.replace('# ', '').trim();
            isParsingNotes = false;
        } else if (line.startsWith('## ')) {
            isParsingNotes = true;
        } else if (isParsingNotes) {
            const cleanLine = line.trim();
            if (cleanLine && !cleanLine.startsWith('---')) {
                // To avoid breaking elements, push lines individually if they are not empty
                addOrUpdateTreeNode(currentLabel, cleanLine, false);
            }
        }
    });
    renderTree();
    saveSession();
}

// Boot
window.onload = () => {
    init();
    loadSessions();
    
    // Disable Apply Button on Knowledge check toggle
    const kList = document.getElementById('knowledge-list');
    if (kList) {
        kList.addEventListener('change', (e) => {
            if (e.target.classList.contains('knowledge-checkbox')) {
                const checked = document.querySelectorAll('.knowledge-checkbox:checked').length;
                const btnApply = document.getElementById('btn-apply-knowledge');
                if (btnApply) {
                    btnApply.disabled = checked === 0;
                }
            }
        });
    }

    checkAndShowSettings();
    applyLanguage();
};
