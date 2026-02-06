package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.response.DatabaseImportResponse;
import com.lorenzodm.jinnlog.api.dto.response.DatabaseStatusResponse;
import com.lorenzodm.jinnlog.config.JinnLogAssetsProperties;
import com.lorenzodm.jinnlog.config.JinnLogDataProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.*;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class DatabaseTransferService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseTransferService.class);

    private static final String SQLITE_HEADER = "SQLite format 3\u0000";

    private final JinnLogDataProperties dataProperties;
    private final JinnLogAssetsProperties assetsProperties;
    private final JdbcTemplate jdbcTemplate;

    public DatabaseTransferService(
            JinnLogDataProperties dataProperties,
            JinnLogAssetsProperties assetsProperties,
            JdbcTemplate jdbcTemplate
    ) {
        this.dataProperties = dataProperties;
        this.assetsProperties = assetsProperties;
        this.jdbcTemplate = jdbcTemplate;
    }

    public Path getDbPath() {
        return Paths.get(dataProperties.getPath()).resolve("jinnlog.db").toAbsolutePath().normalize();
    }

    public Path getConfigDir() {
        return Paths.get(dataProperties.getPath()).resolve("config").toAbsolutePath().normalize();
    }

    public Path getPendingImportDir() {
        return getConfigDir().resolve("db-import").toAbsolutePath().normalize();
    }

    public Path getPendingDbFile() {
        return getPendingImportDir().resolve("pending-jinnlog.db").toAbsolutePath().normalize();
    }

    public Path getPendingMarkerFile() {
        return getPendingImportDir().resolve("pending.marker").toAbsolutePath().normalize();
    }

    public DatabaseStatusResponse status() {
        Path db = getDbPath();
        boolean exists = Files.exists(db);
        long size = 0;
        long lastModified = 0;
        boolean sqlite = false;

        try {
            if (exists) {
                size = Files.size(db);
                lastModified = Files.getLastModifiedTime(db).toMillis();
                sqlite = isSqliteFile(db);
            }
        } catch (IOException e) {
            log.warn("Impossibile leggere status DB: {}", e.getMessage());
        }

        return new DatabaseStatusResponse(
                db.toString(),
                exists,
                size,
                lastModified,
                sqlite
        );
    }

    public ExportedFile exportDbSnapshot() {
        Path db = getDbPath();
        ensureExists(db);

        try {
            jdbcTemplate.execute("PRAGMA wal_checkpoint(FULL)");
        } catch (Exception e) {
            log.debug("PRAGMA wal_checkpoint(FULL) non eseguito (ok in alcuni setup): {}", e.getMessage());
        }

        Path exportsDir = getConfigDir().resolve("exports");
        mkdirs(exportsDir);

        String ts = DateTimeFormatter.ISO_INSTANT.format(Instant.now()).replace(":", "-");
        Path snapshot = exportsDir.resolve("jinnlog-export-" + ts + ".db");

        try {
            Files.copy(db, snapshot, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Errore export snapshot DB", e);
        }

        return new ExportedFile(snapshot, "application/octet-stream", "JinnLog-db-" + ts + ".db");
    }

    public ExportedFile exportZip(boolean includeAssets) {
        Path db = getDbPath();
        ensureExists(db);

        try {
            jdbcTemplate.execute("PRAGMA wal_checkpoint(FULL)");
        } catch (Exception e) {
            log.debug("PRAGMA wal_checkpoint(FULL) non eseguito (ok): {}", e.getMessage());
        }

        Path exportsDir = getConfigDir().resolve("exports");
        mkdirs(exportsDir);

        String ts = DateTimeFormatter.ISO_INSTANT.format(Instant.now()).replace(":", "-");
        Path zipPath = exportsDir.resolve("jinnlog-export-" + ts + ".zip");

        Path assetsDir = Paths.get(assetsProperties.getStoragePath()).toAbsolutePath().normalize();

        try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(zipPath, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING))) {
            addFileToZip(zos, db, "db/jinnlog.db");

            Path wal = Paths.get(db.toString() + "-wal");
            Path shm = Paths.get(db.toString() + "-shm");
            if (Files.exists(wal)) addFileToZip(zos, wal, "db/jinnlog.db-wal");
            if (Files.exists(shm)) addFileToZip(zos, shm, "db/jinnlog.db-shm");

            if (includeAssets && Files.isDirectory(assetsDir)) {
                addDirectoryToZip(zos, assetsDir, "assets");
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Errore export ZIP", e);
        }

        return new ExportedFile(zipPath, "application/zip", "JinnLog-export-" + ts + ".zip");
    }

    public DatabaseImportResponse importDb(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return new DatabaseImportResponse(false, false, null, "File mancante o vuoto");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (!original.endsWith(".db")) {
            return new DatabaseImportResponse(false, false, null, "Il file deve avere estensione .db (SQLite)");
        }

        mkdirs(getPendingImportDir());

        Path pending = getPendingDbFile();
        Path marker = getPendingMarkerFile();

        try {
            try (InputStream in = new BufferedInputStream(file.getInputStream())) {
                Files.copy(in, pending, StandardCopyOption.REPLACE_EXISTING);
            }

            if (!isSqliteFile(pending)) {
                Files.deleteIfExists(pending);
                Files.deleteIfExists(marker);
                return new DatabaseImportResponse(false, false, null, "Il file non sembra un database SQLite valido");
            }

            Files.writeString(marker, "PENDING", StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            return new DatabaseImportResponse(
                    true,
                    true,
                    pending.toString(),
                    "Import accettato: verrà applicato al prossimo avvio del backend JinnLog (Electron potrà riavviare il processo)."
            );

        } catch (IOException e) {
            return new DatabaseImportResponse(false, false, null, "Errore import: " + e.getMessage());
        }
    }

    private boolean isSqliteFile(Path path) {
        if (!Files.exists(path)) return false;
        try (InputStream is = Files.newInputStream(path, StandardOpenOption.READ)) {
            byte[] header = new byte[SQLITE_HEADER.length()];
            int read = is.read(header);
            if (read != SQLITE_HEADER.length()) return false;
            String s = new String(header);
            return SQLITE_HEADER.equals(s);
        } catch (IOException e) {
            return false;
        }
    }

    private void addFileToZip(ZipOutputStream zos, Path file, String entryName) throws IOException {
        ZipEntry entry = new ZipEntry(entryName);
        entry.setTime(Files.getLastModifiedTime(file).toMillis());
        zos.putNextEntry(entry);
        Files.copy(file, zos);
        zos.closeEntry();
    }

    private void addDirectoryToZip(ZipOutputStream zos, Path dir, String prefix) throws IOException {
        Files.walk(dir)
                .sorted(Comparator.comparing(Path::toString))
                .forEach(p -> {
                    try {
                        if (Files.isDirectory(p)) return;
                        Path rel = dir.relativize(p);
                        String entryName = prefix + "/" + rel.toString().replace('\\', '/');
                        addFileToZip(zos, p, entryName);
                    } catch (IOException e) {
                        throw new UncheckedIOException(e);
                    }
                });
    }

    private void ensureExists(Path p) {
        if (!Files.exists(p)) {
            throw new IllegalStateException("Database non trovato: " + p);
        }
    }

    private void mkdirs(Path p) {
        try {
            Files.createDirectories(p);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public record ExportedFile(Path path, String contentType, String downloadName) {
    }

    public InputStreamResource asResource(Path path) {
        try {
            return new InputStreamResource(Files.newInputStream(path, StandardOpenOption.READ));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
