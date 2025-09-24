import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message:
          'Account not found. Please check your email or sign up for a new account.',
        error: 'ACCOUNT_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
