const express = require('express');
const router = express.Router();

const {createNewQuip,updateDisLikes,updateLike,addComment}  = require("../controller/quip_controller") 
const protection = require("../middleware/user_middleware.js")
router.post("/create",createNewQuip);



router.get("/like",protection,updateLike);
router.get("/dislike",protection,updateDisLikes);
router.post("/addComment",protection,addComment); 

module.exports = router; 