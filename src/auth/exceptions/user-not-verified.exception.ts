import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotVerifiedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Please verify your email before signing in. Check your inbox for the verification code.',
        error: 'USER_NOT_VERIFIED',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
