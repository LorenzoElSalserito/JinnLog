package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.response.AnalyticsResponse;
import com.lorenzodm.jinnlog.api.dto.response.FocusHeatmapResponse;
import com.lorenzodm.jinnlog.api.dto.response.FocusStatsResponse;

public interface AnalyticsService {
    AnalyticsResponse getEstimatesAnalytics(String userId, String projectId);
    FocusHeatmapResponse getFocusHeatmap(String userId, String projectId, int daysRange);
    FocusStatsResponse getFocusStats(String userId, String period);
}
