const express = require("express");
const router = express.Router();

const { getHalls, addHall } = require("../controllers/hallController");

router.get("/", getHalls);
router.post("/", addHall);

module.exports = router;