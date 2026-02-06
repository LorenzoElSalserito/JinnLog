package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.exception.ForbiddenException;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.Notification;
import com.lorenzodm.jinnlog.core.entity.User;
import com.lorenzodm.jinnlog.repository.NotificationRepository;
import com.lorenzodm.jinnlog.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void create(User recipient, User sender, Notification.NotificationType type, String message, String refType, String refId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSender(sender);
        notification.setType(type);
        notification.setMessage(message);
        notification.setReferenceType(refType);
        notification.setReferenceId(refId);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> listUnread(String userId) {
        return notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> listAll(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(String userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Override
    public void markAsRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notifica non trovata"));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new ForbiddenException("Non puoi gestire le notifiche di altri utenti");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
