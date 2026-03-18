package com.lorenzodm.jinnlog.repository;

import com.lorenzodm.jinnlog.core.entity.SuccessMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuccessMetricRepository extends JpaRepository<SuccessMetric, String> {

    List<SuccessMetric> findByOkrId(String okrId);
}
