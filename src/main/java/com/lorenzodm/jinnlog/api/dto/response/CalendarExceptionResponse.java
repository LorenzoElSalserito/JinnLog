package com.lorenzodm.jinnlog.api.dto.response;

import java.time.LocalDate;

public record CalendarExceptionResponse(
        String id,
        String calendarId,
        LocalDate date,
        boolean isWorkingDay,
        String description
) {}
