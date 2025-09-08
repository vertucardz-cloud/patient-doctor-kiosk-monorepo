import * as Joi from 'joi';
import { AnySchema } from 'joi';

const password = (type: 'user' | 'smtp'): AnySchema => {
  const types = [
    {
      type: 'user',
      schema: Joi.string().min(8).max(16),
    },
    {
      type: 'smtp',
      schema: Joi.string().regex(
        /^[a-z-0-9\-]{2,12}\.[a-z]{2,16}\.[a-z]{2,8}$/i
      ),
    },
  ];
  return types.find((h) => h.type === type)?.schema ?? Joi.string(); // fallback
};

export { password };
