package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public record BaselineResponse(
        String id,
        String projectId,
        String name,
        LocalDateTime snapshotDate,
        List<BaselineTaskSnapshotResponse> taskSnapshots,
        Instant createdAt
) {}
