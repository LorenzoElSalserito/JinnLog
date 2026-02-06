package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateProjectRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateProjectRequest;
import com.lorenzodm.jinnlog.core.entity.Project;
import com.lorenzodm.jinnlog.core.entity.ProjectMember;
import com.lorenzodm.jinnlog.core.entity.User;

import java.util.List;

public interface ProjectService {
    Project create(String userId, CreateProjectRequest req);
    Project getOwned(String userId, String projectId);
    List<Project> listOwned(String userId, Boolean archived, Boolean favorite, String search);
    Project update(String userId, String projectId, UpdateProjectRequest req);
    Project setArchived(String userId, String projectId, boolean archived);
    void delete(String userId, String projectId);

    // Team features
    ProjectMember addMember(String requesterId, String projectId, String userId, ProjectMember.Role role);
    void removeMember(String requesterId, String projectId, String userId);
    List<ProjectMember> getMembers(String requesterId, String projectId);
    User createGhostUser(String ownerId, String username, String displayName);
    User createGhostUserAndAddToProject(String ownerId, String projectId, String username, String displayName);
}
