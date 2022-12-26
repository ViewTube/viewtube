import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

export const checkParams = (...params: string[]): boolean => {
  return params.every(param => typeof param === 'string' && param.length > 0);
};

export const throwChannelError = (
  error: { message?: string; code?: number; response?: { status?: number } },
  errorMessage: string
) => {
  const returnError = {
    message: errorMessage,
    description: error?.message,
    code: error?.code,
    status: error?.response?.status
  };
  if (error?.response?.status === 404) {
    throw new NotFoundException(returnError);
  }
  throw new InternalServerErrorException(returnError);
};
