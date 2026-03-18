package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateRiskRegisterEntryRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateRiskRegisterEntryRequest;
import com.lorenzodm.jinnlog.core.entity.RiskRegisterEntry;

import java.util.List;

public interface RiskRegisterEntryService {

    RiskRegisterEntry create(String userId, String projectId, CreateRiskRegisterEntryRequest req);

    RiskRegisterEntry getById(String userId, String projectId, String entryId);

    List<RiskRegisterEntry> listByProject(String userId, String projectId);

    RiskRegisterEntry update(String userId, String projectId, String entryId, UpdateRiskRegisterEntryRequest req);

    void delete(String userId, String projectId, String entryId);
}
