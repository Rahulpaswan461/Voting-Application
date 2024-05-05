const express = require("express")
const User = require("../models/user");
const { jwtAuthMiddleware,generateToken } = require("../jwt");

const router = express.Router()
const checkForAdmin = async () => {
   const adminCount = await User.countDocuments({ role: 'admin' });
   return adminCount > 0 ? false : true;
}



router.post("/signup",async (req,res)=>{
     try{
      //   if(!(await checkForAdmin())){
      //     return res.status(404).json({msg:'Admin is already there !'})
      //   }
        const data = req.body;

        const newUser = new User(data)
        const response = await newUser.save();
        console.log("user is saved")
        
        const payload  = {
            id:response.id
        }
        console.log(JSON.stringify(payload))
        const token = generateToken(payload)
        console.log("Token is ",token)

        res.status(200).json({response:response,token:token})
     }
     catch(error){
        console.log(error)
        res.status(500).json({error:"Internal Server error"})
     }
})

router.post("/login",async (req,res)=>{
    try{
         const {aadharCardNUmber,password} = req.body;

         const user = await User.findOne({aadharCardNumber,password})

         if(!user)
          return res.status(401).json({error:"Invalid username or password"})

          const payload ={
            id:user.id,
          }
          const token = generateToken(payload)

        return res.json(token)
    }
    catch(error){
         console.error(error)
         res.status(500).json({error:"Internal Server Error"})
    }
})

router.get("/profile",jwtAuthMiddleware,async (req,res)=>{
     try{
        const userData = req.user;
        console.log(req.user)
        const userId = userData.id;
        const user = await User.findById(userId)

        return res.status(200).json(user);
     }
     catch(error){
        console.log(error)
        res.status(500).json({error:"Internal Server error"})
     }
})

router.patch("/profile/password",jwtAuthMiddleware,async (req,res)=>{
     try{
        const userId = req.user.id;
        const {currentPassword,newPassword} = req.body; //Extract the current and the new Password

        const user = await User.findById(userId)

     
        // first we compare the current password from the database and then return the access to the new password
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:"Invalid username or password"})
        }

        user.password = newPassword
        await user.save();

        console.log("password updated")
        res.status(200).json({msg:"Message updated"})
     }
     catch(error){

     }
})

module.exports = router