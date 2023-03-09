import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyPluginOptions,
  FastifyRegisterOptions
} from 'fastify';

export function registerFastifyPlugin<Options extends FastifyPluginOptions>(
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
  return app.register(plugin, opts);
}
