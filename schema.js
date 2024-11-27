const Joi = require('joi');
const review = require('./models/review');
module.exports.listingSchema = Joi.object({
    listing :Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0),
        image : Joi.string().allow("", null)
    }).required()
});

// Joi is a schema validator , i.e we create it to use all contents of schema together
// we dont need to define each content seperately and check for any validation or errro there

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating :Joi.number().required().min(1).max(5),
        comment :Joi.string().required(),
    }).required(),
});