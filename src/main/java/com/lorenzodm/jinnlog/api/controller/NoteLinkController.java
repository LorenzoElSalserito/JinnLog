package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.request.CreateNoteLinkRequest;
import com.lorenzodm.jinnlog.api.dto.response.NoteLinkResponse;
import com.lorenzodm.jinnlog.api.mapper.NoteLinkMapper;
import com.lorenzodm.jinnlog.core.entity.NoteLink;
import com.lorenzodm.jinnlog.service.NoteLinkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/note-links")
public class NoteLinkController {

    private final NoteLinkService service;
    private final NoteLinkMapper mapper;

    public NoteLinkController(NoteLinkService service, NoteLinkMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<NoteLinkResponse> create(@Valid @RequestBody CreateNoteLinkRequest request) {
        NoteLink link = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(link));
    }

    @GetMapping("/note/{noteId}")
    public ResponseEntity<List<NoteLinkResponse>> findByNoteId(@PathVariable String noteId) {
        List<NoteLinkResponse> response = service.findByNoteId(noteId).stream()
                .map(mapper::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<NoteLinkResponse>> findByLinkedEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        List<NoteLinkResponse> response = service.findByLinkedEntity(entityType, entityId).stream()
                .map(mapper::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
