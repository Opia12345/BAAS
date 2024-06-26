const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Register = require("./Controllers/Register");
const Login = require("./Controllers/Login");
const Logout = require("./Controllers/Logout");
const GenerateTicket = require("./Controllers/GenerateTicket");
const DeleteTicket = require("./Controllers/DeleteTicket");
const AllTickets = require("./Controllers/AllTickets");
require("dotenv").config();

const app = express();
const path = __dirname + "/views/";
const port = process.env.port || 8080;
app.use(express.static(path));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbURI = process.env.dbURI;

mongoose
  .connect(dbURI)
  .then(() => {
    console.log(`Loading...`);
    app.listen(port, () => {
      console.log(`Server running on ${port} and MongoDB connected`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

//API ROUTES
app.post("/register", Register.Register);
app.post("/login", Login.Login);
app.post("/logout", Logout.Logout);
app.post("/getTicket", GenerateTicket.GenerateTicket);
app.delete("/ticket/:id", DeleteTicket.DeleteTicket);
app.get("/all-tickets", AllTickets.AllTickets);
