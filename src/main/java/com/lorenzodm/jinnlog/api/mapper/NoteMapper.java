package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.NoteResponse;
import com.lorenzodm.jinnlog.api.dto.response.TagResponse;
import com.lorenzodm.jinnlog.core.entity.Note;
import com.lorenzodm.jinnlog.repository.ProjectRepository;
import com.lorenzodm.jinnlog.repository.TaskRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NoteMapper {

    private final TagMapper tagMapper;
    private final UserMapper userMapper;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public NoteMapper(TagMapper tagMapper, UserMapper userMapper, TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.tagMapper = tagMapper;
        this.userMapper = userMapper;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public NoteResponse toResponse(Note note) {
        List<TagResponse> tags = note.getTags() != null
                ? note.getTags().stream().map(tagMapper::toResponseLight).collect(Collectors.toList())
                : List.of();

        String parentTitle = "Sconosciuto";
        if (note.getParentType() == Note.ParentType.TASK) {
            parentTitle = taskRepository.findById(note.getParentId())
                    .map(t -> t.getTitle())
                    .orElse("Task eliminato");
        } else if (note.getParentType() == Note.ParentType.PROJECT) {
            parentTitle = projectRepository.findById(note.getParentId())
                    .map(p -> p.getName())
                    .orElse("Progetto eliminato");
        }

        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getContent(),
                note.getParentType().name(),
                note.getParentId(),
                parentTitle,
                userMapper.toResponseLight(note.getOwner()),
                note.getCreatedAt(),
                note.getUpdatedAt(),
                tags
        );
    }
}
