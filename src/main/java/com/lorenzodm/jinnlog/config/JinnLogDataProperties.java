package com.lorenzodm.jinnlog.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "jinnlog.data")
public class JinnLogDataProperties {

    @NotBlank
    private String path = "./data";

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
