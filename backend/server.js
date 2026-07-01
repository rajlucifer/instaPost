require("dotenv").config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const app  = require("./src/app");
const connectDB = require("./src/db/db");


connectDB();
app.listen(3000,()=>{
    console.log("server running on PORT 3000");
})