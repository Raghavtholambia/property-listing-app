const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const reviews=require('./review')
const users=require('./users')
const listingSchema =new Schema({
    title:{
        type:String,
        require:true,
    },
    description:String,
image: {
  url: String,
  filename: String
},
    price:Number,
    location:String,
    country:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"reviews"
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"userSchema"
    }
})
//when the listing delete all the reviews will be delete with the help of this middleware

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing)
        await reviews.deleteMany({_id:{$in:listing.reviews}})        
    })

const listing=mongoose.model("listing",listingSchema);

module.exports=listing;