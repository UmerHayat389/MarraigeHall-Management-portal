const Hall = require("../models/Hall");

exports.getHalls = async (req, res) => {
  const halls = await Hall.find();
  res.json(halls);
};

exports.addHall = async (req, res) => {
  const hall = new Hall(req.body);
  await hall.save();
  res.json(hall);
};