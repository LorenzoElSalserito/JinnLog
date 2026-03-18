package com.lorenzodm.jinnlog.repository;

import com.lorenzodm.jinnlog.core.entity.ImportExportJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportExportJobRepository extends JpaRepository<ImportExportJob, String> {

    List<ImportExportJob> findByUserIdOrderByCreatedAtDesc(String userId);

    List<ImportExportJob> findByUserIdAndProjectIdOrderByCreatedAtDesc(String userId, String projectId);

    List<ImportExportJob> findByStatusOrderByCreatedAtDesc(ImportExportJob.JobStatus status);
}
