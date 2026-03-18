package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.NoteLinkResponse;
import com.lorenzodm.jinnlog.core.entity.NoteLink;
import org.springframework.stereotype.Component;

@Component
public class NoteLinkMapper {

    public NoteLinkResponse toResponse(NoteLink link) {
        if (link == null) return null;
        return new NoteLinkResponse(
                link.getId(),
                link.getNote().getId(),
                link.getLinkedEntityType().name(),
                link.getLinkedEntityId(),
                link.getCreatedAt()
        );
    }
}
