const express = require("express");
const router = express.Router();
const {
  getHalls,
  getHallById,
  addHall,
  updateHall,
  deleteHall,
} = require("../controllers/hallController");

router.get("/",      getHalls);
router.post("/",     addHall);
router.get("/:id",   getHallById);
router.put("/:id",   updateHall);
router.delete("/:id",deleteHall);

module.exports = router;