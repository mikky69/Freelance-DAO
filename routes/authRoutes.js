import express from "express";
import {
  registerClient,
  loginClient,
  registerFreelancer,
  loginFreelancer,
} from "../controllers/authController.js";

const router = express.Router();

// Client

router.post("/register/client", registerClient);
router.post("/login/client", loginClient);

// Freelancer
router.post("/register/freelancer", registerFreelancer);
router.post("/login/freelancer", loginFreelancer);

export default router;