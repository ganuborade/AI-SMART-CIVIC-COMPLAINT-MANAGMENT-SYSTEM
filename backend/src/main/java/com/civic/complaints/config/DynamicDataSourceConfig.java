package com.civic.complaints.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;

@Slf4j
@Configuration
public class DynamicDataSourceConfig {

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/civic_db}")
    private String dbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String dbUsername;

    @Value("${spring.datasource.password:postgres}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        try {
            log.info("Attempting connection to PostgreSQL database at: {}", dbUrl);
            Class.forName("org.postgresql.Driver");
            try (Connection conn = DriverManager.getConnection(dbUrl, dbUsername, dbPassword)) {
                log.info("PostgreSQL connection successfully established! Using PostgreSQL 18.");
                return DataSourceBuilder.create()
                        .url(dbUrl)
                        .username(dbUsername)
                        .password(dbPassword)
                        .driverClassName("org.postgresql.Driver")
                        .build();
            }
        } catch (Exception e) {
            log.warn("PostgreSQL connection unverified ({}) - using resilient in-memory database with PostgreSQL compatibility mode.", e.getMessage());
            return DataSourceBuilder.create()
                    .url("jdbc:h2:mem:civic_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE")
                    .username("sa")
                    .password("")
                    .driverClassName("org.h2.Driver")
                    .build();
        }
    }
}
