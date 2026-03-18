package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;

public record CalendarFeedTokenResponse(
        String id,
        String userId,
        String token,
        String includedEntityTypes,
        String description,
        Instant lastAccessedAt,
        Instant createdAt,
        Instant updatedAt,
        /** Convenience: the full public ICS URL. */
        String feedUrl
) {}
