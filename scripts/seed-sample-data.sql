-- Insert sample system configurations
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('registration_enabled', 'true', 'Allow new user registrations'),
('maintenance_mode', 'false', 'System maintenance mode'),
('log_retention_days', '90', 'Number of days to keep face recognition logs'),
('security_level', 'high', 'Security level: low, medium, high')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_face_logs_created_at ON face_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Create view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.created_at,
    u.last_login,
    u.is_active,
    COUNT(fl.id) as total_attempts,
    SUM(CASE WHEN fl.action_type = 'login_success' THEN 1 ELSE 0 END) as successful_logins,
    SUM(CASE WHEN fl.action_type = 'login_failed' THEN 1 ELSE 0 END) as failed_attempts
FROM users u
LEFT JOIN face_logs fl ON u.id = fl.user_id
GROUP BY u.id, u.name, u.email, u.created_at, u.last_login, u.is_active;
