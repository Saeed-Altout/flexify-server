import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        if (Array.isArray(body.message)) {
          message = body.message.join(', ');
        } else if (typeof body.message === 'string') {
          message = body.message as string;
        } else if (typeof body.error === 'string') {
          message = body.error as string;
        }
      } else {
        message = exception.message ?? message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Standardized error envelope
    response.status(status).json({
      data: null,
      status: 'error',
      message,
    });
  }
}
