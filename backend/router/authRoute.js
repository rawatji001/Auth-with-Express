const express = require("express");
const {
  signup,
  signin,
  getuser,
  logout,
} = require("../controllers/authController");
const jwtAuth = require("../middleware/jwtAuth");

const authRouter = express.Router();

authRouter.post("/signup", signup);

authRouter.post("/signin", signin);

authRouter.get("/user", jwtAuth, getuser);

authRouter.get("/logout", jwtAuth, logout);

module.exports = authRouter;
