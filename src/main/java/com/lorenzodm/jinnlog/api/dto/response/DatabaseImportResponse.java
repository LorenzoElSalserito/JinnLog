package com.lorenzodm.jinnlog.api.dto.response;

public record DatabaseImportResponse(
        boolean accepted,
        boolean appliedOnNextStart,
        String pendingFilePath,
        String message
) {
}
