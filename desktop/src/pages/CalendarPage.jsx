import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, setMonth, setYear } from "date-fns";
import { it, enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { jinn } from "../api/jinn.js";
import { toast } from "react-toastify";
import PortalModal from "../components/PortalModal.jsx";
import { useTranslation } from 'react-i18next';

/**
 * CalendarPage - Vista calendario per task e deadline
 *
 * Features:
 * - Visualizzazione task con deadline su calendario
 * - Vista mese/settimana/giorno
 * - Navigazione mese/anno con selettori dropdown
 * - Click su evento per dettagli
 * - Click su slot vuoto per creare evento (PRD-03)
 * - Localizzazione italiana
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.4.0 - Aggiunta creazione evento da calendario (PRD-03)
 */

// ========================================
// Configurazione Localizer date-fns
// ========================================

const locales = {
    "it": it,
    "en": enUS
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunedì
    getDay,
    locales,
});

// ========================================
// Create Event Modal - CORRETTO: senza doppio wrapping
// ========================================

function CreateEventModal({ date, onClose, onCreate }) {
    const { t, i18n } = useTranslation();
    const [title, setTitle] = useState("");
    const [type, setType] = useState("TASK_BLOCK"); // MEETING, CALL, APPOINTMENT, TASK_BLOCK

    const handleSubmit = () => {
        if (!title.trim()) return;
        onCreate({ title, type, date });
    };

    return (
        <PortalModal onClick={onClose}>
            <div className="modal-header">
                <h5 className="modal-title">{t("New Event")}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
                <div className="mb-3">
                    <label className="form-label">{t("Date")}</label>
                    <input
                        type="text"
                        className="form-control"
                        value={format(date, "dd MMMM yyyy", { locale: locales[i18n.language] || locales.en })}
                        disabled
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">{t("Title")}</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">{t("Type")}</label>
                    <select
                        className="form-select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="TASK_BLOCK">Task Block</option>
                        <option value="MEETING">Meeting</option>
                        <option value="CALL">Call</option>
                        <option value="APPOINTMENT">{t("Appointment")}</option>
                    </select>
                </div>
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>{t("Cancel")}</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={!title.trim()}>{t("Create")}</button>
            </div>
        </PortalModal>
    );
}

// ========================================
// CalendarPage Component
// ========================================

export default function CalendarPage({ shell }) {
    const { t, i18n } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState("month");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedDateForCreate, setSelectedDateForCreate] = useState(null);

    // Messaggi localizzati per il calendario
    const messages = useMemo(() => ({
        allDay: t("All Day"),
        previous: t("Back"),
        next: t("Next"),
        today: t("Today"),
        month: t("Month"),
        week: t("Week"),
        day: t("Day"),
        agenda: t("Agenda"),
        date: t("Date"),
        time: t("Time"),
        event: t("Event"),
        noEventsInRange: t("No events in this range"),
        showMore: (total) => `+ ${total} ${t("more")}`,
    }), [t]);

    // Nomi mesi localizzati
    const MONTHS = useMemo(() => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            months.push(format(new Date(2023, i, 1), 'MMMM', { locale: locales[i18n.language] || locales.en }));
        }
        return months;
    }, [i18n.language]);

    // Genera array di anni (10 anni prima e dopo l'anno corrente)
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const yearsArray = [];
        for (let y = currentYear - 10; y <= currentYear + 10; y++) {
            yearsArray.push(y);
        }
        return yearsArray;
    }, []);

    // Handler per cambio mese
    const handleMonthChange = useCallback((e) => {
        const newMonth = parseInt(e.target.value, 10);
        setCurrentDate(prev => setMonth(prev, newMonth));
    }, []);

    // Handler per cambio anno
    const handleYearChange = useCallback((e) => {
        const newYear = parseInt(e.target.value, 10);
        setCurrentDate(prev => setYear(prev, newYear));
    }, []);

    // Setup shell
    useEffect(() => {
        shell?.setTitle?.(t("Calendar"));
        shell?.setHeaderActions?.(
            <div className="d-flex gap-2 align-items-center flex-wrap">
                {/* Selettore Mese */}
                <select
                    className="form-select form-select-sm"
                    style={{ width: "auto", minWidth: 120 }}
                    value={currentDate.getMonth()}
                    onChange={handleMonthChange}
                >
                    {MONTHS.map((month, idx) => (
                        <option key={idx} value={idx}>{month}</option>
                    ))}
                </select>

                {/* Selettore Anno */}
                <select
                    className="form-select form-select-sm"
                    style={{ width: "auto", minWidth: 90 }}
                    value={currentDate.getFullYear()}
                    onChange={handleYearChange}
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                {/* Separatore */}
                <div className="vr d-none d-md-block"></div>

                {/* Bottone Oggi */}
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setCurrentDate(new Date())}
                    title={t("Go to today")}
                >
                    <i className="bi bi-calendar-date me-1"></i>
                    {t("Today")}
                </button>

                {/* Bottone Refresh */}
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={loadTasks}
                    title={t("Refresh")}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>
        );
    }, [shell, currentDate, handleMonthChange, handleYearChange, years, t, MONTHS]);

    // Aggiorna right panel quando cambia selezione
    useEffect(() => {
        shell?.setRightPanel?.(
            <div className="d-flex flex-column gap-3">
                <div className="fw-bold">{t("Task Calendar")}</div>
                <div className="jl-muted small">
                    {t("View tasks with deadlines on the calendar. Click on a day to create a new event.")}
                </div>

                {selectedEvent && (
                    <div className="p-3 border rounded-3 bg-white">
                        <div className="fw-bold mb-2">{selectedEvent.title}</div>
                        <div className="small text-muted mb-2">
                            <i className="bi bi-calendar3 me-1"></i>
                            {format(selectedEvent.start, "dd MMMM yyyy", { locale: locales[i18n.language] || locales.en })}
                        </div>
                        <div className="d-flex gap-2">
                            <span className={`badge ${
                                selectedEvent.resource?.status === 'DONE' ? 'bg-success' :
                                    selectedEvent.resource?.status === 'DOING' ? 'bg-primary' : 'bg-secondary'
                            }`}>
                                {selectedEvent.resource?.status || 'TODO'}
                            </span>
                            <span className={`badge ${
                                selectedEvent.resource?.priority === 'HIGH' ? 'bg-danger' :
                                    selectedEvent.resource?.priority === 'MED' ? 'bg-warning text-dark' : 'bg-secondary'
                            }`}>
                                {selectedEvent.resource?.priority || 'MED'}
                            </span>
                        </div>
                    </div>
                )}

                <div className="p-2 border rounded-3 bg-white">
                    <div className="small fw-bold mb-2">{t("Statistics")}</div>
                    <div className="small text-muted">
                        <div>{t("Tasks with deadline")}: {tasks.filter(t => t.deadline).length}</div>
                        <div>{t("This month")}: {tasks.filter(t => {
                            if (!t.deadline) return false;
                            const d = new Date(t.deadline);
                            return d.getMonth() === currentDate.getMonth() &&
                                d.getFullYear() === currentDate.getFullYear();
                        }).length}</div>
                        <div>{t("Overdue")}: {tasks.filter(t => {
                            if (!t.deadline || t.status === 'DONE') return false;
                            return new Date(t.deadline) < new Date();
                        }).length}</div>
                    </div>
                </div>
            </div>
        );
    }, [shell, selectedEvent, tasks, currentDate, t, i18n.language]);

    // Carica task
    const loadTasks = useCallback(async () => {
        if (!shell?.currentProject) {
            setTasks([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const tasksList = await jinn.tasksList(shell.currentProject.id);
            setTasks(tasksList || []);
        } catch (e) {
            console.error("[CalendarPage] Errore caricamento:", e);
            toast.error(t("Error loading tasks") + ": " + e.message);
        } finally {
            setLoading(false);
        }
    }, [shell?.currentProject, t]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Converti task in eventi calendario
    const events = useMemo(() => {
        return tasks
            .filter((task) => task.deadline && !task.archived)
            .map((task) => {
                const deadline = new Date(task.deadline);
                const isOverdue = deadline < new Date() && task.status !== "DONE";

                return {
                    id: task.id,
                    title: task.title,
                    start: deadline,
                    end: deadline,
                    allDay: true,
                    resource: task,
                    isOverdue,
                };
            });
    }, [tasks]);

    // Stile eventi
    const eventStyleGetter = useCallback((event) => {
        let backgroundColor = "#6c757d"; // Default gray

        if (event.isOverdue) {
            backgroundColor = "#dc3545"; // Red for overdue
        } else if (event.resource?.status === "DONE") {
            backgroundColor = "#198754"; // Green for done
        } else if (event.resource?.status === "DOING") {
            backgroundColor = "#0d6efd"; // Blue for in progress
        }

        return {
            style: {
                backgroundColor,
                borderRadius: "4px",
                border: "none",
                color: "white",
                fontSize: "0.8rem",
            },
        };
    }, []);

    // Click su evento
    const handleSelectEvent = useCallback((event) => {
        setSelectedEvent(event);
    }, []);

    // Click su slot vuoto
    const handleSelectSlot = useCallback((slotInfo) => {
        setSelectedDateForCreate(slotInfo.start);
        setShowCreateModal(true);
    }, []);

    // Crea evento (Task)
    const handleCreateEvent = async ({ title, type, date }) => {
        if (!shell?.currentProject) return;

        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const newTask = await jinn.tasksCreate(shell.currentProject.id, {
                title: `[${type}] ${title}`,
                status: "TODO",
                priority: "MED",
                deadline: formattedDate
            });

            setTasks(prev => [...prev, newTask]);
            setShowCreateModal(false);
            toast.success(t("Event created"));
        } catch (e) {
            console.error("[CalendarPage] Errore creazione:", e);
            toast.error(t("Error creating event") + ": " + e.message);
        }
    };

    // Render loading
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t("Loading")}</span>
                </div>
            </div>
        );
    }

    // Render no project
    if (!shell?.currentProject) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-folder2-open fs-1 text-muted d-block mb-3"></i>
                <h5 className="text-muted">{t("No project selected")}</h5>
                <p className="text-muted small">
                    {t("Select or create a project to view the calendar.")}
                </p>
            </div>
        );
    }

    return (
        <div className="calendar-page h-100 p-3">
            <div
                className="calendar-container bg-white rounded shadow-sm p-3"
                style={{ height: "calc(100vh - 180px)", minHeight: 500 }}
            >
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    messages={messages}
                    culture={i18n.language}
                    views={["month", "week", "day", "agenda"]}
                    view={currentView}
                    onView={setCurrentView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    popup
                    selectable
                    onSelectSlot={handleSelectSlot}
                />
            </div>

            {showCreateModal && (
                <CreateEventModal
                    date={selectedDateForCreate}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateEvent}
                />
            )}

            <style>{`
                .rbc-calendar {
                    font-family: inherit;
                }
                
                .rbc-header {
                    padding: 8px;
                    font-weight: 600;
                }
                
                .rbc-today {
                    background-color: rgba(13, 110, 253, 0.1);
                }
                
                .rbc-event {
                    padding: 2px 5px;
                }
                
                .rbc-event:focus {
                    outline: none;
                }
                
                .rbc-toolbar button {
                    border-radius: 4px;
                }
                
                .rbc-toolbar button:hover {
                    background-color: #e9ecef;
                }
                
                .rbc-toolbar button.rbc-active {
                    background-color: #0d6efd;
                    color: white;
                }

                .rbc-toolbar-label {
                    font-weight: 600;
                    font-size: 1.1rem;
                }
            `}</style>
        </div>
    );
}
