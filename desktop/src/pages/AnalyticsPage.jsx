import React, { useState, useEffect } from 'react';
import { jinn } from '../api/jinn';
import FocusHeatmapWidget from '../components/FocusHeatmapWidget';
import EstimatesWidget from '../components/EstimatesWidget';
import { useTranslation } from 'react-i18next';

const AnalyticsPage = () => {
    const { t } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await jinn.projectsList({ archived: false });
            setProjects(data);
        } catch (err) {
            console.error('Errore caricamento progetti:', err);
            setError(t("Unable to load projects"));
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = (e) => {
        setSelectedProjectId(e.target.value);
    };

    if (loading) {
        return (
            <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t("Loading")}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">{t("Analytics Hub")}</h2>
                    <p className="text-muted mb-0">{t("Productivity and estimate accuracy analysis")}</p>
                </div>
                
                <div className="d-flex gap-2">
                    <select 
                        className="form-select" 
                        value={selectedProjectId} 
                        onChange={handleProjectChange}
                        style={{ minWidth: '250px' }}
                    >
                        <option value="">{t("All projects")}</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="row g-4">
                {/* Row 1: Focus Heatmap (Full Width) */}
                <div className="col-12">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-transparent border-0 pt-3 pb-0">
                            <h5 className="card-title mb-0">{t("Focus Heatmap")}</h5>
                        </div>
                        <div className="card-body">
                            <FocusHeatmapWidget projectId={selectedProjectId} range={365} />
                        </div>
                    </div>
                </div>

                {/* Row 2: Estimates & Health (2 Columns) */}
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-transparent border-0 pt-3 pb-0">
                            <h5 className="card-title mb-0">{t("Estimate Accuracy")}</h5>
                        </div>
                        <div className="card-body">
                            <EstimatesWidget projectId={selectedProjectId} />
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-transparent border-0 pt-3 pb-0">
                            <h5 className="card-title mb-0">{t("Project Health")}</h5>
                        </div>
                        <div className="card-body d-flex align-items-center justify-content-center text-muted">
                            {/* Placeholder per Health Widget (futuro) */}
                            <div className="text-center py-5">
                                <i className="bi bi-heart-pulse fs-1 mb-2 d-block"></i>
                                <p>{t("Health analysis coming soon...")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
