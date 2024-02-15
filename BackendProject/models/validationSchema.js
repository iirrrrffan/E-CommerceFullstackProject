const joi= require("joi")
const joiUserSchema=joi.object({
    name:joi.string(),
    username:joi.string().min(3).max(30).alphanum().required(),
    email:joi.string().email(),
    password:joi.string().min(3).max(19).required()

})

module.exports={joiUserSchema}