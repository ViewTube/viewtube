import cluster from 'cluster';
import os from 'os';
import { Injectable, Logger } from '@nestjs/common';

const cpuCount = os.cpus().length;

@Injectable()
export class AppClusterService {
  private static readonly logger = new Logger('AppClusterService');

  static get isClustered() {
    if (!this._clustered) {
      const production = process.env.NODE_ENV === 'production';
      const clusterEnabled = !(
        Boolean(process.env.VIEWTUBE_CLUSTERED) === false ||
        process.env.VIEWTUBE_CLUSTERED === 'false'
      );
      this._clustered = Boolean(production && clusterEnabled);
    }

    return this._clustered;
  }

  private static _clustered = null;

  static clusterize(bootstrap: () => void): void {
    if (cluster.isPrimary) {
      this.logger.log(`Primary node started: pid ${process.pid}`);
      for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker, code, _signal) => {
        this.logger.warn(`Worker ${worker.process.pid} died with code ${code}. Restarting worker.`);
        cluster.fork();
      });
    } else {
      this.logger.log(`Worker node started: pid ${process.pid}`);
      bootstrap();
    }
  }
}
