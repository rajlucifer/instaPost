require("dotenv").config();
const dns = require('dns');

// Only override DNS servers in development (some local ISPs block MongoDB Atlas).
// Overriding DNS in production will break Render's container DNS resolution.
if (process.env.NODE_ENV !== "production") {
    try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (err) {
        console.warn("Could not set DNS servers:", err.message);
    }
}

const app  = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on PORT ${PORT}`);
});