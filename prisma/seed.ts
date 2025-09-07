import { PrismaClient, Role, Gender, MaritalStatus, EmploymentType, WorkLocation } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.performance.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.jobPosting.deleteMany();
  // Break manager-employee relationship to avoid required relation violation
  await prisma.employee.updateMany({ data: { managerId: null } });
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const hashedHrPassword = await bcrypt.hash('hr123', 12);
  const hashedManagerPassword = await bcrypt.hash('manager123', 12);
  const hashedEmployeePassword = await bcrypt.hash('employee123', 12);

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
      employeeId: 'EMP001'
    }
  });

  const hrUser = await prisma.user.create({
    data: {
      email: 'hr@company.com',
      password: hashedHrPassword,
      role: 'HR',
      employeeId: 'EMP002'
    }
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@company.com',
      password: hashedManagerPassword,
      role: 'MANAGER',
      employeeId: 'EMP003'
    }
  });

  const employeeUser = await prisma.user.create({
    data: {
      email: 'employee@company.com',
      password: hashedEmployeePassword,
      role: 'EMPLOYEE',
      employeeId: 'EMP004'
    }
  });

  // Create employees
  const adminEmployee = await prisma.employee.create({
    data: {
      employeeId: 'EMP001',
      userId: adminUser.id,
      personalInfo: {
        firstName: 'John',
        lastName: 'Admin',
        dateOfBirth: new Date('1985-01-15'),
        gender: 'MALE',
        maritalStatus: 'MARRIED',
        nationality: 'Indian',
        phone: '+91-9876543210',
        address: {
          street: '123 Admin Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India'
        }
      },
      professionalInfo: {
        designation: 'System Administrator',
        department: 'IT',
        joiningDate: new Date('2020-01-01'),
        employmentType: 'PERMANENT',
        workLocation: 'OFFICE'
      },
      emergencyContact: {
        name: 'Jane Admin',
        relation: 'Wife',
        phone: '+91-9876543211',
        email: 'jane.admin@email.com'
      },
      bankDetails: {
        accountNumber: '1234567890',
        bankName: 'State Bank of India',
        branchName: 'Mumbai Main',
        ifscCode: 'SBIN0000123',
        accountHolderName: 'John Admin'
      }
    }
  });

  const hrEmployee = await prisma.employee.create({
    data: {
      employeeId: 'EMP002',
      userId: hrUser.id,
      personalInfo: {
        firstName: 'Sarah',
        lastName: 'Smith',
        dateOfBirth: new Date('1988-05-20'),
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        nationality: 'Indian',
        phone: '+91-9876543212',
        address: {
          street: '456 HR Avenue',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        }
      },
      professionalInfo: {
        designation: 'HR Manager',
        department: 'Human Resources',
        joiningDate: new Date('2019-03-15'),
        employmentType: 'PERMANENT',
        workLocation: 'OFFICE'
      },
      emergencyContact: {
        name: 'Robert Smith',
        relation: 'Father',
        phone: '+91-9876543213'
      },
      bankDetails: {
        accountNumber: '2345678901',
        bankName: 'HDFC Bank',
        branchName: 'Bangalore Central',
        ifscCode: 'HDFC0000234',
        accountHolderName: 'Sarah Smith'
      }
    }
  });

  const managerEmployee = await prisma.employee.create({
    data: {
      employeeId: 'EMP003',
      userId: managerUser.id,
      personalInfo: {
        firstName: 'Michael',
        lastName: 'Johnson',
        dateOfBirth: new Date('1982-08-10'),
        gender: 'MALE',
        maritalStatus: 'MARRIED',
        nationality: 'Indian',
        phone: '+91-9876543214',
        address: {
          street: '789 Manager Lane',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India'
        }
      },
      professionalInfo: {
        designation: 'Engineering Manager',
        department: 'Engineering',
        joiningDate: new Date('2018-06-01'),
        employmentType: 'PERMANENT',
        workLocation: 'HYBRID'
      },
      emergencyContact: {
        name: 'Lisa Johnson',
        relation: 'Wife',
        phone: '+91-9876543215',
        email: 'lisa.johnson@email.com'
      },
      bankDetails: {
        accountNumber: '3456789012',
        bankName: 'ICICI Bank',
        branchName: 'Delhi Main',
        ifscCode: 'ICIC0000345',
        accountHolderName: 'Michael Johnson'
      }
    }
  });

  const regularEmployee = await prisma.employee.create({
    data: {
      employeeId: 'EMP004',
      userId: employeeUser.id,
      managerId: managerEmployee.id,
      personalInfo: {
        firstName: 'Alice',
        lastName: 'Wilson',
        dateOfBirth: new Date('1995-12-03'),
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        nationality: 'Indian',
        phone: '+91-9876543216',
        address: {
          street: '321 Employee Road',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411001',
          country: 'India'
        }
      },
      professionalInfo: {
        designation: 'Software Developer',
        department: 'Engineering',
        joiningDate: new Date('2022-01-15'),
        employmentType: 'PERMANENT',
        workLocation: 'REMOTE'
      },
      emergencyContact: {
        name: 'David Wilson',
        relation: 'Father',
        phone: '+91-9876543217',
        email: 'david.wilson@email.com'
      },
      bankDetails: {
        accountNumber: '4567890123',
        bankName: 'Axis Bank',
        branchName: 'Pune FC Road',
        ifscCode: 'UTIB0000456',
        accountHolderName: 'Alice Wilson'
      }
    }
  });

  // Create sample job postings
  await prisma.jobPosting.create({
    data: {
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Bangalore, India',
      employmentType: 'PERMANENT',
      experienceLevel: 'SENIOR',
      description: 'We are looking for a Senior Software Engineer to join our dynamic team...',
      requirements: [
        '5+ years of experience in software development',
        'Strong knowledge of Node.js and TypeScript',
        'Experience with MongoDB and Redis',
        'Knowledge of microservices architecture'
      ],
      responsibilities: [
        'Design and develop scalable backend systems',
        'Mentor junior developers',
        'Code review and quality assurance',
        'Collaborate with cross-functional teams'
      ],
      skillsRequired: ['Node.js', 'TypeScript', 'MongoDB', 'Redis', 'Docker'],
      salaryRange: {
        min: 1200000,
        max: 1800000,
        currency: 'INR'
      },
      benefits: ['Health Insurance', 'Flexible Working Hours', 'Learning Budget'],
      applicationDeadline: new Date('2025-03-31'),
      postedBy: hrEmployee.employeeId
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Default Credentials:');
  console.log('Admin: admin@company.com / admin123');
  console.log('HR: hr@company.com / hr123');
  console.log('Manager: manager@company.com / manager123');
  console.log('Employee: employee@company.com / employee123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });