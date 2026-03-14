const express = require("express");
const router  = express.Router();
const {
  employeeLogin,
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

router.post("/login",   employeeLogin);   // NEW — employee login
router.get("/",         getEmployees);
router.post("/",        addEmployee);
router.put("/:id",      updateEmployee);
router.delete("/:id",   deleteEmployee);

module.exports = router;