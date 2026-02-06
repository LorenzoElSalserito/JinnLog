package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO per Task (v0.5.0)
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @version 0.5.0
 */
public record TaskResponse(
        String id,
        String title,
        String description,
        String status,
        String priority,
        LocalDate deadline,
        String owner,
        String notes,
        String markdownNotes,
        boolean archived,
        int sortOrder,
        Instant createdAt,
        Instant updatedAt,
        Instant lastSyncedAt,
        String syncStatus,
        String projectId,
        String assignedToId,
        LocalDateTime reminderDate,
        boolean reminderEnabled,
        boolean notificationSent,
        Integer estimatedMinutes,
        Integer actualMinutes,
        String assetPath,
        String assetFileName,
        String assetMimeType,
        Long assetSizeBytes,
        List<TagResponse> tags,
        List<AssetResponse> assets,
        List<TaskChecklistItemResponse> checklistItems,
        Long totalFocusTimeMs,
        Boolean isOverdue,
        
        // Nuovo in v0.5.0
        String type,
        LocalDateTime scheduledStart,
        LocalDateTime scheduledEnd,
        Boolean isBlocked,
        List<String> blockerIds // Lista ID dei task che bloccano questo
) {}
