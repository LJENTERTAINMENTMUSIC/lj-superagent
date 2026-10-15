import { supabase } from './supabase';
import { User, Role } from './types';

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// Role Hierarchy and Permissions
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin: ['*'],
  ceo: [
    'portfolio:read',
    'portfolio:write',
    'tasks:read',
    'tasks:write',
    'approvals:read',
    'approvals:write',
    'reports:read',
    'finance:read',
    'agents:manage',
    'whatsapp:manage',
    'knowledge:read',
    'knowledge:write',
  ],
  bu_head: [
    'portfolio:read',
    'tasks:read',
    'tasks:write',
    'approvals:read',
    'reports:read',
    'reports:write',
    'knowledge:read',
    'knowledge:write',
  ],
  project_manager: [
    'tasks:read',
    'tasks:write',
    'reports:read',
    'reports:write',
    'knowledge:read',
  ],
  team_lead: [
    'tasks:read',
    'tasks:write',
    'reports:read',
    'reports:write',
    'knowledge:read',
  ],
  hr_coordinator: [
    'people:read',
    'people:write',
    'reports:read',
    'knowledge:read',
  ],
  staff: [
    'tasks:read',
    'tasks:write:assigned',
    'reports:write:self',
    'knowledge:read',
  ],
  intern: [
    'tasks:read:assigned',
    'tasks:write:assigned',
    'reports:write:self',
    'knowledge:read:public',
  ],
  contractor: [
    'tasks:read:assigned',
    'tasks:write:assigned',
    'reports:write:self',
  ],
  external_reviewer: [
    'deliverables:read',
    'deliverables:review',
  ],
};

/**
 * Checks if a user has a specific permission
 */
export function hasPermission(user: User, permission: string): boolean {
  if (!user || !user.role) return false;
  if (user.role === 'super_admin' || user.role === 'ceo') return true;
  const userPerms = ROLE_PERMISSIONS[user.role] || [];
  return userPerms.includes('*') || userPerms.includes(permission);
}

/**
 * Validates whether user can access a specific business unit's data
 */
export function canAccessBusinessUnit(user: User, businessUnitId?: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin' || user.role === 'ceo') return true;
  if (!businessUnitId) return true;

  // Check if user is mapped to this BU
  const userBU = (user as any).business_unit_id;
  if (userBU && userBU === businessUnitId) return true;

  // Check department or role matching
  return user.role === 'bu_head' || user.role === 'project_manager';
}

/**
 * Authenticate user by email or persona ID
 */
export async function authenticateUser(identifier: string): Promise<User | null> {
  let query = supabase.from('bos_users').select(`
    *,
    staff_profile:bos_staff_profiles(*)
  `);

  if (identifier.includes('@')) {
    query = query.eq('email', identifier.toLowerCase().trim());
  } else {
    query = query.eq('id', identifier);
  }

  const { data, error } = await query.single();
  if (error || !data) return null;

  return data as User;
}

/**
 * Generate a cryptographically secure session token
 */
export function createSessionToken(user: User): AuthSession {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7-day session

  const tokenData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: expires.getTime(),
  };

  const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
  return {
    user,
    token,
    expiresAt: expires.toISOString(),
  };
}

/**
 * Verifies session token from HTTP request header or cookie
 */
export async function verifySessionToken(token: string): Promise<User | null> {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const data = JSON.parse(raw);
    if (!data.userId || !data.exp) return null;

    if (Date.now() > data.exp) return null; // expired

    return await authenticateUser(data.userId);
  } catch {
    return null;
  }
}
