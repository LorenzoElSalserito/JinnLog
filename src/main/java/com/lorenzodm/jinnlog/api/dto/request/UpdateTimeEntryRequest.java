package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UpdateTimeEntryRequest(
        LocalDateTime entryDate,
        @Min(value = 1, message = "Durata deve essere almeno 1 minuto")
        Integer durationMinutes,
        @Size(max = 500)
        String description
) {}
