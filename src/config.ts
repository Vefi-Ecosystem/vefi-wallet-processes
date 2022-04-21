import express from 'express';
import morgan from 'morgan';
import router from './router';

const _config = (app: express.Express) => {
  app.use(express.json());
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST, DELETE, GET');
    next();
  });
  app.use(morgan('combined'));
  app.use('/', router);
};

export default _config;
