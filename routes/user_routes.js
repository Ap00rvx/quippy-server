const express = require('express');
const router = express.Router();
const {registerUser,loginUser,profile} = require("../controller/user_controller");
const protection = require("../middleware/user_middleware")

router.post("/register",registerUser); 
router.post("/login",loginUser);


router.get("/profile",protection,profile); 

module.exports = router;