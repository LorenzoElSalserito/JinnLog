package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;

public record NoteLinkResponse(
        String id,
        String noteId,
        String linkedEntityType,
        String linkedEntityId,
        Instant createdAt
) {}
