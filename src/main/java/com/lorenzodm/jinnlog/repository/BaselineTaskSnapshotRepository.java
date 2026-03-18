package com.lorenzodm.jinnlog.repository;

import com.lorenzodm.jinnlog.core.entity.BaselineTaskSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaselineTaskSnapshotRepository extends JpaRepository<BaselineTaskSnapshot, String> {

    List<BaselineTaskSnapshot> findByBaselineId(String baselineId);

    Optional<BaselineTaskSnapshot> findByBaselineIdAndTaskId(String baselineId, String taskId);
}
