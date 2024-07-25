const mongoose=require('mongoose')
const UserSchema = new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    otp:{type:String,required:false,default:"none"},
    fcm:{type:String,required:false,default:"none"},
    password:{type:String,required:true},
    verification:{type:Boolean,default:false},
    phone:{type:String,default:"0901108024"},
    phoneVerification:{type:Boolean,default:false},
    address:{
        type:mongoose.Types.ObjectId,
        ref:"Address",
        required:false
    },
    userType:{type:String,required:true,default:"Client",enum:['Client','Admin','Vendor','Driver']},
    profile:{type:String,default:'https://utfs.io/f/c8a5f946-3c2e-46db-8e4b-37392016e729-ibclyc.jfif'},
},{timestamps:true})
module.exports=mongoose.model('User',UserSchema);