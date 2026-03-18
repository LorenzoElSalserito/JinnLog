package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateUpdateProjectCharterRequest;
import com.lorenzodm.jinnlog.core.entity.ProjectCharter;

public interface ProjectCharterService {

    ProjectCharter upsert(String userId, String projectId, CreateUpdateProjectCharterRequest req);

    ProjectCharter getByProjectId(String userId, String projectId);
}
