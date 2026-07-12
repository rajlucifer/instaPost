const mongoose = require("mongoose");


async function connectDB() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("DB connected successfully");
    }
    catch(error){
        console.error("DB connection failed ",error);
        process.exit(1);
    }

}

module.exports = connectDB;