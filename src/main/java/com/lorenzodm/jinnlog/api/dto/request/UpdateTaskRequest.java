package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Request per aggiornamento Task (v0.5.0)
 *
 * Nuovi campi:
 * - markdownNotes: Note in formato Markdown
 * - tagIds: Lista ID tag da associare
 * - reminderDate: Data/ora reminder
 * - reminderEnabled: Abilita/disabilita reminder
 * - estimatedMinutes: Stima tempo
 * - actualMinutes: Tempo effettivo
 * - type: Tipo task (MEETING, CALL, etc.)
 * - scheduledStart/End: Date schedulate
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @version 0.5.0
 */
public record UpdateTaskRequest(
        @Size(max = 500) String title,
        @Size(max = 5000) String description,
        @Size(max = 20) String status,
        @Size(max = 20) String priority,
        LocalDate deadline,
        @Size(max = 200) String owner,
        @Size(max = 2000) String notes, // Legacy
        String markdownNotes, // Nuovo in v0.2.0
        Boolean archived,
        Integer sortOrder,
        String assignedToId,

        // Reminder (nuovo in v0.2.0)
        LocalDateTime reminderDate,
        Boolean reminderEnabled,

        // Time Tracking (v0.4.0)
        Integer estimatedMinutes,
        Integer actualMinutes,

        // Asset legacy (mantenuti per compatibilità)
        @Size(max = 500) String assetPath,
        @Size(max = 100) String assetFileName,
        @Size(max = 50) String assetMimeType,
        Long assetSizeBytes,

        // Nuovo in v0.2.0
        List<String> tagIds, // Lista ID tag da associare al task

        // Nuovo in v0.5.0
        String type,
        LocalDateTime scheduledStart,
        LocalDateTime scheduledEnd
) {}
