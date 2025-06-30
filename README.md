# Ignite Student Portal

A comprehensive student management system built with React (frontend) and Express.js with PostgreSQL (backend).

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Admin can manage students and other admins
- **Brigade Management**: Organize students into brigades
- **Event Management**: Create and manage events with detailed planning
- **Activity Planning**: Schedule activities with submission requirements
- **Submission System**: Students can submit files, text, or links
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **File Upload**: Secure file upload with validation
- **Real-time Updates**: Live data updates across the application

## Tech Stack

### Backend
- **Express.js**: Web framework
- **PostgreSQL**: Database
- **Prisma**: ORM and database toolkit
- **JWT**: Authentication
- **Winston**: Logging
- **Multer**: File upload handling
- **bcryptjs**: Password hashing

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Component library
- **React Router**: Navigation
- **Axios**: HTTP client
- **Recharts**: Data visualization

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and other settings
```

4. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

5. Seed the database:
```bash
npm run db:seed
```

6. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

4. Start development server:
```bash
npm run dev
```

## Default Login Credentials

After seeding the database:

**Admin Login:**
- Email: admin@ignite.edu
- Password: admin123

**Student Login (examples):**
- Roll Number: CS2021001
- Password: student123

(Roll numbers CS2021001 through CS2021010 are available)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Brigades
- `GET /api/brigades` - Get all brigades
- `POST /api/brigades` - Create brigade (Admin only)
- `PUT /api/brigades/:id` - Update brigade (Admin only)
- `DELETE /api/brigades/:id` - Delete brigade (Admin only)

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)

### Event Plans
- `GET /api/event-plans` - Get event plans
- `POST /api/event-plans` - Create event plan (Admin only)
- `PUT /api/event-plans/:id` - Update event plan (Admin only)
- `DELETE /api/event-plans/:id` - Delete event plan (Admin only)

### Submissions
- `GET /api/submissions` - Get submissions
- `POST /api/submissions` - Create submission (Students only)
- `PUT /api/submissions/:id/status` - Update submission status (Admin only)
- `DELETE /api/submissions/:id` - Delete submission (Admin only)

### Analytics
- `GET /api/analytics` - Get analytics data (Admin only)

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities:

- **Users**: Admin and student accounts
- **Brigades**: Student groups/teams
- **Events**: Main events (e.g., orientation)
- **EventPlans**: Specific activities within events
- **Submissions**: Student submissions for activities

## File Upload

Files are uploaded to the `backend/uploads` directory and served statically. Supported file types:
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX, TXT

## Logging

The application uses Winston for comprehensive logging:
- **Console**: Development logging
- **Files**: Production logging (error.log, combined.log)
- **Database**: Query logging in development

## Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Helmet security headers

## Development

### Database Operations

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create and run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Building for Production

Backend:
```bash
npm run build
npm start
```

Frontend:
```bash
npm run build
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.