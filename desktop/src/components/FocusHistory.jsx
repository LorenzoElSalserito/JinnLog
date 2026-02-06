import { useEffect, useMemo, useState } from "react";
import { jinn } from "../api/jinn.js";
import { useTranslation } from 'react-i18next';

function formatMs(ms) {
    const total = Math.floor((ms ?? 0) / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
    return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function startOfTodayMs() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

// overlap accurato tra sessione e intervallo [from, to]
function overlapMs(session, fromMs, toMs) {
    const a = session.startedAt ?? 0;
    const b = session.endedAt ?? 0;
    const start = Math.max(a, fromMs);
    const end = Math.min(b, toMs);
    return Math.max(0, end - start);
}

export default function FocusHistory({ selectedTask }) {
    const { t } = useTranslation();
    const [sessionsTask, setSessionsTask] = useState([]);
    const [sessionsAll, setSessionsAll] = useState([]);
    const [running, setRunning] = useState(null);

    async function refresh() {
        const r = await jinn.focusRunning();
        setRunning(r);

        if (!selectedTask) {
            setSessionsTask([]);
            setSessionsAll([]);
            return;
        }

        const listTask = await jinn.focusHistory(selectedTask.id);
        setSessionsTask(Array.isArray(listTask) ? listTask : []);

        const all = await jinn.focusHistoryAll();
        setSessionsAll(Array.isArray(all) ? all : []);
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTask?.id]);

    // refresh â€œsoftâ€ mentre un timer Ã¨ attivo (per vedere aggiornarsi i totali di oggi)
    useEffect(() => {
        let t = null;
        t = setInterval(() => refresh(), 2000);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stats = useMemo(() => {
        const now = Date.now();
        const today0 = startOfTodayMs();

        const taskTotal = sessionsTask.reduce((sum, s) => sum + (s.durationMs ?? 0), 0);

        const taskToday = sessionsTask.reduce(
            (sum, s) => sum + overlapMs(s, today0, now),
            0
        );

        const todayAll = sessionsAll.reduce(
            (sum, s) => sum + overlapMs(s, today0, now),
            0
        );

        return { taskTotal, taskToday, todayAll };
    }, [sessionsTask, sessionsAll]);

    return (
        <div className="card bg-black text-light border-secondary">
            <div className="card-header border-secondary d-flex justify-content-between align-items-center">
                <span>{t("Focus History")}</span>
                <button className="btn btn-sm btn-outline-light" onClick={refresh}>
                    {t("Refresh")}
                </button>
            </div>

            <div className="card-body">
                {!selectedTask ? (
                    <div className="text-secondary small">{t("Select a task to view history.")}</div>
                ) : (
                    <>
                        <div className="mb-3">
                            <div className="text-secondary small mb-1">{t("Task")}</div>
                            <div className="fw-bold text-truncate">{selectedTask.title}</div>
                        </div>

                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <div className="p-2 border border-secondary rounded bg-dark">
                                    <div className="text-secondary small">{t("Task total")}</div>
                                    <div className="fw-bold">{formatMs(stats.taskTotal)}</div>
                                </div>
                            </div>

                            <div className="col-6">
                                <div className="p-2 border border-secondary rounded bg-dark">
                                    <div className="text-secondary small">{t("Task today")}</div>
                                    <div className="fw-bold">{formatMs(stats.taskToday)}</div>
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="p-2 border border-secondary rounded bg-dark">
                                    <div className="text-secondary small">{t("Today total (all tasks)")}</div>
                                    <div className="fw-bold">{formatMs(stats.todayAll)}</div>
                                </div>
                            </div>
                        </div>

                        {running && (
                            <div className="text-secondary small mb-2">
                                {t("Timer active:")} <span className="text-light">{running.taskId}</span>
                            </div>
                        )}

                        <div className="text-secondary small mb-2">
                            {t("Sessions")} ({sessionsTask.length})
                        </div>

                        <div className="border border-secondary rounded p-2 bg-dark" style={{ maxHeight: 260, overflow: "auto" }}>
                            {sessionsTask.length === 0 ? (
                                <div className="text-secondary small">{t("No sessions yet.")}</div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {sessionsTask.map((s) => {
                                        const start = new Date(s.startedAt).toLocaleString();
                                        const end = new Date(s.endedAt).toLocaleString();
                                        return (
                                            <div key={s.id} className="p-2 rounded border border-secondary bg-black">
                                                <div className="d-flex justify-content-between gap-2">
                                                    <div className="text-secondary small text-truncate">{start}</div>
                                                    <div className="fw-bold">{formatMs(s.durationMs)}</div>
                                                </div>
                                                <div className="text-secondary small text-truncate">â†’ {end}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
