// joi: joi is a package use for the schema validation rather then check one by one we can directly apply the joi to detact the mssing validation

const Joi=require('joi')
const review = require('./models/review')


module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    category: Joi.string()
      .valid("Accessories", "Electronics", "Home Appliance", "Furniture", "Others")
      .required(),
    itemName: Joi.string().required(),
    description: Joi.string().allow(""),   // description is not required
    image: Joi.object({
      url: Joi.string().uri().allow(""),   // optional image url
      filename: Joi.string().allow("")
    }).optional(),
    pricePerDay: Joi.number().required(),
    city: Joi.string().allow(""),          // optional
    country: Joi.string().allow(""),       // optional
  }).required()
});


module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comments:Joi.string().required()
    }).required()
})