const express = require("express");
const userRegister = require("../controllers/userRegistercontroller");
const auth = require("../middlewares/auth");

const route = express.Router();

// POST route for User Registration
route.post("/user-register", userRegister.userRegister);

// POST route for User Login
route.post("/user-login", userRegister.userLogin);

// GET route for mentors
route.get("/mentors", auth, userRegister.getMentors); 

// GET route for bookings for mentors
route.get("/booking-mentor", auth, userRegister.bookingMentor);

// GET route for bookings for students
route.get("/booking-student", auth, userRegister.bookingstudent);

// POST route for payment
route.post("/payment", auth, userRegister.payment);

// POST route for booking appointments
route.post("/bookings", auth, userRegister.bookAppointment);

module.exports = route;