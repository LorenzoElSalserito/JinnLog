package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.DependencyResponse;
import com.lorenzodm.jinnlog.core.entity.Dependency;
import org.springframework.stereotype.Component;

@Component
public class DependencyMapper {

    public DependencyResponse toResponse(Dependency dependency) {
        if (dependency == null) return null;
        return new DependencyResponse(
                dependency.getId(),
                dependency.getPredecessor().getId(),
                dependency.getPredecessor().getTitle(),
                dependency.getSuccessor().getId(),
                dependency.getSuccessor().getTitle(),
                dependency.getType().name(),
                dependency.getLag(),
                dependency.getLead(),
                dependency.getCreatedAt()
        );
    }
}
