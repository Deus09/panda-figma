#!/usr/bin/env node
import { execSync } from 'node:child_process';

const PORT = process.argv[2] || '8101';
console.log(`🔍 Port ${PORT} teşhis ediliyor...`);

function run(cmd){
  try { return execSync(cmd,{stdio:'pipe'}).toString().trim(); } catch(e){ return e.stdout?.toString() || e.message; }
}

console.log('\n[lsof]');
console.log(run(`lsof -iTCP -sTCP:LISTEN -Pn | grep ${PORT} || echo BOS`));

console.log('\n[netstat]');
console.log(run(`netstat -tulnp 2>/dev/null | grep ${PORT} || echo BOS`));

console.log('\n[process list match]');
console.log(run(`ps -ef | grep -E '${PORT}|vite|ionic' | grep -v grep || echo BOS`));

console.log('\n[Node binaries]');
console.log(run('which node || echo yok'));
console.log(run('which vite || echo vite_yok'));

console.log('\nNot: strictPort=true ile Vite bu port doluysa hata verip çıkmalıdır. Burada BOS görüyorsan ama Vite başka porta geçiyorsa farklı bir config instance çalıştırılıyor olabilir.');
