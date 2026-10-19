import { ApiError } from '../utils/api_error.js';
import { sendResponse } from '../utils/send_reponse.js';

const setRequestProperty = (req, prop, value) => {
  try {
    req[prop] = value;
  } catch {}

  if (req[prop] !== value) {
    Object.defineProperty(req, prop, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
};

export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const targetSource = source === 'param' ? 'params' : source;

      const isMultiPart =
        schema?.shape &&
        (schema.shape.body || schema.shape.query || schema.shape.params);

      const dataToValidate = isMultiPart
        ? {
            body: req.body,
            query: req.query,
            params: req.params,
          }
        : (req[targetSource] ?? {});

      const result = await schema.safeParseAsync(dataToValidate);

      if (!result.success) {
        const issues = result.error.issues || result.error.errors || [];
        const formattedErrors = issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
        }));

        const errorMessage =
          formattedErrors.length > 0
            ? formattedErrors[0].message
            : 'Validation failed';

        return sendResponse(
          res,
          new ApiError({
            statusCode: 400,
            message: errorMessage,
            errors: formattedErrors,
          })
        );
      }

      if (isMultiPart) {
        if (result.data.body !== undefined) {
          setRequestProperty(req, 'body', result.data.body);
        }
        if (result.data.query !== undefined) {
          setRequestProperty(req, 'query', result.data.query);
        }
        if (result.data.params !== undefined) {
          setRequestProperty(req, 'params', result.data.params);
          setRequestProperty(req, 'param', result.data.params);
        }
        setRequestProperty(req, 'data', result.data);
      } else {
        setRequestProperty(req, targetSource, result.data);
        if (targetSource === 'params') {
          setRequestProperty(req, 'param', result.data);
        }
        setRequestProperty(req, 'data', result.data);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');

export default {
  validateBody,
  validateQuery,
  validateParams,
};
