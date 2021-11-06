import cluster from 'cluster';
import os from 'os';
import { Injectable } from '@nestjs/common';
import Consola from 'consola';

const cpuCount = os.cpus().length;

@Injectable()
export class AppClusterService {
  static get isClustered() {
    if (!this._clustered) {
      const production = process.env.NODE_ENV === 'production';
      const clusterEnabled = !(process.env.VIEWTUBE_CLUSTERED as any === false || process.env.VIEWTUBE_CLUSTERED === 'false');
      this._clustered = Boolean(production && clusterEnabled);
    }

    return this._clustered;
  }

  private static _clustered = null;

  static clusterize(bootstrap: () => void): void {
    if (cluster.isPrimary) {
      Consola.info(`Primary node started: pid ${process.pid}`);
      for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker, code, _signal) => {
        Consola.warn(`Worker ${worker.process.pid} died with code ${code}. Restarting worker.`);
        cluster.fork();
      });
    } else {
      Consola.info(`Worker node started: pid ${process.pid}`);
      bootstrap();
    }
  }
}
