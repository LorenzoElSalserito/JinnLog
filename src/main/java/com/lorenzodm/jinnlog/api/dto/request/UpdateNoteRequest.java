package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateNoteRequest(
        @Size(max = 200) String title,
        String content,
        List<String> tagIds
) {}
