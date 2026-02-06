/**
 * JinnLog API Client v0.7.2
 *
 * This module handles all communication with the Java backend.
 * It works in both Electron (desktop) and browser (web) modes.
 *
 * Features:
 * - Auto-discovery of backend port
 * - Centralized error handling
 * - Support for all v0.2.0 APIs (tags, markdown notes, reminders, assets)
 * - Fallback to Electron IPC for desktop-specific functions
 * - API paths aligned with RESTful backend (/api/users/{userId}/...)
 * - Bootstrap API for onboarding (v0.3.0)
 * - Local preference management (v0.3.0)
 * - Focus Timer API (v0.4.1)
 * - Checklist API (v0.4.3)
 * - Notes API (v0.7.1 - Refactored)
 * - Team API (v0.5.0)
 * - Analytics API (v0.5.0)
 * - Connections API (v0.6.0)
 * - Resource API (v0.6.0)
 * - Notifications API (v0.7.0)
 *
 * @module jinn
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.7.2 - Fixed preference parsing
 */

// ========================================
// Configuration
// ========================================

let API_BASE_URL = null;
let CURRENT_USER_ID = null;
let CURRENT_PROJECT_ID = null;

// Default port if config file cannot be read
const DEFAULT_PORT = 8080;

// Keys for localStorage (client-side preferences)
const STORAGE_KEY_AUTOLOGIN = 'jinnlog_autologin_enabled';
const STORAGE_KEY_LAST_USER = 'jinnlog_last_user_id';
const STORAGE_KEY_LANGUAGE = 'jinnlog_language';

/**
 * Initializes the API client.
 * Reads the port from the config file or uses the default.
 * @returns {Promise<string>} The base API URL.
 */
async function initializeApi() {
    if (API_BASE_URL) return API_BASE_URL;

    try {
        // In Electron, try reading port from config file via IPC
        if (window.jinn && window.jinn.getBackendPort) {
            const port = await window.jinn.getBackendPort();
            if (port) {
                API_BASE_URL = `http://localhost:${port}/api`;
                console.log('[JinnLog API] Backend su porta:', port);
                return API_BASE_URL;
            }
        }
    } catch (e) {
        console.warn('[JinnLog API] Impossibile leggere porta da config:', e);
    }

    // Try common ports
    const portsToTry = [8080, 45499, 3000];
    for (const port of portsToTry) {
        try {
            const testUrl = `http://localhost:${port}/api/health`;
            const response = await fetch(testUrl, { method: 'GET', signal: AbortSignal.timeout(2000) });
            if (response.ok) {
                API_BASE_URL = `http://localhost:${port}/api`;
                console.log('[JinnLog API] Backend trovato su porta:', port);
                return API_BASE_URL;
            }
        } catch (e) {
            // Ignore, try next port
        }
    }

    // Fallback
    API_BASE_URL = `http://localhost:${DEFAULT_PORT}/api`;
    console.log('[JinnLog API] Usando porta default:', DEFAULT_PORT);
    return API_BASE_URL;
}

/**
 * Gets the base API URL (initializes if necessary).
 * @returns {Promise<string>} The base API URL.
 */
async function getApiUrl() {
    if (!API_BASE_URL) {
        await initializeApi();
    }
    return API_BASE_URL;
}

/**
 * Helper: constructs the base path for the current user.
 * @throws {Error} If CURRENT_USER_ID is not set.
 * @returns {string} The user base path (e.g., /users/123).
 */
function getUserBasePath() {
    if (!CURRENT_USER_ID) {
        throw new Error('[JinnLog API] Utente non impostato. Chiamare setCurrentUser() o bootstrap.selectProfile() prima.');
    }
    return `/users/${CURRENT_USER_ID}`;
}

/**
 * Helper: checks if a user is set (without throwing).
 * @returns {boolean} True if a user is set.
 */
function hasCurrentUser() {
    return CURRENT_USER_ID !== null && CURRENT_USER_ID !== undefined;
}

// ========================================
// HTTP Helpers
// ========================================

/**
 * Performs an HTTP request to the backend.
 * @param {string} endpoint - The API endpoint (e.g., /users).
 * @param {Object} options - Fetch options (method, body, headers).
 * @returns {Promise<any>} The JSON response or null.
 * @throws {ApiError} If the request fails.
 */
async function apiRequest(endpoint, options = {}) {
    const baseUrl = await getApiUrl();
    const url = `${baseUrl}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    // Add header to identify user (for controllers using @CurrentUser)
    if (CURRENT_USER_ID) {
        defaultHeaders['X-User-Id'] = CURRENT_USER_ID;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                errorData
            );
        }

        // If response is empty (204 No Content)
        if (response.status === 204) {
            return null;
        }

        // Handle empty responses with status 200
        const text = await response.text();
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            // If not valid JSON but not empty, might be an error or plain text
            console.warn('[JinnLog API] Risposta non JSON:', text);
            return text;
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network error
        console.error('[JinnLog API] Errore di rete:', error);
        throw new ApiError(
            'Impossibile contattare il server. Verifica che il backend sia avviato.',
            0,
            { originalError: error.message }
        );
    }
}

/**
 * Custom Error class for API errors.
 */
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// ========================================
// Local Preferences Helper
// ========================================

/**
 * Saves a preference to localStorage (fallback for web).
 * In Electron, uses electron-store if available.
 * @param {string} key - The preference key.
 * @param {any} value - The value to save.
 */
function saveLocalPreference(key, value) {
    try {
        if (window.jinn?.setPreference) {
            window.jinn.setPreference(key, value);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    } catch (e) {
        console.warn('[JinnLog API] Errore salvataggio preferenza:', e);
    }
}

/**
 * Reads a preference from localStorage (fallback for web).
 * @param {string} key - The preference key.
 * @param {any} defaultValue - Default value if not found.
 * @returns {any} The preference value.
 */
function loadLocalPreference(key, defaultValue = null) {
    try {
        if (window.jinn?.getPreference) {
            return window.jinn.getPreference(key) ?? defaultValue;
        }
        const stored = localStorage.getItem(key);
        // Fix: Handle non-JSON strings (like "it") gracefully
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                // If parsing fails, return the raw string (e.g. "it")
                return stored;
            }
        }
        return defaultValue;
    } catch (e) {
        console.warn('[JinnLog API] Errore lettura preferenza:', e);
        return defaultValue;
    }
}

// ========================================
// API Export - Main Object
// ========================================

export const jinn = {
    // ========================================
    // Logging (to console and/or Electron main process)
    // ========================================
    log: (...args) => {
        console.log('[JinnLog]', ...args);
        if (window.jinn?.log) window.jinn.log(...args);
    },
    warn: (...args) => {
        console.warn('[JinnLog]', ...args);
        if (window.jinn?.warn) window.jinn.warn(...args);
    },
    error: (...args) => {
        console.error('[JinnLog]', ...args);
        if (window.jinn?.error) window.jinn.error(...args);
    },

    // ========================================
    // Initialization and Auth
    // ========================================

    /**
     * Initializes the API client.
     */
    init: async () => {
        await initializeApi();
        return { baseUrl: API_BASE_URL };
    },

    /**
     * Sets the current user ID.
     * @param {string} userId - The user ID.
     */
    setCurrentUser: (userId) => {
        CURRENT_USER_ID = userId;
        console.log('[JinnLog API] Utente corrente impostato:', userId);
    },

    /**
     * Sets the current project ID.
     * @param {string} projectId - The project ID.
     */
    setCurrentProject: (projectId) => {
        CURRENT_PROJECT_ID = projectId;
    },

    /**
     * Gets the current user ID.
     * @returns {string|null} The user ID.
     */
    getCurrentUser: () => CURRENT_USER_ID,

    /**
     * Gets the current project ID.
     * @returns {string|null} The project ID.
     */
    getCurrentProject: () => CURRENT_PROJECT_ID,

    /**
     * Checks if a user is set.
     * @returns {boolean} True if set.
     */
    hasCurrentUser: () => hasCurrentUser(),

    // ========================================
    // Bootstrap API (v0.3.0)
    // Endpoint: /api/bootstrap
    // ========================================

    /**
     * Gets bootstrap data (users, preferences, system info).
     * ALWAYS call this at application startup.
     */
    bootstrapGet: () => apiRequest('/bootstrap'),

    /**
     * Creates a new local profile (no password).
     * @param {Object} data - { username, displayName, email?, avatarPath? }
     */
    bootstrapCreateProfile: (data) => apiRequest('/bootstrap/profiles', {
        method: 'POST',
        body: data,
    }),

    /**
     * Selects a profile as active (updates lastLoginAt).
     * Automatically sets CURRENT_USER_ID.
     * @param {string} userId - ID of the profile to select.
     */
    bootstrapSelectProfile: async (userId) => {
        const user = await apiRequest(`/bootstrap/select/${userId}`, {
            method: 'POST',
        });
        CURRENT_USER_ID = user.id;
        // Save locally for autologin
        saveLocalPreference(STORAGE_KEY_LAST_USER, userId);
        console.log('[JinnLog API] Profilo selezionato:', user.displayName || user.username);
        return user;
    },

    /**
     * Deletes (deactivates) a local profile.
     * @param {string} userId - ID of the profile to delete.
     */
    bootstrapDeleteProfile: (userId) => apiRequest(`/bootstrap/profiles/${userId}`, {
        method: 'DELETE',
    }),

    /**
     * Gets global preferences from backend.
     */
    bootstrapGetPreferences: () => apiRequest('/bootstrap/preferences'),

    /**
     * Updates global preferences.
     * @param {Object} data - { lastUserId?, autologinEnabled? }
     */
    bootstrapUpdatePreferences: (data) => apiRequest('/bootstrap/preferences', {
        method: 'PUT',
        body: data,
    }),

    /**
     * Validates if a userId is valid for autologin.
     * @param {string} userId - ID to validate.
     */
    bootstrapValidateUser: (userId) => apiRequest(`/bootstrap/validate/${userId}`),

    /**
     * Gets local preferences (localStorage/electron-store).
     * Useful for quick bootstrap before backend is ready.
     */
    getLocalPreferences: () => ({
        autologinEnabled: loadLocalPreference(STORAGE_KEY_AUTOLOGIN, false),
        lastUserId: loadLocalPreference(STORAGE_KEY_LAST_USER, null),
        language: loadLocalPreference(STORAGE_KEY_LANGUAGE, 'it'),
    }),

    /**
     * Saves local preferences.
     * @param {Object} prefs - { autologinEnabled?, lastUserId?, language? }
     */
    setLocalPreferences: (prefs) => {
        if (prefs.autologinEnabled !== undefined) {
            saveLocalPreference(STORAGE_KEY_AUTOLOGIN, prefs.autologinEnabled);
        }
        if (prefs.lastUserId !== undefined) {
            saveLocalPreference(STORAGE_KEY_LAST_USER, prefs.lastUserId);
        }
        if (prefs.language !== undefined) {
            saveLocalPreference(STORAGE_KEY_LANGUAGE, prefs.language);
        }
    },

    // ========================================
    // Health Check
    // ========================================

    /**
     * Checks if the backend is active.
     */
    healthCheck: async () => {
        try {
            const result = await apiRequest('/health');
            return { ok: true, ...result };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    },

    // ========================================
    // Users API
    // Endpoint: /api/users (does not require userId in path)
    // ========================================

    /**
     * Gets all users.
     */
    usersList: (onlyActive = true) => apiRequest(`/users?onlyActive=${onlyActive}`),

    /**
     * Searches users by name, username, or email.
     */
    usersSearch: (query) => apiRequest(`/users/search?q=${encodeURIComponent(query)}`),

    /**
     * Gets a specific user.
     */
    usersGet: (userId) => apiRequest(`/users/${userId}`),

    /**
     * Creates a new user.
     */
    usersCreate: (data) => apiRequest('/users', {
        method: 'POST',
        body: data,
    }),

    /**
     * Updates a user.
     */
    usersUpdate: (userId, data) => apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: data,
    }),

    /**
     * Sets user active/inactive.
     */
    usersSetActive: (userId, active) => apiRequest(`/users/${userId}/active?active=${active}`, {
        method: 'PATCH',
    }),

    // ========================================
    // Connections API (v0.6.0)
    // Endpoint: /api/connections (userId from header)
    // ========================================

    /**
     * Gets the list of friends (JinnLoggers).
     */
    connectionsList: () => {
        return apiRequest(`/connections`);
    },

    /**
     * Searches among friends.
     */
    connectionsSearch: (query) => {
        return apiRequest(`/connections/search?q=${encodeURIComponent(query)}`);
    },

    /**
     * Sends a connection request.
     */
    connectionsRequest: (targetId) => {
        return apiRequest(`/connections/request/${targetId}`, { method: 'POST' });
    },

    /**
     * Accepts a connection request.
     */
    connectionsAccept: (connectionId) => {
        return apiRequest(`/connections/${connectionId}/accept`, { method: 'POST' });
    },

    /**
     * Rejects a connection request.
     */
    connectionsReject: (connectionId) => {
        return apiRequest(`/connections/${connectionId}/reject`, { method: 'DELETE' });
    },

    /**
     * Removes a connection.
     */
    connectionsRemove: (targetId) => {
        return apiRequest(`/connections/remove/${targetId}`, { method: 'DELETE' });
    },

    /**
     * Gets incoming pending requests.
     */
    connectionsPendingIncoming: () => {
        return apiRequest(`/connections/pending/incoming`);
    },

    /**
     * Gets outgoing pending requests.
     */
    connectionsPendingOutgoing: () => {
        return apiRequest(`/connections/pending/outgoing`);
    },

    // ========================================
    // Projects API
    // Endpoint: /api/users/{userId}/projects
    // ========================================

    /**
     * Gets all projects for the current user.
     */
    projectsList: (options = {}) => {
        const basePath = getUserBasePath();
        const params = new URLSearchParams();
        if (options.archived !== undefined) params.append('archived', options.archived.toString());
        if (options.favorite !== undefined) params.append('favorite', options.favorite.toString());
        if (options.search) params.append('search', options.search);

        const queryString = params.toString();
        return apiRequest(`${basePath}/projects${queryString ? '?' + queryString : ''}`);
    },

    /**
     * Gets a specific project.
     */
    projectsGet: (projectId) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}`);
    },

    /**
     * Creates a new project.
     */
    projectsCreate: (name, description = '', color = null, icon = null) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects`, {
            method: 'POST',
            body: { name, description, color, icon },
        });
    },

    /**
     * Updates a project.
     */
    projectsUpdate: (projectId, data) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Archives/Unarchives a project.
     */
    projectsSetArchived: (projectId, archived) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/archived?archived=${archived}`, {
            method: 'PATCH',
        });
    },

    /**
     * Deletes a project (soft delete via archived).
     */
    projectsDelete: (projectId) => {
        // For now, we use archived=true as soft delete
        return jinn.projectsSetArchived(projectId, true);
    },

    // ========================================
    // Tasks API
    // Endpoint: /api/users/{userId}/projects/{projectId}/tasks
    // ========================================

    /**
     * Gets all tasks for a project.
     */
    tasksList: (projectId, options = {}) => {
        const basePath = getUserBasePath();
        const params = new URLSearchParams();
        if (options.status) params.append('status', options.status);
        if (options.priority) params.append('priority', options.priority);
        if (options.search) params.append('search', options.search);
        if (options.includeArchived) params.append('includeArchived', 'true');

        const queryString = params.toString();
        return apiRequest(`${basePath}/projects/${projectId}/tasks${queryString ? '?' + queryString : ''}`);
    },

    /**
     * Gets a specific task.
     */
    tasksGet: (projectId, taskId) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/tasks/${taskId}`);
    },

    /**
     * Creates a new task.
     */
    tasksCreate: (projectId, data) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/tasks`, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Updates a task.
     */
    tasksUpdate: (projectId, taskId, data) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/tasks/${taskId}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Updates only the status of a task.
     */
    tasksUpdateStatus: (projectId, taskId, status) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/tasks/${taskId}/status`, {
            method: 'PATCH',
            body: { status },
        });
    },

    /**
     * Archives/Unarchives a task.
     */
    tasksSetArchived: (projectId, taskId, archived) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/tasks/${taskId}/archived?archived=${archived}`, {
            method: 'PATCH',
        });
    },

    /**
     * Deletes a task (soft delete via archived).
     */
    tasksDelete: (projectId, taskId) => {
        return jinn.tasksSetArchived(projectId, taskId, true);
    },

    /**
     * Reorders tasks.
     */
    tasksReorder: (projectId, orderedTaskIds) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/tasks/reorder`, {
            method: 'PUT',
            body: orderedTaskIds,
        });
    },

    // ========================================
    // Checklist API (v0.4.3)
    // Endpoint: /api/users/{userId}/projects/{projectId}/tasks/{taskId}/checklist
    // ========================================

    /**
     * Creates a new item in the checklist.
     */
    checklistCreate: (projectId, taskId, text) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/tasks/${taskId}/checklist`, {
            method: 'POST',
            body: { text },
        });
    },

    /**
     * Updates a checklist item.
     */
    checklistUpdate: (projectId, taskId, itemId, data) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/tasks/${taskId}/checklist/${itemId}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Deletes a checklist item.
     */
    checklistDelete: (projectId, taskId, itemId) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/tasks/${taskId}/checklist/${itemId}`, {
            method: 'DELETE',
        });
    },

    // ========================================
    // Notes API (v0.7.1)
    // Endpoint: /api/notes
    // ========================================

    /**
     * Gets the list of notes for a Task.
     */
    notesListTask: (taskId) => {
        return apiRequest(`/tasks/${taskId}/notes`);
    },

    /**
     * Creates a note for a Task.
     */
    notesCreateTask: (taskId, data) => {
        return apiRequest(`/tasks/${taskId}/notes`, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Gets the list of notes for a Project.
     */
    notesListProject: (projectId) => {
        return apiRequest(`/projects/${projectId}/notes`);
    },

    /**
     * Creates a note for a Project.
     */
    notesCreateProject: (projectId, data) => {
        return apiRequest(`/projects/${projectId}/notes`, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Gets the list of notes (Legacy/Search).
     */
    notesList: (parentType = null, parentId = null, search = null) => {
        const params = new URLSearchParams();
        if (parentType) params.append('parentType', parentType);
        if (parentId) params.append('parentId', parentId);
        if (search) params.append('search', search);

        const queryString = params.toString();
        return apiRequest(`/notes${queryString ? '?' + queryString : ''}`);
    },
    
    /**
     * Gets the notes feed (Inbox, Sent, All).
     */
    notesFeed: (scope = 'ALL') => {
        return apiRequest(`/notes/feed?scope=${scope}`);
    },

    /**
     * Creates a new note (Legacy).
     * @param {Object} data - { title, content, parentType, parentId, tagIds }
     */
    notesCreate: (data) => {
        const params = new URLSearchParams();
        params.append('parentType', data.parentType);
        params.append('parentId', data.parentId);
        
        // Remove parentType/parentId from body as they are now query params
        const { parentType, parentId, ...body } = data;
        
        return apiRequest(`/notes?${params.toString()}`, {
            method: 'POST',
            body: body,
        });
    },

    /**
     * Updates a note.
     */
    notesUpdate: (noteId, data) => {
        return apiRequest(`/notes/${noteId}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Deletes a note.
     */
    notesDelete: (noteId) => {
        return apiRequest(`/notes/${noteId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Gets a specific note.
     */
    notesGet: (noteId) => {
        return apiRequest(`/notes/${noteId}`);
    },

    // ========================================
    // Team API (v0.5.0)
    // Endpoint: /api/users/{userId}/projects/{projectId}/members
    // ========================================

    /**
     * Gets the list of project members.
     */
    projectMembersList: (projectId) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/members`);
    },

    /**
     * Adds a member to the project.
     */
    projectMembersAdd: (projectId, userId, role) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/members`, {
            method: 'POST',
            body: { userId, role },
        });
    },

    /**
     * Removes a member from the project.
     */
    projectMembersRemove: (projectId, memberId) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/members/${memberId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Creates a Ghost user for the project.
     */
    projectMembersCreateGhost: (projectId, username, displayName) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/projects/${projectId}/members/ghosts`, {
            method: 'POST',
            body: { username, displayName },
        });
    },

    // ========================================
    // Resource API (v0.6.0)
    // Endpoint: /api/projects/{projectId}/resources
    // ========================================

    /**
     * Gets resource allocation for a project.
     */
    resourceAllocation: (projectId, startDate, endDate) => {
        return apiRequest(`/projects/${projectId}/resources?startDate=${startDate}&endDate=${endDate}`);
    },

    // ========================================
    // Analytics API (v0.5.0)
    // Endpoint: /api/users/{userId}/analytics
    // ========================================

    /**
     * Gets analytics on estimates.
     */
    analyticsEstimates: (projectId = null) => {
        const basePath = getUserBasePath();
        const params = projectId ? `?projectId=${projectId}` : '';
        return apiRequest(`${basePath}/analytics/estimates${params}`);
    },

    /**
     * Gets focus heatmap.
     */
    analyticsFocusHeatmap: (projectId = null, range = 365) => {
        const basePath = getUserBasePath();
        const params = new URLSearchParams();
        if (projectId) params.append('projectId', projectId);
        params.append('range', range.toString());
        
        const queryString = params.toString();
        return apiRequest(`${basePath}/analytics/focus-heatmap${queryString ? '?' + queryString : ''}`);
    },

    // ========================================
    // Notifications API (v0.7.0)
    // Endpoint: /api/notifications
    // ========================================

    /**
     * Gets unread notifications.
     */
    notificationsUnread: () => {
        return apiRequest(`/notifications/unread`);
    },

    /**
     * Counts unread notifications.
     */
    notificationsCount: () => {
        return apiRequest(`/notifications/count`);
    },

    /**
     * Marks a notification as read.
     */
    notificationsMarkRead: (notificationId) => {
        return apiRequest(`/notifications/${notificationId}/read`, { method: 'POST' });
    },

    /**
     * Marks all notifications as read.
     */
    notificationsMarkAllRead: () => {
        return apiRequest(`/notifications/read-all`, { method: 'POST' });
    },

    // ========================================
    // Tags API (v0.2.0)
    // Endpoint: /api/tags (uses @CurrentUser from X-User-Id header)
    // ========================================

    /**
     * Gets all user tags.
     */
    tagsList: () => apiRequest('/tags'),

    /**
     * Gets a specific tag.
     */
    tagsGet: (tagId) => apiRequest(`/tags/${tagId}`),

    /**
     * Creates a new tag.
     */
    tagsCreate: (name, color = '#3498db') => apiRequest('/tags', {
        method: 'POST',
        body: { name, color },
    }),

    /**
     * Updates a tag.
     */
    tagsUpdate: (tagId, data) => apiRequest(`/tags/${tagId}`, {
        method: 'PUT',
        body: data,
    }),

    /**
     * Deletes a tag.
     */
    tagsDelete: (tagId) => apiRequest(`/tags/${tagId}`, {
        method: 'DELETE',
    }),

    /**
     * Searches tags by name.
     */
    tagsSearch: (query) => apiRequest(`/tags/search?q=${encodeURIComponent(query)}`),

    /**
     * Tag statistics (most used, unused).
     */
    tagsStats: () => apiRequest('/tags/stats'),

    // ========================================
    // Focus Sessions API
    // Endpoint: /api/users/{userId}/focus-sessions
    // ========================================

    /**
     * Starts a focus session.
     */
    focusStart: (taskId, options = {}) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/focus-sessions/tasks/${taskId}/start`, {
            method: 'POST',
            body: options,
        });
    },

    /**
     * Stops the current focus session.
     */
    focusStop: (sessionId = null, options = {}) => {
        const basePath = getUserBasePath();
        // If sessionId is not provided, try to stop the current one
        const endpoint = sessionId 
            ? `${basePath}/focus-sessions/${sessionId}/stop`
            : `${basePath}/focus-sessions/current/stop`;
            
        return apiRequest(endpoint, {
            method: 'POST',
            body: options,
        });
    },

    /**
     * Gets the current focus session (if active).
     */
    focusRunning: () => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/focus-sessions/current`);
    },

    /**
     * Gets focus sessions (optionally filtered by taskId).
     */
    focusList: (taskId = null) => {
        const basePath = getUserBasePath();
        const params = taskId ? `?taskId=${taskId}` : '';
        return apiRequest(`${basePath}/focus-sessions${params}`);
    },

    /**
     * Session history for a task.
     */
    focusHistory: (taskId) => jinn.focusList(taskId),

    /**
     * History of all sessions.
     */
    focusHistoryAll: (options = {}) => {
        const basePath = getUserBasePath();
        const params = new URLSearchParams();
        if (options.taskId) params.append('taskId', options.taskId);

        const queryString = params.toString();
        return apiRequest(`${basePath}/focus-sessions${queryString ? '?' + queryString : ''}`);
    },

    /**
     * Focus statistics by period (TODO: implement backend side).
     */
    focusStats: (period = 'week') => {
        // TODO: This endpoint does not exist in the backend yet
        console.warn('[JinnLog API] focusStats non ancora implementato nel backend');
        return Promise.resolve({ totalMinutes: 0, sessionsCount: 0, period });
    },

    // ========================================
    // User Settings API (v0.2.0)
    // Endpoint: /api/settings (uses @CurrentUser from X-User-Id header)
    // ========================================

    /**
     * Gets user settings.
     */
    settingsGet: () => apiRequest('/settings'),

    /**
     * Updates user settings.
     */
    settingsUpdate: (data) => apiRequest('/settings', {
        method: 'PUT',
        body: data,
    }),

    /**
     * Resets settings to default values.
     */
    settingsReset: () => apiRequest('/settings/reset', {
        method: 'POST',
    }),

    // ========================================
    // Assets API (v0.2.0)
    // Endpoint: /api/users/{userId}/assets
    // ========================================

    /**
     * Gets all user assets.
     */
    assetsList: (includeDeleted = false) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/assets?includeDeleted=${includeDeleted}`);
    },

    /**
     * Gets a specific asset.
     */
    assetsGet: (assetId) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/assets/${assetId}`);
    },

    /**
     * Uploads an asset.
     */
    assetsUpload: async (file, description = null) => {
        const baseUrl = await getApiUrl();
        const basePath = getUserBasePath();
        const formData = new FormData();
        formData.append('file', file);
        if (description) {
            formData.append('description', description);
        }

        const response = await fetch(`${baseUrl}${basePath}/assets/upload`, {
            method: 'POST',
            body: formData,
            headers: CURRENT_USER_ID ? { 'X-User-Id': CURRENT_USER_ID } : {},
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || 'Errore upload asset',
                response.status,
                errorData
            );
        }

        return response.json();
    },

    /**
     * Multiple asset upload.
     */
    assetsUploadMultiple: async (files, description = null) => {
        const results = [];
        for (const file of files) {
            try {
                const result = await jinn.assetsUpload(file, description);
                results.push(result);
            } catch (e) {
                console.error('[JinnLog API] Errore upload file:', file.name, e);
            }
        }
        return results;
    },

    /**
     * Updates asset metadata.
     */
    assetsUpdate: (assetId, data) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/assets/${assetId}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Deletes an asset (soft delete).
     */
    assetsDelete: (assetId) => {
        const basePath = getUserBasePath();
        return apiRequest(`${basePath}/assets/${assetId}/deleted?deleted=true`, {
            method: 'PATCH',
        });
    },

    /**
     * Downloads an asset (TODO: implement download endpoint in backend).
     */
    assetsDownload: async (assetId) => {
        console.warn('[JinnLog API] assetsDownload: endpoint da implementare nel backend');
        // For now, returns only metadata
        return jinn.assetsGet(assetId);
    },

    // ========================================
    // Reminders API (v0.2.0)
    // TODO: Implement backend controller
    // ========================================

    /**
     * Gets all active reminders.
     */
    remindersList: () => {
        console.warn('[JinnLog API] remindersList: endpoint non ancora implementato');
        return Promise.resolve([]);
    },

    /**
     * Checks due reminders.
     */
    remindersCheckDue: () => {
        console.warn('[JinnLog API] remindersCheckDue: endpoint non ancora implementato');
        return Promise.resolve([]);
    },

    /**
     * Marks a reminder as notified.
     */
    reminderMarkNotified: (taskId) => {
        console.warn('[JinnLog API] reminderMarkNotified: endpoint non ancora implementato');
        return Promise.resolve({ taskId, notified: true });
    },

    // ========================================
    // Database Export/Import
    // Endpoint: /api/db
    // ========================================

    /**
     * Exports database as file.
     */
    exportDatabase: async (format = 'db', includeAssets = false) => {
        const baseUrl = await getApiUrl();
        const response = await fetch(
            `${baseUrl}/db/export?format=${format}&includeAssets=${includeAssets}`,
            {
                headers: CURRENT_USER_ID ? { 'X-User-Id': CURRENT_USER_ID } : {},
            }
        );

        if (!response.ok) {
            throw new ApiError('Errore export database', response.status);
        }

        return response.blob();
    },

    /**
     * Imports database from file.
     */
    importDatabase: async (file) => {
        const baseUrl = await getApiUrl();
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${baseUrl}/db/import`, {
            method: 'POST',
            body: formData,
            headers: CURRENT_USER_ID ? { 'X-User-Id': CURRENT_USER_ID } : {},
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || 'Errore import database',
                response.status,
                errorData
            );
        }

        return response.json();
    },

    /**
     * Database status.
     */
    databaseStatus: () => apiRequest('/db/status'),

    // ========================================
    // Electron IPC Fallback (desktop only)
    // ========================================

    /**
     * Export JSON with native dialog.
     */
    exportJsonDialog: () => {
        if (window.jinn?.exportJsonDialog) {
            return window.jinn.exportJsonDialog();
        }
        throw new Error('Funzione disponibile solo in Electron');
    },

    /**
     * Export CSV with native dialog.
     */
    exportCsvDialog: (projectId) => {
        if (window.jinn?.exportCsvDialog) {
            return window.jinn.exportCsvDialog(projectId);
        }
        throw new Error('Funzione disponibile solo in Electron');
    },

    /**
     * Import JSON with native dialog.
     */
    importJsonDialog: () => {
        if (window.jinn?.importJsonDialog) {
            return window.jinn.importJsonDialog();
        }
        throw new Error('Funzione disponibile solo in Electron');
    },

    /**
     * Gets local data path.
     */
    getLocalDataPath: () => {
        if (window.jinn?.getLocalDataPath) {
            return window.jinn.getLocalDataPath();
        }
        return null;
    },

    // ========================================
    // Utilities
    // ========================================

    /**
     * Checks if running in Electron.
     */
    isElectron: () => {
        return typeof window !== 'undefined' && window.jinn !== undefined;
    },

    /**
     * API Error Class.
     */
    ApiError,
};

// ========================================
// Auto-init when module is loaded
// ========================================

// Initialize automatically
initializeApi().catch(console.error);

export default jinn;