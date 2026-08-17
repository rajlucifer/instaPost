const jwt = require("jsonwebtoken");
const userModel = require("../models.js/user");

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "instapost_access_secret_key_12345";

const protect = async (req, res, next) => {
    try {
        let token = null;

        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Authentication required. Please log in." });
        }

        const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User no longer exists." });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "Invalid authentication token." });
    }
};

module.exports = { protect };
