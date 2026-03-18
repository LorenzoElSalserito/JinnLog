package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;

public record TaskPriorityResponse(
        String id,
        String name,
        int level,
        String color,
        Instant createdAt
) {}
