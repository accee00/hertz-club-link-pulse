import { asyncHandler } from '../utils/async_handler.js';
import { User } from '../models/user_model.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { ApiError } from '../utils/api_error.js';
import { userRegisterSchema } from '../zod-schema/user_schemas.js';

const registerUser = asyncHandler(async (req, res) => {
  const validation = userRegisterSchema.safeParse(req.body);

  if (!validation.success) {
    const firstErrorMessage =
      validation.error.issues[0]?.message || 'Validation failed';
    throw new ApiError({
      statusCode: 400,
      message: firstErrorMessage,
      errors: validation.error.issues,
    });
  }

  const data = validation.data;
  const { email, password } = data;

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: { email },
      message: 'User registered successfully',
    })
  );
});

export { registerUser };
