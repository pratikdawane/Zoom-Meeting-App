

// if (process.env.NODE_ENV !== "production") {
//   require('dotenv').config(); // Require .env file in development
// }

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const { createServer } = require("node:http");  // for socket.io
// const connectToSocket = require("./controllers/socketManager.js");
// const router = require("./routes/userRoutes.js"); // CommonJS
// // const httpStatus = require("http-status");
// const {User} = require("./models/userModel");
// const bcrypt = require("bcrypt");
// const crypto = require("crypto");

// const app = express();
// const PORT = 3000;

// // Server configuration
// app.set("port", (process.env.PORT || 3000));
// const server = createServer(app); // Create HTTP server with Express for socket.io
// const io = connectToSocket(server);  // Initialize socket.io

// // Middleware
// // app.use(cors({
// //     origin: 'http://localhost:5173/', // Replace with your frontend URL
// //     credentials: true, // Allow cookies to be sent
// // }));

// app.use(cors())
// app.use(express.json()); // For parsing application/json
// app.use(express.urlencoded({ limit: "40kb", extended: true }));

// // Routes
// app.use("/", router); // Mount the router

// // Database connection
// const mongoDB = process.env.MONGO_URL;

// async function main() {
//     await mongoose.connect(mongoDB, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });
// }

// main()
//     .then((res) => {
//         console.log("DB connection successful!");
//     })
//     .catch((err) => {
//         console.error("DB connection error:", err);
//     });

// // Basic route
// app.get("/", (req, res) => {
//     res.send("Root is Running!");
// });




// // Make sure httpStatus is properly required at the top
// // const httpStatus = require('http-status-codes'); // or use numeric status codes directly



// // // Register endpoint
// // app.post("/register", async (req, res) => {
// //     const { name, username, password } = req.body;

// //     try {
// //         // Check if user exists
// //         const existingUser = await User.findOne({ username });
// //         if (existingUser) {
// //             return res.status(409).json({  // 409 Conflict
// //                 message: "User already exists!" 
// //             });
// //         }

// //         // Hash password
// //         const hashedPassword = await bcrypt.hash(password, 10);

// //         // Create new user
// //         const newUser = new User({
// //             name,
// //             username,
// //             password: hashedPassword
// //         });

// //         // Save user to database
// //         await newUser.save();

// //         // Return success response
// //         return res.status(201).json({  // 201 Created
// //             message: "User registered successfully!",
// //             user: {
// //                 id: newUser._id,
// //                 name: newUser.name,
// //                 username: newUser.username
// //             }
// //         });

// //     } catch (err) {
// //         console.error("Registration error:", err);
// //         return res.status(500).json({  // 500 Internal Server Error
// //             message: "Internal server error" 
// //         });
// //     }
// // });

// // // Login endpoint
// // app.post("/login", async (req, res) => {
// //     const { username, password } = req.body;

// //     // Validate input
// //     if (!username || !password) {
// //         return res.status(400).json({  // 400 Bad Request
// //             message: "Please provide username and password" 
// //         });
// //     }

// //     try {
// //         // Find user
// //         const user = await User.findOne({ username });
// //         if (!user) {
// //             return res.status(401).json({  // 401 Unauthorized
// //                 message: "Invalid credentials" 
// //             });
// //         }

// //         // Check password
// //         const isPasswordValid = await bcrypt.compare(password, user.password);
// //         if (!isPasswordValid) {
// //             return res.status(401).json({  // 401 Unauthorized
// //                 message: "Invalid credentials" 
// //             });
// //         }

// //         // Generate token
// //         const token = crypto.randomBytes(32).toString("hex");
// //         user.token = token;
// //         await user.save();

// //         // Return success with token
// //         return res.status(200).json({  // 200 OK
// //             message: "Login successful",
// //             token: token,
// //             user: {
// //                 id: user._id,
// //                 name: user.name,
// //                 username: user.username
// //             }
// //         });

// //     } catch (err) {
// //         console.error("Login error:", err);
// //         return res.status(500).json({  // 500 Internal Server Error
// //             message: "Internal server error" 
// //         });
// //     }
// // });



// // Start server
// server.listen(PORT, () => {
//     console.log(`APP is Running on port ${PORT}`);
// });



require('dotenv').config();

const express = require("express"); 
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("node:http");
const connectToSocket = require("./controllers/socketManager.js");
const router = require("./routes/userRoutes.js");

const app = express();
const PORT = 3000;

// HTTP + Socket Server
const server = createServer(app);
connectToSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", router);

// DB connection
async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            tls: true
        });
        console.log("DB connection successful!");
    } catch (err) {
        console.error("DB connection error:", err);
    }
}

main();

app.get("/", (req, res) => {
    res.send("Root is Running!");
});

// Start server
server.listen(PORT, () => {
    console.log(`APP is Running on port ${PORT}`);
});
