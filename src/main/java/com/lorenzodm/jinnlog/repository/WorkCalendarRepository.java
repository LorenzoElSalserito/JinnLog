package com.lorenzodm.jinnlog.repository;

import com.lorenzodm.jinnlog.core.entity.WorkCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkCalendarRepository extends JpaRepository<WorkCalendar, String> {

    Optional<WorkCalendar> findByName(String name);

    boolean existsByName(String name);
}
