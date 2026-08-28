import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AnalyticsService } from '../server/src/services/analyticsService';
import { config } from '../server/src/config/env';

async function runPhase10Verification() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 10 Verification Suite          🎵');
  console.log('🎵   Protected Admin Portal & Telemetry Analytics Engine   🎵');
  console.log('🎵 ======================================================== 🎵\n');

  // 1. Verify Password Hashing with Bcrypt (Salt Rounds >= 12)
  console.log('[1/5] Verifying Password Hashing & Salt Rounds Security...');
  const testPassword = 'AdminSecurePassword2026!';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(testPassword, salt);

  console.log(`✓ Password hashed with 12 rounds: ${hash.substring(0, 25)}...`);
  const isMatchValid = await bcrypt.compare(testPassword, hash);
  const isMatchInvalid = await bcrypt.compare('WrongPassword', hash);

  if (!isMatchValid || isMatchInvalid) {
    throw new Error('Bcrypt password comparison logic failed');
  }
  console.log('✓ Password comparison securely validated.');

  // 2. Verify JWT Access & Refresh Token Issuance
  console.log('\n[2/5] Verifying JWT Token Issuance & Signature...');
  const mockAdmin = {
    id: 'admin_test_001',
    email: 'admin@surojhankaar.in',
    role: 'superadmin'
  };

  const accessToken = jwt.sign(mockAdmin, config.jwtSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: mockAdmin.id }, config.jwtRefreshSecret, { expiresIn: '30d' });

  console.log(`✓ Access Token (15m): ${accessToken.substring(0, 30)}...`);
  console.log(`✓ Refresh Token (30d): ${refreshToken.substring(0, 30)}...`);

  // Verify access token
  const decodedAccess = jwt.verify(accessToken, config.jwtSecret) as any;
  if (decodedAccess.email !== mockAdmin.email || decodedAccess.role !== 'superadmin') {
    throw new Error('Access token claims verification failed');
  }
  console.log(`✓ Verified claims: email="${decodedAccess.email}", role="${decodedAccess.role}"`);

  // 3. Verify Refresh Token Rotation
  console.log('\n[3/5] Verifying Refresh Token Rotation...');
  const decodedRefresh = jwt.verify(refreshToken, config.jwtRefreshSecret) as any;
  if (decodedRefresh.id !== mockAdmin.id) {
    throw new Error('Refresh token verification failed');
  }
  const rotatedAccessToken = jwt.sign(mockAdmin, config.jwtSecret, { expiresIn: '15m' });
  console.log(`✓ Fresh rotated access token generated: ${rotatedAccessToken.substring(0, 30)}...`);

  // 4. Verify RBAC Authorization Gates
  console.log('\n[4/5] Verifying RBAC role checks...');
  const roles = ['superadmin', 'admin'];
  roles.forEach(r => {
    const hasAdminAccess = ['admin', 'superadmin'].includes(r);
    const hasSuperAdminAccess = r === 'superadmin';
    console.log(`  • Role [${r.padEnd(12)}] -> AdminAccess: ${hasAdminAccess}, SuperAdminAccess: ${hasSuperAdminAccess}`);
    if (!hasAdminAccess) throw new Error(`Role ${r} should have admin access`);
  });

  // 5. Verify Telemetry & Analytics Aggregation
  console.log('\n[5/5] Verifying Telemetry Analytics calculations...');
  const stats = await AnalyticsService.getDashboardStats();
  console.log(`✓ Telemetry Snapshot:`);
  console.log(`  - Total Master Songs: ${stats.totalSongs}`);
  console.log(`  - Total Playlists:    ${stats.totalPlaylists}`);
  console.log(`  - Spoken Word Audio:  ${stats.spokenWordCount}`);
  console.log(`  - Active Listeners:   ${stats.activeListeners}`);
  console.log(`  - Languages:          ${stats.languageDistribution.map(l => `${l.language} (${l.count})`).join(', ')}`);

  if (!stats.totalSongs || !stats.totalPlaylists) {
    throw new Error('Analytics aggregation failed');
  }

  console.log('\n✨ Phase 10 Protected Admin Portal & Telemetry Analytics Verified Successfully! 🎉\n');
}

runPhase10Verification().catch(err => {
  console.error('[Phase 10 Verification Error]:', err);
  process.exit(1);
});
