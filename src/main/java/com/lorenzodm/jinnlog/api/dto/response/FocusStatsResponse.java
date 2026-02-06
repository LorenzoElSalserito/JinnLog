package com.lorenzodm.jinnlog.api.dto.response;

public record FocusStatsResponse(
        long totalMinutes,
        int sessionsCount,
        String period
) {}
