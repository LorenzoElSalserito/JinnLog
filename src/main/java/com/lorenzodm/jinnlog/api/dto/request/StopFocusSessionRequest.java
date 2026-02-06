package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.Size;

public record StopFocusSessionRequest(
        @Size(max = 2000) String notes
) {}
