import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyPluginOptions,
  FastifyRegisterOptions
} from 'fastify';

export async function registerFastifyPlugin<Options extends FastifyPluginOptions>(
  app: NestFastifyApplication,
  plugin:
    | FastifyPluginCallback<Options>
    | FastifyPluginAsync<Options>
    | Promise<{
        default: FastifyPluginCallback<Options>;
      }>
    | Promise<{
        default: FastifyPluginAsync<Options>;
      }>,
  opts?: FastifyRegisterOptions<Options>
): Promise<FastifyInstance> {
  return (await app.register(plugin as never, opts as never)) as unknown as FastifyInstance;
}
