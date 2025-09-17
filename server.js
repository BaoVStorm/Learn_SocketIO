import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import initSocketIO from './socketio/index.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOW_ORIGIN?.split(',') || '*' }));
app.use(express.static('public'));

const server = http.createServer(app);

// khởi tạo socketIO
initSocketIO(server);

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));