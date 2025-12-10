

// const httpStatus = require("http-status");
const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Meeting } = require("../models/meetingModel");
const { console } = require("inspector");



// Register Controller
const register = async (req, res) => {
    const { name, username, password } = req.body;

    // Validate input
    if (!name || !username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "All fields (name, username, password) are required"
        });
    }

    try {
        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({  // 409 Conflict
                message: "User already exists!" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            username,
            password: hashedPassword
        });

        // Save user to database
        await newUser.save();

        // Return success response
        return res.status(201).json({  
            message: "User registered successfully!",
            user: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username
            }
        });

    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({  // 500 Internal Server Error
            message: "Internal server error" 
        });
    }
};




// Login Controller
const login = async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({  // 400 Bad Request
            message: "Please provide username and password" 
        });
    }

    try {
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({  // 401 Unauthorized
                message: "User is not Found!" 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({  // 401 Unauthorized
                message: "Please enter correct Password!" 
            });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");
        user.token = token;
        await user.save();

        // Return success with token
        return res.status(200).json({  // 200 OK
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({  // 500 Internal Server Error
            message: "Internal server error" 
        });
    }
};




// for get History
const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}


// for add History
const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}



// for delete History
const deleteHistory = async (req, res) => {
    const { meetingId } = req.params;  // Now getting from URL params
    const token = req.headers.authorization?.split(' ')[1];  // Get token from header

    try {
        // Verify the user first
        const user = await User.findOne({ token });

        // Delete the meeting that belongs to this user
        const result = await Meeting.findOneAndDelete({
            _id: meetingId,
            user_id: user.username
        });

        return res.json({
            success: true,
            message: "Meeting deleted successfully",
        });

    } catch (error) {
        console.error("Delete history error:", error);

    }
};




module.exports = { login, register, getUserHistory, addToHistory, deleteHistory };