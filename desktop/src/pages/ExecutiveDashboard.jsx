import React, { useState, useEffect } from 'react';
import jinn from '../api/jinn';
import ProjectCharterWidget from '../components/dashboard/ProjectCharterWidget';
import RisksWidget from '../components/dashboard/RisksWidget';
import DeliverablesWidget from '../components/dashboard/DeliverablesWidget';
import ProjectStatsWidget from '../components/dashboard/ProjectStatsWidget';
import '../styles/Dashboard.css'; // Create CSS for layout

const ExecutiveDashboard = ({ shell }) => {
    const projectId = shell?.currentProject?.id;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(!!projectId);

    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) {
                setProject(null);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await jinn.projectsGet(projectId);
                setProject(data);
            } catch (err) {
                console.error('Failed to load project details', err);
                setProject(null); // Clear project on error
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    const handleProjectSwitch = (e) => {
        const newProjectId = e.target.value;
        const projectToSwitch = newProjectId === "__SELECT__"
            ? null
            : shell?.projects?.find(p => p.id === newProjectId);
        shell?.setCurrentProject?.(projectToSwitch);
    };

    const renderProjectSelector = () => (
        <select
            className="form-select form-select-sm"
            value={projectId || "__SELECT__"}
            onChange={handleProjectSwitch}
            style={{ width: 200 }}
        >
            <option value="__SELECT__">Switch Project...</option>
            {shell?.projects?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>
    );

    const renderHeader = () => (
        <header className="dashboard-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h1>{project ? `${project.name} - Executive Dashboard` : 'Executive Dashboard'}</h1>
                {shell?.projects && renderProjectSelector()}
            </div>
            {project && <p>{project.description}</p>}
        </header>
    );

    if (loading) {
        return (
            <div className="executive-dashboard">
                {renderHeader()}
                <div className="loading-container">Caricamento Dashboard...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="executive-dashboard">
                {renderHeader()}
                <div className="error-container">Seleziona un progetto per visualizzare la dashboard.</div>
            </div>
        );
    }

    return (
        <div className="executive-dashboard">
            {renderHeader()}
            <div className="dashboard-grid">
                <div className="dashboard-row top-row">
                    <ProjectStatsWidget projectId={projectId} />
                    <ProjectCharterWidget projectId={projectId} />
                </div>
                <div className="dashboard-row bottom-row">
                    <RisksWidget projectId={projectId} />
                    <DeliverablesWidget projectId={projectId} />
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
