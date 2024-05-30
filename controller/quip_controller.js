const mongoose = require("mongoose"); 
const User = require('../model/user_model');
const dotenv = require("dotenv")
dotenv.config()
const Quip = require("../model/quip_model");
const commentModel = require("../model/comment_model");


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
exports.updateLike = async (req, res) => {
    const quipID = req.header("quipID");
    let user = req.user;
    const userID = user._id;

    try {
        let quip = await Quip.findById(quipID);

        if (!quip) {
            return res.status(404).send({ status: "failed", message: "Quip not found" });
        }

        const likeIndex = quip.likes.indexOf(userID);

        if (likeIndex > -1) {
            // User ID exists in likes array, remove it
            quip.likes.splice(likeIndex, 1);
            await quip.save();
            res.status(200).send({ status: "success", message: "Like removed" });
        } else {
            // User ID does not exist in likes array, add it
            quip.likes.push(userID);
            await quip.save();
            res.status(200).send({ status: "success", message: "Like added" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "failed", message: "Internal Server Error" });
    }
};
exports.updateDisLikes = async (req, res) => {
    const quipID = req.header("quipID");
    let user = req.user;
    const userID = user._id;

    try {
        let quip = await Quip.findById(quipID);

        if (!quip) {
            return res.status(404).send({ status: "failed", message: "Quip not found" });
        }

        const likeIndex = quip.dislikes.indexOf(userID);

        if (likeIndex > -1) {
            // User ID exists in likes array, remove it
            quip.dislikes.splice(likeIndex, 1);
            await quip.save();
            res.status(200).send({ status: "success", message: "Dislike removed" });
        } else {
            // User ID does not exist in likes array, add it
            quip.dislikes.push(userID);
            await quip.save();
            res.status(200).send({ status: "success", message: "Dislike added" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "failed", message: "Internal Server Error" });
    }
};
exports.addComment = async (req,res)=> {
    const quipID = req.header("quipID");
    const userID = req.user._id;
    try {
        if(userID && quipID ){
            let quip = await Quip.findById(quipID);
            if(!quip){
                return res.status(404).send({"message":"Quip not found"}); 
            }
            const comment = req.body.comment;
            if(!comment){
                return res.status(402).send({"message":"All fields are required"});
            }
            const newComment = new commentModel({
                comment:comment,
                user:userID,
                quip:quipID,
            });
            await newComment.save(); 
            quip.comments.push(newComment._id);
            await quip.save();
            res.status(201).send({"message":"Comment added"});
        }
        else{
            res.status(400).send({"message":"Auathorized Sender"}); 
        }
    }catch (err){
        console.log(err);
        res.status(500).send({'status':'failed','message':'Internal Server Error'})
    }
}
exports.home = async (req, res) => {
    try {
        const quips = await Quip.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userID', 'name')
            .populate('comments.user', 'name');

        res.status(200).json({
            status: 'success',
            data: quips
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            status: 'failed',
            message: 'Internal Server Error'
        });
    }
};
exports.getComments = async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
        // Find the quip by its ID
        const quip = await Quip.findOne({ _id: id });

        if (!quip) {
            return res.status(404).send({ status: 'failed', message: 'Quip not found' });
        }

        // Extract the comment IDs from the quip
        const commentIds = quip.comments;

        // Fetch the comments using the extracted IDs
        const comments = await commentModel.find({ _id: { $in: commentIds } });

        // Send the comments in the response
        res.status(200).send({ status: 'success', comments });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: 'failed', message: 'Internal Server Error' });
    }
};
