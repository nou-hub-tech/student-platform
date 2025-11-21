package org.example.studentmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import java.time.Duration;

/**
 * Application configuration for beans required by the NLP service
 */
@Configuration
public class AppConfig {

    /**
     * RestTemplate bean for making HTTP requests to external services
     * Configured with timeouts and JSON message converter
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(30))
                .setReadTimeout(Duration.ofSeconds(300))
                .messageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    /**
     * ObjectMapper bean for JSON serialization/deserialization
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Configure ObjectMapper if needed
        mapper.findAndRegisterModules();
        return mapper;
    }
}