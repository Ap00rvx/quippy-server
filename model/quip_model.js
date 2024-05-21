const { default: mongoose } = require("mongoose");

const QuipSchema = new mongoose.Schema({
    title :{
        type :String, 
        required :true
    },
    content:{
        type :String, 
        required : true
    },
    image:{
        type :String,
    },
    username:{
        type :String,
        required : true
    },
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        required:true, 
    },
    date:{
        type: Date,
        default: Date.now()
    },
    likes:{
        type: Number,
        default: 0
    },
    dislikes:{
        type: Number,
        default: 0
    },
});

const Quip = mongoose.model("quip",QuipSchema); 
module.exports = Quip;