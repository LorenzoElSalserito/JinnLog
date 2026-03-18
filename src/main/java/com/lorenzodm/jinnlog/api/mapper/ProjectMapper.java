package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.ProjectResponse;
import com.lorenzodm.jinnlog.core.entity.Project;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

/**
 * Mapper Project -> ProjectResponse
 *
 * NOTA: Evita di triggerare lazy loading sui Task per prevenire
 * errori di parsing date SQLite. Il conteggio task viene fatto
 * solo se la collection è già inizializzata.
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.5.0 - Aggiunti campi Team, Visibility, Health
 */
@Component
public class ProjectMapper {

    /**
     * Converte Project entity in ProjectResponse DTO.
     *
     * Il campo tasksCount viene valorizzato solo se la collection
     * tasks è già stata caricata (per evitare lazy loading N+1).
     * Altrimenti viene impostato a 0.
     *
     * Per ottenere il conteggio reale dei task, usare una query
     * dedicata nel repository (es. countByProjectId).
     */
    public ProjectResponse toResponse(Project p) {
        // Evita lazy loading: conta solo se già inizializzato
        int tasksCount = 0;
        if (p.getTasks() != null && Hibernate.isInitialized(p.getTasks())) {
            tasksCount = p.getTasks().size();
        }

        return new ProjectResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getColor(),
                p.getIcon(),
                p.isArchived(),
                p.isFavorite(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                p.getLastSyncedAt(),
                p.getSyncStatus() != null ? p.getSyncStatus().name() : null,
                p.getOwner() != null ? p.getOwner().getId() : null,
                tasksCount,
                p.getVisibility().name(),
                p.getHealth().name(),
                p.getOverdueCount(),
                p.getTeam() != null ? p.getTeam().getId() : null
        );
    }

    /**
     * Versione con conteggio task esplicito.
     * Usare quando si ha già il conteggio da una query separata.
     */
    public ProjectResponse toResponse(Project p, int tasksCount) {
        return new ProjectResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getColor(),
                p.getIcon(),
                p.isArchived(),
                p.isFavorite(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                p.getLastSyncedAt(),
                p.getSyncStatus() != null ? p.getSyncStatus().name() : null,
                p.getOwner() != null ? p.getOwner().getId() : null,
                tasksCount,
                p.getVisibility().name(),
                p.getHealth().name(),
                p.getOverdueCount(),
                p.getTeam() != null ? p.getTeam().getId() : null
        );
    }
}
