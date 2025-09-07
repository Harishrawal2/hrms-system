# HRMS Backend System with Prisma

A comprehensive Human Resource Management System backend built with Node.js, Express, Prisma ORM, MongoDB, Redis, and TypeScript following repository pattern architecture.

## 🏗️ System Architecture

### High-Level Design (HLD)

The HRMS system follows a **3-tier layered architecture** with **Repository Pattern** and **Service-Oriented Architecture (SOA)**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web App   │  │ Mobile App  │  │ Third-party │             │
│  │  (React)    │  │ (React N.)  │  │ Integrations│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                         HTTP/HTTPS
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Controllers │  │ Middleware  │  │ Validations │             │
│  │ (HTTP Layer)│  │ (Auth/RBAC) │  │ (Joi/Zod)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       BUSINESS LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Services   │  │   Utils     │  │   Config    │             │
│  │ (Bus. Logic)│  │ (Helpers)   │  │ (Settings)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    DAOs     │  │   Prisma    │  │   Models    │             │
│  │(Repository) │  │   Client    │  │ (Entities)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       STORAGE LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  MongoDB    │  │    Redis    │  │ File System │             │
│  │ (Primary)   │  │  (Cache)    │  │ (Documents) │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Low-Level Design (LLD)

#### Request/Response Flow

```
Request Flow:
Client → API Gateway → Controller → Middleware → Service → DAO → Database
                                      ↓
Response Flow:
Client ← API Gateway ← Controller ← Service ← DAO ← Database
```

#### Core Design Patterns

- **Repository Pattern**: Clean separation between data access and business logic
- **Service Layer Pattern**: Centralized business logic with validation and transformation
- **Controller Pattern**: HTTP request/response handling with standardized error management
- **Dependency Injection**: Loose coupling between components for better testability

## 🚀 Features

### Core Modules

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Employee Management**: Complete employee lifecycle management with repository pattern
- **Attendance Management**: Clock in/out, overtime tracking, location-based attendance
- **Leave Management**: Leave applications, approval workflows, balance tracking
- **Payroll Processing**: Salary calculations, payslip generation, payment tracking
- **Recruitment**: Job postings and application management
- **Performance Management**: Goal setting, appraisals, feedback systems
- **Custom Roles & Permissions**: Admin-configurable role-based access control
- **Document Management**: Secure file upload, verification, and storage
- **Notifications**: Real-time in-app notifications with email integration
- **2FA Authentication**: TOTP-based two-factor authentication for enhanced security
- **Audit Logging**: Complete system activity tracking for compliance
- **Analytics Dashboard**: Comprehensive reporting and data visualization

### Technical Features

- **Prisma ORM** for type-safe database operations
- **Repository Pattern** for clean data access layer
- **Service Layer** for business logic separation
- **TypeScript** for complete type safety
- **MongoDB** with optimized schemas and indexing
- **Redis** for caching and session management
- **JWT authentication** with refresh tokens
- **Advanced RBAC** with custom roles and granular permissions
- **Comprehensive input validation** with Joi
- **Error handling and logging** with Winston
- **Rate limiting** and security middleware
- **Email notifications** with HTML templates
- **File upload** with type validation and security
- **Pagination, filtering, and sorting** on all list endpoints

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Redis (v6.0 or higher)
- TypeScript

## ⚡ Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Environment Variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database connections and secrets
   ```

3. **Generate Prisma Client**

   ```bash
   npm run db:generate
   ```

4. **Push Database Schema**

   ```bash
   npm run db:push
   ```

5. **Seed Database** (Optional)

   ```bash
   npm run db:seed
   ```

6. **Start Development Server**

   ```bash
   npm run dev
   ```

7. **Access API Documentation**

   ```
   http://localhost:5000/api-docs
   ```

8. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📚 API Documentation

The system includes comprehensive Swagger/OpenAPI documentation accessible at:

- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-domain.com/api-docs

### Key Features:

- **Interactive API Explorer**: Test APIs directly from the documentation
- **Request/Response Examples**: Complete examples for all endpoints
- **Authentication**: Built-in JWT token authentication
- **Schema Validation**: Detailed request/response schemas
- **Error Handling**: Comprehensive error response documentation

## 🏗️ Architecture

### Repository Pattern Structure

```
src/
├── config/          # Database and external service configurations
├── dao/             # Data Access Objects (Repository layer)
├── services/        # Business logic layer
├── controllers/     # HTTP request handlers
├── routes/          # API route definitions
├── middleware/      # Custom middleware functions
├── validations/     # Input validation schemas
└── utils/           # Utility functions and helpers
```

### Key Components

#### Data Access Layer (DAO)

- **UserDAO**: User account operations
- **EmployeeDAO**: Employee profile management
- **AttendanceDAO**: Attendance record operations
- **LeaveDAO**: Leave application management
- **PayrollDAO**: Payroll processing operations
- **JobPostingDAO**: Recruitment job management
- **PerformanceDAO**: Performance review operations

#### Service Layer

- **AuthService**: Authentication and authorization logic
- **EmployeeService**: Employee management business logic
- **AttendanceService**: Attendance tracking and calculations
- **LeaveService**: Leave policy enforcement and workflows
- **PayrollService**: Salary calculations and processing
- **RecruitmentService**: Job posting and application management
- **PerformanceService**: Performance review workflows

## 🗄️ Database Schema

### Prisma Models

- **User**: Authentication and user accounts
- **Employee**: Employee profiles and professional information
- **Attendance**: Daily attendance records with clock in/out
- **Leave**: Leave applications and approvals
- **Payroll**: Monthly payroll processing records
- **JobPosting**: Job postings for recruitment
- **Performance**: Performance reviews and goals

### Key Features

- **Type-safe database operations** with Prisma
- **Automatic relationship management**
- **Built-in validation** at database level
- **Optimized queries** with proper indexing
- **Migration system** for schema changes

## 🔐 API Authentication

### Default Credentials (after seeding)

- **Admin**: admin@company.com / admin123
- **HR**: hr@company.com / hr123
- **Manager**: manager@company.com / manager123
- **Employee**: employee@company.com / employee123

### Authentication Flow

1. POST `/api/v1/auth/login` - Get access and refresh tokens
2. Include `Authorization: Bearer <token>` in all protected routes
3. Use `/api/v1/auth/refresh-token` to refresh expired tokens

## 📚 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/2fa/setup` - Setup 2FA authentication
- `POST /api/v1/auth/2fa/verify` - Verify 2FA token
- `POST /api/v1/auth/logout-all` - Logout from all sessions
- `GET /api/v1/auth/sessions` - Get active sessions

### User Management

- `GET /api/v1/users` - List users with filtering and pagination
- `GET /api/v1/users/stats` - Get user statistics
- `PUT /api/v1/users/:id` - Update user (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Custom Roles & Permissions (Admin Only)

- `POST /api/v1/roles` - Create custom role
- `GET /api/v1/roles` - List custom roles
- `GET /api/v1/roles/permissions` - Get available permissions
- `GET /api/v1/roles/:id` - Get role details
- `PUT /api/v1/roles/:id` - Update custom role
- `DELETE /api/v1/roles/:id` - Delete custom role

### Department Management

- `POST /api/v1/departments` - Create department (Admin/HR)
- `GET /api/v1/departments` - List departments
- `GET /api/v1/departments/:id` - Get department details
- `PUT /api/v1/departments/:id` - Update department (Admin/HR)
- `DELETE /api/v1/departments/:id` - Delete department (Admin)

### Document Management

- `POST /api/v1/documents/upload` - Upload document
- `GET /api/v1/documents/:employeeId` - Get employee documents
- `GET /api/v1/documents` - List all documents (Admin/HR)
- `PATCH /api/v1/documents/:id/verify` - Verify document (Admin/HR)
- `DELETE /api/v1/documents/:id` - Delete document

### Notifications

- `GET /api/v1/notifications` - Get user notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PATCH /api/v1/notifications/mark-all-read` - Mark all as read
- `PATCH /api/v1/notifications/:id/read` - Mark notification as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Audit Logs (Admin Only)

- `GET /api/v1/audit/logs` - Get audit logs with filtering

### Employee Management

- `POST /api/v1/employees` - Create employee (Admin/HR)
- `GET /api/v1/employees` - List employees with filtering and pagination (Admin/HR/Manager)
- `GET /api/v1/employees/departments` - Get all departments
- `GET /api/v1/employees/designations` - Get all designations
- `GET /api/v1/employees/:id` - Get employee details
- `PUT /api/v1/employees/:id` - Update employee (Admin/HR)
- `PATCH /api/v1/employees/:id/deactivate` - Deactivate employee (Admin/HR)
- `GET /api/v1/employees/team` - Get team members (Manager)

### Attendance Management

- `POST /api/v1/attendance/clock-in` - Clock in
- `POST /api/v1/attendance/clock-out` - Clock out
- `GET /api/v1/attendance` - Get attendance records with filtering and pagination (Admin/HR/Manager)
- `GET /api/v1/attendance/summary` - Get attendance summary (Admin/HR/Manager)
- `GET /api/v1/attendance/:employeeId/monthly` - Get monthly attendance
- `PUT /api/v1/attendance/:id` - Update attendance (Admin/HR)

### Leave Management

- `POST /api/v1/leaves` - Apply for leave
- `GET /api/v1/leaves` - Get leave applications with filtering and pagination
- `PATCH /api/v1/leaves/:id/approve` - Approve/reject leave (Admin/HR/Manager)
- `PATCH /api/v1/leaves/:id/cancel` - Cancel leave application
- `GET /api/v1/leaves/:employeeId/balance` - Get leave balance

### Payroll Management

- `POST /api/v1/payroll` - Process payroll (Admin/HR)
- `GET /api/v1/payroll` - Get payroll records with filtering and pagination (Admin/HR/Manager)
- `GET /api/v1/payroll/summary` - Get payroll summary (Admin/HR)
- `GET /api/v1/payroll/:payrollId/payslip` - Generate payslip
- `PATCH /api/v1/payroll/:id/status` - Update payroll status (Admin/HR)

### Recruitment Management

- `POST /api/v1/recruitment/jobs` - Create job posting (Admin/HR)
- `GET /api/v1/recruitment/jobs` - Get job postings
- `GET /api/v1/recruitment/jobs/active` - Get active job postings
- `GET /api/v1/recruitment/jobs/:id` - Get job posting details
- `PUT /api/v1/recruitment/jobs/:id` - Update job posting (Admin/HR)
- `PATCH /api/v1/recruitment/jobs/:id/deactivate` - Deactivate job posting (Admin/HR)
- `POST /api/v1/recruitment/jobs/:jobId/apply` - Apply for job

### Performance Management

- `POST /api/v1/performance/reviews` - Create performance review (Admin/HR/Manager)
- `GET /api/v1/performance/reviews` - Get performance reviews
- `GET /api/v1/performance/reviews/summary` - Get performance summary (Admin/HR)
- `GET /api/v1/performance/reviews/:id` - Get performance review details
- `PUT /api/v1/performance/reviews/:id` - Update performance review (Admin/HR/Manager)
- `PATCH /api/v1/performance/reviews/:id/submit` - Submit performance review

## 🔐 Custom Roles & Permissions System

The system now supports custom roles with granular permissions:

### Default Roles

- **ADMIN**: Full system access (all permissions)
- **HR**: Employee, leave, payroll, recruitment management
- **MANAGER**: Team management, leave approvals, attendance viewing
- **EMPLOYEE**: Self-service operations

### Custom Roles

Admins can create custom roles with specific permissions:

```json
{
  "name": "Senior Manager",
  "description": "Senior management with extended permissions",
  "permissions": [
    "employee.read",
    "employee.update",
    "leave.approve",
    "payroll.read",
    "performance.manage",
    "analytics.read"
  ]
}
```

### Available Permissions

- **User Management**: `user.create`, `user.read`, `user.update`, `user.delete`
- **Employee Management**: `employee.create`, `employee.read`, `employee.update`, `employee.delete`
- **Attendance**: `attendance.read`, `attendance.update`, `attendance.approve`
- **Leave Management**: `leave.apply`, `leave.read`, `leave.approve`, `leave.cancel`
- **Payroll**: `payroll.process`, `payroll.read`, `payroll.update`
- **Recruitment**: `recruitment.create`, `recruitment.read`, `recruitment.update`
- **Performance**: `performance.create`, `performance.read`, `performance.update`
- **Analytics**: `analytics.read`, `reports.generate`
- **System**: `system.settings`, `roles.manage`, `audit.read`
- **Documents**: `documents.upload`, `documents.read`, `documents.verify`
- **Organization**: `departments.manage`, `designations.manage`

## 🔒 Two-Factor Authentication (2FA)

Enhanced security with TOTP-based 2FA:

1. **Setup 2FA**: `POST /api/v1/auth/2fa/setup` - Returns QR code and secret
2. **Verify 2FA**: `POST /api/v1/auth/2fa/verify` - Verify OTP token
3. **Login with 2FA**: Include OTP token in login request when enabled

## 🛠️ Development Commands

### Database Operations

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and apply migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (Database browser)
npm run db:studio
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## 🛡️ Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT tokens** with secure secrets and expiration
- **Rate limiting** to prevent abuse
- **Input validation** with Joi schemas
- **SQL injection prevention** through Prisma
- **CORS configuration** for cross-origin requests
- **Helmet.js** security headers
- **Session management** with Redis
- **Token blacklisting** for secure logout
- **Role-based access control** on all endpoints
- **Two-factor authentication** with TOTP
- **Audit logging** for compliance
- **File upload security** with type validation

## 📊 Monitoring & Logging

- **Winston logger** with file and console output
- **Request logging** with Morgan
- **Error tracking** with stack traces
- **Audit trails** for user actions
- **Performance monitoring** ready
- **Prisma query logging** in development

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB and Redis URLs
3. Set secure JWT secrets
4. Run database migrations: `npm run db:migrate`
5. Build the application: `npm run build`
6. Start the server: `npm start`

## 🔄 Database Migrations

Prisma provides a robust migration system:

```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 📖 Development Notes

### Repository Pattern Benefits

- **Separation of concerns**: Data access logic separated from business logic
- **Testability**: Easy to mock data access for unit testing
- **Maintainability**: Changes to data access don't affect business logic
- **Flexibility**: Easy to switch between different data sources

### Service Layer Benefits

- **Business logic centralization**: All business rules in one place
- **Reusability**: Services can be used by multiple controllers
- **Transaction management**: Complex operations with multiple data sources
- **Validation**: Business rule validation before data persistence

### Prisma Advantages

- **Type safety**: Generated types for all database operations
- **Auto-completion**: IntelliSense support for queries
- **Migration system**: Version-controlled schema changes
- **Query optimization**: Automatic query optimization
- **Relationship management**: Easy handling of complex relationships

### Clean Architecture Benefits

- **Scalability**: Easy to add new features without affecting existing code
- **Maintainability**: Clear separation of concerns makes code easier to maintain
- **Testability**: Each layer can be tested independently
- **Reusability**: Common patterns can be reused across different modules

### Analytics & Reports

- `GET /api/v1/analytics/dashboard` - Get dashboard statistics
- `GET /api/v1/analytics/employees` - Get employee analytics
- `GET /api/v1/analytics/attendance` - Get attendance analytics
- `GET /api/v1/analytics/leaves` - Get leave analytics
- `GET /api/v1/analytics/payroll` - Get payroll analytics

## 🔍 API Query Parameters

### Pagination

All list endpoints support pagination:

```
GET /api/v1/employees?page=2&limit=20
```

### Sorting

Sort by any field (prefix with `-` for descending):

```
GET /api/v1/employees?sort=-createdAt,firstName
GET /api/v1/attendance?sort=date,-clockIn
```

### Filtering

Filter by various criteria:

```
GET /api/v1/employees?department=Engineering&isActive=true
GET /api/v1/leaves?status=PENDING&leaveType=SICK
GET /api/v1/attendance?startDate=2024-01-01&endDate=2024-01-31
```

### Search

Search across multiple fields:

```
GET /api/v1/employees?search=john
GET /api/v1/users?search=admin&role=ADMIN
GET /api/v1/departments?search=engineering
GET /api/v1/notifications?type=LEAVE_APPLIED
```

## 📧 Enhanced Email System

### Automated Notifications

- **Registration**: Email verification with secure tokens
- **Password Reset**: Secure reset flow with time-limited tokens
- **Leave Management**: Application, approval, rejection notifications
- **Payroll**: Salary processing confirmations
- **Document Upload**: Verification notifications
- **Training**: Course enrollment and completion alerts

### Email Templates

All emails use responsive HTML templates with company branding and clear call-to-action buttons.

## 📊 Advanced Analytics

### Dashboard Statistics

- Employee metrics (total, active, by department)
- Attendance trends and patterns
- Leave utilization and patterns
- Payroll summaries and costs
- Performance ratings distribution

### Detailed Reports

- **Recruitment Analytics**: Application funnel, time-to-hire, source effectiveness
- **Performance Trends**: Department-wise ratings, goal completion rates
- **Turnover Analysis**: Attrition rates, exit patterns, retention metrics

## 🔔 Real-time Notifications

### Notification Types

- Leave applications and approvals
- Payroll processing updates
- Document upload confirmations
- Training assignments
- System alerts and announcements

### Features

- Real-time delivery
- Read/unread status tracking
- Bulk mark as read
- Notification history
- Unread count badges

## 📧 Email Features

### Automated Email Notifications

- **Welcome emails** for new employees with temporary credentials
- **Email verification** for account security
- **Password reset** with secure token-based flow
- **Leave notifications** for applications, approvals, and rejections
- **Payroll notifications** when salary is processed

### Email Templates

All emails use responsive HTML templates with:

- Company branding and styling
- Clear call-to-action buttons
- Security information and expiration times
- Professional formatting

## 🔧 Configuration

### Environment Variables

All configuration is handled through environment variables. Copy `.env.example` to `.env` and update the values:

- **Database**: MongoDB connection string
- **Redis**: Redis connection URL
- **JWT**: Secret keys and expiration times
- **Email**: SMTP configuration for notifications
- **Frontend**: Frontend URL for email links
- **Security**: Bcrypt rounds, rate limiting settings
- **Company**: Company information for payslips

### Role Permissions

- **ADMIN**: Full system access
- **HR**: Employee, leave, payroll, recruitment management
- **MANAGER**: Team management, leave approvals, attendance viewing
- **EMPLOYEE**: Self-service operations, leave applications

## 🧪 Testing

The system is designed with testability in mind:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Performance Optimization

- **Database indexing** on frequently queried fields
- **Redis caching** for session management
- **Connection pooling** with Prisma
- **Query optimization** with proper relations
- **Pagination** on all list endpoints
- **Compression** middleware for response optimization

## 🔮 Future Enhancements

- **GraphQL API** for mobile app optimization
- **WebSocket integration** for real-time features
- **Multi-tenancy** support for SaaS deployment
- **Advanced reporting** with charts and visualizations
- **Integration APIs** for biometric and accounting systems
- **Machine learning** for predictive analytics
- **Microservices architecture** for large-scale deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

This project created for my learning purpose.
