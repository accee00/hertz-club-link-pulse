import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['MONGODB_URI', 'JWT_SECRET'];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`${variable} is not defined in environment variables`);
  }
}

const config = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  PORT: Number(process.env.PORT) || 3000,
};

export { config };
export default config;
