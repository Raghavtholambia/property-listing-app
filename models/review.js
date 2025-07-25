const mongoose=require('mongoose')
const Schema=mongoose.Schema;

const reviewsSchema=new Schema({
    comments:String,
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"userSchema"
    }
})

module.exports=mongoose.model("reviews",reviewsSchema)