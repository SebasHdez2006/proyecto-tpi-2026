import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'https://localhost';

const perNode = {
  app1: new Counter('hits_app1'),
  app2: new Counter('hits_app2'),
  app3: new Counter('hits_app3'),
};

export const options = {
  vus: 10,
  duration: '30s',
  insecureSkipTLSVerify: true,
};

export default function () {
  const res = http.get(`${BASE}/api/v1/info`);
  check(res, { 'status 200': (r) => r.status === 200 });
  const node = res.json('node_id');
  if (perNode[node]) perNode[node].add(1);
}

export function handleSummary(data) {
  const counts = {};
  for (const n of ['app1', 'app2', 'app3']) {
    counts[n] = data.metrics[`hits_${n}`]?.values.count ?? 0;
  }
  console.log('Distribución por nodo:', JSON.stringify(counts));
  return { stdout: JSON.stringify({ nodes: counts }, null, 2) + '\n' };
}
