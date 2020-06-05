//Validation
const Joi = require("@hapi/joi");

const animeAddValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "any.required": `"nome" é obrigrtorio`,
    }),
    episodesWatched: Joi.number().required(),
    status: Joi.number().required(),
    anilistId: Joi.number().required(),
  });

  return schema.validate(data);
};

module.exports.animeAddValidation = animeAddValidation;
