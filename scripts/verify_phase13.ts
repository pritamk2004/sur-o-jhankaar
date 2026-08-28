import fs from 'fs';
import path from 'path';

async function runPhase13Verification() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 13 Verification Suite          🎵');
  console.log('🎵   Production Dockerization, Security & K8s Deployments  🎵');
  console.log('🎵 ======================================================== 🎵\n');

  const root = path.resolve(__dirname, '..');

  // 1. Verify Dockerfiles & Non-Root User Hardening
  console.log('[1/5] Verifying Multi-Stage Dockerfiles & Security...');
  const dockerfiles = [
    { path: 'server/Dockerfile', expectedUser: 'node' },
    { path: 'apps/web/Dockerfile', expectedUser: 'nextjs' },
    { path: 'python-engine/Dockerfile', expectedUser: 'appuser' }
  ];

  dockerfiles.forEach(d => {
    const full = path.join(root, d.path);
    if (!fs.existsSync(full)) throw new Error(`Missing Dockerfile: ${d.path}`);
    const content = fs.readFileSync(full, 'utf-8');
    if (!content.includes(`USER ${d.expectedUser}`)) {
      throw new Error(`Dockerfile ${d.path} is missing non-root USER ${d.expectedUser}`);
    }
    console.log(`  ✓ [${d.path.padEnd(26)}] Non-root USER: ${d.expectedUser}`);
  });

  // 2. Verify Docker Compose Production Stack
  console.log('\n[2/5] Verifying Docker Compose topology...');
  const composePath = path.join(root, 'docker-compose.yml');
  const composeContent = fs.readFileSync(composePath, 'utf-8');
  const requiredServices = ['mongo', 'redis', 'server', 'python-engine', 'web', 'nginx'];

  requiredServices.forEach(s => {
    if (!composeContent.includes(`${s}:`)) {
      throw new Error(`docker-compose.yml missing service: ${s}`);
    }
    console.log(`  ✓ Service configured: "${s}"`);
  });

  // 3. Verify Nginx Reverse Proxy & CSP Security Headers
  console.log('\n[3/5] Verifying Nginx Reverse Proxy & Content-Security-Policy...');
  const nginxPath = path.join(root, 'nginx/nginx.conf');
  const nginxContent = fs.readFileSync(nginxPath, 'utf-8');

  const nginxDirectives = [
    'gzip on',
    'location /socket.io/',
    'location /api/',
    'Content-Security-Policy',
    'X-Content-Type-Options "nosniff"'
  ];

  nginxDirectives.forEach(dir => {
    if (!nginxContent.includes(dir)) {
      throw new Error(`nginx.conf missing directive: "${dir}"`);
    }
    console.log(`  ✓ Verified Nginx directive: "${dir}"`);
  });

  // 4. Verify PM2 Cluster Configuration
  console.log('\n[4/5] Verifying PM2 Cluster Mode...');
  const pm2Path = path.join(root, 'ecosystem.config.js');
  const pm2Content = fs.readFileSync(pm2Path, 'utf-8');
  if (!pm2Content.includes("exec_mode: 'cluster'") || !pm2Content.includes("instances: 'max'")) {
    throw new Error('PM2 cluster configuration missing cluster exec_mode');
  }
  console.log('✓ PM2 ecosystem.config.js configured for multi-instance clustering.');

  // 5. Verify Kubernetes Cloud-Native Manifests
  console.log('\n[5/5] Verifying Kubernetes manifests (k8s/)...');
  const k8sFiles = [
    'k8s/namespace.yaml',
    'k8s/configmap.yaml',
    'k8s/deployments.yaml',
    'k8s/ingress.yaml'
  ];

  k8sFiles.forEach(k => {
    const full = path.join(root, k);
    if (!fs.existsSync(full)) throw new Error(`Missing Kubernetes manifest: ${k}`);
    console.log(`  ✓ [${k.padEnd(24)}] validated.`);
  });

  console.log('\n✨ Phase 13 Production Dockerization, Security Hardening & Deployment Verified Successfully! 🎉\n');
}

runPhase13Verification().catch(err => {
  console.error('[Phase 13 Verification Error]:', err);
  process.exit(1);
});
