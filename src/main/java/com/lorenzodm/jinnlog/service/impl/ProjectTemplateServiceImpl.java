package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateProjectTemplateRequest;
import com.lorenzodm.jinnlog.api.exception.ConflictException;
import com.lorenzodm.jinnlog.api.exception.OwnershipViolationException;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.ProjectTemplate;
import com.lorenzodm.jinnlog.repository.ProjectTemplateRepository;
import com.lorenzodm.jinnlog.service.ProjectTemplateService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * PRD-16: ProjectTemplate CRUD and gallery management.
 * PRD-16-BR-001: templates are not live projects.
 * PRD-16-BR-005: system templates are versionable.
 * PRD-16-FR-006: scope-based separation (SYSTEM / WORKSPACE / USER).
 */
@Service
@Transactional
public class ProjectTemplateServiceImpl implements ProjectTemplateService {

    private final ProjectTemplateRepository templateRepository;

    public ProjectTemplateServiceImpl(ProjectTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectTemplate> listAll() {
        return templateRepository.findByTemplateScopeInOrderByTemplateScopeAscNameAsc(
                List.of(ProjectTemplate.TemplateScope.SYSTEM,
                        ProjectTemplate.TemplateScope.WORKSPACE,
                        ProjectTemplate.TemplateScope.USER));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectTemplate> listSystemTemplates() {
        return templateRepository.findByTemplateScopeOrderByNameAsc(ProjectTemplate.TemplateScope.SYSTEM);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectTemplate getById(String templateId) {
        return templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template non trovato: " + templateId));
    }

    @Override
    public ProjectTemplate create(CreateProjectTemplateRequest req) {
        if (templateRepository.existsByName(req.name())) {
            throw new ConflictException("Template con questo nome già esistente");
        }

        ProjectTemplate t = new ProjectTemplate();
        t.setName(req.name());
        t.setDescription(req.description());
        t.setCategory(req.category());
        t.setUseCases(req.useCases());
        t.setPrerequisites(req.prerequisites());
        t.setRequiresPlanningEngine(req.requiresPlanningEngine());
        t.setTemplateScope(ProjectTemplate.TemplateScope.USER);
        t.setVersion("1.0");
        t.setStructureJson(req.structureJson() != null ? req.structureJson() : "{}");

        return templateRepository.save(t);
    }

    @Override
    public ProjectTemplate clone(String templateId, String newName) {
        ProjectTemplate source = getById(templateId);

        if (templateRepository.existsByName(newName)) {
            throw new ConflictException("Template con nome '" + newName + "' già esistente");
        }

        ProjectTemplate copy = new ProjectTemplate();
        copy.setName(newName);
        copy.setDescription(source.getDescription());
        copy.setCategory(source.getCategory());
        copy.setUseCases(source.getUseCases());
        copy.setPrerequisites(source.getPrerequisites());
        copy.setRequiresPlanningEngine(source.isRequiresPlanningEngine());
        copy.setTemplateScope(ProjectTemplate.TemplateScope.USER); // clone is always USER-scoped
        copy.setVersion("1.0");
        copy.setStructureJson(source.getStructureJson());

        return templateRepository.save(copy);
    }

    @Override
    public void delete(String templateId) {
        ProjectTemplate t = getById(templateId);
        // PRD-16-BR-001: system templates cannot be deleted via the API
        if (t.getTemplateScope() == ProjectTemplate.TemplateScope.SYSTEM) {
            throw new OwnershipViolationException("I template di sistema non possono essere eliminati");
        }
        templateRepository.delete(t);
    }
}
