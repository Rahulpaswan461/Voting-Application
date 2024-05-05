const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
     name:{
        type:String,
        require:true,
     },
     age:{
        type:Number,
        required:true,
     },
     email:{
        type:String,
        required:true,
     },
     mobile:{
        type:String,
        required:true,
     },
     address:{
        type:String,
        required:true,
     },
     aadharCardNumber:{
        type:Number,
        required:true,
        unique:true,
     },
     password:{
        type:String,
        required:true,
     },
     role:{
        type:String,
        enum:["voter","admin"],
        default:"voter"
     },
     isVoted:{
        type:Boolean,
        default:false,
     }
},{timestamps:true})


userSchema.pre("save",async function(next){
    const user = this;

    if(!user.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(10);

        // hash the password before saving into the database
        const hashedPassword = await bcrypt.hash(user.password,salt)

        user.password = hashedPassword
       return next();
    }catch(error){
        return next(error);
    }
})

userSchema.method.comparePassword = async function(candidatePassword){
     try{
        const isMath = await bcrypt.compare(candidatePassword,this.password)
        return isMath;
     }
     catch(error){
        throw error;
     }
}

const User = mongoose.model("user",userSchema)

module.exports = User
