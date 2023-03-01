import express from "express";
import { Logger } from './utils/logger';
import { routes as apiRoutes } from "./routes/index";
import errorMiddleware from "./middlewares/error";
import RouteNotFoundException from "./exceptions/routeNotFoundException";

const app = express();
const logger = new Logger();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

const serviceBasedUrl = '/api/'+process.env.API_VERSION;

app.use(serviceBasedUrl, apiRoutes);

app.get(serviceBasedUrl+'/health', (req, res) => res.json({
    status: true,
    version: 'v0',
    maj:  '2023-03-01, 19:43',
    message: `Welcome to ${ process.env.SERVICE_NAME } api! - Health OK 😎️`
}))

app.use((req, res, next) => {
    next(new RouteNotFoundException());
});

app.use(errorMiddleware)

export { app };
