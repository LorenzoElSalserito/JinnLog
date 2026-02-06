package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.TagResponse;
import com.lorenzodm.jinnlog.core.entity.Tag;
import org.springframework.stereotype.Component;

/**
 * Mapper per Tag entity
 *
 * @author Lorenzo DM
 * @since 0.2.0
 */
@Component
public class TagMapper {

    public TagResponse toResponse(Tag tag) {
        if (tag == null) return null;

        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getColor(),
                tag.getCreatedAt(),
                tag.getOwner().getId(),
                tag.getTasks() != null ? tag.getTasks().size() : 0
        );
    }

    /**
     * Versione lightweight senza contare i task (per performance)
     */
    public TagResponse toResponseLight(Tag tag) {
        if (tag == null) return null;

        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getColor(),
                tag.getCreatedAt(),
                tag.getOwner().getId(),
                null // Non carichiamo task count per performance
        );
    }
}
