package com.lorenzodm.jinnlog.api.dto.response;

public record EffortDeviationResponse(
        String taskId,
        String taskTitle,
        Integer estimatedMinutes,
        int actualMinutes,
        int deviationMinutes,
        double deviationPercentage
) {}
