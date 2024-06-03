// controllers/userController.js
const bcrypt = require("bcrypt");
const sendMail = require('../helper/node_mailer');
const otpGenerator = require("otp-generator"); 
const OTP = require("../model/otp_model")
const jwt = require('jsonwebtoken');
const User = require('../model/user_model');
const dotenv = require("dotenv")
dotenv.config()
const secret = process.env.JWT_SECRET;

exports.registerUser = async (req, res) => {
    const { username, fullName, email, password, provider, googleId } = req.body;
    if(username && fullName && email && password){
        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
    
            user = new User({
                username,
                fullName,
                email,
                password,
                provider: provider || "local", // Default to "local" if provider is not provided
                googleId: googleId || "null"
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
    const payload = {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            };  
            await user.save();
            const newOtp  = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets:false, specialChars: false,digits:true});
            const otpmodel = new OTP({
                email:email,
                otp:newOtp,
            });
            await sendMail(email,newOtp,username);     
            await otpmodel.save(); 
            jwt.sign(
                payload,
                secret,
                { expiresIn: '150d' },
                (err, token) => {
                    if (err)  res.status(201).json({ error:err.message });;
                    res.status(201).json({ message:"user created",token:token,user:user,"note":"Otp has been sent to your email"});
                }
            );
          
            
        } catch (err) {
            console.error(err.message);
            res.status(500).send({error : 'Internal Server error'});
        }
    }
    else{
        res.status(400).send({error : 'All fields are required '});
    }

    
};
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
        jwt.sign(
            payload,
            secret,
            { expiresIn: '150d' },
            (err, token) => {
                if (err)  res.status(400).json({ error:err.message });;
                res.status(200).json({ message:"user login success",token:token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send({error : 'Internal Server error'});
    }
};

exports.profile = async (req,res) => {
    try {
        const user = req.user;
        if(user ){
            res.status(200).json({message : 'user profile', user : user});

        }
        else{
            res.status(404).json({message : 'user not found'});
        }
    }catch(Err){
        console.log(Err);
        res.status(500).send({'status':'failed','message':'Internal Server Error'})
    }
}

exports.checkUsername = async(req,res) => {
    try {
        const {username} = req.body;
        if(username){
        const user = await User.findOne({username:username});
        if (user){
            res.send({"ava":false,"message":"User name is already taken"});
        }
        else{
            res.status(200).send({"ava":true,"message":"User name available"}); 
        }
    }
    else{
        res.status(400).send({"message":"All fields are required "}); 
    }
    }catch(Err){
        console.log(Err);
        res.status(500).send({'status':'failed','message':'Internal Server Error'})
    }
}

exports.verifyOtp = async(req,res) => {
    const {otp,email}= req.body ; 
    if(otp && email){
            try {
                let  user = await User.findOne({email:email});
                if(user){
                    const otpModel = await OTP.findOne({email : email});
                     if(otpModel.otp === otp){
                        user.isVerified = true; 
                        await user.save();
                        await OTP.deleteOne({email :email }); 
                        res.status(200).send({"message":"User verified successfully"});
                     }
                     else{
                        res.status(400).send({"message":"Invalid OTP"});
                     }
                }
                else{
                    res.status(404).json({message : 'user not found'});
                }
            }catch(err){
                console.log(err);
                res.status(500).send({'status':'failed','message':'Internal Server Error'})
            }
    }
    else{
        res.status(400).send({"message":"Please enter otp and email"})
    }
}
exports.followUnfollow = async(req,res) =>{
    const {followId} = req.body ;
    const userID  = req.user._id; 
    if(followId == userID){
      return   res.status(400).send({"message":"users are same"}); 
    }
    if(followId){
        try {
            let user = await User.findById(userID);
            let followUser = await User.findById(followId);
            if(user && followUser){
            const index  = followUser.followers.indexOf(userID);
            if(index >-1){
                followUser.followers.splice(index,1);
                await followUser.save();
                res.status(200).send({"message":"Follower removed"}); 

            }
            else{
                followUser.followers.push(userID);
                await followUser.save();
                res.status(200).send({"message":"Follower Added"}); 
            }
        }
        else{
            res.status(404).send({"message":"Users not found"}); 
        }
        }catch(err){
            console.log(err);
            res.status(500).send({'status':'failed','message':'Internal Server Error'})
        }
    
    }
    else{
        res.status(400).send({"message":"Please enter followId"})
    }

}
exports.getUser  = async(req,res) => {
    const id = req.params.id; 
    try{
    if(id){
        const user = await User.findById(id).select("-password"); 
        if(user){
            res.status(200).send({"status":"success",user});
        }
        else{
            res.status(404).send({"message":"User not found"});
        }
    }
    else{
        res.status(400).send({"message":"UserId is incorrect"}); 
    }
    }catch(err){
        console.log(err);
        res.status(500).send({'status':'failed','message':'Internal Server Error'})
    }
}

exports.changePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).send({ message: 'Please provide email, old password, and new password' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).send({ message: 'Old password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).send({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};
