require("dotenv").config()
const express = require("express")
const userRoute = require("./routes/user")
const {connectDB} = require("./connection")
const  candidateRoute = require("./routes/candidates")

const app = express()
const PORT = process.env.PORT || 1200;

connectDB(process.env.MONGO_URL)
.then(()=>console.log("mongoDB is connected"))
.catch(()=>console.log("There is some error"))

const bodyParser = require("body-parser")
app.use(bodyParser.json());

app.use(express.urlencoded({extended:false}))

app.use("/user",userRoute)
app.use("/candidate",candidateRoute)

app.listen(PORT,()=>{
    console.log("Server is running ")
})