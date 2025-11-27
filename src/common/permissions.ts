// XEIDAP Permission System
export enum Action {
  EXECUTE = 'X', // eXecute: view/list/run processes
  EDIT = 'E',    // Edit: modify existing data
  INSERT = 'I',  // Insert: create new data
  DELETE = 'D',  // Delete: remove data
  APPROVE = 'A', // Approve/Authorize
  PRINT = 'P',   // Print: generate reports/exports
}

export type Resource =
  | 'DASHBOARD'
  | 'ORGANIZATION'
  | 'BENEFIT'
  | 'OCCASION'
  | 'CLUSTER'
  | 'MEMBER'
  | 'MENU'
  | 'ACCESS'
  | 'PERSON'
  | 'USER';

export type PermissionCode = `${Resource}:${Action}`;

// Helper function to create permission codes for a resource
export function createPermissions(
  resource: Resource,
  ...actions: Action[]
): PermissionCode[] {
  return actions.map((action) => `${resource}:${action}` as PermissionCode);
}
