import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import validator from "validator";


// Login USer 
const loginUser = async (req,res) => {
    const {email,password} = req.body
    try {
        const user = await userModel.findOne({email})

        if (!user) {
             return res.json({success:false,message:"User Doesn't Not Exist"})
        }

        const isMatch = await bcryptjs.compare(password,user.password)

        if (!isMatch) {
            return res.json({success:false,message:"Invalid Password"})
        }

        const token =  createToken(user._id)
        res.json({success:true,message:"Successfully Login",token})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }

 }

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
    }


// Register User 
const registerUser = async (req,res) => {
    const {name,email,password} = req.body;
    try {
        // Checking user already exists
        const exists = await userModel.findOne({email})
        if(exists) {
            return res.json({success:false,message:"User Already Exists"})
        }
        // validating email and strong password
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Please Enter A Valid Email"})
        }

        if (password.length<8) {
            return res.json({success:false,message:"Enter A Strong Password"})
        }

        // hashing user Password

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password,salt)

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,message:"User Created Successfully",token})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}

export {loginUser , registerUser}