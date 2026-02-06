package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;

/**
 * DTO Response per User
 *
 * @author Lorenzo DM
 * @since 1.0.0
 * @updated 0.3.0 - Aggiunto lastLoginAt per onboarding
 */
public record UserResponse(
        String id,
        String username,
        String email,
        String displayName,
        String avatarPath,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLoginAt,
        Instant lastSyncedAt,
        String syncStatus,
        int projectsCount
) {}