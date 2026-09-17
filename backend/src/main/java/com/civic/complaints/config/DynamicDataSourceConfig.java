package com.civic.complaints.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
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

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/civic_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8}")
    private String dbUrl;

    @Value("${spring.datasource.username:root}")
    private String dbUsername;

    @Value("${spring.datasource.password:Roor@123}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        try {
            log.info("Attempting connection to MySQL database at: {}", dbUrl);
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(dbUrl, dbUsername, dbPassword)) {
                log.info("MySQL connection successfully established! Using MySQL 8 with HikariCP connection pooling.");
                
                HikariConfig config = new HikariConfig();
                config.setJdbcUrl(dbUrl);
                config.setUsername(dbUsername);
                config.setPassword(dbPassword);
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
                config.setPoolName("CivicMySQLHikariPool");
                
                // High-performance Connection Pool Tuning
                config.setMaximumPoolSize(20);
                config.setMinimumIdle(5);
                config.setIdleTimeout(300000);       // 5 minutes
                config.setConnectionTimeout(20000);  // 20 seconds
                config.setMaxLifetime(1200000);      // 20 minutes
                config.setLeakDetectionThreshold(60000); // 60 seconds
                
                // High-throughput MySQL JDBC Performance Flags
                config.addDataSourceProperty("cachePrepStmts", "true");
                config.addDataSourceProperty("prepStmtCacheSize", "250");
                config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
                config.addDataSourceProperty("useServerPrepStmts", "true");
                config.addDataSourceProperty("useLocalSessionState", "true");
                config.addDataSourceProperty("rewriteBatchedStatements", "true");
                config.addDataSourceProperty("cacheResultSetMetadata", "true");
                config.addDataSourceProperty("cacheServerConfiguration", "true");
                config.addDataSourceProperty("elideSetAutoCommits", "true");
                config.addDataSourceProperty("maintainTimeStats", "false");

                return new HikariDataSource(config);
            }
        } catch (Exception e) {
            log.warn("MySQL connection not reachable ({}). Falling back to resilient in-memory H2 database in MySQL mode.", e.getMessage());
            return DataSourceBuilder.create()
                    .url("jdbc:h2:mem:civic_db;DB_CLOSE_DELAY=-1;MODE=MySQL;DATABASE_TO_LOWER=TRUE")
                    .username("sa")
                    .password("")
                    .driverClassName("org.h2.Driver")
                    .build();
        }
    }
}
