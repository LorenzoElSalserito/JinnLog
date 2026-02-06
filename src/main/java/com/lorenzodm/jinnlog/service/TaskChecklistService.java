package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateTaskChecklistItemRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateTaskChecklistItemRequest;
import com.lorenzodm.jinnlog.api.dto.response.TaskChecklistItemResponse;

import java.util.List;

public interface TaskChecklistService {
    List<TaskChecklistItemResponse> listItems(String userId, String projectId, String taskId);
    TaskChecklistItemResponse createItem(String userId, String projectId, String taskId, CreateTaskChecklistItemRequest request);
    TaskChecklistItemResponse updateItem(String userId, String projectId, String taskId, String itemId, UpdateTaskChecklistItemRequest request);
    void deleteItem(String userId, String projectId, String taskId, String itemId);
    void reorderItems(String userId, String projectId, String taskId, List<String> orderedItemIds);
}
