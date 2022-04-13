import express from 'express';
import debug from 'debug';
import { port as PORT } from './env';

const logger = debug('index');
const port: number = parseInt(PORT || '15500');
const app: express.Express = express();

app.listen(port, () => logger('Server running on port %d', port));
