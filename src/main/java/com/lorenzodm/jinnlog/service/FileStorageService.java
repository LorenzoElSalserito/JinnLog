package com.lorenzodm.jinnlog.service;

import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

public interface FileStorageService {
    StoredFile store(MultipartFile file);

    record StoredFile(
            String relativePath,
            String originalFileName,
            String mimeType,
            long sizeBytes,
            String checksumSha256,
            Path absolutePath
    ) {}
}
