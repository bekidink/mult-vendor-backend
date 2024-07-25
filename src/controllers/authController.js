const User=require('../models/User')
const CryptoJS=require('crypto-js')
const jwt=require('jsonwebtoken')
const generateOtp=require('../utils/otp_generator')
const sendEmail = require('../utils/smtp_function')

module.exports={
createUser:async(req,res)=>{
    const emailRegex=/^{a-zA-Z0-9._-}+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    if(emailRegex.test(req.body.email)){
        return res.status(400).json({status:false,message:"Email is not valid"})
    }
    const minPasswordLength=8;
    if(req.body.password<minPasswordLength){
        return res.status(400).json({status:false,message:"Password should be at least"+minPasswordLength+"characters"})
    }
    try {
        const emailExists=await User.findOne({email:req.body.email})
        if(emailExists){
            return res.status(400).json({status:false,message:error.message})
            
        }
        const otp=generateOtp()
        const newUser=new User({
            username:req.body.username,
            email:req.body.email,
            userType:"Client",
            password:CryptoJS.AES.encrypt(req.body.password,process.env.SECRET).toString(),
            otp:otp
        })
        await newUser.save()
        sendEmail(newUser.email,otp)
        res.status(201).json({status:true,message:"User successfully created."})
    } catch (error) {
        res.status(500).json({status:false,message:"Failed to create user"})
    }
},
loginUser:async(req,res)=>{
    const emailRegex=/^{a-zA-Z0-9._-}+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    if(emailRegex.test(req.body.email)){
        return res.status(400).json({status:false,message:"Email is not valid"})
    }
    const minPasswordLength=8;
    if(req.body.password<minPasswordLength){
        return res.status(400).json({status:false,message:"Password should be at least"+minPasswordLength+"characters"})
    }
    try {
        const user=await User.findOne({email:req.body.email});
        if(!user){
            return res.status(400).json({status:false,message:"User not found"})
        }
        const decryptedPassword=CryptoJS.AES.decrypt(user.password,process.env.SECRET)
        const depassword=decryptedPassword.toString(CryptoJS.enc.Utf8)
        if(depassword !== req.body.password){
            return res.status(400).json({status:false,message:"Wrong Password"})
        }
        const userToken=jwt.sign({
            id:user.id,
            userType:user.userType,
            email:user.email,

        },process.env.JWT_SECRET,{expiresIn:"25d"})
        const {password,otp,...others}=user._doc
        res.status(200).json({...others,userToken})

    } catch (error) {
        res.status(500).json({status:false,message:error.message})
    }
}
}