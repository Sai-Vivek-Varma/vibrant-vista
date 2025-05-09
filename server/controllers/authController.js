import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: "User already exists with this email" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    res.status(201).send({ user, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).send({ message: "Error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    res.send({ user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).send({ message: "Error during login" });
  }
};
