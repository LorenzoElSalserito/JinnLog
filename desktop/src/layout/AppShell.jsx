import { useEffect, useMemo, useState, useCallback } from "react";
import { jinn } from "../api/jinn.js";
import { useTranslation } from 'react-i18next';

// Layout components
import LeftNav from "./LeftNav.jsx";
import TopHeader from "./TopHeader.jsx";
import ProfileMenu from "./ProfileMenu.jsx";
import CommandPalette from "../components/CommandPalette.jsx";
import NotificationBell from "../components/NotificationBell.jsx";

// Pages
import MenuPage from "../pages/MenuPage.jsx";
import CalendarPage from "../pages/CalendarPage.jsx";
import PlannerPage from "../pages/PlannerPage.jsx";
import KanbanPage from "../pages/KanbanPage.jsx";
import NotesPage from "../pages/NotesPage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import AnalyticsPage from "../pages/AnalyticsPage.jsx";
import TeamPage from "../pages/TeamPage.jsx";
import ResourcePage from "../pages/ResourcePage.jsx";
import ConnectionsPage from "../pages/ConnectionsPage.jsx";

// Assets
import LogoIcon from "../assets/Logo.svg";

/**
 * AppShell - Main Layout Component for JinnLog.
 *
 * Provides the structural skeleton for the authenticated application:
 * - Sidebar Navigation (LeftNav)
 * - Top Header with dynamic title and actions
 * - Collapsible Right Panel for context details
 * - Main Content Area for pages
 * - Global features like Command Palette and Notifications
 *
 * It also manages global state like the current project, theme, and user session.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.initialUser - The currently logged-in user.
 * @param {Function} props.onLogout - Callback function to handle logout.
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.7.0 - Added NotificationBell
 */
export default function AppShell({ initialUser, onLogout }) {
    const { t } = useTranslation();

    // ========================================
    // State - Pages and Navigation
    // ========================================

    const PAGES = useMemo(() => [
        { id: "dashboard", label: t("Dashboard"), icon: "bi-speedometer2", component: Dashboard },
        { id: "menu", label: t("Projects"), icon: "bi-folder2-open", component: MenuPage },
        { id: "team", label: "Team", icon: "bi-people", component: TeamPage },
        { id: "resources", label: t("Resources"), icon: "bi-bar-chart-steps", component: ResourcePage },
        { id: "connections", label: "JinnLoggers", icon: "bi-person-lines-fill", component: ConnectionsPage },
        { id: "calendar", label: t("Calendar"), icon: "bi-calendar3", component: CalendarPage },
        { id: "planner", label: t("Planner"), icon: "bi-card-checklist", component: PlannerPage }, // Uses custom icon for branding
        { id: "kanban", label: t("Kanban"), icon: "bi-kanban", component: KanbanPage },
        { id: "notes", label: t("Notes"), icon: "bi-journal-text", component: NotesPage },
        { id: "analytics", label: "Analytics", icon: "bi-graph-up", component: AnalyticsPage },
        { id: "settings", label: t("Settings"), icon: "bi-gear", component: SettingsPage },
    ], [t]);

    const [activeId, setActiveId] = useState("dashboard");
    const [navContext, setNavContext] = useState(null); // Context for navigation (e.g., taskId for Notes)

    const activePage = useMemo(() => PAGES.find((p) => p.id === activeId) ?? PAGES[0], [PAGES, activeId]);

    // ========================================
    // State - UI Components
    // ========================================

    const [title, setTitle] = useState(activePage.label);
    const [headerActions, setHeaderActions] = useState(null);
    const [rightPanel, setRightPanel] = useState(null);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);

    // ========================================
    // State - Theme
    // ========================================

    const [currentTheme, setCurrentTheme] = useState("dark");

    // ========================================
    // State - Backend Data
    // ========================================

    const [currentUser, setCurrentUser] = useState(initialUser);
    const [currentProject, setCurrentProject] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ========================================
    // State - Profile Menu
    // ========================================

    const [profileItems, setProfileItems] = useState(() => [
        {
            id: "settings",
            label: t("Settings"),
            icon: "bi-gear",
            onClick: () => setActiveId("settings"),
        },
        {
            id: "about",
            label: "Info JinnLog",
            icon: "bi-info-circle",
            onClick: () => {
                alert("JinnLog v0.5.2\nPlanner & Task Manager\nPowered by Java + React + Electron\nhttps://www.lorenzodm.it");
            },
        },
        { type: "sep" },
        {
            id: "openData",
            label: "Apri cartella dati",
            icon: "bi-folder2-open",
            onClick: async () => {
                const path = await jinn.getLocalDataPath();
                if (path) {
                    alert(`Cartella dati: ${path}`);
                } else {
                    alert("Percorso dati non disponibile");
                }
            },
        },
        {
            id: "export",
            label: "Esporta Database",
            icon: "bi-box-arrow-up",
            onClick: async () => {
                try {
                    if (jinn.isElectron()) {
                        await jinn.exportJsonDialog();
                    } else {
                        const blob = await jinn.exportDatabase();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `jinnlog-backup-${new Date().toISOString().split('T')[0]}.zip`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                } catch (e) {
                    console.error('Errore export:', e);
                    alert('Errore durante l\'export: ' + e.message);
                }
            },
        },
        { type: "sep" },
        {
            id: "switchProfile",
            label: "Cambia profilo",
            icon: "bi-person-badge",
            onClick: () => {
                if (onLogout) {
                    if (confirm("Vuoi cambiare profilo? Tornerai alla schermata di selezione.")) {
                        onLogout();
                    }
                }
            },
        },
        {
            id: "logout",
            label: "Esci",
            icon: "bi-box-arrow-right",
            danger: true,
            onClick: () => {
                if (onLogout) {
                    if (confirm("Vuoi uscire? L'autologin verrà disabilitato.")) {
                        onLogout();
                    }
                }
            },
        },
    ]);

    // Update profile items when language changes
    useEffect(() => {
        setProfileItems([
            {
                id: "settings",
                label: t("Settings"),
                icon: "bi-gear",
                onClick: () => setActiveId("settings"),
            },
            {
                id: "about",
                label: "Info JinnLog",
                icon: "bi-info-circle",
                onClick: () => {
                    alert(`JAVA INNOVATIVE LOG\nJinnLog v${__APP_VERSION__}\nPlanner & Task Manager
                            \nPowered by Java + React + Electron\nhttps://www.lorenzodm.it
                            \n© Lorenzo DM 2026 - All Rights Reserved\nDistributed under the LICENSE AGPLv3`);
                },
            },
            { type: "sep" },
            {
                id: "openData",
                label: "Apri cartella dati",
                icon: "bi-folder2-open",
                onClick: async () => {
                    const path = await jinn.getLocalDataPath();
                    if (path) {
                        alert(`Cartella dati: ${path}`);
                    } else {
                        alert("Percorso dati non disponibile");
                    }
                },
            },
            {
                id: "export",
                label: "Esporta Database",
                icon: "bi-box-arrow-up",
                onClick: async () => {
                    try {
                        if (jinn.isElectron()) {
                            await jinn.exportJsonDialog();
                        } else {
                            const blob = await jinn.exportDatabase();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `jinnlog-backup-${new Date().toISOString().split('T')[0]}.zip`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }
                    } catch (e) {
                        console.error('Errore export:', e);
                        alert('Errore durante l\'export: ' + e.message);
                    }
                },
            },
            { type: "sep" },
            {
                id: "switchProfile",
                label: "Cambia profilo",
                icon: "bi-person-badge",
                onClick: () => {
                    if (onLogout) {
                        if (confirm("Vuoi cambiare profilo? Tornerai alla schermata di selezione.")) {
                            onLogout();
                        }
                    }
                },
            },
            {
                id: "logout",
                label: "Esci",
                icon: "bi-box-arrow-right",
                danger: true,
                onClick: () => {
                    if (onLogout) {
                        if (confirm("Vuoi uscire? L'autologin verrà disabilitato.")) {
                            onLogout();
                        }
                    }
                },
            },
        ]);
    }, [t, onLogout]);

    // ========================================
    // Effect - Load theme from settings
    // ========================================

    useEffect(() => {
        async function loadTheme() {
            try {
                const settings = await jinn.settingsGet();
                if (settings?.theme) {
                    setCurrentTheme(settings.theme);
                }
            } catch (e) {
                console.warn("[AppShell] Impossibile caricare tema, uso default:", e.message);
                setCurrentTheme("dark");
            }
        }

        if (currentUser) {
            loadTheme();
        }
    }, [currentUser]);

    // ========================================
    // Effect - Apply theme to DOM
    // ========================================

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.body.setAttribute('data-theme', currentTheme);

        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-bs-theme');
        }
    }, [currentTheme]);

    // ========================================
    // Initialization - Load projects
    // ========================================

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const projectsList = await jinn.projectsList();
                setProjects(projectsList);

                if (projectsList.length > 0) {
                    setCurrentProject(projectsList[0]);
                    jinn.setCurrentProject(projectsList[0].id);
                }

                setLoading(false);
            } catch (e) {
                console.error('[AppShell] Errore caricamento dati:', e);
                setError(e.message);
                setLoading(false);
            }
        }

        if (currentUser) {
            loadData();
        }
    }, [currentUser]);

    // ========================================
    // Shell API exposed to pages
    // ========================================

    const shell = useMemo(() => ({
        // UI Controls
        setTitle,
        setHeaderActions,
        setRightPanel,
        setRightPanelOpen,
        setProfileMenuItems: setProfileItems,
        navigate: (pageId, context = null) => {
            setActiveId(pageId);
            setNavContext(context);
        },
        navContext, // Exposes context to current page
        resetSlots: () => {
            setHeaderActions(null);
            setRightPanel(null);
        },

        // Theme
        currentTheme,
        setTheme: setCurrentTheme,

        // Data
        currentUser,
        currentProject,
        projects,
        setCurrentProject: (project) => {
            setCurrentProject(project);
            jinn.setCurrentProject(project?.id);
        },

        // Actions
        refreshProjects: async () => {
            const projectsList = await jinn.projectsList();
            setProjects(projectsList);
            return projectsList;
        },
        createProject: async (name, description) => {
            const newProject = await jinn.projectsCreate(name, description);
            const projectsList = await jinn.projectsList();
            setProjects(projectsList);
            setCurrentProject(newProject);
            jinn.setCurrentProject(newProject.id);
            return newProject;
        },
        deleteProject: async (projectId) => {
            await jinn.projectsDelete(projectId);
            const remaining = await jinn.projectsList();
            setProjects(remaining);
            if (currentProject?.id === projectId) {
                const newCurrent = remaining.length > 0 ? remaining[0] : null;
                setCurrentProject(newCurrent);
                jinn.setCurrentProject(newCurrent?.id);
            }
        },

        // Logout callback
        logout: onLogout,
    }), [currentUser, currentProject, projects, currentTheme, onLogout, navContext]);

    // ========================================
    // Effect - Update title on page change
    // ========================================

    useEffect(() => {
        setTitle(activePage.label);
        shell.resetSlots();
    }, [activeId, activePage.label, shell]);

    // ========================================
    // Render - Loading State
    // ========================================

    if (loading) {
        return (
            <div className={`jl-root ${currentTheme === 'dark' ? 'dark-theme' : ''}`}>
                <div className="jl-loading d-flex flex-column align-items-center justify-content-center vh-100">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Caricamento...</span>
                    </div>
                    <h5 className="text-muted">Caricamento progetti...</h5>
                    <p className="small text-muted">
                        {currentUser?.displayName || currentUser?.username || "Utente"}
                    </p>
                </div>
            </div>
        );
    }

    // ========================================
    // Render - Error State
    // ========================================

    if (error) {
        return (
            <div className={`jl-root ${currentTheme === 'dark' ? 'dark-theme' : ''}`}>
                <div className="jl-error d-flex flex-column align-items-center justify-content-center vh-100">
                    <div className="alert alert-danger text-center" style={{ maxWidth: 500 }}>
                        <h5 className="alert-heading">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Errore di Caricamento
                        </h5>
                        <p className="mb-2">{error}</p>
                        <hr />
                        <p className="small mb-3">
                            Si è verificato un errore durante il caricamento dei dati.
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button
                                className="btn btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Riprova
                            </button>
                            {onLogout && (
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={onLogout}
                                >
                                    <i className="bi bi-person-badge me-2"></i>
                                    Cambia profilo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // Render - Main App
    // ========================================

    const PageComponent = activePage.component;

    const panelToggleBtn = (
        <button
            className="btn btn-sm btn-light"
            type="button"
            title={rightPanelOpen ? "Nascondi pannello destro" : "Mostra pannello destro"}
            onClick={() => setRightPanelOpen((v) => !v)}
        >
            {rightPanelOpen ? "Panel ▸" : "Panel ◂"}
        </button>
    );

    return (
        <div className={`jl-root ${currentTheme === 'dark' ? 'dark-theme' : ''}`}>
            <div className="jl-appframe">
                <div className="jl-shell">
                    {/* Command Palette */}
                    <CommandPalette shell={shell} />

                    {/* Sidebar Navigation */}
                    <LeftNav
                        items={PAGES}
                        activeId={activeId}
                        onSelect={(id) => {
                            setActiveId(id);
                            setNavContext(null); // Reset context on manual nav
                        }}
                    />

                    {/* Main Content Area */}
                    <main className="jl-main">
                        {/* Top Header */}
                        <TopHeader
                            title={title}
                            actions={
                                <>
                                    {headerActions}
                                    <NotificationBell />
                                    {panelToggleBtn}
                                    <ProfileMenu
                                        initials={currentUser?.displayName?.substring(0, 2)?.toUpperCase() || "JL"}
                                        title={currentUser?.displayName || "Utente"}
                                        subtitle={`@${currentUser?.username || "jinnlog"}`}
                                        items={profileItems}
                                    />
                                </>
                            }
                        />

                        {/* Content Section */}
                        <section className="jl-content">
                            {/* Page Content */}
                            <div className="jl-page">
                                <PageComponent shell={shell} />
                            </div>

                            {/* Right Panel */}
                            <aside className={"jl-rightpanel " + (rightPanelOpen ? "" : "closed")}>
                                {rightPanel ?? (
                                    <div className="d-flex flex-column gap-2">
                                        <div className="fw-bold">JinnLog v{__APP_VERSION__}</div>
                                        <div className="jl-muted small">
                                            Pannello informativo. Le pagine possono personalizzare questo spazio.
                                        </div>

                                        {currentProject && (
                                            <div className="p-2 border rounded-3">
                                                <div className="small fw-bold">Progetto attivo</div>
                                                <div className="text-primary">{currentProject.name}</div>
                                            </div>
                                        )}

                                        {currentUser && (
                                            <div className="p-2 border rounded-3">
                                                <div className="small fw-bold">Utente</div>
                                                <div className="jl-muted small">
                                                    {currentUser.displayName || currentUser.username}
                                                </div>
                                                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                                    @{currentUser.username}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </aside>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
