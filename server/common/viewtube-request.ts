import { FastifyRequest } from 'fastify';
import { Multipart } from 'fastify-multipart';

export interface ViewTubeRequest extends FastifyRequest {
  file(arg0: { limits: { fieldNameSize: number; fileSize: number; files: number } }): Multipart;
  user?: {
    username: string;
  };
}
