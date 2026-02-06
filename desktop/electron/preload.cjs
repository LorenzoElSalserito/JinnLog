/**
 * JinnLog Electron Preload Script v0.2.2
 *
 * Espone API sicure al renderer process per:
 * - Logging al main process
 * - Accesso alla configurazione backend
 * - Funzioni native Electron (dialogs, file system)
 * - Focus management sincronizzato (forceFocusSync, ensureWebContentFocusSync)
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.2.2 - Aggiunto ensureWebContentFocusSync per recupero key focus su Linux
 */

const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

// ========================================
// Helpers
// ========================================

function safeSerialize(arg) {
    try {
        if (arg instanceof Error) {
            return { name: arg.name, message: arg.message, stack: arg.stack };
        }
        return arg;
    } catch (_) {
        return String(arg);
    }
}

function sendLog(level, ...args) {
    ipcRenderer.send(
        "renderer:log",
        level,
        ...args.map((a) => safeSerialize(a))
    );
}

/**
 * Legge la porta del backend Java dal file di configurazione
 */
async function getBackendPort() {
    try {
        // Chiedi al main process
        const port = await ipcRenderer.invoke("backend:getPort");
        if (port) return port;

        // Fallback: leggi direttamente il file (se disponibile)
        const userData = await ipcRenderer.invoke("app:getPath", "userData");
        const configPaths = [
            path.join(userData, "config", "backend.port"),
            path.join(process.cwd(), "data", "config", "backend.port"),
            "./data/config/backend.port",
        ];

        for (const configPath of configPaths) {
            try {
                if (fs.existsSync(configPath)) {
                    const content = fs.readFileSync(configPath, "utf-8").trim();
                    const port = parseInt(content, 10);
                    if (!isNaN(port) && port > 0 && port < 65536) {
                        console.log("[Preload] Backend port from file:", port);
                        return port;
                    }
                }
            } catch (e) {
                // Ignora
            }
        }

        return null;
    } catch (e) {
        console.error("[Preload] Error reading backend port:", e);
        return null;
    }
}

// ========================================
// Context Bridge - Focus Management API
// ========================================

/**
 * JLWindow - API per la gestione del focus della finestra Electron
 *
 * forceFocus: Richiesta asincrona (fallback)
 * forceFocusSync: Richiesta SINCRONA (fondamentale per text-box su Linux/Wayland)
 * ensureWebContentFocusSync: NUOVO - Forza webContents.focus() per recuperare key focus
 */
contextBridge.exposeInMainWorld('JLWindow', {
    /**
     * Richiesta focus asincrona (fallback, meno efficace)
     */
    forceFocus: (reason) => {
        try {
            ipcRenderer.send('jl:force-focus', { reason: reason || 'async' });
        } catch (e) {
            console.warn('[Preload] forceFocus error:', e);
        }
    },

    /**
     * Richiesta focus SINCRONA - CHIAMALA durante pointerdown/keydown!
     * Fondamentale su Linux/Wayland dove i window manager
     * accettano richieste di focus solo durante gesti utente reali.
     */
    forceFocusSync: (reason) => {
        try {
            return ipcRenderer.sendSync('jl:force-focus-sync', { reason: reason || 'sync' });
        } catch (e) {
            console.warn('[Preload] forceFocusSync fallback to async:', e);
            try {
                ipcRenderer.send('jl:force-focus', { reason: (reason || 'sync') + '-fallback' });
            } catch (e2) {
                console.warn('[Preload] forceFocus fallback also failed:', e2);
            }
            return false;
        }
    },

    /**
     * NUOVO in v0.2.2: Forza webContents.focus() per recuperare il key focus
     *
     * Su Linux, può succedere che:
     * - win.isFocused() = true (la finestra ha focus a livello window manager)
     * - webContents NON ha il "key focus" interno
     * - Risultato: la tastiera non funziona!
     *
     * Questo handler SEMPRE chiama webContents.focus() per assicurarsi
     * che il renderer possa ricevere input da tastiera.
     *
     * USARE CON CAUTELA: chiamarlo durante la digitazione normale
     * ruberebbe il focus dalla text-box!
     */
    ensureWebContentFocusSync: (reason) => {
        try {
            return ipcRenderer.sendSync('jl:ensure-webcontent-focus', { reason: reason || 'ensure' });
        } catch (e) {
            console.warn('[Preload] ensureWebContentFocusSync error:', e);
            // Fallback: prova forceFocusSync
            try {
                return ipcRenderer.sendSync('jl:force-focus-sync', { reason: (reason || 'ensure') + '-fallback' });
            } catch (e2) {
                console.warn('[Preload] ensureWebContentFocusSync fallback also failed:', e2);
            }
            return false;
        }
    },
});

// ========================================
// Context Bridge - Main API (jinn)
// ========================================

contextBridge.exposeInMainWorld("jinn", {
    // ========================================
    // Logging (Renderer -> Main terminal)
    // ========================================
    log: (...args) => sendLog("log", ...args),
    warn: (...args) => sendLog("warn", ...args),
    error: (...args) => sendLog("error", ...args),

    // ========================================
    // Backend Configuration
    // ========================================

    /**
     * Ottiene la porta del backend Java
     */
    getBackendPort: () => getBackendPort(),

    /**
     * Verifica se il backend e disponibile
     */
    checkBackendHealth: async () => {
        const port = await getBackendPort();
        if (!port) return { ok: false, error: "Port not found" };

        try {
            const response = await fetch(`http://localhost:${port}/api/health`, {
                signal: AbortSignal.timeout(3000),
            });
            return { ok: response.ok, port };
        } catch (e) {
            return { ok: false, error: e.message, port };
        }
    },

    // ========================================
    // Projects (IPC -> Backend via Main)
    // ========================================
    projectsList: () => ipcRenderer.invoke("projects:list"),
    projectsCreate: (name) => ipcRenderer.invoke("projects:create", name),
    projectsDelete: (projectId) => ipcRenderer.invoke("projects:delete", projectId),

    // ========================================
    // Tasks (IPC -> Backend via Main)
    // ========================================
    tasksList: (projectId) => ipcRenderer.invoke("tasks:list", projectId),
    tasksCreate: (payload) => ipcRenderer.invoke("tasks:create", payload),
    tasksUpdate: (taskId, patch) => ipcRenderer.invoke("tasks:update", taskId, patch),
    tasksDelete: (taskId) => ipcRenderer.invoke("tasks:delete", taskId),

    // ========================================
    // Focus Sessions
    // ========================================
    focusStart: (taskId) => ipcRenderer.invoke("focus:start", taskId),
    focusStop: () => ipcRenderer.invoke("focus:stop"),
    focusRunning: () => ipcRenderer.invoke("focus:running"),
    focusHistory: (taskId) => ipcRenderer.invoke("focus:history", taskId),
    focusHistoryAll: () => ipcRenderer.invoke("focus:historyAll"),

    // ========================================
    // Export/Import con Native Dialogs
    // ========================================

    /**
     * Export JSON con dialog nativo per scegliere destinazione
     */
    exportJsonDialog: () => ipcRenderer.invoke("data:exportJsonDialog"),

    /**
     * Export CSV con dialog nativo
     */
    exportCsvDialog: (projectId) => ipcRenderer.invoke("data:exportCsvDialog", projectId),

    /**
     * Import JSON con dialog nativo per scegliere file
     */
    importJsonDialog: () => ipcRenderer.invoke("data:importJsonDialog"),

    /**
     * Import database (.db) dal backend Java
     */
    importDbDialog: () => ipcRenderer.invoke("data:importDbDialog"),

    /**
     * Export database (.db) dal backend Java
     */
    exportDbDialog: () => ipcRenderer.invoke("data:exportDbDialog"),

    // ========================================
    // App Paths
    // ========================================

    /**
     * Ottiene il percorso dati locale
     */
    getLocalDataPath: () => ipcRenderer.invoke("data:getLocalDataPath"),

    /**
     * Ottiene percorso app Electron
     */
    getAppPath: (name) => ipcRenderer.invoke("app:getPath", name),

    // ========================================
    // File Operations
    // ========================================

    /**
     * Apre file/cartella nel file manager di sistema
     */
    openPath: (filePath) => ipcRenderer.invoke("shell:openPath", filePath),

    /**
     * Mostra file nel file manager (con selezione)
     */
    showItemInFolder: (filePath) => ipcRenderer.invoke("shell:showItemInFolder", filePath),

    /**
     * Apre URL esterno nel browser
     */
    openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),

    // ========================================
    // System Info
    // ========================================

    /**
     * Informazioni piattaforma
     */
    platform: process.platform,

    /**
     * Versione Electron
     */
    versions: {
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
    },

    // ========================================
    // Window Controls
    // ========================================

    /**
     * Minimizza finestra
     */
    minimize: () => ipcRenderer.send("window:minimize"),

    /**
     * Massimizza/Ripristina finestra
     */
    maximize: () => ipcRenderer.send("window:maximize"),

    /**
     * Chiudi finestra
     */
    close: () => ipcRenderer.send("window:close"),

    /**
     * Forza il focus sulla finestra (utile per modali)
     */
    focusWindow: () => ipcRenderer.invoke("jinnlog:focus-window"),

    // ========================================
    // Notifications
    // ========================================

    /**
     * Mostra notifica di sistema
     */
    showNotification: (title, body, options = {}) => {
        ipcRenderer.invoke("notification:show", { title, body, ...options });
    },

    /**
     * Richiedi permesso notifiche (se necessario)
     */
    requestNotificationPermission: () => {
        return ipcRenderer.invoke("notification:requestPermission");
    },

    // ========================================
    // App Events (da Main a Renderer)
    // ========================================

    /**
     * Registra callback per eventi
     */
    on: (channel, callback) => {
        const validChannels = [
            "app:focus",
            "app:blur",
            "backend:status",
            "reminder:due",
            "sync:status",
        ];

        if (validChannels.includes(channel)) {
            const subscription = (_event, ...args) => callback(...args);
            ipcRenderer.on(channel, subscription);

            // Ritorna funzione per rimuovere listener
            return () => ipcRenderer.removeListener(channel, subscription);
        }
    },

    /**
     * Rimuovi tutti i listener per un canale
     */
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },
});

// ========================================
// Log inizializzazione
// ========================================

console.log("[Preload] JinnLog preload script loaded v0.2.2");
console.log("[Preload] Platform:", process.platform);
console.log("[Preload] Electron:", process.versions.electron);
console.log("[Preload] forceFocusSync available:", typeof ipcRenderer.sendSync === 'function');
console.log("[Preload] ensureWebContentFocusSync available:", typeof ipcRenderer.sendSync === 'function');