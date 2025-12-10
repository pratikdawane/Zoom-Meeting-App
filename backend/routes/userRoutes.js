
// const { Router } = require("express");

const express = require("express");
const { login, register, addToHistory, getUserHistory, deleteHistory } = require("../controllers/userController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/add_to_activity", addToHistory);
router.get("/get_all_activity", getUserHistory);
router.delete("/delete_activity/:meetingId", deleteHistory);

module.exports = router;