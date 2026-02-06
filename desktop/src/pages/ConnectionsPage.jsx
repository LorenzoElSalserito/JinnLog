import React, { useState, useEffect } from 'react';
import { jinn } from '../api/jinn';
import { toast } from 'react-toastify';

export default function ConnectionsPage({ shell }) {
    const [friends, setFriends] = useState([]);
    const [pendingIncoming, setPendingIncoming] = useState([]);
    const [pendingOutgoing, setPendingOutgoing] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        shell?.setTitle?.("JinnLoggers");
        shell?.setRightPanel?.(
            <div className="d-flex flex-column gap-3">
                <div className="fw-bold">Le tue Connessioni</div>
                <p className="small text-muted">
                    Qui puoi gestire la tua rete di contatti JinnLog.
                    Aggiungi amici per collaborare facilmente sui progetti.
                </p>
                <div className="alert alert-info small">
                    <i className="bi bi-lightbulb me-2"></i>
                    Solo i JinnLoggers connessi possono essere aggiunti ai tuoi team come utenti reali.
                </div>
            </div>
        );
        loadData();
    }, [shell]);

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
            toast.error("Errore caricamento dati");
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
            toast.error("Errore ricerca");
        }
    };

    const sendRequest = async (targetId) => {
        try {
            await jinn.connectionsRequest(targetId);
            toast.success("Richiesta inviata");
            setSearchResults(prev => prev.filter(u => u.id !== targetId));
            loadData();
        } catch (e) {
            toast.error("Errore invio richiesta");
        }
    };

    const acceptRequest = async (connectionId) => {
        try {
            await jinn.connectionsAccept(connectionId);
            toast.success("Richiesta accettata");
            loadData();
        } catch (e) {
            toast.error("Errore accettazione");
        }
    };

    const rejectRequest = async (connectionId) => {
        try {
            await jinn.connectionsReject(connectionId);
            toast.info("Richiesta rifiutata");
            loadData();
        } catch (e) {
            toast.error("Errore rifiuto");
        }
    };

    const removeFriend = async (friendId) => {
        if (!confirm("Rimuovere questo utente dagli amici?")) return;
        try {
            await jinn.connectionsRemove(friendId);
            toast.success("Amico rimosso");
            loadData();
        } catch (e) {
            toast.error("Errore rimozione");
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
                                Richieste in Arrivo ({pendingIncoming.length})
                            </div>
                            <ul className="list-group list-group-flush">
                                {pendingIncoming.map(req => (
                                    <li key={req.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold">{req.user.displayName || req.user.username}</div>
                                            <small className="text-muted">@{req.user.username}</small>
                                        </div>
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-success" onClick={() => acceptRequest(req.id)}>Accetta</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => rejectRequest(req.id)}>Rifiuta</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Lista Amici */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-white fw-bold">
                            I tuoi JinnLoggers ({friends.length})
                        </div>
                        {friends.length === 0 ? (
                            <div className="p-4 text-center text-muted">
                                Non hai ancora connessioni. Cerca utenti per aggiungerli!
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
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeFriend(friend.id)} title="Rimuovi">
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
                            Cerca JinnLoggers
                        </div>
                        <div className="card-body">
                            <div className="input-group mb-3">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Username o email..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button className="btn btn-primary" onClick={handleSearch}>Cerca</button>
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
                                                Connetti
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {pendingOutgoing.length > 0 && (
                                <div className="mt-4">
                                    <h6 className="small text-muted text-uppercase fw-bold mb-2">Richieste Inviate</h6>
                                    <ul className="list-group list-group-flush small">
                                        {pendingOutgoing.map(req => (
                                            <li key={req.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                <span className="text-muted">A: {req.user.displayName || req.user.username}</span>
                                                <span className="badge bg-light text-dark border">In attesa</span>
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
