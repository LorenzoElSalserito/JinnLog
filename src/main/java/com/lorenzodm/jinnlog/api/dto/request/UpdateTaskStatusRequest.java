package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTaskStatusRequest(
        @NotBlank @Size(max = 20) String status
) {}
