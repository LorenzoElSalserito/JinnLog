package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.MergePolicyResponse;
import com.lorenzodm.jinnlog.core.entity.MergePolicy;
import org.springframework.stereotype.Component;

@Component
public class MergePolicyMapper {

    public MergePolicyResponse toResponse(MergePolicy mp) {
        if (mp == null) return null;
        return new MergePolicyResponse(
                mp.getId(),
                mp.getEntityType(),
                mp.getPolicy() != null ? mp.getPolicy().name() : null,
                mp.getDescription(),
                mp.isAutoResolvable(),
                mp.getFieldScope(),
                mp.getCreatedAt(),
                mp.getUpdatedAt()
        );
    }
}
