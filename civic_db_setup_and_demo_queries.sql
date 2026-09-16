-- ============================================================================
-- AI-SMART CIVIC COMPLAINT MANAGEMENT SYSTEM
-- COMPLETE DATABASE SCHEMA, SEED DATA & DEMO QUERIES FOR POSTGRESQL 18
-- ============================================================================
-- Description:
-- Production-ready PostgreSQL script for academic & project presentation.
-- Run this script in PostgreSQL (pgAdmin, DBeaver, or psql command line).
-- ============================================================================

-- OPTIONAL: Create Database (run separately if connected as postgres superuser)
-- CREATE DATABASE civic_db;
-- \c civic_db;

-- ============================================================================
-- 1. DROP TABLES (Clean Slate in Correct Dependency Order)
-- ============================================================================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS complaint_status_history CASCADE;
DROP TABLE IF EXISTS complaint_images CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS ai_analysis CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ============================================================================
-- 2. CREATE SCHEMAS & TABLES (DDL)
-- ============================================================================

-- Table: departments
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    head_name VARCHAR(255)
);

-- Table: users
-- Verified Spring Security BCrypt hashes:
-- 'admin123'   -> $2a$10$9WjWLpTQoISeZEQpSOn.OegghvtayEqlJSxm/vZrEuVJf5BkBzU22
-- 'officer123' -> $2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2
-- 'citizen123' -> $2a$10$0Pan1mqtJ/sq8UReOsgtTO6LpwvTCcTT6/cFu0Jk0GP.FhKLBxJBO
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('CITIZEN', 'ADMIN', 'EMPLOYEE')),
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: complaints
CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('ROAD_DAMAGE', 'WATER_LEAKAGE', 'STREET_LIGHT', 'GARBAGE_WASTE', 'DRAINAGE_OVERFLOW', 'OTHER')),
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'AI_ANALYZED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')),
    ai_confidence DOUBLE PRECISION,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: ai_analysis
CREATE TABLE ai_analysis (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    suggested_department VARCHAR(255) NOT NULL,
    summary TEXT,
    confidence DOUBLE PRECISION NOT NULL,
    ai_response TEXT,
    duplicate_of_id BIGINT,
    image_tags VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: assignments
CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    employee_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    notes TEXT
);

-- Table: complaint_images
CREATE TABLE complaint_images (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(50) NOT NULL CHECK (image_type IN ('BEFORE', 'AFTER', 'EVIDENCE')),
    uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: complaint_status_history
CREATE TABLE complaint_status_history (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT,
    changed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: feedback
CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(50),
    complaint_id BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. PERFORMANCE INDEXES
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
-- 4. OFFICIAL SEED DATA (DML)
-- ============================================================================

-- 4.1 Insert Departments
INSERT INTO departments (id, name, description, icon, contact_email, contact_phone, head_name) VALUES
(1, 'Road & Infrastructure Department', 'Responsible for asphalt repair, potholes, sidewalks, road dividers, and highway maintenance.', 'Road', 'roads@civic.gov', '+91 20 2550 1101', 'Eng. Rajesh Gupta'),
(2, 'Water Supply & Sewerage', 'Oversees drinking water pipelines, leakage rectification, water supply pressure, and main connections.', 'Droplets', 'water@civic.gov', '+91 20 2550 1102', 'Dr. Anita Kulkarni'),
(3, 'Electricity & Street Lighting', 'Maintains streetlights, power poles, electrical transformers, cable safety, and public illumination.', 'Zap', 'electricity@civic.gov', '+91 20 2550 1103', 'Er. Nitin Shinde'),
(4, 'Solid Waste Management & Sanitation', 'Handles community dustbins, waste collection trucks, illegal garbage dumping, and street sweeping.', 'Trash2', 'waste@civic.gov', '+91 20 2550 1104', 'Smt. Vandana Chavan'),
(5, 'Stormwater & Drainage Department', 'Maintains roadside storm gutters, open manholes, flood drain cleaning, and sewage channels.', 'Waves', 'drainage@civic.gov', '+91 20 2550 1105', 'Er. Dilip Jadhav');

ALTER SEQUENCE departments_id_seq RESTART WITH 6;

-- 4.2 Insert Users (Admin, Officers, Citizens)
-- Note: Passwords correspond to admin123, officer123, citizen123 encoded with Spring Security BCrypt.
INSERT INTO users (id, name, email, password, phone, role, department_id, created_at) VALUES
-- Administrator (Password: admin123)
(1, 'Civic Administrator', 'admin@civic.gov', '$2a$10$9WjWLpTQoISeZEQpSOn.OegghvtayEqlJSxm/vZrEuVJf5BkBzU22', '+91 98220 11223', 'ADMIN', NULL, NOW() - INTERVAL '30 days'),
-- Municipal Department Officers (Password: officer123)
(2, 'Ramesh Sharma', 'road.officer@civic.gov', '$2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2', '+91 98221 22334', 'EMPLOYEE', 1, NOW() - INTERVAL '25 days'),
(3, 'Priya Patil', 'water.officer@civic.gov', '$2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2', '+91 98222 33445', 'EMPLOYEE', 2, NOW() - INTERVAL '25 days'),
(4, 'Suresh Deshmukh', 'electric.officer@civic.gov', '$2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2', '+91 98223 44556', 'EMPLOYEE', 3, NOW() - INTERVAL '25 days'),
(5, 'Sunita More', 'waste.officer@civic.gov', '$2a$10$xzb9aT6vPeibXX4izekCG.rquA8M5L6re/pxrhK29bYKUZfOvT5E2', '+91 98224 55667', 'EMPLOYEE', 4, NOW() - INTERVAL '25 days'),
-- Citizens (Password: citizen123)
(6, 'Ganesh Borade', 'ganesh@citizen.org', '$2a$10$0Pan1mqtJ/sq8UReOsgtTO6LpwvTCcTT6/cFu0Jk0GP.FhKLBxJBO', '+91 98900 12345', 'CITIZEN', NULL, NOW() - INTERVAL '20 days'),
(7, 'Aarav Mehta', 'citizen@civic.org', '$2a$10$0Pan1mqtJ/sq8UReOsgtTO6LpwvTCcTT6/cFu0Jk0GP.FhKLBxJBO', '+91 98901 67890', 'CITIZEN', NULL, NOW() - INTERVAL '15 days');

ALTER SEQUENCE users_id_seq RESTART WITH 8;

-- 4.3 Insert Complaints across Lifecycle States
INSERT INTO complaints (id, citizen_id, title, description, category, priority, latitude, longitude, address, status, ai_confidence, created_at, updated_at) VALUES
(1, 6, 'Large pothole near school entrance causing accidents', 'There is a large pothole near the primary school gate. School buses and two-wheelers are losing balance and vehicles are having severe difficulty passing.', 'ROAD_DAMAGE', 'HIGH', 18.5204, 73.8567, 'FC Road, near Modern High School, Shivajinagar, Pune', 'IN_PROGRESS', 0.94, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
(2, 7, 'Major water pipeline has burst and water is flooding houses', 'High pressure drinking water line ruptured under pavement. Huge volume of water is gushing onto the street and flooding nearby ground floor houses and shops.', 'WATER_LEAKAGE', 'CRITICAL', 18.5314, 73.8446, 'Senapati Bapat Road, near ICC Tech Park, Pune', 'ASSIGNED', 0.98, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 hour'),
(3, 6, 'Street light has not been working for the last 5 days', 'Four consecutive street light poles are dark near the community garden. Pedestrians and women feel unsafe walking after 8 PM.', 'STREET_LIGHT', 'MEDIUM', 18.5089, 73.8260, 'Paud Road, near Joggers Park, Kothrud, Pune', 'RESOLVED', 0.92, NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'),
(4, 7, 'Garbage container overflowing with street waste near vegetable market', 'The green community waste bins have not been emptied for 3 days. Animals are scattering the waste across the road causing severe stench.', 'GARBAGE_WASTE', 'HIGH', 18.5074, 73.8077, 'Karve Nagar Market, Pune', 'UNDER_REVIEW', 0.89, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
(5, 6, 'Open storm drain manhole lid missing near bus stop', 'Cement cover of roadside stormwater drain broken and collapsed. It poses an immediate fall risk for commuters boarding the PMT bus.', 'DRAINAGE_OVERFLOW', 'HIGH', 18.5362, 73.8300, 'Aundh Road, near Bremen Chowk, Pune', 'UNDER_REVIEW', 0.95, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours');

ALTER SEQUENCE complaints_id_seq RESTART WITH 6;

-- 4.4 Insert AI Analysis Results
INSERT INTO ai_analysis (id, complaint_id, category, priority, suggested_department, summary, confidence, ai_response, duplicate_of_id, image_tags, created_at) VALUES
(1, 1, 'ROAD_DAMAGE', 'HIGH', 'Road & Infrastructure Department', 'Detected asphalt depression measuring approx 1.2m diameter near school transit route. Recommended immediate cold patch repair.', 0.94, '{"hazardLevel": "HIGH", "structuralRisk": "MODERATE", "pedestrianSafety": "CRITICAL"}', NULL, 'pothole, asphalt, school_zone', NOW() - INTERVAL '1 day'),
(2, 2, 'WATER_LEAKAGE', 'CRITICAL', 'Water Supply & Sewerage', 'High velocity pressurized potable water discharge. Water loss estimated at 120 LPM with flood hazard to adjacent structures.', 0.98, '{"hazardLevel": "CRITICAL", "valveShutdownRequired": true, "infrastructureRisk": "SEVERE"}', NULL, 'water_burst, flood, pipeline', NOW() - INTERVAL '6 hours'),
(3, 3, 'STREET_LIGHT', 'MEDIUM', 'Electricity & Street Lighting', 'Illumination failure across consecutive poles #12 through #15. Suspected short circuit or failed circuit breaker.', 0.92, '{"hazardLevel": "MEDIUM", "publicSafetyImpact": "HIGH"}', NULL, 'darkness, streetlight, power_failure', NOW() - INTERVAL '4 days'),
(4, 4, 'GARBAGE_WASTE', 'HIGH', 'Solid Waste Management & Sanitation', 'Municipal container overflow exceeding 150% capacity with bio-waste spillage on public roadway.', 0.89, '{"hazardLevel": "HIGH", "healthRisk": "MODERATE"}', NULL, 'overflowing_bin, trash, sanitation', NOW() - INTERVAL '8 hours'),
(5, 5, 'DRAINAGE_OVERFLOW', 'HIGH', 'Stormwater & Drainage Department', 'Uncovered subterranean chamber posing severe fall hazard in high-density transit corridor.', 0.95, '{"hazardLevel": "HIGH", "fallHazard": "IMMEDIATE"}', NULL, 'open_manhole, broken_slab, pedestrian_danger', NOW() - INTERVAL '12 hours');

ALTER SEQUENCE ai_analysis_id_seq RESTART WITH 6;

-- 4.5 Insert Assignments
INSERT INTO assignments (id, complaint_id, department_id, employee_id, assigned_at, completed_at, notes) VALUES
(1, 1, 1, 2, NOW() - INTERVAL '18 hours', NULL, 'Dispatched road maintenance asphalt mixer crew with vibrating compactor.'),
(2, 2, 2, 3, NOW() - INTERVAL '4 hours', NULL, 'EMERGENCY: Valve shut-off ordered, main trunk repair team dispatched.'),
(3, 3, 3, 4, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', 'Faulty underground cable spliced and LED drivers replaced on poles #12 to #15.');

ALTER SEQUENCE assignments_id_seq RESTART WITH 4;

-- 4.6 Insert Complaint Images (Before / After Evidence)
INSERT INTO complaint_images (id, complaint_id, image_url, image_type, uploaded_at) VALUES
(1, 1, '/uploads/pothole_before.svg', 'BEFORE', NOW() - INTERVAL '1 day'),
(2, 1, '/uploads/pothole_after.svg', 'AFTER', NOW() - INTERVAL '2 hours'),
(3, 2, '/uploads/water_leak_before.svg', 'BEFORE', NOW() - INTERVAL '6 hours'),
(4, 3, '/uploads/streetlight_before.svg', 'BEFORE', NOW() - INTERVAL '4 days'),
(5, 3, '/uploads/streetlight_after.svg', 'AFTER', NOW() - INTERVAL '1 day'),
(6, 4, '/uploads/garbage_before.svg', 'BEFORE', NOW() - INTERVAL '8 hours'),
(7, 5, '/uploads/drain_before.svg', 'BEFORE', NOW() - INTERVAL '12 hours');

ALTER SEQUENCE complaint_images_id_seq RESTART WITH 8;

-- 4.7 Insert Status History Audit Trail
INSERT INTO complaint_status_history (id, complaint_id, old_status, new_status, changed_by, comment, changed_at) VALUES
(1, 1, 'SUBMITTED', 'UNDER_REVIEW', 1, 'AI analysis processed; reviewed by Admin.', NOW() - INTERVAL '23 hours'),
(2, 1, 'UNDER_REVIEW', 'ASSIGNED', 1, 'Assigned to Road Dept (Ramesh Sharma).', NOW() - INTERVAL '18 hours'),
(3, 1, 'ASSIGNED', 'IN_PROGRESS', 2, 'Road patch work started on site by field team.', NOW() - INTERVAL '4 hours'),
(4, 2, 'SUBMITTED', 'ASSIGNED', 1, 'Emergency high priority dispatch to Water Dept (Priya Patil).', NOW() - INTERVAL '4 hours'),
(5, 3, 'SUBMITTED', 'ASSIGNED', 1, 'Assigned to Electrical Dept (Suresh Deshmukh).', NOW() - INTERVAL '3 days'),
(6, 3, 'ASSIGNED', 'IN_PROGRESS', 4, 'Electrical lineman team deployed with hydraulic lift.', NOW() - INTERVAL '2 days'),
(7, 3, 'IN_PROGRESS', 'RESOLVED', 4, 'Streetlights restored, new LED drivers fitted, and tested.', NOW() - INTERVAL '1 day');

ALTER SEQUENCE complaint_status_history_id_seq RESTART WITH 8;

-- 4.8 Insert Citizen Feedback
INSERT INTO feedback (id, complaint_id, citizen_id, rating, comments, created_at) VALUES
(1, 3, 6, 5, 'Prompt and effective repair! The street is fully illuminated now. Great work team!', NOW() - INTERVAL '20 hours');

ALTER SEQUENCE feedback_id_seq RESTART WITH 2;

-- 4.9 Insert Notifications
INSERT INTO notifications (id, user_id, title, message, is_read, type, complaint_id, created_at) VALUES
(1, 6, 'Complaint Status Updated', 'Your complaint #1 (Pothole) is now IN_PROGRESS.', FALSE, 'STATUS_UPDATE', 1, NOW() - INTERVAL '4 hours'),
(2, 2, 'New Work Order Assigned', 'You have been assigned Complaint #1: Pothole on FC Road.', TRUE, 'ASSIGNMENT', 1, NOW() - INTERVAL '18 hours'),
(3, 3, 'Emergency Assignment', 'CRITICAL: Water pipeline burst on SB Road assigned to your unit.', FALSE, 'ASSIGNMENT', 2, NOW() - INTERVAL '4 hours'),
(4, 6, 'Complaint Resolved', 'Your complaint #3 (Street light) has been marked RESOLVED. Please provide feedback.', TRUE, 'STATUS_UPDATE', 3, NOW() - INTERVAL '1 day');

ALTER SEQUENCE notifications_id_seq RESTART WITH 5;


-- ============================================================================
-- 5. DEMO & PRESENTATION QUERIES FOR YOUR SIR / PROFESSOR
-- ============================================================================

-- DEMO QUERY 1: System User Directory & Municipal Roles
-- Proves role-based access control (Admin, Department Officers, Registered Citizens)
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.role, 
    COALESCE(d.name, 'Independent / Citizen') AS assigned_department,
    u.phone,
    u.created_at::DATE as registered_date
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
ORDER BY u.role, u.id;

-- DEMO QUERY 2: AI-Assisted Complaint Triage Dashboard
-- Shows automated category prediction, priority assessment, and AI confidence score
SELECT 
    c.id AS complaint_id,
    c.title,
    c.category AS human_or_reported_category,
    ai.category AS ai_classified_category,
    c.priority,
    ROUND((ai.confidence * 100)::numeric, 1) || '%' AS ai_confidence,
    ai.suggested_department,
    c.status
FROM complaints c
JOIN ai_analysis ai ON c.id = ai.complaint_id
ORDER BY c.created_at DESC;

-- DEMO QUERY 3: Officer Work Orders & Dispatch Status
-- Shows which officer is handling each complaint, department allocation, and turnaround
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

-- DEMO QUERY 4: Complaint Audit Trail & Status Timeline
-- Demonstrates full governance transparency: who changed what status and when
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
-- Demonstrates closed-loop governance: Before/After photo proof with citizen feedback
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
-- High-level department KPI breakdown of total, pending, and resolved complaints
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
