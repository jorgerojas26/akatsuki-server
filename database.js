import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/akatsuki");

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to database");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error: " + err);
});
