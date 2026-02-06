package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.exception.BadRequestException;
import com.lorenzodm.jinnlog.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Locale;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    @Value("${jinnlog.assets.storage-path}")
    private String storagePath;

    @Value("${jinnlog.assets.allowed-extensions}")
    private String allowedExtensionsCsv;

    @Value("${jinnlog.assets.max-file-size:-1}")
    private long maxFileSize;

    @Override
    public StoredFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File vuoto o mancante");
        }

        if (maxFileSize > 0 && file.getSize() > maxFileSize) {
            throw new BadRequestException("File troppo grande: " + file.getSize() + " bytes");
        }

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.bin";
        String cleaned = sanitizeFileName(original);
        String ext = getExtension(cleaned);

        if (!isAllowedExtension(ext)) {
            throw new BadRequestException("Estensione non consentita: " + ext);
        }

        try {
            Path root = Paths.get(storagePath);
            Files.createDirectories(root);

            String id = UUID.randomUUID().toString();
            String targetName = id + "-" + cleaned;
            Path target = root.resolve(targetName);

            // Copia file
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            // Checksum SHA-256
            String checksum = sha256(target);

            // path relativo (coerente con Asset.filePath)
            String relative = "assets/" + targetName;

            return new StoredFile(
                    relative,
                    cleaned,
                    file.getContentType(),
                    file.getSize(),
                    checksum,
                    target
            );

        } catch (Exception e) {
            throw new IllegalStateException("Errore salvataggio file su disco", e);
        }
    }

    private boolean isAllowedExtension(String ext) {
        if (ext.isBlank()) return false;
        String[] allowed = allowedExtensionsCsv.split(",");
        return Arrays.stream(allowed)
                .map(s -> s.trim().toLowerCase(Locale.ROOT))
                .anyMatch(a -> a.equals(ext.toLowerCase(Locale.ROOT)));
    }

    private String sanitizeFileName(String name) {
        String cleaned = StringUtils.cleanPath(name);
        cleaned = cleaned.replace("\\", "_").replace("/", "_");
        if (cleaned.length() > 200) {
            cleaned = cleaned.substring(cleaned.length() - 200);
        }
        return cleaned;
    }

    private String getExtension(String fileName) {
        int idx = fileName.lastIndexOf('.');
        if (idx < 0 || idx == fileName.length() - 1) return "";
        return fileName.substring(idx + 1).toLowerCase(Locale.ROOT);
    }

    private String sha256(Path file) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        try (InputStream is = Files.newInputStream(file, StandardOpenOption.READ)) {
            byte[] buf = new byte[8192];
            int r;
            while ((r = is.read(buf)) > 0) {
                md.update(buf, 0, r);
            }
        }
        byte[] digest = md.digest();
        StringBuilder sb = new StringBuilder(digest.length * 2);
        for (byte b : digest) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
