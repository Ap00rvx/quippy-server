const { default: mongoose } = require("mongoose");
 const CommentSchema = new mongoose.Schema({
    comment:{
        type :String ,
        required :true,

    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        required :true, 
        ref : "User"

    },
    quip:{
        type : mongoose.Schema.Types.ObjectId,
        required :true,
        ref : "Quip"
    },
    date :{
        type : Date,
        default : Date.now()
    },


 });

 const commentModel = mongoose.model("comment",CommentSchema);
 module.exports = commentModel ;