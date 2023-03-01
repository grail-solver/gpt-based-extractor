import HttpException from './httpException';

class RouteNotFoundException extends HttpException {
  constructor() {
    super(404, 'Oups ! This route do not exist.', ['Oups ! This route do not exist.']);
  }
}

export default RouteNotFoundException;