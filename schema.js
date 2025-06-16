// joi: joi is a package use for the schema validation rather then check one by one we can directly apply the joi to detact the mssing validation

const Joi=require('joi')
const review = require('./models/review')

module.exports.listingSchema=Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.number().required(),
        price:Joi.number().required(),
        country:Joi.number().required(),
        image: Joi.any()
        // image:Joi.string().required(),  

    }).required()
})

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comments:Joi.string().required()
    }).required()
})