const mongoose = require("mongoose")

function connectDB(filePath){
     return mongoose.connect(filePath)
}

module.exports ={
    connectDB,
}