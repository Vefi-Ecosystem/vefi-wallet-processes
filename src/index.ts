import express from 'express';
import logger from './logger';
import { port as PORT } from './env';

const port: number = parseInt(PORT || '15500');
const app: express.Express = express();

app.listen(port, () => logger('Server running on port %d', port));
