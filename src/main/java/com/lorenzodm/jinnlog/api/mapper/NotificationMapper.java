package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.NotificationResponse;
import com.lorenzodm.jinnlog.core.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    private final UserMapper userMapper;

    public NotificationMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.getType().name(),
                notification.getReferenceType(),
                notification.getReferenceId(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getSender() != null ? userMapper.toResponseLight(notification.getSender()) : null
        );
    }
}
