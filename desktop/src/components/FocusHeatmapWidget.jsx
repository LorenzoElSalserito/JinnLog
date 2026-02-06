import React, { useState, useEffect } from 'react';
import { jinn } from '../api/jinn';
import { Tooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';

const FocusHeatmapWidget = ({ projectId, range = 365 }) => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [projectId, range]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await jinn.analyticsFocusHeatmap(projectId, range);
            setData(response.data);
        } catch (err) {
            console.error('Errore caricamento heatmap:', err);
        } finally {
            setLoading(false);
        }
    };

    // Helper per generare la griglia (stile GitHub)
    // Semplificazione: mostriamo solo gli ultimi 52 settimane (o meno)
    // Ogni cella è un giorno.
    
    const getColor = (minutes) => {
        if (minutes === 0) return '#ebedf0'; // Grigio chiaro
        if (minutes < 30) return '#9be9a8'; // Verde chiaro
        if (minutes < 60) return '#40c463';
        if (minutes < 120) return '#30a14e';
        return '#216e39'; // Verde scuro
    };

    if (loading) return <div className="text-center p-3">{t("Loading heatmap...")}</div>;

    // Trasforma i dati in una mappa per accesso rapido
    const dataMap = new Map(data.map(d => [d.date, d.totalMinutes]));

    // Genera date per l'ultimo anno
    const today = new Date();
    const dates = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d);
    }

    // Raggruppa per settimane (colonne)
    const weeks = [];
    let currentWeek = [];
    
    // Allinea al giorno della settimana (Domenica start)
    const firstDay = dates[0].getDay();
    for(let i=0; i<firstDay; i++) currentWeek.push(null); // Padding iniziale

    dates.forEach(date => {
        currentWeek.push(date);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return (
        <div className="d-flex flex-column align-items-center w-100 overflow-auto">
            <div className="d-flex gap-1">
                {weeks.map((week, wIndex) => (
                    <div key={wIndex} className="d-flex flex-column gap-1">
                        {week.map((date, dIndex) => {
                            if (!date) return <div key={dIndex} style={{ width: 12, height: 12 }} />;
                            
                            const dateStr = date.toISOString().split('T')[0];
                            const minutes = dataMap.get(dateStr) || 0;
                            
                            return (
                                <div
                                    key={dateStr}
                                    data-tooltip-id="heatmap-tooltip"
                                    data-tooltip-content={`${dateStr}: ${minutes} min`}
                                    style={{
                                        width: 12,
                                        height: 12,
                                        backgroundColor: getColor(minutes),
                                        borderRadius: 2,
                                        cursor: 'pointer'
                                    }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <Tooltip id="heatmap-tooltip" />
            
            <div className="d-flex align-items-center gap-2 mt-2 text-muted small">
                <span>{t("Less")}</span>
                <div style={{width: 10, height: 10, background: '#ebedf0'}}></div>
                <div style={{width: 10, height: 10, background: '#9be9a8'}}></div>
                <div style={{width: 10, height: 10, background: '#40c463'}}></div>
                <div style={{width: 10, height: 10, background: '#30a14e'}}></div>
                <div style={{width: 10, height: 10, background: '#216e39'}}></div>
                <span>{t("More")}</span>
            </div>
        </div>
    );
};

export default FocusHeatmapWidget;
