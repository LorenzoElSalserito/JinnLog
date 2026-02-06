import React, { useState, useEffect } from 'react';
import { jinn } from '../api/jinn';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export default function ConnectionsPage({ shell }) {
    const { t } = useTranslation();
    const [friends, setFriends] = useState([]);
    const [pendingIncoming, setPendingIncoming] = useState([]);
    const [pendingOutgoing, setPendingOutgoing] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        shell?.setTitle?.(t("JinnLoggers"));
        shell?.setRightPanel?.(
            <div className="d-flex flex-column gap-3">
                <div className="fw-bold">{t("Your Connections")}</div>
                <p className="small text-muted">
                    {t("Manage your JinnLog network here...")}
                </p>
                <div className="alert alert-info small">
                    <i className="bi bi-lightbulb me-2"></i>
                    {t("Only connected JinnLoggers can be added...")}
                </div>
            </div>
        );
        loadData();
    }, [shell, t]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Fetch parallelo usando le API di jinn.js che puntano agli endpoint corretti (/api/connections)
            const [friendsList, incoming, outgoing] = await Promise.all([
                jinn.connectionsList(),
                jinn.connectionsPendingIncoming(),
                jinn.connectionsPendingOutgoing()
            ]);

            setFriends(friendsList);
            setPendingIncoming(incoming);
            setPendingOutgoing(outgoing);
        } catch (e) {
            console.error("Errore caricamento connessioni:", e);
            toast.error(t("Error loading"));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery || searchQuery.length < 2) return;
        try {
            const results = await jinn.usersSearch(searchQuery);
            // Filtra se stesso e chi è già amico/pending
            const currentUserId = jinn.getCurrentUser();
            const friendIds = new Set(friends.map(f => f.id));
            const pendingIds = new Set([
                ...pendingIncoming.map(p => p.user.id),
                ...pendingOutgoing.map(p => p.user.id)
            ]);
            
            setSearchResults(results.filter(u => 
                u.id !== currentUserId && 
                !friendIds.has(u.id) && 
                !pendingIds.has(u.id)
            ));
        } catch (e) {
            toast.error(t("Error"));
        }
    };

    const sendRequest = async (targetId) => {
        try {
            await jinn.connectionsRequest(targetId);
            toast.success(t("Success"));
            setSearchResults(prev => prev.filter(u => u.id !== targetId));
            loadData();
        } catch (e) {
            toast.error(t("Error"));
        }
    };

    const acceptRequest = async (connectionId) => {
        try {
            await jinn.connectionsAccept(connectionId);
            toast.success(t("Success"));
            loadData();
        } catch (e) {
            toast.error(t("Error"));
        }
    };

    const rejectRequest = async (connectionId) => {
        try {
            await jinn.connectionsReject(connectionId);
            toast.info(t("Rejected"));
            loadData();
        } catch (e) {
            toast.error(t("Error"));
        }
    };

    const removeFriend = async (friendId) => {
        if (!confirm(t("Are you sure you want to delete"))) return;
        try {
            await jinn.connectionsRemove(friendId);
            toast.success(t("Deleted successfully"));
            loadData();
        } catch (e) {
            toast.error(t("Deletion error"));
        }
    };

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid p-4 fade-in">
            <div className="row g-4">
                {/* Colonna Sinistra: Lista Amici e Richieste */}
                <div className="col-md-7">
                    {/* Richieste in Arrivo */}
                    {pendingIncoming.length > 0 && (
                        <div className="card mb-4 border-primary">
                            <div className="card-header bg-primary-subtle text-primary fw-bold">
                                {t("Incoming Requests")} ({pendingIncoming.length})
                            </div>
                            <ul className="list-group list-group-flush">
                                {pendingIncoming.map(req => (
                                    <li key={req.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold">{req.user.displayName || req.user.username}</div>
                                            <small className="text-muted">@{req.user.username}</small>
                                        </div>
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-success" onClick={() => acceptRequest(req.id)}>{t("Accept")}</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => rejectRequest(req.id)}>{t("Reject")}</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Lista Amici */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-white fw-bold">
                            {t("Your JinnLoggers")} ({friends.length})
                        </div>
                        {friends.length === 0 ? (
                            <div className="p-4 text-center text-muted">
                                {t("No connections yet...")}
                            </div>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {friends.map(friend => (
                                    <li key={friend.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{width: 40, height: 40, borderRadius: '50%'}}>
                                                {(friend.displayName || friend.username).substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-bold">{friend.displayName || friend.username}</div>
                                                <small className="text-muted">@{friend.username}</small>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeFriend(friend.id)} title={t("Remove")}>
                                            <i className="bi bi-person-x"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Colonna Destra: Cerca e Aggiungi */}
                <div className="col-md-5">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white fw-bold">
                            {t("Search JinnLoggers")}
                        </div>
                        <div className="card-body">
                            <div className="input-group mb-3">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder={t("Username or email...")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button className="btn btn-primary" onClick={handleSearch}>{t("Search")}</button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="list-group">
                                    {searchResults.map(user => (
                                        <div key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold">{user.displayName || user.username}</div>
                                                <small className="text-muted">@{user.username}</small>
                                            </div>
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => sendRequest(user.id)}>
                                                <i className="bi bi-person-plus me-1"></i>
                                                {t("Connect")}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {pendingOutgoing.length > 0 && (
                                <div className="mt-4">
                                    <h6 className="small text-muted text-uppercase fw-bold mb-2">{t("Sent Requests")}</h6>
                                    <ul className="list-group list-group-flush small">
                                        {pendingOutgoing.map(req => (
                                            <li key={req.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                <span className="text-muted">{t("To:")} {req.user.displayName || req.user.username}</span>
                                                <span className="badge bg-light text-dark border">{t("Pending")}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
