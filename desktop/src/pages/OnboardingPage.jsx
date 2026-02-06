import { useState, useEffect } from "react";
import { jinn } from "../api/jinn.js";
import Logo from "../assets/Logo.svg";
import { useTranslation } from 'react-i18next';

/**
 * OnboardingPage - Schermata di profilazione al primo avvio
 *
 * Stati gestiti:
 * - LOADING: Caricamento dati bootstrap
 * - NO_PROFILES: Nessun profilo, mostra form creazione
 * - PROFILES_LIST: Lista profili esistenti + opzione crea nuovo
 * - ERROR: Errore di connessione/rete
 *
 * @author Lorenzo DM
 * @since 0.3.0
 */
export default function OnboardingPage({ onProfileSelected, bootstrapData, onRetry }) {
    const { t, i18n } = useTranslation();
    // ========================================
    // State
    // ========================================

    const [view, setView] = useState("list"); // "list" | "create"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [localUsers, setLocalUsers] = useState(bootstrapData?.users || []);

    // Form creazione profilo
    const [formData, setFormData] = useState({
        username: "",
        displayName: "",
        email: "",
    });
    const [formErrors, setFormErrors] = useState({});

    // Preferenze
    const [autologinEnabled, setAutologinEnabled] = useState(
        bootstrapData?.preferences?.autologinEnabled || false
    );

    // ========================================
    // Computed
    // ========================================

    const hasProfiles = localUsers.length > 0;
    const lastUserId = bootstrapData?.preferences?.lastUserId;

    // ========================================
    // Effects
    // ========================================

    useEffect(() => {
        // Se non ci sono profili, mostra direttamente il form di creazione
        if (!hasProfiles && view !== "create") {
            setView("create");
            // Reset form data per evitare residui
            setFormData({ username: "", displayName: "", email: "" });
        }
    }, [hasProfiles, view]);

    useEffect(() => {
        // Aggiorna localUsers solo se bootstrapData cambia e abbiamo utenti
        // Questo evita di sovrascrivere l'eliminazione locale se il parent non ha ancora ricaricato
        if (bootstrapData?.users && bootstrapData.users.length !== localUsers.length) {
             // Logica opzionale: potremmo voler sincronizzare sempre, ma per ora fidiamoci dell'azione locale
             // setLocalUsers(bootstrapData.users);
        }
    }, [bootstrapData]);

    // ========================================
    // Handlers
    // ========================================

    /**
     * Seleziona un profilo esistente
     */
    const handleSelectProfile = async (userId) => {
        setLoading(true);
        setError(null);

        try {
            // Seleziona profilo nel backend (aggiorna lastLoginAt)
            const user = await jinn.bootstrapSelectProfile(userId);

            // Aggiorna preferenze se autologin è attivo
            if (autologinEnabled) {
                await jinn.bootstrapUpdatePreferences({
                    lastUserId: userId,
                    autologinEnabled: true,
                });
                jinn.setLocalPreferences({ autologinEnabled: true, lastUserId: userId });
            }

            // Notifica il parent
            onProfileSelected(user);
        } catch (e) {
            console.error("[Onboarding] Errore selezione profilo:", e);
            setError(t("Unable to select profile. Please try again."));
            setLoading(false);
        }
    };

    /**
     * Elimina un profilo esistente
     */
    const handleDeleteProfile = async (e, userId, userName) => {
        e.stopPropagation(); // Evita selezione profilo
        
        if (!window.confirm(`${t("Are you sure you want to delete profile")} "${userName}"? ${t("This action cannot be undone.")}`)) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await jinn.bootstrapDeleteProfile(userId);
            
            // Aggiorna lista locale
            const updatedUsers = localUsers.filter(u => u.id !== userId);
            setLocalUsers(updatedUsers);
            
            // Se non ci sono più utenti, vai a create
            if (updatedUsers.length === 0) {
                setFormData({ username: "", displayName: "", email: "" });
                setView("create");
            }
        } catch (e) {
            console.error("[Onboarding] Errore eliminazione profilo:", e);
            setError(t("Unable to delete profile. Please try again."));
            // Ripristina stato in caso di errore
            if (bootstrapData?.users) {
                setLocalUsers(bootstrapData.users);
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Crea un nuovo profilo
     */
    const handleCreateProfile = async (e) => {
        e.preventDefault();

        // Validazione client-side
        const errors = {};
        if (!formData.username.trim()) {
            errors.username = t("Username is required");
        } else if (formData.username.length < 3) {
            errors.username = t("Username must be at least 3 characters");
        }
        if (!formData.displayName.trim()) {
            errors.displayName = t("Display name is required");
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = t("Invalid email");
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setLoading(true);
        setError(null);
        setFormErrors({});

        try {
            // Crea profilo nel backend
            const newUser = await jinn.bootstrapCreateProfile({
                username: formData.username.trim(),
                displayName: formData.displayName.trim(),
                email: formData.email.trim() || null,
            });

            // Seleziona automaticamente il nuovo profilo
            jinn.setCurrentUser(newUser.id);

            // Aggiorna preferenze
            await jinn.bootstrapUpdatePreferences({
                lastUserId: newUser.id,
                autologinEnabled: autologinEnabled,
            });
            jinn.setLocalPreferences({
                autologinEnabled: autologinEnabled,
                lastUserId: newUser.id
            });

            // Notifica il parent
            onProfileSelected(newUser);
        } catch (e) {
            console.error("[Onboarding] Errore creazione profilo:", e);
            if (e.status === 409) {
                setFormErrors({ username: t("Username already exists") });
            } else {
                setError(e.message || t("Unable to create profile. Please try again."));
            }
            setLoading(false);
        }
    };

    /**
     * Toggle autologin preference
     */
    const handleAutologinChange = (e) => {
        setAutologinEnabled(e.target.checked);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        jinn.setLocalPreferences({ language: lng });
    };

    // ========================================
    // Render - Lista Profili
    // ========================================

    const renderProfilesList = () => (
        <div className="onboarding-profiles">
            <h4 className="mb-4">
                <i className="bi bi-person-circle me-2"></i>
                {t("Select a profile")}
            </h4>

            <div className="profiles-grid mb-4">
                {localUsers.map((user) => (
                    <div
                        key={user.id}
                        className={`profile-card ${user.id === lastUserId ? "last-used" : ""}`}
                        onClick={() => handleSelectProfile(user.id)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === "Enter" && handleSelectProfile(user.id)}
                    >
                        <div className="profile-avatar">
                            {user.avatarPath ? (
                                <img src={user.avatarPath} alt={user.displayName} />
                            ) : (
                                <span className="avatar-initials">
                                    {(user.displayName || user.username || "?")
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="profile-info">
                            <div className="profile-name">
                                {user.displayName || user.username}
                            </div>
                            <div className="profile-username text-muted small">
                                @{user.username}
                            </div>
                            {user.id === lastUserId && (
                                <span className="badge bg-primary-subtle text-primary mt-1">
                                    {t("Last used")}
                                </span>
                            )}
                        </div>
                        
                        <div className="profile-actions">
                            <button 
                                className="btn btn-sm btn-link text-danger delete-btn"
                                onClick={(e) => handleDeleteProfile(e, user.id, user.displayName || user.username)}
                                title={t("Delete profile")}
                            >
                                <i className="bi bi-trash"></i>
                            </button>
                            <div className="profile-select-icon">
                                <i className="bi bi-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Opzione crea nuovo */}
            <div className="text-center">
                <button
                    className="btn btn-outline-primary"
                    onClick={() => setView("create")}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    {t("Create new profile")}
                </button>
            </div>

            {/* Checkbox autologin */}
            <div className="form-check mt-4 text-center">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="autologinCheck"
                    checked={autologinEnabled}
                    onChange={handleAutologinChange}
                />
                <label className="form-check-label" htmlFor="autologinCheck">
                    {t("Automatically login with last used profile")}
                </label>
            </div>
        </div>
    );

    // ========================================
    // Render - Form Creazione
    // ========================================

    const renderCreateForm = () => (
        <div className="onboarding-create">
            <h4 className="mb-4">
                <i className="bi bi-person-plus me-2"></i>
                {hasProfiles ? t("Create new profile") : t("Create your profile")}
            </h4>

            {!hasProfiles && (
                <p className="text-muted mb-4">
                    {t("Welcome to JinnLog! To get started, create your user profile.")}
                </p>
            )}

            <form onSubmit={handleCreateProfile}>
                {/* Username */}
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                        {t("Username")} <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className={`form-control ${formErrors.username ? "is-invalid" : ""}`}
                        id="username"
                        placeholder="es. mario.rossi"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={loading}
                        autoFocus
                    />
                    {formErrors.username && (
                        <div className="invalid-feedback">{formErrors.username}</div>
                    )}
                    <div className="form-text">
                        {t("Unique identifier (min. 3 chars)")}
                    </div>
                </div>

                {/* Display Name */}
                <div className="mb-3">
                    <label htmlFor="displayName" className="form-label">
                        {t("Display Name")} <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className={`form-control ${formErrors.displayName ? "is-invalid" : ""}`}
                        id="displayName"
                        placeholder="es. Mario Rossi"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        disabled={loading}
                    />
                    {formErrors.displayName && (
                        <div className="invalid-feedback">{formErrors.displayName}</div>
                    )}
                    <div className="form-text">
                        {t("How you want to be called")}
                    </div>
                </div>

                {/* Email (opzionale) */}
                <div className="mb-4">
                    <label htmlFor="email" className="form-label">
                        {t("Email (optional)")}
                    </label>
                    <input
                        type="email"
                        className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                        id="email"
                        placeholder="es. mario@esempio.it"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={loading}
                    />
                    {formErrors.email && (
                        <div className="invalid-feedback">{formErrors.email}</div>
                    )}
                    <div className="form-text">
                        {t("For future sync/cloud features")}
                    </div>
                </div>

                {/* Checkbox autologin */}
                <div className="form-check mb-4">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="autologinCheckCreate"
                        checked={autologinEnabled}
                        onChange={handleAutologinChange}
                        disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="autologinCheckCreate">
                        {t("Automatically login on next startup")}
                    </label>
                </div>

                {/* Bottoni */}
                <div className="d-flex gap-2">
                    {hasProfiles && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setView("list")}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            {t("Back")}
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn btn-primary flex-grow-1"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                {t("Creating...")}
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-lg me-2"></i>
                                {t("Create profile and start")}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

    // ========================================
    // Render - Main
    // ========================================

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                {/* Language Switcher */}
                <div className="position-absolute top-0 end-0 p-3">
                    <div className="btn-group btn-group-sm" role="group">
                        <button 
                            type="button" 
                            className={`btn ${i18n.language === 'it' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => changeLanguage('it')}
                        >
                            IT
                        </button>
                        <button 
                            type="button" 
                            className={`btn ${i18n.language === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => changeLanguage('en')}
                        >
                            EN
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="onboarding-header text-center mb-4">
                    <div className="onboarding-logo mb-3">
                        <img 
                            src={Logo} 
                            alt="JinnLog Logo" 
                            style={{ 
                                width: "80px", 
                                height: "80px",
                                borderRadius: "16px", // Smussamento angoli
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                            }} 
                        />
                    </div>
                    <h2 className="fw-bold">JinnLog</h2>
                    <p className="text-muted">{t("Planner & Task Manager")}</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-4">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div className="flex-grow-1">{error}</div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setError(null)}
                        >
                            {t("Close")}
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="onboarding-content">
                    {loading && view === "list" ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary mb-3"></div>
                            <p className="text-muted">{t("Processing...")}</p>
                        </div>
                    ) : view === "create" ? (
                        renderCreateForm()
                    ) : (
                        renderProfilesList()
                    )}
                </div>

                {/* Footer */}
                <div className="onboarding-footer text-center mt-4 pt-4 border-top">
                    <small className="text-muted">
                        JinnLog v{bootstrapData?.systemInfo?.version || "0.3.0"} —
                        {t("Mode")}: {bootstrapData?.systemInfo?.mode || "desktop"}
                    </small>
                </div>
            </div>

            {/* Stili inline per questa pagina */}
            <style>{`
                .onboarding-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                    position: relative;
                    z-index: 1; /* Base z-index */
                }
                
                .onboarding-container {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    max-width: 480px;
                    width: 100%;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    position: relative;
                    z-index: 2; /* Container sopra il background */
                }
                
                .profiles-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .profile-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }
                
                .profile-card:hover {
                    border-color: #667eea;
                    background: #f8f9fa;
                }
                
                .profile-card.last-used {
                    border-color: #667eea;
                    background: linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%);
                }
                
                .profile-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .profile-avatar img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }
                
                .avatar-initials {
                    color: white;
                    font-weight: 600;
                    font-size: 16px;
                }
                
                .profile-info {
                    flex-grow: 1;
                    min-width: 0;
                }
                
                .profile-name {
                    font-weight: 600;
                    color: #212529;
                }
                
                .profile-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .delete-btn {
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    padding: 4px 8px;
                }
                
                .profile-card:hover .delete-btn {
                    opacity: 1;
                }
                
                .profile-select-icon {
                    color: #adb5bd;
                    transition: transform 0.2s ease;
                }
                
                .profile-card:hover .profile-select-icon {
                    transform: translateX(4px);
                    color: #667eea;
                }
                
                @media (max-width: 480px) {
                    .onboarding-container {
                        padding: 24px;
                    }
                }
            `}</style>
        </div>
    );
}