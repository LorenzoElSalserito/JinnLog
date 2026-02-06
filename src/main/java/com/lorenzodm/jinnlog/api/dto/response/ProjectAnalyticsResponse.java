package com.lorenzodm.jinnlog.api.dto.response;

public record ProjectAnalyticsResponse(
        String projectId,
        String projectName,
        Double deviationPercentage,
        Integer totalTasksWithEstimates,
        Integer totalEstimatedMinutes,
        Integer totalActualMinutes
) {}
