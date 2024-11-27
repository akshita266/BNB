const express = require("express")
const app = express();
const mongoose = require("mongoose");
const Listing  = require("./models/listing.js")
const path = require("path");
const mongo_URL = "mongodb+srv://mca23akshitagupta:Divit%40123@wanderlust.ycsuh.mongodb.net/?retryWrites=true&w=majority&appName=Wanderlust";
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")    // for constant item like navbar
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { error } = require("console");
const {listingSchema, reviewSchema} = require("./schema.js")   // using joi for schema validation
const Review =require("./models/review.js");
const review = require("./models/review.js");

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
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true})); // for show route
app.use(methodOverride("_method"))
app.engine("ejs", ejsMate)
app.use(express.static(path.join (__dirname, "/public")))

app.get("/",(req,res)=>{
    res.send("Hi i am root");
})
//Index route , will show headings of all data with their respective links]
app.get("/listings", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});

}));

//NEw Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
});

// SHow Route
app.get("/listings/:id", wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");  // populate helps to show details
    res.render("listings/show.ejs",{listing});
}));

//CReate Route
app.post("/listings", wrapAsync(async (req, res, next)=>{
    
        const newListing = new Listing(req.body.listing);
    if (!req.body.listing.image) {
        newListing.image = {
            filename: "https://unsplash.com/photos/a-person-walking-down-a-path-in-the-rain-ITzcIAcCdZM",
            url: "https://unsplash.com/photos/a-person-walking-down-a-path-in-the-rain-ITzcIAcCdZM"
        };
    } // here listing is from the new.js whuch is used to create  object so that can we use all inputs of form in one go
    let result = listingSchema.validate(req.body);  // joi will check whether all contents are appropiate or not
    console.log(result);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    await newListing.save();
    res.redirect("/listings"); // directing the new form created to the index where all listings are shown
    
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id", wrapAsync(async(req,res)=>{
    try {
        const { id } = req.params; // Extracting id from URL
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).send("Error updating listing");
    } // updated to bothe index and show ejs
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
}));

//POST ROute (Reviews)
app.post("/listings/:id/reviews", async (req, res) => {
    try {
        let listing = await Listing.findById(req.params.id);

        if (!listing) {
            // Handle case where listing isn't found
            return res.status(404).send("Listing not found");
        }

        // Create the new review object
        let newReview = new Review(req.body.review);

        // Add the review to the listing's reviews array
        listing.reviews.push(newReview);

        // Save the new review and update the listing
        await newReview.save();
        await listing.save();

        // Skip validation on unmodified fields (like image)
        await listing.save({ validateModifiedOnly: true });

        // Redirect back to the listing page
        res.redirect(`/listings/${listing._id}`);
    } catch (error) {
        console.error("Error while adding review:", error);
        res.status(500).send("An error occurred while processing your request.");
    }
});

//Delete route Review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    let{id, reviewId}= req.params;
    await Listing.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
    // pull operator removes from an existing array al instances of a value
    // or values that match a specified condition
    await Review.findByIdAndDelete(reviewId);
    
    res.redirect(`/listings/${id}`);
}))

// app.get("/testListing",async (req,res)=>{
//     try {
//         let sampleListing = new Listing({
//             title: "New Villa",
//             description: "Near beach",
//             price: 1200,
//             location: "Goa",
//             country: "India",
//         });
//         await sampleListing.save();
//         console.log("Sample was saved");
//         res.send("Successful");
//     } catch (err) {
//         console.error("Error saving data:", err);
//         res.status(500).send("Error saving data");
//     }
   
// });

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found"))    // shows error when we go on a page thta is not there
})
app.use((err, req, res, next)=>{  
    let{statusCode = 500, message= "Something Went Wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});     //error handling by middleware
         // now this message will be shown incase of error instad of showing error codes to user 
})
app.listen(8080, ()=>{
    console.log("server is listening to port 8080")
});