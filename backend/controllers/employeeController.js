const Employee = require("../models/Employee");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @desc  Employee login
// @route POST /api/employees/login
exports.employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const employee = await Employee.findOne({ email, isActive: true }).select("+password");
    if (!employee)
      return res.status(401).json({ success: false, message: "Invalid credentials or account inactive" });

    if (!employee.password)
      return res.status(401).json({ success: false, message: "No password set for this account. Ask admin to set one." });

    const match = await bcrypt.compare(password, employee.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(employee._id, employee.role),
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all employees
// @route GET /api/employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Add employee
// @route POST /api/employees
exports.addEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, message: "Employee added", employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update employee
// @route PUT /api/employees/:id
exports.updateEmployee = async (req, res) => {
  try {
    // If password is being updated, hash it first
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, message: "Employee updated", employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete employee
// @route DELETE /api/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, message: "Employee deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};