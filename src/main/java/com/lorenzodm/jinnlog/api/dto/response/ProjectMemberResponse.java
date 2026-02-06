package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;

public record ProjectMemberResponse(
        UserResponse user,
        String role,
        Instant joinedAt
) {}
