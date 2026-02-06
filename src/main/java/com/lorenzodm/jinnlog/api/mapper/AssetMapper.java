package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.AssetResponse;
import com.lorenzodm.jinnlog.core.entity.Asset;
import org.springframework.stereotype.Component;

@Component
public class AssetMapper {

    public AssetResponse toResponse(Asset a) {
        return new AssetResponse(
                a.getId(),
                a.getFileName(),
                a.getFilePath(),
                a.getMimeType(),
                a.getSizeBytes(),
                a.getChecksum(),
                a.getDescription(),
                a.getThumbnailPath(),
                a.getDeletedAt() != null,
                a.getCreatedAt(),
                a.getLastAccessedAt(),
                a.getLastSyncedAt(),
                a.getSyncStatus(),
                a.getCloudUrl(),
                a.getOwner() != null ? a.getOwner().getId() : null
        );
    }
}
