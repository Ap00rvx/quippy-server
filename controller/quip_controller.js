const mongoose = require("mongoose"); 
const User = require('../model/user_model');
const dotenv = require("dotenv")
dotenv.config()
const Quip = require("../model/quip_model");


exports.createNewQuip  = async (req,res) => {
    const {title,content,image,userID} = req.body;
    try {
    if(title && content && userID){

    
   
    let  user = await User.findById(userID); 
    if(!user){
        res.status(404).send({"message":"User not found"}); 
    }
    else{
        const quip = new Quip({
            title :title,
            content :content,
            image:image || "",
            username:user.username,
            userID:userID
        }); 
        try {
            await quip.save();
            const quipID = quip._id;
            user.quips.push(quipID);
            await user.save();
            res.status(200).send({"message":"Quip created successfully",quip : quip});
            

        }catch(err){
            console.log(err);
            res.status(500).send({'status':'failed','message':'Internal Server Error'})
        }
    }
}
else{
    res.status(400).send({"message":"Please fill all the fields"});
}
    }
    catch(err){
        res.status(500).send({'status':'failed','message':'Internal Server Error'})
    }
}