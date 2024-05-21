const express = require('express');
const router = express.Router();

const {createNewQuip}  = require("../controller/quip_controller") 

router.post("/create",createNewQuip);

module.exports = router; 