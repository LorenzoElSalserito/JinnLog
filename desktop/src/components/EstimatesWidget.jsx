import React, { useState, useEffect } from 'react';
import { jinn } from '../api/jinn';
import { Bar } from 'react-chartjs-2';

const EstimatesWidget = ({ projectId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await jinn.analyticsEstimates(projectId);
            setData(response);
        } catch (err) {
            console.error('Errore caricamento stime:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-3">Caricamento stime...</div>;
    if (!data || !data.projectAnalytics || data.projectAnalytics.length === 0) return <div className="text-center p-3 text-muted">Nessun dato sulle stime disponibile.</div>;

    // Prepara dati per il grafico
    // Se projectId è selezionato, mostra dettaglio task (top outliers)
    // Se globale, mostra aggregato per progetto
    
    let chartData;
    let options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false }
        }
    };

    if (projectId) {
        // Mostra Top 5 Underestimated (ci ho messo di più)
        const items = data.topUnderestimated ? data.topUnderestimated.slice(0, 5) : [];
        chartData = {
            labels: items.map(t => t.taskTitle.substring(0, 20) + '...'),
            datasets: [
                {
                    label: 'Stimato (min)',
                    data: items.map(t => t.estimatedMinutes),
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                },
                {
                    label: 'Reale (min)',
                    data: items.map(t => t.actualMinutes),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }
            ]
        };
    } else {
        // Mostra aggregato per progetto
        const items = data.projectAnalytics.slice(0, 5);
        chartData = {
            labels: items.map(p => p.projectName),
            datasets: [
                {
                    label: 'Deviazione Media (%)',
                    data: items.map(p => p.deviationPercentage),
                    backgroundColor: items.map(p => p.deviationPercentage > 0 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(75, 192, 192, 0.5)'),
                }
            ]
        };
    }

    const deviation = data.globalDeviation || 0;

    return (
        <div>
            <div className="mb-3 text-center">
                <h3 className={deviation > 0 ? "text-danger" : "text-success"}>
                    {deviation > 0 ? "+" : ""}{deviation.toFixed(1)}%
                </h3>
                <p className="text-muted small">Deviazione media globale</p>
            </div>
            <Bar options={options} data={chartData} />
        </div>
    );
};

export default EstimatesWidget;
