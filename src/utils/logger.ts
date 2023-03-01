import * as winston from 'winston';

class Logger{
    public createLogger(loggerName: string) {
        return winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { name: loggerName },
            transports: [new winston.transports.Console()]
        });
    }

    public log(type: string, message: string) {
        console.log('['+type.toUpperCase()+']: ' + message);
    }

    public errorHandler = (server: any, port: Number, error: any) => {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const address = server.address();
        const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
        switch (error.code) {
            case 'EACCES':
                this.log('error', bind + ' requires elevated privileges.');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                this.log('error', bind + ' is already in use.');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

export { Logger }