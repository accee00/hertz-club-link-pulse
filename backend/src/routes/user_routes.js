import { Router } from 'express';
import { signUp } from '../controllers/user_controller.js';
import { validateBody } from '../middleware/validation_middleware.js';
import { signUpUserSchema } from '../zod-schema/user_schemas.js';
const router = Router();

router.route('/signup').post(validateBody(signUpUserSchema), signUp);

export default router;
