import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.route('/health').get((req, res) => {
  res.send("Yoo!! What's uppp.");
});

export { app };
