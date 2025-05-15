const User = require('../models/user'); 
const bcrypt = require('bcrypt')
const jwt  =require('jsonwebtoken')
const {JWT_SECRET}=require('../utils/config')



const authController ={
    // register 
register:async(req,res)=>{
    try{
        // return res.status(200).json({message:'Registration successfully'})
        const {name,email,password} =req.body;
        // validate input
        if(!name||!email || !password){
            return res.status(400).json({message:'All fields are required'});
        }
        // check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({message:'All ready user exists'})
        }
        // encrypt the password
        const hashedPassword =await bcrypt.hash(password,10)
        // create new user
        const newUser =new User({
            name,email,password:hashedPassword
        })
        // save user to database
        await newUser.save();
        // send response
       return res.status(200).json({message:'User register successfully'})

    }catch(error){
            return res.status(500).json({message:'Registration failed'})
    }
},
// Login
login:async(req,res)=>{
    try{
        // get details from the request body
        const {email,password}=req.body;

        // validate input
        if(!email || !password){
            return res.status(400).json({message:'All fields are required'})
        }

        // check is user exists
        // const existingUser =await User.findOne({email})
        const existingUser = await User.findOne({ email });
         if(!existingUser){
            return res.status(400).json({message:'Invalid credentials'})
        }

         // check is user exists
        const isPasswordValid =await bcrypt.compare(password,existingUser.password);

         if(!isPasswordValid){
            return res.status(400).json({message:'Invalid credentials'})
        }

        // create a JWT token 
        const token =jwt.sign({id:existingUser._id},JWT_SECRET,{expiresIn:'1h'})

        // set the token in a cookies
        res.cookie('token',token,{
            httpOnly:true,
            secure:false,
            sameSite:'Strict',
            maxAge:3600000  //1 hour
        });
        // send response
         return res.status(200).json({message:'Login successful'})
    }catch(error){
        return res.status(500).json({message:'login failed'})
    }
},
// Logout
logout:async(req,res)=>{
    try{
        // clear the cookies
        res.clearCookie('token');
        // send response
        res.status(200).json({message:'logout successful'})
    }catch(error){
        return res.status(500).json({message:'logout failed'})
    }
},
// me
me:async(req,res)=>{
    try{
        const userId =req.userId;

        // find the user by ID
        const user =await User.findById(userId).select('-password -_v');
        if(!user){
           return res.status(404).json({message:'User not found'}); 
        }
        // send response
        return res.status(200).json({user});
    }catch(error){
        return res.status(500).json({message:'profile picture failed'})
    }
},
}
module.exports=authController;


