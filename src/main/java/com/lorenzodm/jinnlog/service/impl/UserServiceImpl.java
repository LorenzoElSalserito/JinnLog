package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateUserRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateUserRequest;
import com.lorenzodm.jinnlog.api.exception.ConflictException;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.User;
import com.lorenzodm.jinnlog.repository.UserRepository;
import com.lorenzodm.jinnlog.service.PasswordService;
import com.lorenzodm.jinnlog.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;

    public UserServiceImpl(UserRepository userRepository, PasswordService passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    @Override
    public User create(CreateUserRequest req) {
        if (userRepository.existsByUsernameIgnoreCase(req.username())) {
            throw new ConflictException("Username già esistente: " + req.username());
        }
        if (req.email() != null && !req.email().isBlank() && userRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email già esistente: " + req.email());
        }

        User u = new User();
        u.setUsername(req.username());
        u.setEmail(req.email());
        u.setDisplayName(req.displayName());
        u.setPasswordHash(passwordService.hash(req.password()));
        u.setActive(true);

        return userRepository.save(u);
    }

    @Override
    public User getById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User non trovato: " + userId));
    }

    @Override
    public List<User> list(boolean onlyActive) {
        return onlyActive ? userRepository.findByActiveTrue() : userRepository.findAll();
    }

    @Override
    public List<User> search(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return userRepository.searchRealUsers(query);
    }

    @Override
    public User update(String userId, UpdateUserRequest req) {
        User u = getById(userId);

        if (req.email() != null && !req.email().isBlank() && !req.email().equalsIgnoreCase(u.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(req.email())) {
                throw new ConflictException("Email già esistente: " + req.email());
            }
            u.setEmail(req.email());
        }

        if (req.displayName() != null) u.setDisplayName(req.displayName());
        if (req.avatarPath() != null) u.setAvatarPath(req.avatarPath());
        if (req.active() != null) u.setActive(req.active());

        return userRepository.save(u);
    }

    @Override
    public User setActive(String userId, boolean active) {
        User u = getById(userId);
        u.setActive(active);
        return userRepository.save(u);
    }
}
