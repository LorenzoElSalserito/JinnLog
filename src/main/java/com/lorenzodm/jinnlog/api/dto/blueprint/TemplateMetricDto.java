package com.lorenzodm.jinnlog.api.dto.blueprint;

public record TemplateMetricDto(
        String name,
        double targetValue,
        String unit
) {}
