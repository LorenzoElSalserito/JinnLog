package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;

public record AuditEventResponse(
        String id,
        String entityType,
        String entityId,
        String action,
        String userId,
        Instant eventTimestamp,
        String details
) {}
