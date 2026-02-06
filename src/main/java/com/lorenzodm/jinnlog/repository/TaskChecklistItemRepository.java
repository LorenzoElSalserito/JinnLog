package com.lorenzodm.jinnlog.repository;

import com.lorenzodm.jinnlog.core.entity.TaskChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskChecklistItemRepository extends JpaRepository<TaskChecklistItem, String> {
    List<TaskChecklistItem> findByTaskIdOrderBySortOrderAsc(String taskId);
}
