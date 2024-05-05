const express = require("express")
const {jwtAuthMiddleware} = require("../jwt")
const Candidate = require("../models/candidate")
const User = require("../models/user")

const router = express.Router()

const checkAdminRole = async (userID) => {
    try{
         const user = await User.findById(userID);
         if(user.role === 'admin'){
             return true;
         }
    }catch(err){
         return false;
    }
 }
 
 // POST route to add a candidate
 router.post('/', jwtAuthMiddleware, async (req, res) =>{
     try{
         if(!(await checkAdminRole(req.user.id)))
             return res.status(403).json({message: 'user does not have admin role'});
 
         const data = req.body // Assuming the request body contains the candidate data
 
         // Create a new User document using the Mongoose model
         const newCandidate = new Candidate(data);
 
         // Save the new user to the database
         const response = await newCandidate.save();
         console.log('data saved');
        return res.status(200).json({response: response});
     }
     catch(err){
         console.log(err);
         res.status(500).json({error: 'Internal Server Error'});
     }
 })

router.patch("/:candidateId",jwtAuthMiddleware,async (req,res)=>{
     try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({msg:"User is not authorized "})
        }
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData,{
            new:true,
            runValidators:true
        })

         if(!response){
            return res.status(404).json({msg:"Candidate not found !!!"})
         }

         return res.status(200).json(response)
     }
     catch(error){
        console.log(error)
        return res.status(500).json({msg:"Internal server error"})
     }
})
router.delete("/:candidateId",jwtAuthMiddleware,async (req,res)=>{
     try{
           if(!checkAdminRole(req.user.id)){
            return res.status(403).json({msg:"User is not authorized "})
           }
           const candidateId = req.params.candidateId;
           const response = await Candidate.findByIdAndDelete(candidateId)

           if(!response)
            return res.status(404).json({msg:"Candidate data is not found !!"})

           return res.status(200).json({msg:"Candidate deleted successfully : "})
     }
     catch(error){
         console.log(error)
         return res.status(500).json({msg:"Internal server error"})
     }
})

// lets start the voting 

router.post("/vote/:candidateId",jwtAuthMiddleware,async (req,res)=>{
    //   Admin can not give the vote
    //one use can only give the vote once
     const candidateId = req.params.candidateId;
     const userId = req.user.id;
     try{
        //  find the candidte for the voting 
        const candidate = await Candidate.findById(candidateId)
        if(!candidate)
            return res.status(404).json({msg:"candidate is not found !!!"})

        const user = await User.findById(userId)
        if(!user)
            return res.status(404).json({msg:"user is not found"})

        if(user.isVoted)
            return res.status(400).json({msg:"You have already voted !!"})
         
        if(user.role ==='admin')
            return res.status(400).json({msg:"Admin not allow for vote !!!"})

        candidate.votes.push({user:userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user as well
        user.isVoted=true;
        await user.save()

        return res.status(200).json({msg:"Vote give successfully !!!"})
     }
     catch(error){
        console.log(error)
        return res.status(500).json({msg:"Internal server error"})
     }
})

// vote count ----------------------------------------
router.get("/vote/count",async (req,res)=>{
    try{
        // find all the candidat and store in descending order
      const candidate = await Candidate.find({}).sort({voteCount :'desc'})

    //   map the candidate to only return there name and voteCount
        const voteRecords = await candidate.map((data)=>{
             return {
                party:data.party,
                count:data.voteCount
             }
        })

        return res.status(200).json(voteRecords)
    }
    catch(error){
        console.log(error)
        return res.status(500).json({msg:"internal server error"})  
    } 
})

router.get("/",async (req,res)=>{
     try{
         const candidate = await Candidate.find({})

         const records = await candidate.map(data=>{
            return {
                name:data.name,
                party:data.party,
                age:data.age
            }
         })
         return res.status(200).json(records)
     }
     catch(error){
        console.log(error)
        return res.status(500).json({msg:"Internal Server error"})
     }
})


module.exports = router