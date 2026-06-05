import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";
import { sendTelegramMessage } from "../lib/telegram";

const router = Router();

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: "/",
};

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailVerificationCode = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        emailVerificationCode,
        emailVerificationToken: null,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    
    await sendTelegramMessage(
      `🔐 Assistant Builder

    Email: ${normalizedEmail}

    Verification code: ${emailVerificationCode}`
    );

return res.status(201).json({
  message: "User registered successfully. Verification code sent.",
  user: {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  },
});
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        error: "JWT secret is not configured",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

res.cookie("authToken", token, {
  ...authCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

return res.status(200).json({
  message: "Login successful",
  user: {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  },
});
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Me error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const token = req.query.token;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        error: "Verification token is required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid verification token",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Email verified successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.post("/verify-email-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: "Email and code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = String(code).trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || user.emailVerificationCode !== normalizedCode) {
      return res.status(400).json({
        error: "Invalid verification code",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Email verified successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verify email code error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("authToken", authCookieOptions);

  return res.status(200).json({
    message: "Logged out successfully",
  });
});

export default router;