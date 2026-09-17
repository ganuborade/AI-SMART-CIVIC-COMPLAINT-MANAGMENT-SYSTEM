package com.civic.complaints;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Slf4j
@SpringBootApplication
public class CivicComplaintSystemApplication {

    public static void main(String[] args) {
        // Load .env variables into System properties (check root and current dir)
        loadDotEnv(Paths.get("../.env"));
        loadDotEnv(Paths.get(".env"));

        SpringApplication.run(CivicComplaintSystemApplication.class, args);
    }

    private static void loadDotEnv(Path path) {
        if (!Files.exists(path)) {
            return;
        }
        try {
            List<String> lines = Files.readAllLines(path);
            for (String line : lines) {
                line = line.trim();
                if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                    int eqIdx = line.indexOf('=');
                    String key = line.substring(0, eqIdx).trim();
                    String val = line.substring(eqIdx + 1).trim();
                    if ((val.startsWith("\"") && val.endsWith("\"")) ||
                        (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.substring(1, val.length() - 1);
                    }
                    // Always set into System properties so Spring Boot picks it up
                    System.setProperty(key, val);

                    // Also set common Spring aliases
                    if ("ADMIN_REGISTRATION_KEY".equalsIgnoreCase(key)) {
                        System.setProperty("app.admin.secret-key", val);
                    } else if ("EMPLOYEE_REGISTRATION_KEY".equalsIgnoreCase(key)) {
                        System.setProperty("app.employee.secret-key", val);
                    } else if ("DB_PASSWORD".equalsIgnoreCase(key)) {
                        System.setProperty("spring.datasource.password", val);
                    } else if ("DB_USERNAME".equalsIgnoreCase(key)) {
                        System.setProperty("spring.datasource.username", val);
                    } else if ("DB_URL".equalsIgnoreCase(key)) {
                        System.setProperty("spring.datasource.url", val);
                    }
                }
            }
            log.info("Successfully loaded environment variables from: {}", path.toAbsolutePath().normalize());
        } catch (IOException e) {
            log.warn("Failed to read .env from {}: {}", path, e.getMessage());
        }
    }
}
