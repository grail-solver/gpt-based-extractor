
class HttpException extends Error {
  public status: number;
  public message: string;
  public errors: Array<String>;
  
  constructor(status: number, message: string, errors: Array<String>) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}
  
export default HttpException;