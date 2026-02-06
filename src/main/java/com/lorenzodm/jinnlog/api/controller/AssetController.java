package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.request.CreateAssetRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateAssetRequest;
import com.lorenzodm.jinnlog.api.dto.response.AssetResponse;
import com.lorenzodm.jinnlog.api.mapper.AssetMapper;
import com.lorenzodm.jinnlog.core.entity.Asset;
import com.lorenzodm.jinnlog.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/assets")
public class AssetController {

    private final AssetService assetService;
    private final AssetMapper assetMapper;

    public AssetController(AssetService assetService, AssetMapper assetMapper) {
        this.assetService = assetService;
        this.assetMapper = assetMapper;
    }

    @PostMapping("/metadata")
    public ResponseEntity<AssetResponse> createMetadata(@PathVariable String userId, @Valid @RequestBody CreateAssetRequest req) {
        Asset created = assetService.createMetadata(userId, req);
        return ResponseEntity.created(URI.create("/api/users/" + userId + "/assets/" + created.getId()))
                .body(assetMapper.toResponse(created));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetResponse> upload(
            @PathVariable String userId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "description", required = false) String description
    ) {
        Asset created = assetService.upload(userId, file, description);
        return ResponseEntity.created(URI.create("/api/users/" + userId + "/assets/" + created.getId()))
                .body(assetMapper.toResponse(created));
    }

    @GetMapping("/{assetId}")
    public ResponseEntity<AssetResponse> get(@PathVariable String userId, @PathVariable String assetId) {
        return ResponseEntity.ok(assetMapper.toResponse(assetService.getOwned(userId, assetId)));
    }

    @GetMapping
    public ResponseEntity<List<AssetResponse>> list(
            @PathVariable String userId,
            @RequestParam(defaultValue = "false") boolean includeDeleted
    ) {
        List<AssetResponse> out = assetService.listOwned(userId, includeDeleted).stream()
                .map(assetMapper::toResponse)
                .toList();
        return ResponseEntity.ok(out);
    }

    @PutMapping("/{assetId}")
    public ResponseEntity<AssetResponse> update(@PathVariable String userId, @PathVariable String assetId, @Valid @RequestBody UpdateAssetRequest req) {
        return ResponseEntity.ok(assetMapper.toResponse(assetService.update(userId, assetId, req)));
    }

    @PatchMapping("/{assetId}/deleted")
    public ResponseEntity<AssetResponse> setDeleted(@PathVariable String userId, @PathVariable String assetId, @RequestParam boolean deleted) {
        return ResponseEntity.ok(assetMapper.toResponse(assetService.setDeleted(userId, assetId, deleted)));
    }
}
