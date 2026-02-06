package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.response.CurrentUserResponse;
import com.lorenzodm.jinnlog.security.AuthProperties;
import com.lorenzodm.jinnlog.security.CurrentUser;
import com.lorenzodm.jinnlog.security.CurrentUserUtils;
import com.lorenzodm.jinnlog.security.JinnLogPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {

    private final AuthProperties authProperties;

    public AuthController(AuthProperties authProperties) {
        this.authProperties = authProperties;
    }

    @GetMapping("/api/auth/login-url")
    public Map<String, String> loginUrl() {
        return Map.of("url", "/oauth2/authorization/" + authProperties.getRegistrationId());
    }

    @GetMapping("/api/auth/me")
    public CurrentUserResponse me() {
        JinnLogPrincipal principal = CurrentUserUtils.principal()
                .orElseThrow(() -> new IllegalStateException("Utente non autenticato (JinnLog)"));

        return new CurrentUserResponse(
                principal.getLocalUserId(),
                principal.getName(),
                principal.getAttributes()
        );
    }

    @GetMapping("/api/auth/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken());
    }
}
