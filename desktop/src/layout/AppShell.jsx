import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { jinn } from "../api/jinn.js";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import { useModal } from "../hooks/useModal.js";

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
import GanttPage from "../pages/GanttPage.jsx";
import ChartPage from "../pages/ChartPage.jsx";
import TemplatesPage from "../pages/TemplatesPage.jsx";
import IntegrationsPage from "../pages/IntegrationsPage.jsx";
import GuidesPage from "../pages/GuidesPage.jsx"; // Import GuidesPage

// Context
import { WorkflowProvider } from "../context/WorkflowContext.jsx";

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
 * @updated 0.10.0 - Added Integrations Page
 */
export default function AppShell({ initialUser, onLogout }) {
    const { t } = useTranslation();
    const modal = useModal();

    // ========================================
    // State - Pages and Navigation
    // ========================================

    const PAGES = useMemo(() => [
        { id: "dashboard", label: t("Dashboard"), icon: "bi-speedometer2", component: Dashboard },
        { id: "charter", label: t("Charter"), icon: "bi-file-earmark-text", component: ChartPage },
        { id: "menu", label: t("Projects"), icon: "bi-folder2-open", component: MenuPage },
        { id: "templates", label: t("Gallery"), icon: "bi-grid-3x3-gap", component: TemplatesPage },
        { id: "team", label: t("Team"), icon: "bi-people", component: TeamPage },
        { id: "resources", label: t("Resources"), icon: "bi-bar-chart-steps", component: ResourcePage },
        { id: "connections", label: t("JinnLoggers"), icon: "bi-person-lines-fill", component: ConnectionsPage },
        { id: "calendar", label: t("Calendar"), icon: "bi-calendar3", component: CalendarPage },
        { id: "planner", label: t("Planner"), icon: "bi-card-checklist", component: PlannerPage }, 
        { id: "gantt", label: t("Gantt"), icon: "bi-bar-chart-steps", component: GanttPage },
        { id: "kanban", label: t("Kanban"), icon: "bi-kanban", component: KanbanPage },
        { id: "notes", label: t("Notes"), icon: "bi-journal-text", component: NotesPage },
        { id: "guides", label: t("Guides"), icon: "bi-book", component: GuidesPage }, // Added Guides page
        { id: "analytics", label: t("Analytics"), icon: "bi-graph-up", component: AnalyticsPage },
        { id: "integrations", label: t("Integrations"), icon: "bi-plug", component: IntegrationsPage },
        { id: "settings", label: t("Settings"), icon: "bi-gear", component: SettingsPage },
    ], [t]);

    const [activeId, setActiveId] = useState("dashboard");
    const [navContext, setNavContext] = useState(null); // Context for navigation (e.g., taskId for Notes)
    const [navAction, setNavAction] = useState(null); // Action to perform after navigation (e.g., openModal)

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

    const [profileItems, setProfileItems] = useState([]);

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
                label: t("Info JinnLog"),
                icon: "bi-info-circle",
                onClick: async () => {
                    await modal.confirm({
                        title: "JinnLog",
                        message: `JAVA INNOVATIVE LOG\nJinnLog v${__APP_VERSION__}\n${t("Planner & Task Manager")}\n\nPowered by Java + React + Electron\nhttps://www.lorenzodm.it\n\n© Lorenzo DM 2026 - All Rights Reserved\nDistributed under the LICENSE AGPLv3`,
                    });
                },
            },
            { type: "sep" },
            {
                id: "openData",
                label: t("Open Data Folder"),
                icon: "bi-folder2-open",
                onClick: async () => {
                    const path = await jinn.getLocalDataPath();
                    if (path) {
                        toast.info(`${t("Data folder")}: ${path}`);
                    } else {
                        toast.warning(t("Data path not available"));
                    }
                },
            },
            {
                id: "export",
                label: t("Export Database"),
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
                        console.error('Export error:', e);
                        toast.error(t("Export error") + ': ' + e.message);
                    }
                },
            },
            { type: "sep" },
            {
                id: "switchProfile",
                label: t("Change Profile"),
                icon: "bi-person-badge",
                onClick: async () => {
                    if (onLogout) {
                        const confirmed = await modal.confirm({
                            title: t("Change Profile"),
                            message: t("Change profile? You will return to the selection screen.")
                        });
                        if (confirmed) {
                            onLogout();
                        }
                    }
                },
            },
            {
                id: "logout",
                label: t("Exit"),
                icon: "bi-box-arrow-right",
                danger: true,
                onClick: async () => {
                    if (onLogout) {
                        const confirmed = await modal.confirm({
                            title: t("Exit"),
                            message: t("Exit? Autologin will be disabled.")
                        });
                        if (confirmed) {
                            onLogout();
                        }
                    }
                },
            },
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Shell API exposed to pages (stable refs)
    // ========================================

    // Keep stable refs for functions to avoid shell object recreation
    const setTitleRef = useRef(setTitle);
    const setHeaderActionsRef = useRef(setHeaderActions);
    const setRightPanelRef = useRef(setRightPanel);
    const setRightPanelOpenRef = useRef(setRightPanelOpen);
    const setProfileItemsRef = useRef(setProfileItems);

    // Update refs on each render (cheap, no re-render triggered)
    setTitleRef.current = setTitle;
    setHeaderActionsRef.current = setHeaderActions;
    setRightPanelRef.current = setRightPanel;
    setRightPanelOpenRef.current = setRightPanelOpen;
    setProfileItemsRef.current = setProfileItems;

    const navigateFn = useCallback((pageId, context = null, action = null) => {
        setActiveId(pageId);
        setNavContext(context);
        setNavAction(action);
    }, []);

    const clearNavActionFn = useCallback(() => setNavAction(null), []);

    const setCurrentProjectFn = useCallback((project) => {
        setCurrentProject(project);
        jinn.setCurrentProject(project?.id);
    }, []);

    const refreshProjectsFn = useCallback(async () => {
        const projectsList = await jinn.projectsList();
        setProjects(projectsList);
        return projectsList;
    }, []);

    const createProjectFn = useCallback(async (name, description) => {
        const newProject = await jinn.projectsCreate(name, description);
        const projectsList = await jinn.projectsList();
        setProjects(projectsList);
        setCurrentProject(newProject);
        jinn.setCurrentProject(newProject.id);
        return newProject;
    }, []);

    const deleteProjectFn = useCallback(async (projectId) => {
        await jinn.projectsDelete(projectId);
        const remaining = await jinn.projectsList();
        setProjects(remaining);
        setCurrentProject(prev => {
            if (prev?.id === projectId) {
                const newCurrent = remaining.length > 0 ? remaining[0] : null;
                jinn.setCurrentProject(newCurrent?.id);
                return newCurrent;
            }
            return prev;
        });
    }, []);

    const shell = useMemo(() => ({
        // UI Controls (stable via ref wrappers)
        setTitle: (...args) => setTitleRef.current(...args),
        setHeaderActions: (...args) => setHeaderActionsRef.current(...args),
        setRightPanel: (...args) => setRightPanelRef.current(...args),
        setRightPanelOpen: (...args) => setRightPanelOpenRef.current(...args),
        setProfileMenuItems: (...args) => setProfileItemsRef.current(...args),
        navigate: navigateFn,
        clearNavAction: clearNavActionFn,

        // Reactive data (these change, triggering shell recreation only when needed)
        navContext,
        navAction,
        currentTheme,
        setTheme: setCurrentTheme,
        currentUser,
        currentProject,
        projects,

        // Stable action callbacks
        setCurrentProject: setCurrentProjectFn,
        refreshProjects: refreshProjectsFn,
        createProject: createProjectFn,
        deleteProject: deleteProjectFn,
        logout: onLogout,
    }), [currentUser, currentProject, projects, currentTheme, onLogout, navContext, navAction,
         navigateFn, clearNavActionFn, setCurrentProjectFn, refreshProjectsFn, createProjectFn, deleteProjectFn]);

    // ========================================
    // Effect - Reset slots on page change ONLY
    // ========================================

    useEffect(() => {
        setTitle(activePage.label);
        setRightPanel(null);
    }, [activeId, activePage.label]);

    // ========================================
    // Render - Loading State
    // ========================================

    if (loading) {
        return (
            <div className={`jl-root ${currentTheme === 'dark' ? 'dark-theme' : ''}`}>
                <div className="jl-loading d-flex flex-column align-items-center justify-content-center vh-100">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">{t("Loading...")}</span>
                    </div>
                    <h5 className="text-muted">{t("Loading projects...")}</h5>
                    <p className="small text-muted">
                        {currentUser?.displayName || currentUser?.username || t("User")}
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
                            {t("Loading Error")}
                        </h5>
                        <p className="mb-2">{error}</p>
                        <hr />
                        <p className="small mb-3">
                            {t("An error occurred while loading data.")}
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button
                                className="btn btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                {t("Retry")}
                            </button>
                            {onLogout && (
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={onLogout}
                                >
                                    <i className="bi bi-person-badge me-2"></i>
                                    {t("Change Profile")}
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
            title={rightPanelOpen ? t("Hide right panel") : t("Show right panel")}
            onClick={() => setRightPanelOpen((v) => !v)}
        >
            {rightPanelOpen ? `${t("Panel")} ▸` : `${t("Panel")} ◂`}
        </button>
    );

    return (
        <WorkflowProvider>
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
                            setNavAction(null); // Reset action on manual nav
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
                                        title={currentUser?.displayName || t("User")}
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
                                            {t("Info panel. Pages can customize this space.")}
                                        </div>

                                        {currentProject && (
                                            <div className="p-2 border rounded-3">
                                                <div className="small fw-bold">{t("Active Project")}</div>
                                                <div className="text-primary">{currentProject.name}</div>
                                            </div>
                                        )}

                                        {currentUser && (
                                            <div className="p-2 border rounded-3">
                                                <div className="small fw-bold">{t("User")}</div>
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
        </WorkflowProvider>
    );
}