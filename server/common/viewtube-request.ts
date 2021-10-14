import { FastifyRequest } from 'fastify';

export interface ViewTubeRequest extends FastifyRequest {
  user?: {
    username: string;
  };
}
