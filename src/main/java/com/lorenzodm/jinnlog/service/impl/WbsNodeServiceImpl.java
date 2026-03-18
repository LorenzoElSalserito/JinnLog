package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateWbsNodeRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateWbsNodeRequest;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.Project;
import com.lorenzodm.jinnlog.core.entity.Task;
import com.lorenzodm.jinnlog.core.entity.WbsNode;
import com.lorenzodm.jinnlog.repository.ProjectRepository;
import com.lorenzodm.jinnlog.repository.TaskRepository;
import com.lorenzodm.jinnlog.repository.WbsNodeRepository;
import com.lorenzodm.jinnlog.service.WbsNodeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class WbsNodeServiceImpl implements WbsNodeService {

    private final WbsNodeRepository wbsNodeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public WbsNodeServiceImpl(WbsNodeRepository wbsNodeRepository,
                              ProjectRepository projectRepository,
                              TaskRepository taskRepository) {
        this.wbsNodeRepository = wbsNodeRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public WbsNode create(String userId, String projectId, CreateWbsNodeRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Progetto non trovato"));

        WbsNode node = new WbsNode();
        node.setProject(project);
        node.setName(req.name());
        node.setSortOrder(req.sortOrder() != null ? req.sortOrder() : 0);

        if (req.parentId() != null && !req.parentId().isBlank()) {
            WbsNode parent = wbsNodeRepository.findById(req.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nodo padre non trovato"));
            node.setParent(parent);
        }

        if (req.taskId() != null && !req.taskId().isBlank()) {
            Task task = taskRepository.findById(req.taskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task non trovato"));
            node.setTask(task);
        }
        
        node = wbsNodeRepository.save(node);
        regenerateCodes(projectId); // Regenerate after creation
        return node;
    }

    @Override
    @Transactional(readOnly = true)
    public WbsNode getById(String userId, String projectId, String nodeId) {
        return wbsNodeRepository.findById(nodeId)
                .filter(n -> n.getProject().getId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Nodo WBS non trovato"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WbsNode> listRoots(String userId, String projectId) {
        return wbsNodeRepository.findByProjectIdAndParentIsNullOrderBySortOrderAsc(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WbsNode> listAll(String userId, String projectId) {
        return wbsNodeRepository.findByProjectIdOrderBySortOrderAsc(projectId);
    }

    @Override
    public WbsNode update(String userId, String projectId, String nodeId, UpdateWbsNodeRequest req) {
        WbsNode node = getById(userId, projectId, nodeId);

        if (req.name() != null) node.setName(req.name());
        if (req.sortOrder() != null) node.setSortOrder(req.sortOrder());

        if (req.parentId() != null) {
            if (req.parentId().isBlank()) {
                node.setParent(null);
            } else {
                WbsNode parent = wbsNodeRepository.findById(req.parentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Nodo padre non trovato"));
                node.setParent(parent);
            }
        }

        if (req.taskId() != null) {
            if (req.taskId().isBlank()) {
                node.setTask(null);
            } else {
                Task task = taskRepository.findById(req.taskId())
                        .orElseThrow(() -> new ResourceNotFoundException("Task non trovato"));
                node.setTask(task);
            }
        }
        
        node = wbsNodeRepository.save(node);
        regenerateCodes(projectId); // Regenerate after update
        return node;
    }

    @Override
    public void delete(String userId, String projectId, String nodeId) {
        WbsNode node = getById(userId, projectId, nodeId);
        wbsNodeRepository.delete(node);
        regenerateCodes(projectId); // Regenerate after deletion
    }

    @Override
    public void regenerateCodes(String projectId) {
        List<WbsNode> roots = wbsNodeRepository.findByProjectIdAndParentIsNullOrderBySortOrderAsc(projectId);
        List<WbsNode> allNodes = new ArrayList<>();
        assignCodes(roots, "", allNodes);
        wbsNodeRepository.saveAll(allNodes);
    }

    private void assignCodes(List<WbsNode> nodes, String prefix, List<WbsNode> allNodes) {
        // Sort by sortOrder to ensure deterministic code generation
        nodes.sort(Comparator.comparing(WbsNode::getSortOrder));
        
        for (int i = 0; i < nodes.size(); i++) {
            WbsNode node = nodes.get(i);
            String code = prefix.isBlank() ? String.valueOf(i + 1) : prefix + "." + (i + 1);
            node.setWbsCode(code);
            allNodes.add(node);
            
            // Fetch children and recurse
            List<WbsNode> children = wbsNodeRepository.findByParentIdOrderBySortOrderAsc(node.getId());
            if (!children.isEmpty()) {
                assignCodes(children, code, allNodes);
            }
        }
    }
}
