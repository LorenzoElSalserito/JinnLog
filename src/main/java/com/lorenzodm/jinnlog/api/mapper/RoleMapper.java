package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.RoleResponse;
import com.lorenzodm.jinnlog.core.entity.Role;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RoleMapper {

    public RoleResponse toResponse(Role role, List<String> permissions) {
        if (role == null) return null;
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                permissions,
                role.getCreatedAt()
        );
    }
}
