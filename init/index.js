const mongoose = require("mongoose")
const initData = require("./data.js")
const Listing = require("../models/listing.js");

const mongo_URL = "mongodb+srv://mca23akshitagupta:Divit%40123@wanderlust.ycsuh.mongodb.net/?retryWrites=true&w=majority&appName=Wanderlust";

main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){    // connectionn to db
     await mongoose.connect(mongo_URL) //{
        
    //     serverSelectionTimeoutMS: 50000,  // Increase timeout to 50 seconds
    //     socketTimeoutMS: 45000,  // Increase socket timeout
    // });
}

const initDB = async()=>{   // initialising database
    await Listing.deleteMany({});   // delete all previous data
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
};
initDB();