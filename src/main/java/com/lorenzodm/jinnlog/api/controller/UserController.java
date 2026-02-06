package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.request.CreateUserRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateUserRequest;
import com.lorenzodm.jinnlog.api.dto.response.UserResponse;
import com.lorenzodm.jinnlog.api.mapper.UserMapper;
import com.lorenzodm.jinnlog.core.entity.User;
import com.lorenzodm.jinnlog.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        User created = userService.create(req);
        return ResponseEntity.created(URI.create("/api/users/" + created.getId()))
                .body(userMapper.toResponse(created));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> get(@PathVariable String userId) {
        return ResponseEntity.ok(userMapper.toResponse(userService.getById(userId)));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> list(@RequestParam(defaultValue = "true") boolean onlyActive) {
        List<UserResponse> out = userService.list(onlyActive).stream().map(userMapper::toResponse).toList();
        return ResponseEntity.ok(out);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> search(@RequestParam String q) {
        List<UserResponse> out = userService.search(q).stream().map(userMapper::toResponse).toList();
        return ResponseEntity.ok(out);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> update(@PathVariable String userId, @Valid @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(userMapper.toResponse(userService.update(userId, req)));
    }

    @PatchMapping("/{userId}/active")
    public ResponseEntity<UserResponse> setActive(@PathVariable String userId, @RequestParam boolean active) {
        return ResponseEntity.ok(userMapper.toResponse(userService.setActive(userId, active)));
    }
}
