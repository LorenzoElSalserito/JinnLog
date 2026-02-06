package com.lorenzodm.jinnlog.service;

public interface CalendarService {
    String generateIcsFeed(String userId, String token);
    String rotateToken(String userId);
}
