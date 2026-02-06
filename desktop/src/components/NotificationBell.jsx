import React, { useState, useEffect, useRef } from 'react';
import { jinn } from '../api/jinn';
import { toast } from 'react-toastify';

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Polling per il conteggio
    useEffect(() => {
        const fetchCount = async () => {
            try {
                if (jinn.hasCurrentUser()) {
                    const count = await jinn.notificationsCount();
                    setUnreadCount(count);
                }
            } catch (e) {
                console.error("Errore fetch notifiche:", e);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 30000); // 30 secondi

        return () => clearInterval(interval);
    }, []);

    // Chiudi dropdown se clicco fuori
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = async () => {
        if (!isOpen) {
            setIsOpen(true);
            loadNotifications();
        } else {
            setIsOpen(false);
        }
    };

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const list = await jinn.notificationsUnread();
            setNotifications(list);
        } catch (e) {
            console.error("Errore caricamento lista notifiche:", e);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await jinn.notificationsMarkRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            toast.error("Errore aggiornamento notifica");
        }
    };

    const markAllRead = async () => {
        try {
            await jinn.notificationsMarkAllRead();
            setNotifications([]);
            setUnreadCount(0);
            setIsOpen(false);
            toast.success("Tutte le notifiche segnate come lette");
        } catch (e) {
            toast.error("Errore aggiornamento notifiche");
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'NEW_NOTE':
                return <i className="bi bi-chat-square-text text-primary fs-5"></i>;
            case 'CONNECTION_REQUEST':
                return <i className="bi bi-person-plus text-warning fs-5"></i>;
            case 'CONNECTION_ACCEPTED':
                return <i className="bi bi-check-circle text-success fs-5"></i>;
            default:
                return <i className="bi bi-info-circle text-secondary fs-5"></i>;
        }
    };

    const getNotificationTitle = (type) => {
        switch (type) {
            case 'NEW_NOTE':
                return 'Nuovo commento';
            case 'CONNECTION_REQUEST':
                return 'Richiesta di connessione';
            case 'CONNECTION_ACCEPTED':
                return 'Connessione accettata';
            default:
                return 'Notifica';
        }
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button 
                className="btn btn-link text-dark position-relative p-2" 
                onClick={toggleDropdown}
                title="Notifiche"
            >
                <i className="bi bi-bell fs-5"></i>
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="card shadow position-absolute end-0 mt-2" style={{ width: '320px', zIndex: 1050, maxHeight: '400px', overflow: 'hidden' }}>
                    <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
                        <h6 className="mb-0 fw-bold small">Notifiche</h6>
                        {notifications.length > 0 && (
                            <button className="btn btn-link btn-sm p-0 text-decoration-none small" onClick={markAllRead}>
                                Segna tutte lette
                            </button>
                        )}
                    </div>
                    <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '350px' }}>
                        {loading ? (
                            <div className="p-3 text-center text-muted small">Caricamento...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-3 text-center text-muted small">Nessuna nuova notifica</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="list-group-item list-group-item-action p-3">
                                    <div className="d-flex w-100 justify-content-between mb-1 align-items-center">
                                        <div className="d-flex align-items-center gap-2">
                                            {getNotificationIcon(n.type)}
                                            <small className="fw-bold">{getNotificationTitle(n.type)}</small>
                                        </div>
                                        <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                            {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </small>
                                    </div>
                                    <p className="mb-1 small text-break ps-4">{n.message}</p>
                                    <div className="mt-2 text-end">
                                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" style={{fontSize: '0.7rem'}} onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}>
                                            Segna letta
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
