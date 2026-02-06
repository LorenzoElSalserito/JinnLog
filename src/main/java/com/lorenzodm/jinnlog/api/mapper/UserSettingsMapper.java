package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.UserSettingsResponse;
import com.lorenzodm.jinnlog.core.entity.UserSettings;
import org.springframework.stereotype.Component;

/**
 * Mapper per UserSettings entity
 *
 * @author Lorenzo DM
 * @since 0.2.0
 */
@Component
public class UserSettingsMapper {

    public UserSettingsResponse toResponse(UserSettings settings) {
        if (settings == null) return null;

        return new UserSettingsResponse(
                settings.getUserId(),
                settings.getTheme(),
                settings.getLanguage(),
                settings.isNotificationsEnabled(),
                settings.getFocusTimerDefaultMinutes(),
                settings.isAutoBackupEnabled(),
                settings.getLastBackupAt(),
                settings.getCreatedAt(),
                settings.getUpdatedAt()
        );
    }
}
