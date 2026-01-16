# Frontend UI Skill

**Name:** `frontend-ui`  
**Description:** Build responsive pages, reusable components, layouts, and style them efficiently using modern frontend frameworks. Use for web application development with Next.js and Tailwind CSS.

---

## Instructions

### 1. Page Layouts
- Create flexible layouts using grid or flexbox.  
- Implement header, footer, sidebar, and content sections.  
- Ensure mobile-first and responsive design.

### 2. Components
- Build reusable UI components (buttons, cards, forms, modals).  
- Use props and states for dynamic behavior.  
- Maintain consistent spacing, typography, and colors.

### 3. Styling
- Use Tailwind CSS or CSS Modules for scoped styles.  
- Apply responsive utilities for different breakpoints.  
- Use animations and transitions for better UX.

### 4. Best Practices
- Keep components small and reusable.  
- Follow semantic HTML structure.  
- Optimize images and assets.  
- Ensure accessibility (ARIA attributes, keyboard navigation).

---

## Example Component

```jsx
// Example React Component
export default function Card({ title, description }) {
  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-lg transition">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-gray-600">{description}</p>
      <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Learn More
      </button>
    </div>
  );
}
