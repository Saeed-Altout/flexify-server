-- =====================================================
-- FLEXIFY SERVER SAMPLE DATA
-- =====================================================
-- Insert sample data for testing and development
-- =====================================================

-- =====================================================
-- 1. INSERT SAMPLE USERS
-- =====================================================
-- Note: These are sample users for testing purposes.
-- All users have the password: "password123"
-- In production, users are created through the authentication system.

INSERT INTO users (id, email, name, password_hash, avatar_url, role, is_active, email_verified) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'john.doe@example.com', 'John Doe', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 'USER', true, true),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'jane.smith@example.com', 'Jane Smith', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', 'USER', true, true),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'mike.wilson@example.com', 'Mike Wilson', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 'USER', true, true),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'sarah.johnson@example.com', 'Sarah Johnson', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'USER', true, true),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'alex.brown@example.com', 'Alex Brown', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'USER', true, true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 2. INSERT SAMPLE TECHNOLOGIES
-- =====================================================
-- Additional technologies for testing

INSERT INTO technologies (name, description, category, icon_url, is_active) VALUES
('Vue.js', 'Progressive JavaScript framework', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', true),
('Angular', 'Platform for building mobile and desktop web applications', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg', true),
('Svelte', 'Cybernetically enhanced web apps', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg', true),
('Express.js', 'Fast, unopinionated web framework for Node.js', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', true),
('FastAPI', 'Modern, fast web framework for building APIs with Python', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg', true),
('Django', 'High-level Python web framework', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg', true),
('MongoDB', 'NoSQL database program', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', true),
('Redis', 'In-memory data structure store', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg', true),
('GraphQL', 'Query language for APIs', 'API', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg', true),
('Kubernetes', 'Container orchestration system', 'DevOps', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg', true),
('Terraform', 'Infrastructure as code tool', 'DevOps', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg', true),
('Figma', 'Collaborative interface design tool', 'Design', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. INSERT SAMPLE PROJECTS
-- =====================================================
-- Sample projects for testing

INSERT INTO projects (id, title, description, content, status, user_id, technologies, images, demo_url, github_url, is_public, is_featured) VALUES
('f6a7b8c9-d0e1-2345-fabc-456789012345', 'E-Commerce Platform', 'A full-stack e-commerce platform built with React and Node.js', 'This is a comprehensive e-commerce solution featuring user authentication, product catalog, shopping cart, payment integration, and admin dashboard. Built with modern web technologies and best practices.', 'completed', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'], ARRAY['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800'], 'https://ecommerce-demo.example.com', 'https://github.com/johndoe/ecommerce-platform', true, true),
('g7a8b9c0-e1f2-3456-gbcd-567890123456', 'Task Management App', 'A collaborative task management application with real-time updates', 'A modern task management solution with drag-and-drop functionality, real-time collaboration, team management, and progress tracking. Built with Vue.js and WebSocket integration.', 'active', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', ARRAY['c3d4e5f6-a7b8-9012-cdef-123456789012', 'd4e5f6a7-b8c9-0123-defa-234567890123'], ARRAY['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800'], 'https://taskapp-demo.example.com', 'https://github.com/janesmith/task-management', true, true),
('h8a9b0c1-f2e3-4567-hcde-678901234567', 'Weather Dashboard', 'Real-time weather information dashboard with location services', 'A responsive weather dashboard that provides current conditions, forecasts, and weather maps. Features location-based services, weather alerts, and customizable widgets.', 'in_progress', 'c3d4e5f6-a7b8-9012-cdef-123456789012', ARRAY['e5f6a7b8-c9d0-1234-efab-345678901234'], ARRAY['https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800'], 'https://weather-demo.example.com', 'https://github.com/mikewilson/weather-dashboard', true, false),
('i9a0b1c2-e3f4-5678-idef-789012345678', 'Portfolio Website', 'Personal portfolio website with blog and project showcase', 'A modern, responsive portfolio website featuring a clean design, blog functionality, project showcase, and contact form. Built with Next.js and Tailwind CSS.', 'completed', 'd4e5f6a7-b8c9-0123-defa-234567890123', ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'], ARRAY['https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800'], 'https://sarahjohnson.dev', 'https://github.com/sarahjohnson/portfolio', true, false),
('j0a1b2c3-f4e5-6789-jfgh-890123456789', 'API Gateway', 'Microservices API gateway with authentication and rate limiting', 'A robust API gateway solution for microservices architecture featuring authentication, rate limiting, load balancing, and monitoring. Built with Express.js and Redis.', 'planning', 'e5f6a7b8-c9d0-1234-efab-345678901234', ARRAY['c3d4e5f6-a7b8-9012-cdef-123456789012'], ARRAY[], 'https://api-gateway-docs.example.com', 'https://github.com/alexbrown/api-gateway', false, false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. INSERT SAMPLE MESSAGES
-- =====================================================
-- Sample contact messages for testing

INSERT INTO messages (id, name, email, subject, message, status, user_id, ip_address, user_agent) VALUES
('k1a2b3c4-d5e6-7890-kabc-901234567890', 'Alice Johnson', 'alice.johnson@example.com', 'Project Collaboration Inquiry', 'Hi! I saw your portfolio and I am very impressed with your work. I would like to discuss a potential collaboration on a new project. Could we schedule a call this week?', 'unread', null, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('l2a3b4c5-e6f7-8901-labd-012345678901', 'Bob Smith', 'bob.smith@example.com', 'Freelance Opportunity', 'Hello! I am looking for a skilled developer to help with our startup project. Your experience with React and Node.js is exactly what we need. Are you available for freelance work?', 'read', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('m3a4b5c6-f7e8-9012-mbce-123456789012', 'Carol Davis', 'carol.davis@example.com', 'Technical Consultation', 'I need some technical advice on implementing a real-time chat feature in my web application. Could you provide some guidance on the best approach?', 'replied', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('n4a5b6c7-e8f9-0123-ncdf-234567890123', 'David Wilson', 'david.wilson@example.com', 'Job Opportunity', 'We have an opening for a Senior Full Stack Developer at our company. Your portfolio shows excellent skills that would be a great fit. Would you be interested in learning more?', 'unread', null, '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'),
('o5a6b7c8-f9e0-1234-odeg-345678901234', 'Emma Brown', 'emma.brown@example.com', 'Partnership Proposal', 'I am the founder of a tech startup and I would like to discuss a potential partnership. Your expertise in modern web technologies would be valuable for our project.', 'read', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '192.168.1.104', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. INSERT SAMPLE MESSAGE REPLIES
-- =====================================================
-- Sample replies to messages

INSERT INTO message_replies (id, message_id, user_id, reply, created_at, updated_at) VALUES
('p6a7b8c9-e0f1-2345-pefh-456789012345', 'm3a4b5c6-f7e8-9012-mbce-123456789012', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Thank you for reaching out! For implementing real-time chat, I recommend using WebSockets with Socket.io for Node.js or Pusher for a managed solution. The key considerations are scalability, message persistence, and user presence. Would you like me to elaborate on any specific aspect?', NOW(), NOW()),
('q7a8b9c0-f1e2-3456-qfgi-567890123456', 'l2a3b4c5-e6f7-8901-labd-012345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Hi Bob! Thank you for considering me for your startup project. I am definitely interested in freelance opportunities. Could you tell me more about the project scope, timeline, and budget? I would love to discuss how I can contribute to your success.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FLEXIFY SERVER SAMPLE DATA INSERTED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Sample data includes:';
    RAISE NOTICE '- 5 sample users (password: password123)';
    RAISE NOTICE '- 12 additional technologies';
    RAISE NOTICE '- 5 sample projects';
    RAISE NOTICE '- 5 sample messages';
    RAISE NOTICE '- 2 sample message replies';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Sample data ready for testing!';
    RAISE NOTICE '=====================================================';
END $$;