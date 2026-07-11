export type Ownership = 'personal' | 'company';

export interface EnrollmentForm {
  name: string;
  email: string;
  empId: string;
  dept: string;
  own: Ownership;
}

export interface Permissions {
  notif: boolean;
  vpn: boolean;
  mgmt: boolean;
  loc: boolean;
}

export type VpnStatus = 'off' | 'connecting' | 'on';

export type AppInstallStatus =
  | 'installed'
  | 'available'
  | 'update'
  | 'installing'
  | 'restricted'
  | 'requested';

export interface CatalogApp {
  id: string;
  name: string;
  pub: string;
  size: string;
  tile: string;
  init: string;
  section: 'req' | 'feat' | 'avail';
  usesSlot?: boolean;
  description: string;
  version: string;
  pushedDate: string;
}

export type CertStatus = 'pending' | 'installing' | 'installed';

export interface CertDef {
  id: string;
  name: string;
  detail: string;
  issuer: string;
  expires: string;
  serial: string;
  usedFor: string;
  pushedDate: string;
}

export interface ChatMessage {
  mine: boolean;
  text: string;
  t: string;
}

export interface ChatContact {
  id: string;
  name: string;
  init: string;
  color: string;
  sub: string;
  role?: string;
}

export type FileType = 'pdf' | 'doc' | 'sheet' | 'img' | 'vid';
export type DriveId = 'my' | 'team' | 'shared';

// A single flat node table models the folder tree: folders and files both
// live here, linked by parentId (null = drive root). This is what lets
// "folders inside folders" work without a separate tree structure.
export interface FileNode {
  id: string;
  name: string;
  drive: DriveId;
  parentId: string | null;
  kind: 'folder' | 'file';
  type?: FileType;
  size?: string;
  date: string;
  itemCount?: number;
}

export type CastStatus = 'idle' | 'connecting' | 'live';

export interface CastTarget {
  id: string;
  name: string;
  sub: string;
  status: string;
  isAssist: boolean;
}

export interface CastSession {
  id: string;
  targetName: string;
  initiatedBy: 'me' | 'admin';
  startedAt: string;
  duration: string;
  quality: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type AppScreen = 'onboard' | 'enroll' | 'pending' | 'perms' | 'app' | 'left';

export type NotificationCategory = 'cert' | 'broadcast' | 'app' | 'cast' | 'security';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// Audit trail — every state-changing action a person or IT takes on this device.
export type ActivityKind = 'app' | 'cert' | 'tunnel' | 'sync' | 'cast' | 'security' | 'enroll';

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  time: string;
  actor: string; // 'you' | 'IT · Ravi Kumar'
}

export type ToastTone = 'success' | 'info' | 'danger';

export interface ToastMsg {
  id: number;
  message: string;
  tone: ToastTone;
}
