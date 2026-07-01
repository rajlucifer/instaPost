const mongoose = require("mongoose");


async function connectDB() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("DB connected successfully");
    }
    catch(error){
        console.log("DB connection failed ",error);

    }

}

module.exports = connectDB;