import { useEffect, useRef, useState } from "react";
import { jinn } from "../api/jinn.js";

function formatMs(ms) {
    const total = Math.floor(ms / 1000);
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
}

export default function FocusTimer({ selectedTask }) {
    const [running, setRunning] = useState(null);
    const [elapsed, setElapsed] = useState(0);

    const tickRef = useRef(null);

    async function loadRunning() {
        const r = await jinn.focusRunning();
        setRunning(r);

        if (r) setElapsed(Date.now() - r.startedAt);
        else setElapsed(0);
    }

    useEffect(() => {
        loadRunning();
    }, []);

    useEffect(() => {
        if (tickRef.current) clearInterval(tickRef.current);

        if (running) {
            tickRef.current = setInterval(() => {
                setElapsed(Date.now() - running.startedAt);
            }, 500);
        }

        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
        };
    }, [running]);

    async function start() {
        if (!selectedTask) return;
        const res = await jinn.focusStart(selectedTask.id);
        if (res.ok) await loadRunning();
        else alert(res.error);
    }

    async function stop() {
        const res = await jinn.focusStop();
        if (res.ok) await loadRunning();
        else alert(res.error);
    }

    const isThisTaskRunning =
        running && selectedTask && running.taskId === selectedTask.id;

    return (
        <div className="card bg-black text-light border-secondary">
            <div className="card-header border-secondary">Focus Timer</div>

            <div className="card-body d-flex flex-column gap-3">
                <div>
                    <div className="text-secondary small mb-1">Task selezionato</div>
                    <div className="fw-bold">{selectedTask ? selectedTask.title : "â€”"}</div>
                </div>

                <div className="display-6">{formatMs(elapsed)}</div>

                <div className="d-flex gap-2">
                    <button className="btn btn-success" disabled={!selectedTask || running} onClick={start}>
                        Start
                    </button>

                    <button className="btn btn-danger" disabled={!running} onClick={stop}>
                        Stop
                    </button>
                </div>

                {running && (
                    <div className="text-secondary small">
                        Timer attivo su:{" "}
                        <span className={isThisTaskRunning ? "text-light" : "text-warning"}>
              {running.taskId}
            </span>
                    </div>
                )}

                <div className="text-secondary small">MVP: timer semplice + salvataggio sessioni</div>
            </div>
        </div>
    );
}
