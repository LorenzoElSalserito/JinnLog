package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateUserRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateUserRequest;
import com.lorenzodm.jinnlog.core.entity.User;

import java.util.List;

public interface UserService {
    User create(CreateUserRequest req);
    User getById(String userId);
    List<User> list(boolean onlyActive);
    List<User> search(String query);
    User update(String userId, UpdateUserRequest req);
    User setActive(String userId, boolean active);
}
