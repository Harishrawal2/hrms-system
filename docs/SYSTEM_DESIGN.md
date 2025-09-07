# HRMS System Design Documentation

## 1. High-Level Design (HLD)

### System Architecture Overview

The HRMS system follows a **3-tier layered architecture** with **Repository Pattern** and **Service-Oriented Architecture (SOA)** principles:

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
│                    API GATEWAY / LOAD BALANCER                  │
│                     (Rate Limiting, CORS)                      │
└─────────────────────────────────────────────────────────────────┘
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

### Core Components

#### 1. **API Gateway Layer**
- **Express.js Server**: Main HTTP server
- **Middleware Stack**: Authentication, CORS, Rate Limiting, Logging
- **Route Management**: Centralized routing with versioning

#### 2. **Application Services**
- **Authentication Service**: JWT, 2FA, Session Management
- **Employee Service**: Profile, Hierarchy, Document Management
- **Attendance Service**: Clock-in/out, Overtime, Shift Management
- **Leave Service**: Applications, Approvals, Policy Enforcement
- **Payroll Service**: Salary Calculation, Tax Deduction, Payslip Generation
- **Notification Service**: Real-time Alerts, Email Integration

#### 3. **Data Layer**
- **Primary Database**: MongoDB (Employee data, transactions)
- **Cache Layer**: Redis (Sessions, frequent queries)
- **File Storage**: Local/Cloud storage for documents
- **Search Engine**: MongoDB text search / Elasticsearch (optional)

#### 4. **External Integrations**
- **Email Service**: SMTP (Gmail, SendGrid, AWS SES)
- **File Storage**: AWS S3, Google Cloud Storage
- **Payment Gateway**: Stripe, Razorpay (for salary disbursement)
- **Biometric Systems**: REST API integration
- **Accounting Software**: QuickBooks, Tally integration

### Data Flow Architecture

```
Request Flow:
Client → API Gateway → Controller → Middleware → Service → DAO → Database
                                      ↓
Response Flow:
Client ← API Gateway ← Controller ← Service ← DAO ← Database
```

---

## 2. Low-Level Design (LLD)

### Module Structure

```
src/
├── config/           # Configuration management
├── controllers/      # HTTP request handlers
├── services/         # Business logic layer
├── dao/             # Data Access Objects (Repository)
├── models/          # Data models and interfaces
├── middleware/      # Custom middleware functions
├── routes/          # API route definitions
├── validations/     # Input validation schemas
├── utils/           # Utility functions and helpers
└── types/           # TypeScript type definitions
```

### Core Interfaces and Classes

#### 1. **Base Repository Interface**
```typescript
interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findMany(filters: any): Promise<{ data: T[]; total: number }>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

#### 2. **Service Layer Pattern**
```typescript
abstract class BaseService<T> {
  protected repository: IBaseRepository<T>;
  
  constructor(repository: IBaseRepository<T>) {
    this.repository = repository;
  }
  
  abstract validate(data: any): Promise<void>;
  abstract transform(data: any): any;
}
```

#### 3. **Controller Pattern**
```typescript
abstract class BaseController {
  protected handleRequest = (
    serviceMethod: Function
  ) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await serviceMethod(req.body, req.params, req.query);
      res.status(200).json(new ApiResponse(200, result));
    } catch (error) {
      next(error);
    }
  };
}
```

### Request/Response Flow

#### 1. **Authentication Flow**
```
POST /api/v1/auth/login
│
├── AuthController.login()
│   ├── Validation (Joi schema)
│   ├── AuthService.login()
│   │   ├── UserDAO.findByEmail()
│   │   ├── Password verification
│   │   ├── JWT token generation
│   │   └── Redis session storage
│   └── Response with tokens
```

#### 2. **Employee Management Flow**
```
GET /api/v1/employees?page=1&limit=10&department=IT
│
├── EmployeeController.getEmployees()
│   ├── Query validation
│   ├── Authentication middleware
│   ├── Authorization middleware
│   ├── EmployeeService.getEmployees()
│   │   ├── EmployeeDAO.findMany()
│   │   │   ├── Build MongoDB query
│   │   │   ├── Apply filters & pagination
│   │   │   └── Execute query
│   │   └── Transform response
│   └── Paginated response
```

### Data Models

#### 1. **User Entity**
```typescript
interface IUser {
  id: string;
  email: string;
  password: string;
  role: Role;
  customRoleId?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. **Employee Entity**
```typescript
interface IEmployee {
  id: string;
  employeeId: string;
  userId: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  emergencyContact: EmergencyContact;
  bankDetails?: BankDetails;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Security Architecture

#### 1. **Authentication Layers**
```
┌─────────────────┐
│   JWT Token     │ ← Access Token (15 min)
├─────────────────┤
│ Refresh Token   │ ← Long-lived (30 days)
├─────────────────┤
│ Redis Session   │ ← Server-side validation
├─────────────────┤
│ 2FA (Optional)  │ ← TOTP verification
└─────────────────┘
```

#### 2. **Authorization Matrix**
```
Permission System:
├── Default Roles (ADMIN, HR, MANAGER, EMPLOYEE)
├── Custom Roles (Admin-defined)
├── Granular Permissions (20+ permissions)
└── Resource-based Access Control
```

---

## 3. Scalability & Performance Considerations

### 1. **Database Optimization**
- **Indexing Strategy**: Compound indexes on frequently queried fields
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Efficient aggregation pipelines

### 2. **Caching Strategy**
- **Redis Caching**: Session data, frequent queries
- **Application-level Caching**: Configuration, user permissions
- **CDN Integration**: Static assets, documents

### 3. **Horizontal Scaling**
- **Stateless Services**: No server-side state storage
- **Load Balancing**: Multiple server instances
- **Database Sharding**: User-based or tenant-based partitioning

### 4. **Monitoring & Observability**
- **Logging**: Structured logging with Winston
- **Metrics**: Performance monitoring
- **Health Checks**: Service availability monitoring
- **Audit Trails**: Complete user action logging