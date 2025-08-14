import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// 🔐 Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_jwt_key";

// ============================
// 🧑‍💻 Freelancer Signup
// ============================
export const registerFreelancer = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    // Check if freelancer already exists
    const [existing] = await db.query("SELECT * FROM freelancers WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ message: "Freelancer already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert freelancer into DB
    await db.query("INSERT INTO freelancers (fullname, email, password) VALUES (?, ?, ?)", [fullname, email, hashedPassword]);

    res.status(201).json({ message: "Freelancer registered successfully" });
  } catch (err) {
    console.error("Freelancer Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// 🧑‍💻 Freelancer Login
// ============================
export const loginFreelancer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM freelancers WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ message: "Freelancer not found" });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: rows[0].id, email }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Freelancer login successful", token });
  } catch (err) {
    console.error("Freelancer Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// 🧑‍💼 Client Signup
// ============================
export const registerClient = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    // Check if client already exists
    const [existing] = await db.query("SELECT * FROM clients WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ message: "Client already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert client into DB
    await db.query("INSERT INTO clients (fullname, email, password) VALUES (?, ?, ?)", [fullname, email, hashedPassword]);

    res.status(201).json({ message: "Client registered successfully" });
  } catch (err) {
    console.error("Client Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// 🧑‍💼 Client Login
// ============================
export const loginClient = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM clients WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ message: "Client not found" });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: rows[0].id, email }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Client login successful", token });
  } catch (err) {
    console.error("Client Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};