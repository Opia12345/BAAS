const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    otp: {
      type: Number,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiration: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Queue Schema
const queueSchema = new mongoose.Schema({
  ticketNumber: {
    type: Number,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email address is required"],
    unique: true,
  },
  sessionTime: {
    type: String,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  status: {
    type: String,
  },
  issueTime: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);
const Queue = mongoose.model("Queue", queueSchema);

module.exports = { User, Queue };
