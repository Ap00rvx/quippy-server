const express = require('express');
const router = express.Router();
const {registerUser,loginUser,profile,checkUsername} = require("../controller/user_controller");
const protection = require("../middleware/user_middleware")

router.post("/register",registerUser); 
router.post("/login",loginUser);
router.post("/checkUsername",checkUsername); 

router.get("/profile",protection,profile); 


module.exports = router;