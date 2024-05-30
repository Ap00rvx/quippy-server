const express = require('express');
const router = express.Router();
const {registerUser,loginUser,profile,checkUsername,verifyOtp,followUnfollow} = require("../controller/user_controller");
const protection = require("../middleware/user_middleware")

router.post("/register",registerUser); 
router.post("/login",loginUser);
router.post("/checkUsername",checkUsername); 
router.post("/verify",verifyOtp);


router.get("/profile",protection,profile); 
router.post("/follow",protection,followUnfollow)


module.exports = router;