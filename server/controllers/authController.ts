import { Request, Response } from "express";
import User from "../../models/User.js";
import { hashPassword, generateToken } from "../utils/authHelper.js";
import { prisma } from "../config/prisma.js";

export async function signup(req: Request, res: Response): Promise<any> {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = hashPassword(password);
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: passwordHash
    });
    await newUser.save();

    // Sync to PostgreSQL for relational foreign key constraints
    await prisma.user.create({
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password: passwordHash
      }
    });

    const token = generateToken(newUser.id);

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error during signup" });
  }
}

export async function login(req: Request, res: Response): Promise<any> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const enteredHash = hashPassword(password);
    if (user.password !== enteredHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Ensure user exists in Postgres (sync for existing Mongo users)
    const pgUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!pgUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password
        }
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error during login" });
  }
}
