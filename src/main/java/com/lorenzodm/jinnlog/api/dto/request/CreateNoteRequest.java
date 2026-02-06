package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateNoteRequest(
        @Size(max = 200) String title,
        @NotBlank String content,
        List<String> tagIds
) {}
