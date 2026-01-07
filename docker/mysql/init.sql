-- Initialize Tesseract Database
-- This script runs when the MySQL container is first created

CREATE DATABASE IF NOT EXISTS tesseract CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tesseract;

-- Tables will be created automatically by TypeORM synchronize feature
-- This file can be used for initial data seeding if needed
