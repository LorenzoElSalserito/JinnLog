package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateNoteLinkRequest;
import com.lorenzodm.jinnlog.core.entity.NoteLink;

import java.util.List;

public interface NoteLinkService {
    NoteLink create(CreateNoteLinkRequest request);
    List<NoteLink> findByNoteId(String noteId);
    List<NoteLink> findByLinkedEntity(String entityType, String entityId);
    void delete(String id);
}
