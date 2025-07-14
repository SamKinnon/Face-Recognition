-- Create database
CREATE DATABASE IF NOT EXISTS face_recognition;
USE face_recognition;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    face_encoding TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Create face_logs table for tracking face recognition attempts
CREATE TABLE IF NOT EXISTS face_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type ENUM('register', 'login_success', 'login_failed') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);

-- Create system_settings table for configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('face_similarity_threshold', '0.6', 'Threshold for face matching (lower = more strict)'),
('max_login_attempts', '5', 'Maximum failed login attempts before lockout'),
('liveness_detection_enabled', 'true', 'Enable liveness detection during registration and login'),
('face_encoding_version', '1.0', 'Version of face encoding algorithm used')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
