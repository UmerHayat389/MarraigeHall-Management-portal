const Employee = require("../models/Employee");

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
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
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
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, message: "Employee deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};