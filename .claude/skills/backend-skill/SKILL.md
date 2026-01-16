---
name: backend-skill
description: Generate backend API routes, handle requests/responses, and connect to databases. Use for backend and full-stack applications.
---

# Backend Skill – Routes, Requests & Database Handling

## Instructions

### 1. API Route Design
- Design RESTful or RPC-style endpoints  
- Use clear, consistent URL naming conventions  
- Apply correct HTTP methods (GET, POST, PUT, DELETE)  

### 2. Request & Response Handling
- Validate request body, query params, and headers  
- Return structured JSON responses  
- Use appropriate HTTP status codes  
- Implement centralized error handling  

### 3. Database Integration
- Connect to SQL or NoSQL databases  
- Use ORM/ODM or raw queries as needed  
- Implement CRUD operations efficiently  
- Handle connections and pooling properly  

### 4. Security & Reliability
- Sanitize inputs to prevent injections  
- Add authentication and authorization hooks  
- Use environment-based configuration for sensitive data  
- Log errors and monitor request performance  

## Best Practices
- Keep controllers thin, move logic to service layers  
- Use async/await with proper error handling  
- Never expose sensitive data in responses  
- Use transactions for critical DB operations  
- Follow separation of concerns and maintain modularity  

## Example Structure
```js
// routes/user.routes.js
router.post("/users", async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
