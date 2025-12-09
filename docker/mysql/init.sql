-- Initialize database with proper charset
ALTER DATABASE budget_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant all privileges to the application user
GRANT ALL PRIVILEGES ON budget_manager.* TO 'budget_user'@'%';
FLUSH PRIVILEGES;
