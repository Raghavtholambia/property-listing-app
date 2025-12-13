const notification= require("../models/Notification"); // add at top

const check= async()=>{
    console.log("hhe;;o");
    
    const res=await notification.find();
    console.log(res);
}
check();