import { Router } from 'express';
import { EmployeesService } from '../services/employees.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const employeesService = new EmployeesService();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Unauthorized
 */
// Get all employees
router.get('/', authenticate, async (req, res, next) => {
  try {
/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
    const { is_active } = req.query;
    const filters: any = {};
    
/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@company.com
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               department:
 *                 type: string
 *                 example: Engineering
 *               position:
 *                 type: string
 *                 example: Software Engineer
 *               salary:
 *                 type: number
 *                 format: decimal
 *                 example: 75000.00
 *               hire_date:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }
/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *               position:
 *                 type: string
 *               salary:
 *                 type: number
 *                 format: decimal
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */

    const employees = await employeesService.getAllEmployees(filters);
    res.json({ success: true, data: employees });
/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Employee deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
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
