package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateProjectTemplateRequest;
import com.lorenzodm.jinnlog.core.entity.ProjectTemplate;

import java.util.List;

/**
 * Manages ProjectTemplate lifecycle (PRD-16).
 * PRD-16-BR-001: a template is NOT a live project.
 * PRD-16-FR-006: distinguishes SYSTEM / WORKSPACE / USER scope.
 */
public interface ProjectTemplateService {

    /** Returns all templates visible to the gallery. */
    List<ProjectTemplate> listAll();

    /** Returns only SYSTEM templates (built-in gallery). */
    List<ProjectTemplate> listSystemTemplates();

    ProjectTemplate getById(String templateId);

    /**
     * Creates a USER-scoped template (PRD-16-FR-006).
     * Cannot create SYSTEM templates through the API.
     */
    ProjectTemplate create(CreateProjectTemplateRequest req);

    /**
     * Clones an existing template into a new USER-scoped copy (PRD-16-FR-012).
     * Modifications to the clone do NOT affect the source (PRD-16-AC-006).
     */
    ProjectTemplate clone(String templateId, String newName);

    /**
     * Deletes a USER-scoped template.
     * SYSTEM templates cannot be deleted via the API (PRD-16-BR-001).
     */
    void delete(String templateId);
}
