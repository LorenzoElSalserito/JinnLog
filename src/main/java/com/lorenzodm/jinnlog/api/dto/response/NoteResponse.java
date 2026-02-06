package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;
import java.util.List;

public record NoteResponse(
        String id,
        String title,
        String content,
        String parentType,
        String parentId,
        String parentTitle,
        UserResponse owner, // Aggiunto owner
        Instant createdAt,
        Instant updatedAt,
        List<TagResponse> tags
) {}
