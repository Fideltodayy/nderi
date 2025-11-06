import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (_e) {
    return false;
  }
}

function getDesiredPort() {
  const argPort = process.argv[2];
  if (argPort && /^\d+$/.test(argPort)) return argPort;
  return process.env.PORT || '5000';
}

function main() {
  const pidFile = resolve(projectRoot, 'server.pid');

  if (existsSync(pidFile)) {
    const existingPid = Number.parseInt(readFileSync(pidFile, 'utf8').trim(), 10);
    if (Number.isFinite(existingPid) && isProcessRunning(existingPid)) {
      console.log(`Server already running with PID ${existingPid}.`);
      return;
    }
  }

  const port = getDesiredPort();
  const child = spawn(process.execPath, [resolve(projectRoot, 'dist', 'index.js')], {
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port) },
    detached: true,
    stdio: 'ignore',
  });

  writeFileSync(pidFile, String(child.pid), 'utf8');
  child.unref();
  console.log(`Server started on port ${port} with PID ${child.pid}.`);
}

main();


