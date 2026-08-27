import { describe, it, expect } from 'vitest';
import { getRoleDashboardPath } from '../src/lib/auth/auth-context';
import { SEED_USERS } from '../src/lib/db/store';

describe('Role-Based Authorization & Redirection Tests', () => {
  it('should map roles to correct dashboard paths', () => {
    expect(getRoleDashboardPath('ADMIN')).toBe('/admin/dashboard');
    expect(getRoleDashboardPath('DISPATCHER')).toBe('/dispatcher/dashboard');
    expect(getRoleDashboardPath('DRIVER')).toBe('/driver/dashboard');
    expect(getRoleDashboardPath('MANAGER')).toBe('/manager/dashboard');
    expect(getRoleDashboardPath(null)).toBe('/login');
  });

  it('should contain seeded users for all 4 roles', () => {
    const roles = SEED_USERS.map((u) => u.role);
    expect(roles).toContain('ADMIN');
    expect(roles).toContain('DISPATCHER');
    expect(roles).toContain('DRIVER');
    expect(roles).toContain('MANAGER');
  });
});
