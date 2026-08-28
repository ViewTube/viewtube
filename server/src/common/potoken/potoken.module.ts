import { Global, Module } from '@nestjs/common';
import { PoTokenService } from './potoken.service';

/**
 * Global like the innertube helper: one attestation is shared by every feature that talks
 * to YouTube, and a second would be both wasteful and a second identity.
 */
@Global()
@Module({
  providers: [PoTokenService],
  exports: [PoTokenService]
})
export class PoTokenModule {}
