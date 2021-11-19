import Joi from 'joi';

export const validationSchema = Joi.object({
  // Without these, ViewTube won't work
  VIEWTUBE_URL: Joi.string().uri().required(),

  // These have a usable default value
  PORT: Joi.number().default(8066),

  VIEWTUBE_DATABASE_HOST: Joi.string().default('localhost'),
  VIEWTUBE_DATABASE_PORT: Joi.number().default(27017),
  VIEWTUBE_DATABASE_USER: Joi.string().optional(),
  VIEWTUBE_DATABASE_PASSWORD: Joi.string().optional(),

  VIEWTUBE_REDIS_HOST: Joi.string().default('localhost'),
  VIEWTUBE_REDIS_PORT: Joi.number().default(6379),
  VIEWTUBE_REDIS_PASSWORD: Joi.string().optional(),

  VIEWTUBE_JWT_EXPIRATION_TIME: Joi.number().default(43200),
  VIEWTUBE_ALLOWED_DOMAIN: Joi.string().default(/^viewtube\.io|\.viewtube\.io$/),
  VIEWTUBE_DATA_DIRECTORY: Joi.string().default('/data'),
  VIEWTUBE_CLUSTERED: Joi.boolean().default(true),

  // These are not required for ViewTube to run
  VIEWTUBE_YOUTUBE_COOKIE: Joi.string().optional(),
  VIEWTUBE_YOUTUBE_IDENTIFIER: Joi.string().optional()
});
