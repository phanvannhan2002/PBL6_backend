const Joi = require("joi");
const { UnProcessableEntityError } = require("../core/error.response");

const signUp = async (req, res, next) => {
  const signUpSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
  }).unknown(false);
  try {
    await signUpSchema.validateAsync(req.body, {abortEarly: false});
    return next();
  } catch (error) {
    next(new UnProcessableEntityError(error.details.map((err) =>  err.message)));
  }
};

module.exports = { signUp };
