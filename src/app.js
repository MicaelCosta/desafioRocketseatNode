import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import sentryConfig from './config/sentry';
import 'express-async-errors';
import routes from './routes';

import './database';

class App {
    constructor() {
        // inicia o server
        this.server = express();

        // Monitora os erros
        Sentry.init(sentryConfig);

        // realiza a chamada dos metódos iniciais
        this.middlewares();
        this.routes();
        this.exceptionHandler();
    }

    middlewares() {
        this.server.use(Sentry.Handlers.requestHandler());

        this.server.use(cors());

        // middlewares para formatação dos dados da requisição em Json
        this.server.use(express.json());

        // middlewares para visualização da imagem atraves do retorno da url
        this.server.use(
            '/files',
            express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
        );
    }

    routes() {
        this.server.use(routes);
        this.server.use(Sentry.Handlers.errorHandler());
    }

    exceptionHandler() {
        // middleware de tratamento de exceções
        this.server.use(async (err, req, res, next) => {
            if (process.env.NODE_ENV === 'development') {
                const errors = await new Youch(err, req).toJSON();

                return res.status(500).json(errors);
            }

            return res.status(500).json({ error: 'Internal Server Error' });
        });
    }
}

export default new App().server;
