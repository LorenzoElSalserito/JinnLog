package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateUpdateProjectCharterRequest;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.Project;
import com.lorenzodm.jinnlog.core.entity.ProjectCharter;
import com.lorenzodm.jinnlog.repository.ProjectCharterRepository;
import com.lorenzodm.jinnlog.repository.ProjectRepository;
import com.lorenzodm.jinnlog.service.ProjectCharterService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectCharterServiceImpl implements ProjectCharterService {

    private final ProjectCharterRepository charterRepository;
    private final ProjectRepository projectRepository;

    public ProjectCharterServiceImpl(ProjectCharterRepository charterRepository,
                                     ProjectRepository projectRepository) {
        this.charterRepository = charterRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    public ProjectCharter upsert(String userId, String projectId, CreateUpdateProjectCharterRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Progetto non trovato"));

        ProjectCharter charter = charterRepository.findByProjectId(projectId)
                .orElse(new ProjectCharter());

        charter.setProject(project);
        if (req.sponsor() != null) charter.setSponsor(req.sponsor());
        if (req.projectManager() != null) charter.setProjectManager(req.projectManager());
        if (req.objectives() != null) charter.setObjectives(req.objectives());
        if (req.problemStatement() != null) charter.setProblemStatement(req.problemStatement());
        if (req.businessCase() != null) charter.setBusinessCase(req.businessCase());

        return charterRepository.save(charter);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectCharter getByProjectId(String userId, String projectId) {
        return charterRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Charter non trovato per il progetto"));
    }
}
