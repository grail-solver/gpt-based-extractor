if(!process.env.ALREADY_SET) {
    require('dotenv').config();
}

import * as http from 'http';
import { app } from './app';
import { Logger } from './utils/logger';

const logger: any = new Logger();
const port = parseInt(process.env.PORT || '3000', 10);
const server = http.createServer(app).listen(port);

server.on('error', (error) => logger.errorHandler(server, port, error));
server.on('listening', async () => {
    // await DatabaseService.getConnections();
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    logger.log('info', `${ process.env.SERVICE_NAME } listening on ${ bind }`);
})
