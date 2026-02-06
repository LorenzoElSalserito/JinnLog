package com.lorenzodm.jinnlog.service;

public interface PasswordService {
    String hash(String rawPassword);
}
