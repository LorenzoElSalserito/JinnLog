package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;

public record ProjectTemplateResponse(
        String id,
        String name,
        String description,
        String category,
        String useCases,
        String prerequisites,
        String version,
        boolean requiresPlanningEngine,
        String templateScope,   // SYSTEM | WORKSPACE | USER
        String structureJson,
        Instant createdAt,
        Instant updatedAt
) {}
