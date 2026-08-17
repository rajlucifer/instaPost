const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models.js/user");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "instapost_access_secret_key_12345";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "instapost_refresh_secret_key_67890";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Cookie options
const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: maxAge
});

// Helpers to generate tokens
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, username: user.username },
        JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

// ─── POST /auth/signup ────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, acceptedTerms } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required." });
        }

        if (acceptedTerms !== true && acceptedTerms !== "true") {
            return res.status(400).json({ message: "You must accept the Terms and Conditions to sign up." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();

        // Check duplicate email or username
        const existingUser = await userModel.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
        });

        if (existingUser) {
            if (existingUser.email === normalizedEmail) {
                return res.status(400).json({ message: "An account with this email already exists." });
            }
            return res.status(400).json({ message: "Username is already taken." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new userModel({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            acceptedTerms: true
        });

        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        newUser.refreshToken = refreshToken;
        await newUser.save();

        // Set cookies
        res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 mins
        res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

        return res.status(201).json({
            message: "Account created successfully!",
            user: newUser.toJSON(),
            accessToken
        });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Server error during registration. Please try again." });
    }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        // Set cookies
        res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 mins
        res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

        return res.status(200).json({
            message: "Logged in successfully!",
            user: user.toJSON(),
            accessToken
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Server error during login. Please try again." });
    }
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
router.post("/refresh", async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token missing." });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired refresh token." });
        }

        const user = await userModel.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: "Refresh token is revoked or user not found." });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("accessToken", newAccessToken, getCookieOptions(15 * 60 * 1000));
        res.cookie("refreshToken", newRefreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

        return res.status(200).json({
            message: "Token refreshed successfully.",
            user: user.toJSON(),
            accessToken: newAccessToken
        });
    } catch (error) {
        console.error("Error during token refresh:", error);
        return res.status(500).json({ message: "Server error during token refresh." });
    }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/logout", async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
                await userModel.findByIdAndUpdate(decoded.id, { refreshToken: null });
            } catch (err) {
                // Ignore token verification errors during logout
            }
        }

        const clearCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        };

        res.clearCookie("accessToken", clearCookieOptions);
        res.clearCookie("refreshToken", clearCookieOptions);

        return res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ message: "Server error during logout." });
    }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get("/me", protect, (req, res) => {
    return res.status(200).json({
        user: req.user.toJSON()
    });
});

module.exports = router;
