package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateAssetRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateAssetRequest;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.api.exception.OwnershipViolationException;
import com.lorenzodm.jinnlog.core.entity.Asset;
import com.lorenzodm.jinnlog.core.entity.User;
import com.lorenzodm.jinnlog.repository.AssetRepository;
import com.lorenzodm.jinnlog.repository.UserRepository;
import com.lorenzodm.jinnlog.service.AssetService;
import com.lorenzodm.jinnlog.service.FileStorageService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public AssetServiceImpl(AssetRepository assetRepository, UserRepository userRepository, FileStorageService fileStorageService) {
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public Asset createMetadata(String userId, CreateAssetRequest req) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User non trovato: " + userId));

        Asset a = new Asset();
        a.setFileName(req.fileName());
        a.setFilePath(req.filePath());
        a.setMimeType(req.mimeType());
        a.setSizeBytes(req.sizeBytes());
        a.setChecksum(req.checksum());
        a.setDescription(req.description());
        a.setThumbnailPath(req.thumbnailPath());
        a.setOwner(owner);

        return assetRepository.save(a);
    }

    @Override
    public Asset upload(String userId, MultipartFile file, String description) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User non trovato: " + userId));

        FileStorageService.StoredFile stored = fileStorageService.store(file);

        Asset a = new Asset();
        a.setFileName(stored.originalFileName());
        a.setFilePath(stored.relativePath());
        a.setMimeType(stored.mimeType());
        a.setSizeBytes(stored.sizeBytes());
        a.setChecksum(stored.checksumSha256());
        a.setDescription(description);
        a.setOwner(owner);

        return assetRepository.save(a);
    }

    @Override
    public Asset getOwned(String userId, String assetId) {
        Asset a = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset non trovato: " + assetId));

        if (a.getOwner() == null || !userId.equals(a.getOwner().getId())) {
            throw new OwnershipViolationException("Asset non appartiene all'utente");
        }

        a.markAsAccessed();
        return assetRepository.save(a);
    }

    @Override
    public List<Asset> listOwned(String userId, boolean includeDeleted) {
        return includeDeleted ? assetRepository.findByOwnerId(userId) : assetRepository.findByOwnerIdAndDeletedAtIsNull(userId);
    }

    @Override
    public Asset update(String userId, String assetId, UpdateAssetRequest req) {
        Asset a = getOwned(userId, assetId);

        if (req.description() != null) a.setDescription(req.description());
        if (req.deleted() != null) {
            a.setDeletedAt(req.deleted() ? Instant.now() : null);
        }

        return assetRepository.save(a);
    }

    @Override
    public Asset setDeleted(String userId, String assetId, boolean deleted) {
        Asset a = getOwned(userId, assetId);
        a.setDeletedAt(deleted ? Instant.now() : null);
        return assetRepository.save(a);
    }
}
