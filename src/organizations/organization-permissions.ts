import { Action, createPermissions } from '../common/permissions';

const RESOURCE: 'ORGANIZATION' = 'ORGANIZATION';

export const OrgPerm = (...actions: Action[]) =>
  createPermissions(RESOURCE, ...actions);
