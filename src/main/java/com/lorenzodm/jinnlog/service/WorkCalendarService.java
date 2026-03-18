package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.AddCalendarExceptionRequest;
import com.lorenzodm.jinnlog.api.dto.request.AddWorkDayRuleRequest;
import com.lorenzodm.jinnlog.api.dto.request.CreateWorkCalendarRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateWorkCalendarRequest;
import com.lorenzodm.jinnlog.core.entity.CalendarException;
import com.lorenzodm.jinnlog.core.entity.WorkCalendar;
import com.lorenzodm.jinnlog.core.entity.WorkDayRule;

import java.util.List;

public interface WorkCalendarService {

    WorkCalendar create(CreateWorkCalendarRequest req);

    WorkCalendar getById(String calendarId);

    List<WorkCalendar> listAll();

    WorkCalendar update(String calendarId, UpdateWorkCalendarRequest req);

    void delete(String calendarId);

    WorkDayRule addWorkDayRule(String calendarId, AddWorkDayRuleRequest req);

    void removeWorkDayRule(String calendarId, String ruleId);

    CalendarException addException(String calendarId, AddCalendarExceptionRequest req);

    void removeException(String calendarId, String exceptionId);

    WorkCalendar getDefaultCalendar();
}
