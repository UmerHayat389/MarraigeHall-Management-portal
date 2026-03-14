const Employee = require("../models/Employee");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const mongoose = require("mongoose");

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route POST /api/employees/login
exports.employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const employee = await Employee.findOne({ email: email.toLowerCase().trim(), isActive: true }).select("+password");
    if (!employee)
      return res.status(401).json({ success: false, message: "Invalid credentials or account inactive" });

    if (!employee.password)
      return res.status(401).json({ success: false, message: "No password set. Ask admin to set one." });

    const match = await bcrypt.compare(password, employee.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(employee._id, employee.role),
      employee: { id: employee._id, name: employee.name, email: employee.email, phone: employee.phone, role: employee.role },
    });
  } catch (error) {
    console.error("employeeLogin error:", error.message);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

// @route GET /api/employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    console.error("getEmployees error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch employees" });
  }
};

// @route POST /api/employees
exports.addEmployee = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Employee name is required" });
    if (!email?.trim()) return res.status(400).json({ success: false, message: "Email is required" });

    const existing = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ success: false, message: "An employee with this email already exists" });

    const employee = await Employee.create({ ...req.body, name: name.trim(), email: email.toLowerCase().trim() });
    res.status(201).json({ success: true, message: "Employee added", employee });
  } catch (error) {
    console.error("addEmployee error:", error.message);
    if (error.code === 11000) return res.status(400).json({ success: false, message: "Email already in use" });
    res.status(500).json({ success: false, message: "Could not add employee" });
  }
};

// @route PUT /api/employees/:id
exports.updateEmployee = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid employee ID" });

    // Hash password only if it's being changed and is a plain string
    if (req.body.password) {
      if (req.body.password.length < 6)
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } else {
      delete req.body.password; // never wipe password with empty string
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, message: "Employee updated", employee });
  } catch (error) {
    console.error("updateEmployee error:", error.message);
    if (error.code === 11000) return res.status(400).json({ success: false, message: "Email already in use" });
    res.status(500).json({ success: false, message: "Could not update employee" });
  }
};

// @route DELETE /api/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid employee ID" });

    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, message: "Employee deleted" });
  } catch (error) {
    console.error("deleteEmployee error:", error.message);
    res.status(500).json({ success: false, message: "Could not delete employee" });
  }
};