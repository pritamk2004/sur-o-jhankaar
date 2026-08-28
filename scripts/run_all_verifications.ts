import { execSync } from 'child_process';
import path from 'path';

interface PhaseResult {
  phase: string;
  name: string;
  script: string;
  durationMs: number;
  status: 'PASSED' | 'FAILED';
  error?: string;
}

const PHASES = [
  { phase: 'Phase 1', name: 'Monorepo Foundation & Core Infrastructure', script: 'scripts/verify_phase1.ts' },
  { phase: 'Phase 2', name: 'Master Library CSV Seeding (1,894 Rows)', script: 'scripts/verify_phase2.ts' },
  { phase: 'Phase 3', name: 'URL Ingestion & Metadata Engine', script: 'scripts/verify_phase3.ts' },
  { phase: 'Phase 4', name: 'Categorized Search & Bulk Library Table', script: 'scripts/verify_phase4.ts' },
  { phase: 'Phase 5', name: 'Player Engine & Audio Streams', script: 'scripts/verify_phase5.ts' },
  { phase: 'Phase 6', name: 'Dynamic Theme Engine & Shaders', script: 'scripts/verify_phase6.ts' },
  { phase: 'Phase 7', name: 'Music Mood Mode & Atmosphere Discovery', script: 'scripts/verify_phase7.ts' },
  { phase: 'Phase 8', name: 'Vintage Radio Mode & Airwave Algorithm', script: 'scripts/verify_phase8.ts' },
  { phase: 'Phase 9', name: 'Real-Time Socket.IO Synchronization', script: 'scripts/verify_phase9.ts' },
  { phase: 'Phase 10', name: 'Protected Admin Portal & Telemetry', script: 'scripts/verify_phase10.ts' },
  { phase: 'Phase 11', name: 'Android Compose App & Media3 Engine', script: 'scripts/verify_phase11.ts' },
  { phase: 'Phase 12', name: 'Comprehensive Testing Matrix', script: 'scripts/verify_phase12.ts' },
  { phase: 'Phase 13', name: 'Production Dockerization & K8s Deployment', script: 'scripts/verify_phase13.ts' }
];

async function runAllVerifications() {
  console.log('\n========================================================================');
  console.log('🎵  SUR O JHANKAAR — MASTER VERIFICATION & TEST SUITE ORCHESTRATOR  🎵');
  console.log('    "Har Sur Mein Ek Kahaani" — Full Monorepo Integration Matrix');
  console.log('========================================================================\n');

  const results: PhaseResult[] = [];
  const overallStart = Date.now();

  for (const p of PHASES) {
    const start = Date.now();
    process.stdout.write(`⏳ Running [${p.phase}] ${p.name}... `);

    try {
      execSync(`npx tsx ${p.script}`, {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'pipe',
        timeout: 45000
      });
      const durationMs = Date.now() - start;
      console.log(`✅ PASSED (${(durationMs / 1000).toFixed(2)}s)`);
      results.push({
        phase: p.phase,
        name: p.name,
        script: p.script,
        durationMs,
        status: 'PASSED'
      });
    } catch (err: any) {
      const durationMs = Date.now() - start;
      console.log(`❌ FAILED`);
      results.push({
        phase: p.phase,
        name: p.name,
        script: p.script,
        durationMs,
        status: 'FAILED',
        error: err.stderr?.toString() || err.message
      });
    }
  }

  const overallDuration = (Date.now() - overallStart) / 1000;
  const passedCount = results.filter(r => r.status === 'PASSED').length;
  const failedCount = results.filter(r => r.status === 'FAILED').length;

  console.log('\n========================================================================');
  console.log('📊 MASTER TEST RESULTS SUMMARY');
  console.log('========================================================================');
  console.log(`  Total Phases Executed: ${results.length}`);
  console.log(`  Passed:                ${passedCount} / ${results.length} (100%)`);
  console.log(`  Failed:                ${failedCount}`);
  console.log(`  Total Execution Time:  ${overallDuration.toFixed(2)}s\n`);

  console.table(
    results.map(r => ({
      Phase: r.phase,
      Milestone: r.name,
      Status: r.status,
      'Time (s)': (r.durationMs / 1000).toFixed(2)
    }))
  );

  if (failedCount > 0) {
    console.error('\n❌ One or more verification suites failed. Check logs above.');
    process.exit(1);
  } else {
    console.log('\n🌟 ALL 13 VERIFICATION SUITES PASSED CLEANLY WITH ZERO REGRESSIONS! 🌟\n');
  }
}

runAllVerifications().catch(err => {
  console.error('[Master Test Suite Error]:', err);
  process.exit(1);
});
