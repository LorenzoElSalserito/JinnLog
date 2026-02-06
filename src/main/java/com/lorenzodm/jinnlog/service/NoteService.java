package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateNoteRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateNoteRequest;
import com.lorenzodm.jinnlog.core.entity.Note;

import java.util.List;

public interface NoteService {
    // Metodi contestuali specifici (Task/Project)
    Note createForTask(String userId, String taskId, CreateNoteRequest request);
    Note createForProject(String userId, String projectId, CreateNoteRequest request);
    
    List<Note> listForTask(String userId, String taskId);
    List<Note> listForProject(String userId, String projectId);

    // Metodi CRUD su singola nota (con verifica contesto)
    Note get(String userId, String noteId);
    Note update(String userId, String noteId, UpdateNoteRequest request);
    void delete(String userId, String noteId);

    // Metodi Feed e Ricerca
    List<Note> search(String userId, String query);
    List<Note> getFeed(String userId, String scope, String parentType, String parentId);

    // Deprecati (da rimuovere dopo refactoring completo)
    Note create(String userId, String parentType, String parentId, CreateNoteRequest request);
    List<Note> list(String userId, String parentType, String parentId);
}
