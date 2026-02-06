package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.core.entity.User;
import com.lorenzodm.jinnlog.core.entity.UserConnection;

import java.util.List;

public interface UserConnectionService {
    void sendRequest(String requesterId, String targetId);
    void acceptRequest(String userId, String connectionId);
    void rejectRequest(String userId, String connectionId);
    void removeConnection(String userId, String targetId);
    
    List<User> listFriends(String userId);
    List<UserConnection> listPendingIncoming(String userId);
    List<UserConnection> listPendingOutgoing(String userId);
    
    // Ricerca solo tra gli amici
    List<User> searchFriends(String userId, String query);
}
