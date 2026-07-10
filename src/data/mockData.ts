import {
  CatalogApp,
  CertDef,
  ChatContact,
  FileNode,
  CastTarget,
  CastSession,
  AppInstallStatus,
  NotificationItem,
} from '../types';

export const INITIAL_CHATS: ChatContact[] = [
  { id: 'it', name: 'IT Helpdesk', init: 'IT', color: '#0052CC', sub: 'Online · replies in ~5 min' },
  { id: 'ravi', name: 'Ravi Kumar', init: 'RK', color: '#1D9E5F', sub: 'IT Admin · online' },
  { id: 'team', name: 'Platform Team', init: 'PT', color: '#2E6BE0', sub: '8 members' },
  { id: 'ann', name: 'Announcements', init: 'A', color: '#7A5AF8', sub: 'Broadcast channel' },
];

export const DIRECTORY: ChatContact[] = [
  { id: 'ravi', name: 'Ravi Kumar', init: 'RK', color: '#1D9E5F', role: 'IT Admin', sub: '' },
  { id: 'ananya', name: 'Ananya Iyer', init: 'AI', color: '#7A5AF8', role: 'Design Lead', sub: '' },
  { id: 'marcus', name: 'Marcus Chen', init: 'MC', color: '#2E6BE0', role: 'Security Engineer', sub: '' },
  { id: 'sofia', name: 'Sofia Alvarez', init: 'SA', color: '#C97F10', role: 'HR Partner', sub: '' },
  { id: 'dev', name: 'Dev Patel', init: 'DP', color: '#0052CC', role: 'Platform Engineer', sub: '' },
  { id: 'lena', name: 'Lena Fischer', init: 'LF', color: '#D64545', role: 'Finance Ops', sub: '' },
  { id: 'tom', name: 'Tom Okafor', init: 'TO', color: '#1D9E5F', role: 'Support Lead', sub: '' },
  { id: 'grace', name: 'Grace Kim', init: 'GK', color: '#2E6BE0', role: 'Product Manager', sub: '' },
  { id: 'arjun', name: 'Arjun Mehta', init: 'AM', color: '#7A5AF8', role: 'QA Engineer', sub: '' },
  { id: 'nora', name: 'Nora Haddad', init: 'NH', color: '#C97F10', role: 'Network Engineer', sub: '' },
];

export const INITIAL_MESSAGES: Record<string, { mine: boolean; text: string; t: string }[]> = {
  it: [
    { mine: false, text: 'Hi, your device enrollment request was approved. Welcome aboard.', t: '9:02' },
    { mine: false, text: 'Two certificates are pending install — you can do that from Home → Certs.', t: '9:04' },
  ],
  ravi: [{ mine: false, text: 'Can you confirm the tunnel connects after the cert update?', t: 'Yesterday' }],
  team: [
    { mine: false, text: 'Standup moved to 10:30 today.', t: '8:45' },
    { mine: true, text: 'Noted, thanks.', t: '8:47' },
  ],
  ann: [{ mine: false, text: 'VPN gateway maintenance this Saturday 2–4 AM IST.', t: 'Mon' }],
};

export const INITIAL_UNREAD: Record<string, number> = { it: 2, ravi: 1 };

// Flat node table: folders and files both live here, linked by parentId.
// null parentId = the drive's root. This is what lets folders nest inside
// folders (Policies > HR Policies > Compliance > ...) like a real file manager.
export const FILE_NODES: FileNode[] = [
  // ---- My Drive ----
  { id: 'my-documents', name: 'Documents', drive: 'my', parentId: null, kind: 'folder', date: 'Jun 30', itemCount: 4 },
  { id: 'my-photos', name: 'Photos', drive: 'my', parentId: null, kind: 'folder', date: 'Jun 21', itemCount: 2 },
  { id: 'my-projects', name: 'Projects', drive: 'my', parentId: null, kind: 'folder', date: 'Jun 26', itemCount: 2 },
  { id: 'my-archive', name: 'Archive', drive: 'my', parentId: null, kind: 'folder', date: 'Apr 02', itemCount: 1 },
  { id: 'f2', name: 'Onboarding checklist.docx', drive: 'my', parentId: 'my-documents', kind: 'file', type: 'doc', size: '340 KB', date: 'Jun 30' },
  { id: 'f7', name: 'Expense report May.xlsx', drive: 'my', parentId: 'my-documents', kind: 'file', type: 'sheet', size: '96 KB', date: 'Jun 12' },
  { id: 'fd1', name: 'Travel itinerary.pdf', drive: 'my', parentId: 'my-documents', kind: 'file', type: 'pdf', size: '210 KB', date: 'Jun 09' },
  { id: 'fd2', name: 'Signed NDA.pdf', drive: 'my', parentId: 'my-documents', kind: 'file', type: 'pdf', size: '150 KB', date: 'May 28' },
  { id: 'f4', name: 'Office floor plan.png', drive: 'my', parentId: 'my-photos', kind: 'file', type: 'img', size: '4.8 MB', date: 'Jun 21' },
  { id: 'fph1', name: 'Team offsite.jpg', drive: 'my', parentId: 'my-photos', kind: 'file', type: 'img', size: '3.1 MB', date: 'Jun 14' },
  { id: 'my-projects-atlas', name: 'Project Atlas', drive: 'my', parentId: 'my-projects', kind: 'folder', date: 'Jun 26', itemCount: 2 },
  { id: 'fpr1', name: 'Kickoff notes.docx', drive: 'my', parentId: 'my-projects', kind: 'file', type: 'doc', size: '88 KB', date: 'Jun 18' },
  { id: 'fat1', name: 'Atlas architecture.pdf', drive: 'my', parentId: 'my-projects-atlas', kind: 'file', type: 'pdf', size: '1.4 MB', date: 'Jun 26' },
  { id: 'fat2', name: 'Atlas timeline.xlsx', drive: 'my', parentId: 'my-projects-atlas', kind: 'file', type: 'sheet', size: '112 KB', date: 'Jun 24' },
  { id: 'far1', name: '2025 tax documents.pdf', drive: 'my', parentId: 'my-archive', kind: 'file', type: 'pdf', size: '2.2 MB', date: 'Apr 02' },

  // ---- Team Drive ----
  { id: 'team-policies', name: 'Policies', drive: 'team', parentId: null, kind: 'folder', date: 'Jun 29', itemCount: 3 },
  { id: 'team-it', name: 'IT', drive: 'team', parentId: null, kind: 'folder', date: 'Jun 27', itemCount: 3 },
  { id: 'team-finance', name: 'Finance', drive: 'team', parentId: null, kind: 'folder', date: 'Jun 24', itemCount: 2 },
  { id: 'team-hr', name: 'HR', drive: 'team', parentId: null, kind: 'folder', date: 'Jun 19', itemCount: 2 },
  { id: 'team-design', name: 'Design', drive: 'team', parentId: null, kind: 'folder', date: 'Jun 25', itemCount: 2 },
  { id: 'f1', name: 'Q3 security review.pdf', drive: 'team', parentId: null, kind: 'file', type: 'pdf', size: '2.4 MB', date: 'Jun 28' },

  { id: 'team-policies-hr', name: 'HR Policies', drive: 'team', parentId: 'team-policies', kind: 'folder', date: 'Jun 29', itemCount: 2 },
  { id: 'team-policies-compliance', name: 'Compliance', drive: 'team', parentId: 'team-policies', kind: 'folder', date: 'Jun 20', itemCount: 2 },
  { id: 'fp1', name: 'Code of conduct.pdf', drive: 'team', parentId: 'team-policies', kind: 'file', type: 'pdf', size: '860 KB', date: 'Jun 18' },
  { id: 'fp2', name: 'Leave policy.pdf', drive: 'team', parentId: 'team-policies-hr', kind: 'file', type: 'pdf', size: '410 KB', date: 'Jun 29' },
  { id: 'fp3', name: 'Remote work policy.docx', drive: 'team', parentId: 'team-policies-hr', kind: 'file', type: 'doc', size: '220 KB', date: 'Jun 26' },
  { id: 'fp4', name: 'Data protection policy.pdf', drive: 'team', parentId: 'team-policies-compliance', kind: 'file', type: 'pdf', size: '1.1 MB', date: 'Jun 20' },
  { id: 'team-policies-compliance-audits', name: 'Audit reports', drive: 'team', parentId: 'team-policies-compliance', kind: 'folder', date: 'Jun 10', itemCount: 2 },
  { id: 'fca1', name: 'ISO 27001 audit 2026.pdf', drive: 'team', parentId: 'team-policies-compliance-audits', kind: 'file', type: 'pdf', size: '3.6 MB', date: 'Jun 10' },
  { id: 'fca2', name: 'SOC 2 findings.xlsx', drive: 'team', parentId: 'team-policies-compliance-audits', kind: 'file', type: 'sheet', size: '480 KB', date: 'May 22' },

  { id: 'team-it-runbooks', name: 'Runbooks', drive: 'team', parentId: 'team-it', kind: 'folder', date: 'Jun 22', itemCount: 2 },
  { id: 'team-it-configs', name: 'Device configs', drive: 'team', parentId: 'team-it', kind: 'folder', date: 'Jun 11', itemCount: 2 },
  { id: 'f3', name: 'VPN rollout plan.docx', drive: 'team', parentId: 'team-it', kind: 'file', type: 'doc', size: '1.1 MB', date: 'Jun 24' },
  { id: 'f6', name: 'Device inventory.xlsx', drive: 'team', parentId: 'team-it', kind: 'file', type: 'sheet', size: '780 KB', date: 'Jun 27' },
  { id: 'fi1', name: 'Incident response.pdf', drive: 'team', parentId: 'team-it-runbooks', kind: 'file', type: 'pdf', size: '640 KB', date: 'Jun 22' },
  { id: 'fi2', name: 'Device wipe checklist.docx', drive: 'team', parentId: 'team-it-runbooks', kind: 'file', type: 'doc', size: '180 KB', date: 'Jun 15' },
  { id: 'fic1', name: 'iOS baseline profile.pdf', drive: 'team', parentId: 'team-it-configs', kind: 'file', type: 'pdf', size: '95 KB', date: 'Jun 11' },
  { id: 'fic2', name: 'Android baseline profile.pdf', drive: 'team', parentId: 'team-it-configs', kind: 'file', type: 'pdf', size: '102 KB', date: 'Jun 11' },

  { id: 'f7b', name: 'Q2 budget summary.xlsx', drive: 'team', parentId: 'team-finance', kind: 'file', type: 'sheet', size: '540 KB', date: 'Jun 24' },
  { id: 'ffi1', name: 'Vendor contracts.pdf', drive: 'team', parentId: 'team-finance', kind: 'file', type: 'pdf', size: '1.3 MB', date: 'Jun 05' },

  { id: 'fhr1', name: 'Org chart.pdf', drive: 'team', parentId: 'team-hr', kind: 'file', type: 'pdf', size: '420 KB', date: 'Jun 19' },
  { id: 'fhr2', name: 'Holiday calendar 2026.xlsx', drive: 'team', parentId: 'team-hr', kind: 'file', type: 'sheet', size: '64 KB', date: 'Jan 05' },

  { id: 'fde1', name: 'Brand guidelines.pdf', drive: 'team', parentId: 'team-design', kind: 'file', type: 'pdf', size: '5.2 MB', date: 'Jun 25' },
  { id: 'fde2', name: 'App icon set.png', drive: 'team', parentId: 'team-design', kind: 'file', type: 'img', size: '2.7 MB', date: 'Jun 23' },

  // ---- Shared with me ----
  { id: 'shared-recordings', name: 'Recordings', drive: 'shared', parentId: null, kind: 'folder', date: 'Jun 20', itemCount: 2 },
  { id: 'shared-client-x', name: 'Client X handoff', drive: 'shared', parentId: null, kind: 'folder', date: 'Jun 16', itemCount: 2 },
  { id: 'f8', name: 'Compliance policy.pdf', drive: 'shared', parentId: null, kind: 'file', type: 'pdf', size: '1.9 MB', date: 'Jun 08' },
  { id: 'f9', name: 'Badge photo.png', drive: 'shared', parentId: null, kind: 'file', type: 'img', size: '1.2 MB', date: 'Jun 02' },
  { id: 'f5', name: 'All-hands recording.mp4', drive: 'shared', parentId: 'shared-recordings', kind: 'file', type: 'vid', size: '212 MB', date: 'Jun 20' },
  { id: 'fsr1', name: 'IT AMA recording.mp4', drive: 'shared', parentId: 'shared-recordings', kind: 'file', type: 'vid', size: '96 MB', date: 'Jun 03' },
  { id: 'fcx1', name: 'Handoff deck.pdf', drive: 'shared', parentId: 'shared-client-x', kind: 'file', type: 'pdf', size: '3.8 MB', date: 'Jun 16' },
  { id: 'fcx2', name: 'Environment access.xlsx', drive: 'shared', parentId: 'shared-client-x', kind: 'file', type: 'sheet', size: '58 KB', date: 'Jun 16' },
];

export const FILE_TYPE_STYLE: Record<string, { bg: string; c: string }> = {
  pdf: { bg: 'dangerTint', c: 'danger' },
  doc: { bg: 'infoTint', c: 'info' },
  sheet: { bg: 'successTint', c: 'success' },
  img: { bg: 'violetTint', c: 'violet' },
  vid: { bg: 'amberTint', c: 'amber' },
};

export const TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF document',
  doc: 'Word document',
  sheet: 'Spreadsheet',
  img: 'Image',
  vid: 'Video',
};

export const DRIVE_LABELS: Record<string, string> = {
  my: 'My Drive',
  team: 'Team Drive',
  shared: 'Shared with me',
};

export const APPS: CatalogApp[] = [
  {
    id: 'auth',
    name: 'Authenticator',
    pub: 'Acme Corp IT',
    size: '18 MB',
    tile: '', // brand-tinted — see AppsScreen, which falls back to colors.primary
    init: 'A',
    section: 'req',
    description: 'One-tap sign-in and MFA for all your company accounts.',
    version: '4.2.1',
    pushedDate: 'Jun 30',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    pub: 'Microsoft Corporation',
    size: '94 MB',
    tile: '#2E6BE0',
    init: 'O',
    section: 'req',
    description: 'Email, calendar and contacts, connected to your work account.',
    version: '4.2411.2',
    pushedDate: 'Jun 27',
  },
  {
    id: 'zoom',
    name: 'Zoom Workplace',
    pub: 'Zoom Video Communications',
    size: '187 MB',
    tile: '#4087FC',
    init: 'Z',
    section: 'feat',
    description: 'Video meetings, chat and phone in one place.',
    version: '6.2.0',
    pushedDate: 'Jun 24',
  },
  {
    id: 'slack',
    name: 'Slack',
    pub: 'Salesforce',
    size: '124 MB',
    tile: '#4A154B',
    init: 'S',
    section: 'feat',
    description: 'Team messaging, channels and huddles.',
    version: '24.06',
    pushedDate: 'Jun 22',
  },
  {
    id: 'notion',
    name: 'Notion',
    pub: 'Notion Labs, Inc.',
    size: '102 MB',
    tile: '#17181A',
    init: 'N',
    section: 'avail',
    usesSlot: true,
    description: 'Docs, wikis and project tracking in one workspace.',
    version: '3.13.0',
    pushedDate: 'Jun 18',
  },
  {
    id: 'figma',
    name: 'Figma',
    pub: 'Figma, Inc.',
    size: '85 MB',
    tile: '#7A5AF8',
    init: 'F',
    section: 'avail',
    usesSlot: true,
    description: 'Collaborative interface design, whiteboarding and prototyping.',
    version: '124.0',
    pushedDate: 'Jun 15',
  },
  {
    id: 'tableau',
    name: 'Tableau Mobile',
    pub: 'Salesforce',
    size: '60 MB',
    tile: '#C97F10',
    init: 'T',
    section: 'avail',
    description: 'Browse and interact with dashboards on the go.',
    version: '24.1.2',
    pushedDate: 'Jun 10',
  },
];

export const INITIAL_APP_STATUS: Record<string, AppInstallStatus> = {
  auth: 'installed',
  outlook: 'update',
  zoom: 'available',
  slack: 'available',
  notion: 'available',
  figma: 'restricted',
  tableau: 'restricted',
};

export function certDefs(orgName: string): CertDef[] {
  return [
    {
      id: 'root',
      name: orgName + ' Corporate Root CA',
      detail: 'X.509 · Expires Mar 2027',
      issuer: orgName + ' Certificate Authority',
      expires: '2027-03-18T00:00:00Z',
      serial: '7F:2C:9A:11:BB:04',
      usedFor: 'Trust chain for all managed apps and the secure tunnel',
      pushedDate: 'Jun 18',
    },
    {
      id: 'wifi',
      name: 'Wi-Fi RADIUS (EAP-TLS)',
      detail: 'Required for office Wi-Fi',
      issuer: orgName + ' Certificate Authority',
      expires: '2026-11-27T07:37:15Z',
      serial: 'A4:0E:5D:88:12:F3',
      usedFor: 'Authenticates this device to office Wi-Fi access points',
      pushedDate: 'Jun 29',
    },
    {
      id: 'vpnkey',
      name: 'VPN client key',
      detail: 'Required for the secure tunnel',
      issuer: orgName + ' Certificate Authority',
      expires: '2048-11-23T06:38:21Z',
      serial: '19:C8:73:2D:FA:E1',
      usedFor: 'Client identity for the WireGuard® secure tunnel',
      pushedDate: 'Jun 29',
    },
  ];
}

export const INITIAL_CERTS: Record<string, string> = {
  root: 'installed',
  wifi: 'pending',
  vpnkey: 'pending',
};

export const CAST_TARGETS: CastTarget[] = [
  { id: 'orion', name: 'Boardroom — Orion', sub: 'Conference display · Meeting Room 4', status: 'Ready', isAssist: false },
  { id: 'nebula', name: 'Huddle — Nebula', sub: 'Conference display · Floor 3', status: 'Ready', isAssist: false },
  { id: 'itassist', name: 'IT remote assist', sub: 'Ravi Kumar · IT Admin', status: 'Online', isAssist: true },
];

export const INITIAL_CAST_HISTORY: CastSession[] = [
  { id: 'cs1', targetName: 'IT remote assist — Ravi Kumar', initiatedBy: 'admin', startedAt: 'Yesterday · 4:12 PM', duration: '12m 40s', quality: 'HD' },
  { id: 'cs2', targetName: 'Boardroom — Orion', initiatedBy: 'me', startedAt: 'Jun 28 · 11:05 AM', duration: '38m 02s', quality: 'HD' },
  { id: 'cs3', targetName: 'IT remote assist — Ravi Kumar', initiatedBy: 'admin', startedAt: 'Jun 24 · 9:47 AM', duration: '5m 18s', quality: 'SD' },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    category: 'cast',
    title: 'Remote session requested',
    body: 'Ravi Kumar (IT Admin) wants to start a remote screen share to help with your VPN issue.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'n2',
    category: 'cert',
    title: 'Certificate expiring soon',
    body: 'Wi-Fi RADIUS (EAP-TLS) needs to be installed before it expires.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 'n3',
    category: 'broadcast',
    title: 'IT broadcast',
    body: 'VPN gateway maintenance Saturday 2–4 AM IST. Sessions may briefly drop.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 'n4',
    category: 'app',
    title: 'App update available',
    body: 'Outlook has a required update pending in Apps.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n5',
    category: 'security',
    title: 'New device sign-in',
    body: 'Your account was used to sign in on a new device from Pune, IN.',
    time: '2 days ago',
    read: true,
  },
];

export const ONBOARDING_STEPS = [
  {
    title: 'Your secure workspace key',
    body: 'One calm app for everything work on this device — enrolled, compliant and under your control.',
    cta: 'Continue',
  },
  {
    title: 'One tap to connect',
    body: 'The WireGuard® secure tunnel brings work apps and files to you — status always glanceable.',
    cta: 'Continue',
  },
  {
    title: 'You stay in control',
    body: "See exactly what your company can and can't see. Personal data stays personal — always.",
    cta: 'Get started',
  },
];
