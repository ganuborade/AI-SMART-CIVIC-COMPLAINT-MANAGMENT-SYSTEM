-- ============================================================================
-- AI-SMART CIVIC COMPLAINT MANAGEMENT SYSTEM
-- COMPLETE DATABASE SCHEMA, SEED DATA & DEMO QUERIES FOR MYSQL 8.0+
-- ============================================================================
-- Description:
-- Production-ready, high-performance MySQL script for MySQL Workbench.
-- Run this script directly in MySQL Workbench by pressing the 'Execute (Lightning)' button.
-- ============================================================================

-- ============================================================================
-- 1. DATABASE CREATION & SELECTION
-- ============================================================================
CREATE DATABASE IF NOT EXISTS civic_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE civic_db;

-- Temporarily disable foreign key checks for clean recreation
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 2. DROP TABLES (Clean Slate in Correct Dependency Order)
-- ============================================================================
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS complaint_status_history;
DROP TABLE IF EXISTS complaint_images;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS ai_analysis;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 3. CREATE SCHEMAS & TABLES (DDL - InnoDB Engine with UTF8MB4)
-- ============================================================================

-- Table 1: departments
CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    head_name VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: users
-- Passwords encoded with Spring Security BCrypt:
-- 'admin123'   -> $2a$10$9WjWLpTQoISeZEQpSOn.OegghvtayEqlJSxm/vZrEuVJf5BkBzU22
-- 'officer123' -> $2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2
-- 'citizen123' -> $2a$10$0Pan1mqtJ/sq8UReOsgtTO6LpwvTCcTT6/cFu0Jk0GP.FhKLBxJBO
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    department_id BIGINT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) 
        REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: complaints
CREATE TABLE complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    citizen_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    address VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    ai_confidence DOUBLE DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_citizen FOREIGN KEY (citizen_id) 
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: ai_analysis
CREATE TABLE ai_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    suggested_department VARCHAR(255) NOT NULL,
    summary TEXT,
    confidence DOUBLE NOT NULL,
    ai_response TEXT,
    duplicate_of_id BIGINT DEFAULT NULL,
    image_tags VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_complaint FOREIGN KEY (complaint_id) 
        REFERENCES complaints(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 5: assignments
CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    employee_id BIGINT DEFAULT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL,
    notes TEXT,
    CONSTRAINT fk_assignments_complaint FOREIGN KEY (complaint_id) 
        REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_dept FOREIGN KEY (department_id) 
        REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_assignments_emp FOREIGN KEY (employee_id) 
        REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 6: complaint_images
CREATE TABLE complaint_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_images_complaint FOREIGN KEY (complaint_id) 
        REFERENCES complaints(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 7: complaint_status_history
CREATE TABLE complaint_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT DEFAULT NULL,
    comment TEXT,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) 
        REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by) 
        REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 8: feedback
CREATE TABLE feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE,
    citizen_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comments TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_complaint FOREIGN KEY (complaint_id) 
        REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_citizen FOREIGN KEY (citizen_id) 
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 9: notifications (In-App Municipal Dashboard Notifications)
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(50),
    complaint_id BIGINT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. HIGH-PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX idx_assignments_employee ON assignments(employee_id);
CREATE INDEX idx_assignments_dept ON assignments(department_id);
CREATE INDEX idx_history_complaint ON complaint_status_history(complaint_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- ============================================================================
-- 5. OFFICIAL SEED DATA (DML)
-- ============================================================================

-- 5.1 Insert Departments
INSERT INTO departments (id, name, description, icon, contact_email, contact_phone, head_name) VALUES
(1, 'Road & Infrastructure Department', 'Responsible for asphalt repair, potholes, sidewalks, road dividers, and highway maintenance.', 'Road', 'roads@civic.gov', '+91 20 2550 1101', 'Eng. Rajesh Gupta'),
(2, 'Water Supply & Sewerage', 'Oversees drinking water pipelines, leakage rectification, water supply pressure, and main connections.', 'Droplets', 'water@civic.gov', '+91 20 2550 1102', 'Dr. Anita Kulkarni'),
(3, 'Electricity & Street Lighting', 'Maintains streetlights, power poles, electrical transformers, cable safety, and public illumination.', 'Zap', 'electricity@civic.gov', '+91 20 2550 1103', 'Er. Nitin Shinde'),
(4, 'Solid Waste Management & Sanitation', 'Handles community dustbins, waste collection trucks, illegal garbage dumping, and street sweeping.', 'Trash2', 'waste@civic.gov', '+91 20 2550 1104', 'Smt. Vandana Chavan'),
(5, 'Stormwater & Drainage Department', 'Maintains roadside storm gutters, open manholes, flood drain cleaning, and sewage channels.', 'Waves', 'drainage@civic.gov', '+91 20 2550 1105', 'Er. Dilip Jadhav');

-- 5.2 Insert Users (Admin, Officers, Citizens)
INSERT INTO users (id, name, email, password, phone, role, department_id, created_at) VALUES
-- Administrator (Password: admin123)
(1, 'Civic Administrator', 'admin@civic.gov', '$2a$10$9WjWLpTQoISeZEQpSOn.OegghvtayEqlJSxm/vZrEuVJf5BkBzU22', '+91 98220 11223', 'ADMIN', NULL, DATE_SUB(NOW(), INTERVAL 30 DAY)),
-- Department Officers (Password: officer123)
(2, 'Ramesh Sharma', 'road.officer@civic.gov', '$2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2', '+91 98221 22334', 'EMPLOYEE', 1, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(3, 'Priya Patil', 'water.officer@civic.gov', '$2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2', '+91 98222 33445', 'EMPLOYEE', 2, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(4, 'Suresh Deshmukh', 'electric.officer@civic.gov', '$2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2', '+91 98223 44556', 'EMPLOYEE', 3, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(5, 'Sunita More', 'waste.officer@civic.gov', '$2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2', '+91 98224 55667', 'EMPLOYEE', 4, DATE_SUB(NOW(), INTERVAL 25 DAY)),
-- Citizens (Password: citizen123)
(6, 'Ganesh Borade', 'ganesh@citizen.org', '$2a$10$0Pan1mqtJ/sq8UReOsgtTO6LpwvTCcTT6/cFu0Jk0GP.FhKLBxJBO', '+91 98900 12345', 'CITIZEN', NULL, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(7, 'Aarav Mehta', 'citizen@civic.org', '$2a$10$0Pan1mqtJ/sq8UReOsgtTO6LpwvTCcTT6/cFu0Jk0GP.FhKLBxJBO', '+91 98901 67890', 'CITIZEN', NULL, DATE_SUB(NOW(), INTERVAL 15 DAY));

-- 5.3 Insert Complaints across Lifecycle States
INSERT INTO complaints (id, citizen_id, title, description, category, priority, latitude, longitude, address, status, ai_confidence, created_at, updated_at) VALUES
(1, 6, 'Large pothole near school entrance causing accidents', 'There is a large pothole near the primary school gate. School buses and two-wheelers are losing balance and vehicles are having severe difficulty passing.', 'ROAD_DAMAGE', 'HIGH', 18.5204, 73.8567, 'FC Road, near Modern High School, Shivajinagar, Pune', 'IN_PROGRESS', 0.94, DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 7, 'Major water pipeline has burst and water is flooding houses', 'High pressure drinking water line ruptured under pavement. Huge volume of water is gushing onto the street and flooding nearby ground floor houses and shops.', 'WATER_LEAKAGE', 'CRITICAL', 18.5314, 73.8446, 'Senapati Bapat Road, near ICC Tech Park, Pune', 'ASSIGNED', 0.98, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 6, 'Street light has not been working for the last 5 days', 'Four consecutive street light poles are dark near the community garden. Pedestrians and women feel unsafe walking after 8 PM.', 'STREET_LIGHT', 'MEDIUM', 18.5089, 73.8260, 'Paud Road, near Joggers Park, Kothrud, Pune', 'RESOLVED', 0.92, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 7, 'Garbage container overflowing with street waste near vegetable market', 'The green community waste bins have not been emptied for 3 days. Animals are scattering the waste across the road causing severe stench.', 'GARBAGE_WASTE', 'HIGH', 18.5074, 73.8077, 'Karve Nagar Market, Pune', 'UNDER_REVIEW', 0.89, DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(5, 6, 'Open storm drain manhole lid missing near bus stop', 'Cement cover of roadside stormwater drain broken and collapsed. It poses an immediate fall risk for commuters boarding the PMT bus.', 'DRAINAGE_OVERFLOW', 'HIGH', 18.5362, 73.8300, 'Aundh Road, near Bremen Chowk, Pune', 'UNDER_REVIEW', 0.95, DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- 5.4 Insert AI Analysis Results
INSERT INTO ai_analysis (id, complaint_id, category, priority, suggested_department, summary, confidence, ai_response, duplicate_of_id, image_tags, created_at) VALUES
(1, 1, 'ROAD_DAMAGE', 'HIGH', 'Road & Infrastructure Department', 'Detected asphalt depression measuring approx 1.2m diameter near school transit route. Recommended immediate cold patch repair.', 0.94, '{"hazardLevel": "HIGH", "structuralRisk": "MODERATE", "pedestrianSafety": "CRITICAL"}', NULL, 'pothole, asphalt, school_zone', DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(2, 2, 'WATER_LEAKAGE', 'CRITICAL', 'Water Supply & Sewerage', 'High velocity pressurized potable water discharge. Water loss estimated at 120 LPM with flood hazard to adjacent structures.', 0.98, '{"hazardLevel": "CRITICAL", "valveShutdownRequired": true, "infrastructureRisk": "SEVERE"}', NULL, 'water_burst, flood, pipeline', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(3, 3, 'STREET_LIGHT', 'MEDIUM', 'Electricity & Street Lighting', 'Illumination failure across consecutive poles #12 through #15. Suspected short circuit or failed circuit breaker.', 0.92, '{"hazardLevel": "MEDIUM", "publicSafetyImpact": "HIGH"}', NULL, 'darkness, streetlight, power_failure', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 4, 'GARBAGE_WASTE', 'HIGH', 'Solid Waste Management & Sanitation', 'Municipal container overflow exceeding 150% capacity with bio-waste spillage on public roadway.', 0.89, '{"hazardLevel": "HIGH", "healthRisk": "MODERATE"}', NULL, 'overflowing_bin, trash, sanitation', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(5, 5, 'DRAINAGE_OVERFLOW', 'HIGH', 'Stormwater & Drainage Department', 'Uncovered subterranean chamber posing severe fall hazard in high-density transit corridor.', 0.95, '{"hazardLevel": "HIGH", "fallHazard": "IMMEDIATE"}', NULL, 'open_manhole, broken_slab, pedestrian_danger', DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- 5.5 Insert Department Assignments
INSERT INTO assignments (id, complaint_id, department_id, employee_id, assigned_at, completed_at, notes) VALUES
(1, 1, 1, 2, DATE_SUB(NOW(), INTERVAL 18 HOUR), NULL, 'Dispatched road maintenance asphalt mixer crew with vibrating compactor.'),
(2, 2, 2, 3, DATE_SUB(NOW(), INTERVAL 4 HOUR), NULL, 'EMERGENCY: Valve shut-off ordered, main trunk repair team dispatched.'),
(3, 3, 3, 4, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'Faulty underground cable spliced and LED drivers replaced on poles #12 to #15.');

-- 5.6 Insert Complaint Images (Before / After Proof)
INSERT INTO complaint_images (id, complaint_id, image_url, image_type, uploaded_at) VALUES
(1, 1, '/uploads/pothole_before.svg', 'BEFORE', DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(2, 1, '/uploads/pothole_after.svg', 'AFTER', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 2, '/uploads/water_leak_before.svg', 'BEFORE', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(4, 3, '/uploads/streetlight_before.svg', 'BEFORE', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 3, '/uploads/streetlight_after.svg', 'AFTER', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 4, '/uploads/garbage_before.svg', 'BEFORE', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(7, 5, '/uploads/drain_before.svg', 'BEFORE', DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- 5.7 Insert Status History Audit Trail
INSERT INTO complaint_status_history (id, complaint_id, old_status, new_status, changed_by, comment, changed_at) VALUES
(1, 1, 'SUBMITTED', 'UNDER_REVIEW', 1, 'AI analysis processed; reviewed by Admin.', DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(2, 1, 'UNDER_REVIEW', 'ASSIGNED', 1, 'Assigned to Road Dept (Ramesh Sharma).', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(3, 1, 'ASSIGNED', 'IN_PROGRESS', 2, 'Road patch work started on site by field team.', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(4, 2, 'SUBMITTED', 'ASSIGNED', 1, 'Emergency high priority dispatch to Water Dept (Priya Patil).', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(5, 3, 'SUBMITTED', 'ASSIGNED', 1, 'Assigned to Electrical Dept (Suresh Deshmukh).', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 3, 'ASSIGNED', 'IN_PROGRESS', 4, 'Electrical lineman team deployed with hydraulic lift.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 3, 'IN_PROGRESS', 'RESOLVED', 4, 'Streetlights restored, new LED drivers fitted, and tested.', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 5.8 Insert Citizen Feedback
INSERT INTO feedback (id, complaint_id, citizen_id, rating, comments, created_at) VALUES
(1, 3, 6, 5, 'Prompt and effective repair! The street is fully illuminated now. Great work team!', DATE_SUB(NOW(), INTERVAL 20 HOUR));

-- 5.9 Insert In-App Notifications
INSERT INTO notifications (id, user_id, title, message, is_read, type, complaint_id, created_at) VALUES
(1, 6, 'Complaint Status Updated', 'Your complaint #1 (Pothole) is now IN_PROGRESS.', FALSE, 'STATUS_UPDATE', 1, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 2, 'New Work Order Assigned', 'You have been assigned Complaint #1: Pothole on FC Road.', TRUE, 'ASSIGNMENT', 1, DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(3, 3, 'Emergency Assignment', 'CRITICAL: Water pipeline burst on SB Road assigned to your unit.', FALSE, 'ASSIGNMENT', 2, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(4, 6, 'Complaint Resolved', 'Your complaint #3 (Street light) has been marked RESOLVED. Please provide feedback.', TRUE, 'STATUS_UPDATE', 3, DATE_SUB(NOW(), INTERVAL 1 DAY));


-- ============================================================================
-- 6. DEMO & PRESENTATION QUERIES FOR YOUR SIR / JURY EVALUATION
-- ============================================================================

-- DEMO QUERY 1: System User Directory & Role-Based Access Control (RBAC)
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.role, 
    COALESCE(d.name, 'Citizen (Public User)') AS assigned_department,
    u.phone,
    DATE(u.created_at) AS registered_date
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
ORDER BY u.role, u.id;

-- DEMO QUERY 2: AI-Assisted Complaint Triage Dashboard
-- Demonstrates AI category prediction, priority classification, and confidence score
SELECT 
    c.id AS complaint_id,
    c.title,
    c.category AS citizen_category,
    ai.category AS ai_detected_category,
    c.priority AS assigned_priority,
    CONCAT(ROUND(ai.confidence * 100, 1), '%') AS ai_confidence,
    ai.suggested_department,
    c.status
FROM complaints c
JOIN ai_analysis ai ON c.id = ai.complaint_id
ORDER BY c.created_at DESC;

-- DEMO QUERY 3: Officer Work Orders & Dispatch Status
-- Shows department dispatch, assigned field engineer, and real-time notes
SELECT 
    c.id AS complaint_id,
    c.title,
    d.name AS department,
    u.name AS assigned_officer,
    u.phone AS officer_contact,
    a.assigned_at,
    c.status,
    a.notes AS dispatch_notes
FROM complaints c
JOIN assignments a ON c.id = a.complaint_id
JOIN departments d ON a.department_id = d.id
JOIN users u ON a.employee_id = u.id
ORDER BY a.assigned_at DESC;

-- DEMO QUERY 4: Complaint Audit Trail & Status History
-- Demonstrates transparent municipal governance: who updated the status and when
SELECT 
    h.complaint_id,
    h.old_status,
    h.new_status,
    u.name AS changed_by_user,
    u.role AS user_role,
    h.comment,
    h.changed_at
FROM complaint_status_history h
LEFT JOIN users u ON h.changed_by = u.id
ORDER BY h.complaint_id, h.changed_at ASC;

-- DEMO QUERY 5: Resolution Proof & Citizen Satisfaction
-- Demonstrates closed-loop governance: Before/After photo evidence with citizen rating
SELECT 
    c.id AS complaint_id,
    c.title,
    c.address,
    c.status,
    fb.rating AS citizen_rating,
    fb.comments AS citizen_review,
    COUNT(img.id) AS proof_images_count
FROM complaints c
LEFT JOIN feedback fb ON c.id = fb.complaint_id
LEFT JOIN complaint_images img ON c.id = img.complaint_id
WHERE c.status = 'RESOLVED'
GROUP BY c.id, c.title, c.address, c.status, fb.rating, fb.comments;

-- DEMO QUERY 6: Municipal Analytics KPI Summary
-- High-level department KPI breakdown of total, active, resolved, and critical complaints
SELECT 
    d.name AS department_name,
    COUNT(c.id) AS total_assigned,
    COUNT(CASE WHEN c.status = 'RESOLVED' THEN 1 END) AS resolved_count,
    COUNT(CASE WHEN c.status IN ('ASSIGNED', 'IN_PROGRESS') THEN 1 END) AS active_in_progress,
    COUNT(CASE WHEN c.priority = 'CRITICAL' THEN 1 END) AS critical_issues
FROM departments d
LEFT JOIN assignments a ON d.id = a.department_id
LEFT JOIN complaints c ON a.complaint_id = c.id
GROUP BY d.name
ORDER BY total_assigned DESC;

-- DEMO QUERY 7: Real-Time GPS Spatial Incident Mapping (Geo-Coordinates & Hotspots)
-- Queries latitude, longitude, address, category, and priority for map visualization
SELECT 
    c.id AS complaint_id,
    c.title,
    c.category,
    c.priority,
    c.status,
    c.latitude,
    c.longitude,
    c.address,
    u.name AS reported_by,
    c.created_at
FROM complaints c
JOIN users u ON c.citizen_id = u.id
WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL
ORDER BY c.priority = 'CRITICAL' DESC, c.created_at DESC;

-- DEMO QUERY 8: Emergency & Critical Incident Escalation Queue
-- Filters critical P1 complaints requiring immediate dispatch within 2-hour SLA
SELECT 
    c.id AS incident_id,
    c.title,
    c.category,
    c.address,
    c.status,
    d.name AS responsible_department,
    u.name AS citizen_name,
    u.phone AS citizen_phone,
    TIMESTAMPDIFF(HOUR, c.created_at, NOW()) AS hours_unresolved
FROM complaints c
JOIN users u ON c.citizen_id = u.id
LEFT JOIN assignments a ON c.id = a.complaint_id
LEFT JOIN departments d ON a.department_id = d.id
WHERE c.priority = 'CRITICAL' AND c.status != 'RESOLVED'
ORDER BY hours_unresolved DESC;

-- DEMO QUERY 9: User & Staff Identity Directory (Role & Security Audit)
-- Displays complete user roster with roles, department, and registration age
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    COALESCE(d.name, 'Public / Citizen') AS assigned_department,
    u.phone,
    CASE 
        WHEN u.role = 'ADMIN' THEN 'Passkey Verified (ADMIN@2026)'
        WHEN u.role = 'EMPLOYEE' THEN 'Passkey Verified (STAFF@2026)'
        ELSE 'Standard Citizen Account'
    END AS security_passkey_status,
    DATE(u.created_at) AS registration_date
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
ORDER BY 
    CASE u.role 
        WHEN 'ADMIN' THEN 1 
        WHEN 'EMPLOYEE' THEN 2 
        ELSE 3 
    END, u.id ASC;

-- DEMO QUERY 10: In-App Dashboard Notifications & Citizen Alerts
-- Shows real-time in-app notification alerts generated for complaints
SELECT 
    n.id AS notification_id,
    u.name AS recipient_user,
    u.role AS recipient_role,
    n.complaint_id,
    n.title,
    n.message,
    CASE WHEN n.is_read = 1 THEN 'Read' ELSE 'UNREAD' END AS read_status,
    n.created_at
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC;

-- DEMO QUERY 11: SLA Breach & Aging Incident Warning (> 24 Hours Unresolved)
-- Identifies complaints that exceed target SLA response time
SELECT 
    c.id AS complaint_id,
    c.title,
    c.priority,
    c.status,
    d.name AS department_name,
    emp.name AS assigned_officer,
    c.created_at,
    TIMESTAMPDIFF(HOUR, c.created_at, NOW()) AS age_in_hours,
    CASE 
        WHEN c.priority = 'CRITICAL' AND TIMESTAMPDIFF(HOUR, c.created_at, NOW()) > 12 THEN 'CRITICAL SLA BREACH'
        WHEN c.priority = 'HIGH' AND TIMESTAMPDIFF(HOUR, c.created_at, NOW()) > 24 THEN 'HIGH SLA WARNING'
        ELSE 'Within Normal Threshold'
    END AS sla_risk_level
FROM complaints c
LEFT JOIN assignments a ON c.id = a.complaint_id
LEFT JOIN departments d ON a.department_id = d.id
LEFT JOIN users emp ON a.employee_id = emp.id
WHERE c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')
ORDER BY age_in_hours DESC;

-- DEMO QUERY 12: System Overview & Platform Health KPI Counters
-- Single-query comprehensive dashboard metrics for leadership presentations
SELECT 
    (SELECT COUNT(*) FROM complaints) AS total_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'RESOLVED') AS resolved_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status IN ('ASSIGNED', 'IN_PROGRESS')) AS active_in_progress,
    (SELECT COUNT(*) FROM complaints WHERE status = 'UNDER_REVIEW') AS pending_review,
    (SELECT COUNT(*) FROM complaints WHERE priority = 'CRITICAL') AS critical_emergencies,
    (SELECT COUNT(*) FROM users WHERE role = 'CITIZEN') AS registered_citizens,
    (SELECT COUNT(*) FROM users WHERE role = 'EMPLOYEE') AS municipal_field_officers,
    (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') AS system_administrators,
    (SELECT COUNT(*) FROM departments) AS municipal_departments;

