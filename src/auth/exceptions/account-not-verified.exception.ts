import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountNotVerifiedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Account not verified. Please verify your email before signing in.',
        error: 'ACCOUNT_NOT_VERIFIED',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
