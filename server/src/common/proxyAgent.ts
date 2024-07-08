import { socksDispatcher } from 'fetch-socks';
import type { SocksProxy } from 'socks';
import { ProxyAgent } from 'undici';

export const getProxyUrl = () => {
  return process.env.VIEWTUBE_PROXY_URL;
};

export const proxyEnabled = () => {
  return getProxyUrl() !== undefined;
};

type ProxyAgentEntry = {
  usages: number;
  agent: ProxyAgent;
  uri: string;
};

const proxyAgentPool: ProxyAgentEntry[] = [];

const proxyAgentUses = 100;

const getHttpProxyAgent = (proxyUrl: string) => {
  const existingAgent = proxyAgentPool.find(entry => entry.usages < 10 && entry.uri === proxyUrl);
  let proxyAgent: ProxyAgent;

  if (existingAgent) {
    proxyAgent = existingAgent.agent;
  } else {
    const agent = new ProxyAgent({
      uri: proxyUrl
    });
    proxyAgentPool.push({
      agent,
      usages: 0,
      uri: proxyUrl
    });
    proxyAgent = agent;
  }

  const done = async () => {
    const entry = proxyAgentPool.find(entry => entry.agent === proxyAgent);
    if (entry) {
      entry.usages++;
    }

    for (const [index, entry] of proxyAgentPool.entries()) {
      if (entry.usages >= proxyAgentUses) {
        await entry.agent.close();
        proxyAgentPool.splice(index, 1);
        break;
      }
    }
  };

  return { proxyAgent, done };
};

const getSocksProxyAgent = (proxyUrl: string) => {
  const socksProxy = parseSocksURL(proxyUrl);
  const socksProxyAgent = socksDispatcher(socksProxy);
  return {
    proxyAgent: socksProxyAgent,
    done: async () => {
      await socksProxyAgent.close();
    }
  };
};

export const getDispatcher = (proxyUrl: string) => {
  if (proxyUrl.match(/^https?:\/\//)) {
    return getHttpProxyAgent(proxyUrl);
  } else if (proxyUrl.startsWith('https://')) {
    return getHttpProxyAgent(proxyUrl);
  } else if (proxyUrl.startsWith('socks')) {
    return getSocksProxyAgent(proxyUrl);
  }
};

function parseSocksURL(url: string): SocksProxy {
  const socksUrl = new URL(url);
  let type: SocksProxy['type'] = 5;
  const host = socksUrl.hostname;

  const port = parseInt(socksUrl.port, 10) || 1080;

  switch (socksUrl.protocol.replace(':', '')) {
    case 'socks4':
    case 'socks4a':
      type = 4;
      break;
    case 'socks5':
    case 'socks':
    case 'socks5h':
      type = 5;
      break;
    default:
      type = 5;
      break;
  }

  const proxy: SocksProxy = {
    host,
    port,
    type
  };

  if (socksUrl.username) {
    Object.defineProperty(proxy, 'userId', {
      value: decodeURIComponent(socksUrl.username),
      enumerable: false
    });
  }

  if (socksUrl.password != null) {
    Object.defineProperty(proxy, 'password', {
      value: decodeURIComponent(socksUrl.password),
      enumerable: false
    });
  }

  return proxy;
}
