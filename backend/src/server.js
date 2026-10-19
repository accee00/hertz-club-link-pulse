import { app } from './app.js';
import config from './config/config.js';
import { connectDB } from './config/db.js';

const port = config.PORT;

try {
  await connectDB();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
