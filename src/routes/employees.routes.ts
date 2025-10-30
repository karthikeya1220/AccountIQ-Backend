import { Router } from 'express';
import { EmployeesService } from '../services/employees.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const employeesService = new EmployeesService();

// Get all employees
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { is_active } = req.query;
    const filters: any = {};
    
    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }

    const employees = await employeesService.getAllEmployees(filters);
    res.json({ success: true, data: employees });
  } catch (error: any) {
    next(error);
  }
});

// Get employee by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const employee = await employeesService.getEmployeeById(req.params.id);
    res.json({ success: true, data: employee });
  } catch (error: any) {
    next(error);
  }
});

// Create employee
router.post('/', authenticate, async (req, res, next) => {
  try {
    const employee = await employeesService.createEmployee(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error: any) {
    next(error);
  }
});

// Update employee
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const employee = await employeesService.updateEmployee(req.params.id, req.body);
    res.json({ success: true, data: employee });
  } catch (error: any) {
    next(error);
  }
});

// Delete employee
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await employeesService.deleteEmployee(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;
