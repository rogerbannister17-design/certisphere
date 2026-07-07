export type WorkspacePermission = 'customer-portal.workspace.read';

interface GrantedWorkspaceAccess {
  readonly granted: true;
  readonly permissions: readonly WorkspacePermission[];
}

interface DeniedWorkspaceAccess {
  readonly granted: false;
  readonly reason: string;
}

export type WorkspaceAccess = GrantedWorkspaceAccess | DeniedWorkspaceAccess;

export function resolveWorkspaceAccess(): WorkspaceAccess {
  const configuredPermissions = process.env.CERTISPHERE_BOOTSTRAP_PERMISSIONS;

  if (configuredPermissions === undefined || configuredPermissions.trim() === '') {
    return {
      granted: false,
      reason: 'Customer portal access is not configured for this environment.',
    };
  }

  const permissions = configuredPermissions
    .split(',')
    .map((permission) => permission.trim())
    .filter((permission): permission is WorkspacePermission =>
      permission === 'customer-portal.workspace.read',
    );

  if (!permissions.includes('customer-portal.workspace.read')) {
    return {
      granted: false,
      reason: 'The current principal is not authorised to read the customer portal workspace.',
    };
  }

  return {
    granted: true,
    permissions,
  };
}
