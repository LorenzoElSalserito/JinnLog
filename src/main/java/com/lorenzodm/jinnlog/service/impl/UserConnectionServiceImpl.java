package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.exception.ConflictException;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.Notification;
import com.lorenzodm.jinnlog.core.entity.User;
import com.lorenzodm.jinnlog.core.entity.UserConnection;
import com.lorenzodm.jinnlog.repository.UserConnectionRepository;
import com.lorenzodm.jinnlog.repository.UserRepository;
import com.lorenzodm.jinnlog.service.NotificationService;
import com.lorenzodm.jinnlog.service.UserConnectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserConnectionServiceImpl implements UserConnectionService {

    private final UserConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public UserConnectionServiceImpl(UserConnectionRepository connectionRepository, UserRepository userRepository, NotificationService notificationService) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    public void sendRequest(String requesterId, String targetId) {
        if (requesterId.equals(targetId)) {
            throw new ConflictException("Non puoi inviare una richiesta a te stesso");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Requester non trovato"));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Target non trovato"));

        if (connectionRepository.findConnection(requesterId, targetId).isPresent()) {
            throw new ConflictException("Connessione già esistente o pendente");
        }

        UserConnection conn = new UserConnection(requester, target);
        connectionRepository.save(conn);
        
        // Invia notifica
        notificationService.create(
            target,
            requester,
            Notification.NotificationType.CONNECTION_REQUEST,
            requester.getDisplayName() + " ti ha inviato una richiesta di connessione",
            "USER",
            requester.getId()
        );
    }

    @Override
    public void acceptRequest(String userId, String connectionId) {
        UserConnection conn = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Richiesta non trovata"));

        if (!conn.getTarget().getId().equals(userId)) {
            throw new ConflictException("Non sei il destinatario di questa richiesta");
        }

        if (conn.getStatus() != UserConnection.Status.PENDING) {
            throw new ConflictException("Richiesta già processata");
        }

        conn.setStatus(UserConnection.Status.ACCEPTED);
        connectionRepository.save(conn);
        
        // Notifica accettazione
        notificationService.create(
            conn.getRequester(),
            conn.getTarget(),
            Notification.NotificationType.CONNECTION_ACCEPTED,
            conn.getTarget().getDisplayName() + " ha accettato la tua richiesta di connessione",
            "USER",
            conn.getTarget().getId()
        );
    }

    @Override
    public void rejectRequest(String userId, String connectionId) {
        UserConnection conn = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Richiesta non trovata"));

        if (!conn.getTarget().getId().equals(userId)) {
            throw new ConflictException("Non sei il destinatario di questa richiesta");
        }

        connectionRepository.delete(conn);
    }

    @Override
    public void removeConnection(String userId, String targetId) {
        UserConnection conn = connectionRepository.findConnection(userId, targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Connessione non trovata"));
        
        connectionRepository.delete(conn);
    }

    @Override
    public List<User> listFriends(String userId) {
        return connectionRepository.findAcceptedByUserId(userId).stream()
                .map(c -> c.getRequester().getId().equals(userId) ? c.getTarget() : c.getRequester())
                .collect(Collectors.toList());
    }

    @Override
    public List<UserConnection> listPendingIncoming(String userId) {
        return connectionRepository.findPendingIncoming(userId);
    }

    @Override
    public List<UserConnection> listPendingOutgoing(String userId) {
        return connectionRepository.findPendingOutgoing(userId);
    }

    @Override
    public List<User> searchFriends(String userId, String query) {
        if (query == null || query.isBlank()) return List.of();
        
        String lowerQuery = query.toLowerCase();
        return listFriends(userId).stream()
                .filter(u -> (u.getUsername() != null && u.getUsername().toLowerCase().contains(lowerQuery)) ||
                             (u.getDisplayName() != null && u.getDisplayName().toLowerCase().contains(lowerQuery)) ||
                             (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerQuery)))
                .collect(Collectors.toList());
    }
}
