package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.CalendarFeedTokenResponse;
import com.lorenzodm.jinnlog.core.entity.CalendarFeedToken;
import org.springframework.stereotype.Component;

@Component
public class CalendarFeedTokenMapper {

    private static final String ICS_FEED_PATH = "/api/calendar/feed/";

    public CalendarFeedTokenResponse toResponse(CalendarFeedToken cft) {
        if (cft == null) return null;
        String feedUrl = cft.getToken() != null ? ICS_FEED_PATH + cft.getToken() + ".ics" : null;
        return new CalendarFeedTokenResponse(
                cft.getId(),
                cft.getUser() != null ? cft.getUser().getId() : null,
                cft.getToken(),
                cft.getIncludedEntityTypes(),
                cft.getDescription(),
                cft.getLastAccessedAt(),
                cft.getCreatedAt(),
                cft.getUpdatedAt(),
                feedUrl
        );
    }
}
