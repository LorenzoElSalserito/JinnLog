package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.request.AddMemberRequest;
import com.lorenzodm.jinnlog.api.dto.request.CreateGhostUserRequest;
import com.lorenzodm.jinnlog.api.dto.response.ProjectMemberResponse;
import com.lorenzodm.jinnlog.api.dto.response.UserResponse;
import com.lorenzodm.jinnlog.api.mapper.UserMapper;
import com.lorenzodm.jinnlog.core.entity.ProjectMember;
import com.lorenzodm.jinnlog.core.entity.User;
import com.lorenzodm.jinnlog.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/{userId}/projects/{projectId}/members")
public class ProjectMemberController {

    private final ProjectService projectService;
    private final UserMapper userMapper;

    public ProjectMemberController(ProjectService projectService, UserMapper userMapper) {
        this.projectService = projectService;
        this.userMapper = userMapper;
    }

    @GetMapping
    public ResponseEntity<List<ProjectMemberResponse>> listMembers(
            @PathVariable String userId,
            @PathVariable String projectId) {
        List<ProjectMember> members = projectService.getMembers(userId, projectId);
        List<ProjectMemberResponse> response = members.stream()
                .map(m -> new ProjectMemberResponse(
                        userMapper.toResponseLight(m.getUser()),
                        m.getRole().name(),
                        m.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ProjectMemberResponse> addMember(
            @PathVariable String userId,
            @PathVariable String projectId,
            @Valid @RequestBody AddMemberRequest req) {
        ProjectMember member = projectService.addMember(userId, projectId, req.userId(), ProjectMember.Role.valueOf(req.role()));
        return ResponseEntity.ok(new ProjectMemberResponse(
                userMapper.toResponseLight(member.getUser()),
                member.getRole().name(),
                member.getCreatedAt()
        ));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable String userId,
            @PathVariable String projectId,
            @PathVariable String memberId) {
        projectService.removeMember(userId, projectId, memberId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ghosts")
    public ResponseEntity<UserResponse> createGhost(
            @PathVariable String userId,
            @PathVariable String projectId,
            @Valid @RequestBody CreateGhostUserRequest req) {
        // Usa il nuovo metodo che crea E aggiunge al progetto
        User ghost = projectService.createGhostUserAndAddToProject(userId, projectId, req.username(), req.displayName());
        return ResponseEntity.ok(userMapper.toResponseLight(ghost));
    }
}
