package com.lorenzodm.jinnlog.config;

import com.lorenzodm.jinnlog.security.AuthProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        JinnLogDataProperties.class,
        JinnLogAssetsProperties.class,
        CorsProperties.class,
        AuthProperties.class
})
public class JinnLogPropertiesConfig {
}
