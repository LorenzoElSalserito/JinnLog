package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateBaselineRequest;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.Baseline;
import com.lorenzodm.jinnlog.core.entity.BaselineTaskSnapshot;
import com.lorenzodm.jinnlog.core.entity.Project;
import com.lorenzodm.jinnlog.core.entity.Task;
import com.lorenzodm.jinnlog.repository.BaselineRepository;
import com.lorenzodm.jinnlog.repository.ProjectRepository;
import com.lorenzodm.jinnlog.repository.TaskRepository;
import com.lorenzodm.jinnlog.service.BaselineService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BaselineServiceImpl implements BaselineService {

    private final BaselineRepository baselineRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public BaselineServiceImpl(BaselineRepository baselineRepository,
                               ProjectRepository projectRepository,
                               TaskRepository taskRepository) {
        this.baselineRepository = baselineRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    /**
     * PRD-11-FR-001: Create immutable baseline snapshot.
     * PRD-11-BR-001: Baselines MUST NOT be modifiable (entity has no update method).
     */
    @Override
    public Baseline create(String userId, String projectId, CreateBaselineRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Progetto non trovato"));

        Baseline baseline = new Baseline();
        baseline.setProject(project);
        baseline.setName(req.name());
        baseline.setSnapshotDate(LocalDateTime.now());
        baseline = baselineRepository.save(baseline);

        // Snapshot all tasks with their current planning data
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        for (Task task : tasks) {
            BaselineTaskSnapshot snapshot = new BaselineTaskSnapshot();
            snapshot.setBaseline(baseline);
            snapshot.setTask(task);
            snapshot.setPlannedStart(task.getPlannedStart());
            snapshot.setPlannedFinish(task.getPlannedFinish());
            snapshot.setEstimatedEffort(task.getEstimatedEffort());
            baseline.getTaskSnapshots().add(snapshot);
        }

        return baselineRepository.save(baseline);
    }

    @Override
    @Transactional(readOnly = true)
    public Baseline getById(String userId, String projectId, String baselineId) {
        return baselineRepository.findById(baselineId)
                .filter(b -> b.getProject().getId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Baseline non trovata"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Baseline> listByProject(String userId, String projectId) {
        return baselineRepository.findByProjectIdOrderBySnapshotDateDesc(projectId);
    }

    @Override
    public void delete(String userId, String projectId, String baselineId) {
        Baseline baseline = getById(userId, projectId, baselineId);
        baselineRepository.delete(baseline);
    }
}
