package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.response.DatabaseImportResponse;
import com.lorenzodm.jinnlog.api.dto.response.DatabaseStatusResponse;
import com.lorenzodm.jinnlog.service.DatabaseTransferService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/db")
public class DatabaseTransferController {

    private final DatabaseTransferService databaseTransferService;

    public DatabaseTransferController(DatabaseTransferService databaseTransferService) {
        this.databaseTransferService = databaseTransferService;
    }

    @GetMapping("/status")
    public DatabaseStatusResponse status() {
        return databaseTransferService.status();
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> export(
            @RequestParam(name = "format", defaultValue = "db") String format,
            @RequestParam(name = "includeAssets", defaultValue = "false") boolean includeAssets
    ) {
        DatabaseTransferService.ExportedFile exported;

        if ("zip".equalsIgnoreCase(format)) {
            exported = databaseTransferService.exportZip(includeAssets);
        } else {
            exported = databaseTransferService.exportDbSnapshot();
        }

        InputStreamResource resource = databaseTransferService.asResource(exported.path());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(exported.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + exported.downloadName() + "\"")
                .body(resource);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DatabaseImportResponse importDb(@RequestPart("file") MultipartFile file) {
        return databaseTransferService.importDb(file);
    }
}
