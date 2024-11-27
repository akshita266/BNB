const mongoose = require("mongoose");
const Schema = mongoose.Schema; 
const Review = require("./review.js");


const ImageSchema = new Schema({
    filename: {
        type: String,
        //required: true
    },
    url: {
        type: String,
        required: true
    }
});

const ListingSchema = new Schema({
    title: {
        type : String,
        required : true,
    },    
    description : String,
    image: {
        type: ImageSchema,
        default: {
            filename:"default-image.jpg",
            url: "https://unsplash.com/photos/a-person-walking-down-a-path-in-the-rain-ITzcIAcCdZM"
        }
    },    
    price : Number,
    location : String,
    country : String,
    reviews :[
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        }
    ]

});

//the given below will delete the reviews if lsiting is deleted
ListingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({ _id:{$in : listing.reviews}});
    }
    
})

// Middleware to ensure default image values are applied
// ListingSchema.pre('save', function(next) {
//     if (!this.image || !this.image.filename || !this.image.url) {
//         this.image = {
//             filename: "default-image.jpg",
//             url: "https://unsplash.com/photos/a-person-walking-down-a-path-in-the-rain-ITzcIAcCdZM"
//         };
//     }
//     next();
// });
const Listing = mongoose.model("Listing",ListingSchema);
module.exports = Listing;

//"https://unsplash.com/photos/a-person-walking-down-a-path-in-the-rain-ITzcIAcCdZM"