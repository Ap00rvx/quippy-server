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


