const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://yt-demo:KuUMLNlX8irVtLCU@cluster0.ixji0sy.mongodb.net/hotelmanagementportal"
    );

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;