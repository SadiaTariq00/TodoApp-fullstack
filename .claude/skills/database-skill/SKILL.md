---
name: database-skill
description: Design and manage database schemas, tables, and migrations with best practices. Use for backend and full-stack applications.
---

# Database Skill – Schema & Migrations

## Instructions

1. **Schema Design**
   - Identify entities and relationships
   - Normalize tables (up to 3NF where applicable)
   - Define primary and foreign keys
   - Choose appropriate data types

2. **Table Creation**
   - Use clear, consistent naming conventions
   - Add constraints (NOT NULL, UNIQUE, CHECK)
   - Index frequently queried columns
   - Ensure referential integrity

3. **Migrations**
   - Create incremental, reversible migrations
   - Separate schema changes from data changes
   - Maintain migration order and history
   - Test migrations on staging before production

## Best Practices
- Avoid over-normalization
- Use snake_case for table and column names
- Always include timestamps (`created_at`, `updated_at`)
- Never edit existing migrations in production
- Document schema decisions clearly

## Example Structure
```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migration example
ALTER TABLE users
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
