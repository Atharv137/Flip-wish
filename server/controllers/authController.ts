import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../models/User.js";
import { hashPassword, generateToken } from "../utils/authHelper.js";
import { prisma } from "../config/prisma.js";
import { db } from "../config/db.js";

const ADMIN_EMAIL = "hargudetejas17@gmail.com";

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

    const normalizedEmail = email.toLowerCase();
    const isMongoConnected = mongoose.connection.readyState === 1;

    // Check existing in Mongo if connected
    if (isMongoConnected) {
      try {
        const existingMongo = await User.findOne({ email: normalizedEmail });
        if (existingMongo) {
          return res.status(400).json({ error: "Email already registered" });
        }
      } catch (err) {
        console.warn("Mongo user check failed, falling back to local:", err);
      }
    }

    // Check existing in local db
    const existingLocal = db.users.findOne(u => u.email.toLowerCase() === normalizedEmail);
    if (existingLocal) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = hashPassword(password);
    const assignedRole = normalizedEmail === ADMIN_EMAIL ? "admin" : "customer";

    let createdId = "";

    // Save in Mongo if connected
    if (isMongoConnected) {
      try {
        const newUser = new User({
          name,
          email: normalizedEmail,
          password: passwordHash
        });
        await newUser.save();
        createdId = newUser.id;

        // Sync to PostgreSQL if configured
        if (process.env.DATABASE_URL) {
          try {
            await prisma.user.create({
              data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                password: passwordHash
              }
            });
          } catch (pErr) {
            console.warn("Prisma user sync warning:", pErr);
          }
        }
      } catch (mErr) {
        console.warn("Mongo user save warning:", mErr);
      }
    }

    // Always ensure saved in local db as well for consistency
    const localUser = db.users.insert({
      name,
      email: normalizedEmail,
      passwordHash,
      role: assignedRole
    });

    if (!createdId) {
      createdId = localUser.id;
    }

    const token = generateToken(createdId);

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: createdId,
        name,
        email: normalizedEmail,
        role: assignedRole
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

    const normalizedEmail = email.toLowerCase();
    const enteredHash = hashPassword(password);
    const isMongoConnected = mongoose.connection.readyState === 1;

    let authenticatedUser: { id: string; name: string; email: string; role: "admin" | "customer" } | null = null;

    // Check MongoDB if connected
    if (isMongoConnected) {
      try {
        const mongoUser = await User.findOne({ email: normalizedEmail });
        if (mongoUser && mongoUser.password === enteredHash) {
          const role = normalizedEmail === ADMIN_EMAIL ? "admin" : "customer";
          authenticatedUser = {
            id: mongoUser.id,
            name: mongoUser.name,
            email: mongoUser.email,
            role
          };

          // Sync to Prisma if available
          if (process.env.DATABASE_URL) {
            try {
              const pgUser = await prisma.user.findUnique({ where: { id: mongoUser.id } });
              if (!pgUser) {
                await prisma.user.create({
                  data: {
                    id: mongoUser.id,
                    name: mongoUser.name,
                    email: mongoUser.email,
                    password: mongoUser.password
                  }
                });
              }
            } catch (pgErr) {
              console.warn("Prisma sync warning:", pgErr);
            }
          }
        }
      } catch (mongoErr) {
        console.warn("Mongo login query error, falling back to local:", mongoErr);
      }
    }

    // If not authenticated via Mongo, check local db
    if (!authenticatedUser) {
      const localUser = db.users.findOne(u => u.email.toLowerCase() === normalizedEmail);
      if (localUser && localUser.passwordHash === enteredHash) {
        const role = normalizedEmail === ADMIN_EMAIL ? "admin" : (localUser.role || "customer");
        authenticatedUser = {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          role
        };
      }
    }

    if (!authenticatedUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(authenticatedUser.id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: authenticatedUser
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error during login" });
  }
}
