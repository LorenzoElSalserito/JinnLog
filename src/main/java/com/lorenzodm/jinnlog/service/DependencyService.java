package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateDependencyRequest;
import com.lorenzodm.jinnlog.core.entity.Dependency;

import java.util.List;

public interface DependencyService {

    Dependency create(String userId, String projectId, CreateDependencyRequest req);

    List<Dependency> listByProject(String userId, String projectId);

    List<Dependency> listByTask(String userId, String projectId, String taskId);

    void delete(String userId, String projectId, String dependencyId);
}
