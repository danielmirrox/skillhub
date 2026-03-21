-- SkillHub local PostgreSQL bootstrap
-- Run with:
-- psql -U postgres -h localhost -p 5432 -f scripts/local-postgres-setup.sql

CREATE DATABASE skillhub;
CREATE USER skillhub_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE skillhub TO skillhub_user;
