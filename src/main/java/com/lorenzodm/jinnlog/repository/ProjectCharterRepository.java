package com.lorenzodm.jinnlog.repository;

import com.lorenzodm.jinnlog.core.entity.ProjectCharter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectCharterRepository extends JpaRepository<ProjectCharter, String> {

    Optional<ProjectCharter> findByProjectId(String projectId);

    boolean existsByProjectId(String projectId);
}
