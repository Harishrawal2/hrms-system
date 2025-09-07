import express from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/document.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateParams } from '../middleware/validation.middleware';
import { documentValidation } from '../validations/document.validation';

const router = express.Router();
const documentController = new DocumentController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX are allowed.'));
    }
  }
});

router.use(authenticate);

router.post('/upload', 
  upload.single('document'),
  documentController.uploadDocument
);

router.get('/:employeeId', 
  validateParams(documentValidation.employeeParams),
  documentController.getEmployeeDocuments
);

router.get('/', 
  authorize('ADMIN', 'HR'),
  documentController.getDocuments
);

router.patch('/:id/verify', 
  authorize('ADMIN', 'HR'),
  validateParams(documentValidation.params),
  documentController.verifyDocument
);

router.delete('/:id', 
  validateParams(documentValidation.params),
  documentController.deleteDocument
);

export default router;