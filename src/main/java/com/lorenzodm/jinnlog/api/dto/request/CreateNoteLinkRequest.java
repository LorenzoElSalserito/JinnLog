package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNoteLinkRequest(
        @NotBlank(message = "ID nota obbligatorio")
        String noteId,
        @NotNull(message = "Tipo entità obbligatorio")
        String linkedEntityType,
        @NotBlank(message = "ID entità collegata obbligatorio")
        String linkedEntityId
) {}
