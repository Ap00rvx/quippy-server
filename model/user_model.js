const { default: mongoose } = require("mongoose");
const UserSchema  = new mongoose.Schema({
    username:{
        type : String,
        required :true,
        unique :true, 
    },
    fullName:{
        type : String,

    },
    email :{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        
    },
    image:{
        type:String,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    isBlocked:{
        type:Boolean,
        default:false,
        },
    provider :{
        type:String,
        enum:["local","google"],
        default:"local"
    },
    googleId:{
        type:String,
        required : function (){
            return this.provider === "google"; 
        }
    },
    quips:{
        type:Array,
        default:[]
    },
    followers:{
        type:Array,
        default:[],
    },
});

const User = mongoose.model("user",UserSchema); 
module.exports = User;
//