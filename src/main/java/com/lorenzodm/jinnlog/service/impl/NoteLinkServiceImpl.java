package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateNoteLinkRequest;
import com.lorenzodm.jinnlog.api.exception.ConflictException;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.Note;
import com.lorenzodm.jinnlog.core.entity.NoteLink;
import com.lorenzodm.jinnlog.repository.NoteLinkRepository;
import com.lorenzodm.jinnlog.repository.NoteRepository;
import com.lorenzodm.jinnlog.service.NoteLinkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NoteLinkServiceImpl implements NoteLinkService {

    private static final Logger log = LoggerFactory.getLogger(NoteLinkServiceImpl.class);
    private final NoteLinkRepository noteLinkRepository;
    private final NoteRepository noteRepository;

    public NoteLinkServiceImpl(NoteLinkRepository noteLinkRepository, NoteRepository noteRepository) {
        this.noteLinkRepository = noteLinkRepository;
        this.noteRepository = noteRepository;
    }

    @Override
    public NoteLink create(CreateNoteLinkRequest request) {
        log.debug("Creazione link nota: note={}, type={}, entity={}", 
                request.noteId(), request.linkedEntityType(), request.linkedEntityId());

        Note note = noteRepository.findById(request.noteId())
                .orElseThrow(() -> new ResourceNotFoundException("Nota non trovata: " + request.noteId()));

        NoteLink.LinkedEntityType entityType;
        try {
            entityType = NoteLink.LinkedEntityType.valueOf(request.linkedEntityType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo entità non valido: " + request.linkedEntityType());
        }

        if (noteLinkRepository.existsByNoteIdAndLinkedEntityTypeAndLinkedEntityId(
                request.noteId(), entityType, request.linkedEntityId())) {
            throw new ConflictException("Link già esistente");
        }

        NoteLink link = new NoteLink();
        link.setNote(note);
        link.setLinkedEntityType(entityType);
        link.setLinkedEntityId(request.linkedEntityId());
        return noteLinkRepository.save(link);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteLink> findByNoteId(String noteId) {
        return noteLinkRepository.findByNoteId(noteId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteLink> findByLinkedEntity(String entityType, String entityId) {
        NoteLink.LinkedEntityType type = NoteLink.LinkedEntityType.valueOf(entityType.toUpperCase());
        return noteLinkRepository.findByLinkedEntity(type, entityId);
    }

    @Override
    public void delete(String id) {
        log.debug("Eliminazione link nota: {}", id);
        NoteLink link = noteLinkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Link nota non trovato: " + id));
        noteLinkRepository.delete(link);
    }
}
