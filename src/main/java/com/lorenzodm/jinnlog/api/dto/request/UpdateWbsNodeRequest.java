package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateWbsNodeRequest(
        @Size(max = 100) String name,
        String parentId,
        String taskId,
        Integer sortOrder
) {}
