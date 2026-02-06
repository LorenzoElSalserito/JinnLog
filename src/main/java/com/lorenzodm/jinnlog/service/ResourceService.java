package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.response.ResourceAllocationResponse;

import java.time.LocalDate;

public interface ResourceService {
    ResourceAllocationResponse getResourceAllocation(String projectId, LocalDate startDate, LocalDate endDate);
}
