const mongoose = require('mongoose'); // <-- fix here
const initData = require('./data.js');
const listing = require('../models/listing.js');

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');
        console.log("connected...");

        // Initialize DB after successful connection
        await initDB();
       // await printData()
    } catch (err) {
        console.log(err);
    }
}

const initDB = async () => {
    await listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
        ...obj,
        owner:"682d4b86d53f18b349e1499f"
    }))
    await listing.insertMany(initData.data);

    console.log("Data is initialized");
    // let lis =await listing.find()
    // console.log(lis);
    
};

// const printData= async()=>{
//     const data=await listing.find();
//     console.log("data: ",data);

    
// }

main(); // run the main function