package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateAssetRequest(
        @Size(max = 500) String description,
        Boolean deleted
) {}
