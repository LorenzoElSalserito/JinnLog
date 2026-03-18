package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateWbsNodeRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateWbsNodeRequest;
import com.lorenzodm.jinnlog.core.entity.WbsNode;

import java.util.List;

public interface WbsNodeService {

    WbsNode create(String userId, String projectId, CreateWbsNodeRequest req);

    WbsNode getById(String userId, String projectId, String nodeId);

    List<WbsNode> listRoots(String userId, String projectId);

    List<WbsNode> listAll(String userId, String projectId);

    WbsNode update(String userId, String projectId, String nodeId, UpdateWbsNodeRequest req);

    void delete(String userId, String projectId, String nodeId);

    void regenerateCodes(String projectId);
}
