const mongoose = require('mongoose'); // <-- fix here
const {Schema}=mongoose;
const pasportLocalMongoose=require('passport-local-mongoose')

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    }
})
userSchema.plugin(pasportLocalMongoose)
module.exports=mongoose.model("userSchema",userSchema)