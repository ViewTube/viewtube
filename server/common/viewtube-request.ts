import { FastifyRequest } from 'fastify';
import { Multipart } from 'fastify-multipart';

export interface ViewTubeRequest extends FastifyRequest {
  user?: {
    username: string;
  };
}
