package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateTaskChecklistItemRequest(
        @Size(max = 1000) String text,
        Boolean done,
        Integer sortOrder
) {}
