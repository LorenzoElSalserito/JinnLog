package com.lorenzodm.jinnlog.api.dto.response;

public record TaskDeviationResponse(
        String taskId,
        String taskTitle,
        String projectId,
        String projectName,
        Integer estimatedMinutes,
        Integer actualMinutes,
        Double deviationPercentage
) {}
