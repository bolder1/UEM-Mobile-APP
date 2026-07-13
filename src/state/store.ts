import { create } from 'zustand';
import {
  ActivityEntry,
  ActivityKind,
  AppInstallStatus,
  CastSession,
  CastStatus,
  CastTarget,
  ChatContact,
  ChatMessage,
  DriveId,
  EnrollmentForm,
  NotificationItem,
  Permissions,
  ThemeMode,
  ToastMsg,
  ToastTone,
  VpnStatus,
} from '../types';
import { BrandTheme } from '../theme/colors';
import {
  APPS,
  CAST_TARGETS,
  certDefs,
  DIRECTORY,
  INITIAL_ACTIVITY,
  INITIAL_APP_STATUS,
  INITIAL_CAST_HISTORY,
  INITIAL_CERTS,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_UNREAD,
} from '../data/mockData';

export const ORG_NAME = 'Acme Corp';
export const DEFAULT_USER_NAME = 'Priya Sharma';

interface AppStoreState {
  // identity / enrollment
  form: EnrollmentForm;
  formErr: boolean;
  approved: boolean;
  perms: Permissions;

  // theme
  themeMode: ThemeMode;
  brandTheme: BrandTheme;

  // vpn
  vpn: VpnStatus;
  vpnSecs: number;
  vpnDown: number;
  vpnUp: number;
  vpnPing: number;

  // apps catalog
  appSt: Record<string, AppInstallStatus>;
  progress: Record<string, number>;

  // certs
  certs: Record<string, string>;

  // home feed
  broadcastAcked: boolean;
  lastSync: string;
  syncing: boolean;

  // chat
  chats: ChatContact[];
  messages: Record<string, ChatMessage[]>;
  unread: Record<string, number>;
  draft: string;
  typing: boolean;
  activeChat: string | null;

  // files — folder navigation: currentFolderId is the folder currently open
  // for that drive (null = drive root). Each drive remembers its own place.
  drive: DriveId;
  currentFolderId: string | null;
  fileFilter: 'all' | 'doc' | 'pdf' | 'media';

  // cast
  cast: CastStatus;
  castTarget: CastTarget | null;
  castSecs: number;
  castHistory: CastSession[];
  incomingCastSession: boolean;

  // notifications
  notifications: NotificationItem[];

  // audit trail + transient feedback
  activity: ActivityEntry[];
  toast: ToastMsg | null;

  // unenroll
  unVal: string;

  // actions — identity/enrollment
  updateForm: (patch: Partial<EnrollmentForm>) => void;
  submitForm: () => boolean;
  setApproved: (v: boolean) => void;
  setPerm: (key: keyof Permissions, v: boolean) => void;

  // actions — theme
  setThemeMode: (m: ThemeMode) => void;
  setBrandTheme: (b: BrandTheme) => void;

  // actions — vpn
  toggleVpn: () => void;

  // actions — apps
  appAction: (id: string) => void;

  // actions — certs
  installCert: (id: string) => void;

  // actions — home
  ackBroadcast: () => void;
  syncNow: () => void;

  // actions — chat
  openChat: (id: string) => void;
  startChatWithContact: (id: string) => void;
  setDraft: (v: string) => void;
  sendMsg: () => void;

  // actions — files
  setDrive: (d: DriveId) => void;
  openFolder: (id: string) => void;
  goToFolder: (id: string | null) => void;
  setFileFilter: (f: 'all' | 'doc' | 'pdf' | 'media') => void;

  // actions — cast
  startCast: (target: CastTarget) => void;
  stopCast: () => void;
  dismissIncomingCast: () => void;

  // actions — notifications
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;

  // actions — audit + feedback
  logActivity: (kind: ActivityKind, title: string, detail: string, actor?: string) => void;
  showToast: (message: string, tone?: ToastTone, opts?: { logged?: boolean; actor?: string }) => void;
  hideToast: () => void;

  // actions — unenroll / reset
  setUnVal: (v: string) => void;
  resetAll: () => void;
}

let vpnInterval: ReturnType<typeof setInterval> | null = null;
let castInterval: ReturnType<typeof setInterval> | null = null;
const appInstallIntervals: Record<string, ReturnType<typeof setInterval>> = {};
const timers: ReturnType<typeof setTimeout>[] = [];
function later(fn: () => void, ms: number) {
  timers.push(setTimeout(fn, ms));
}

const initialState = {
  form: { name: '', email: '', empId: '', dept: 'Engineering', own: 'personal' as const },
  formErr: false,
  approved: false,
  perms: { notif: false, vpn: false, mgmt: false, loc: false },
  themeMode: 'light' as ThemeMode,
  brandTheme: 'orange' as BrandTheme,
  vpn: 'off' as VpnStatus,
  vpnSecs: 0,
  vpnDown: 0,
  vpnUp: 0,
  vpnPing: 18,
  appSt: { ...INITIAL_APP_STATUS } as Record<string, AppInstallStatus>,
  progress: {} as Record<string, number>,
  certs: { ...INITIAL_CERTS },
  broadcastAcked: false,
  lastSync: '2 min ago',
  syncing: false,
  chats: [...INITIAL_CHATS],
  messages: JSON.parse(JSON.stringify(INITIAL_MESSAGES)) as Record<string, ChatMessage[]>,
  unread: { ...INITIAL_UNREAD },
  draft: '',
  typing: false,
  activeChat: null as string | null,
  drive: 'my' as DriveId,
  currentFolderId: null as string | null,
  fileFilter: 'all' as const,
  cast: 'idle' as CastStatus,
  castTarget: null as CastTarget | null,
  castSecs: 0,
  castHistory: [...INITIAL_CAST_HISTORY],
  incomingCastSession: true,
  notifications: [...INITIAL_NOTIFICATIONS],
  activity: [...INITIAL_ACTIVITY],
  toast: null as ToastMsg | null,
  unVal: '',
};

let toastSeq = 1;

export const useAppStore = create<AppStoreState>((set, get) => ({
  ...initialState,

  updateForm: (patch) => set((s) => ({ form: { ...s.form, ...patch }, formErr: false })),

  submitForm: () => {
    const s = get();
    if (!s.form.name.trim() || !s.form.email.trim()) {
      set({ formErr: true });
      return false;
    }
    set((st) => ({ form: { ...st.form, empId: st.form.empId || 'ACM-1042' } }));
    get().logActivity('enroll', 'Enrollment requested', 'Sent to IT for approval', 'you');
    later(() => get().setApproved(true), 7000);
    return true;
  },

  setApproved: (v) => {
    const was = get().approved;
    set({ approved: v });
    if (v && !was) {
      get().logActivity('enroll', 'Device enrolled', 'Personal (BYOD) · work profile created', 'IT · Ravi Kumar');
    }
  },

  setPerm: (key, v) => {
    const changed = get().perms[key] !== v;
    set((s) => ({ perms: { ...s.perms, [key]: v } }));
    // Location is a privacy-relevant toggle reachable post-enrollment; make it
    // audit-visible. The onboarding permission gate stays silent.
    if (key === 'loc' && changed) {
      get().logActivity(
        'privacy',
        v ? 'Location sharing turned on' : 'Location sharing turned off',
        v ? 'Used only for office geofence check-in' : 'IT can no longer see your location',
        'you',
      );
      get().showToast(v ? 'Location sharing on' : 'Location sharing off', 'info', { logged: true, actor: 'you' });
    }
  },

  setThemeMode: (m) => set({ themeMode: m }),
  setBrandTheme: (b) => set({ brandTheme: b }),

  toggleVpn: () => {
    const s = get();
    if (s.vpn === 'off') {
      set({ vpn: 'connecting' });
      later(() => {
        set({ vpn: 'on', vpnSecs: 0, vpnDown: 186, vpnUp: 42, vpnPing: 18 });
        get().logActivity('tunnel', 'Secure tunnel connected', 'WireGuard® · office gateway', 'you');
        get().showToast('Secure tunnel connected', 'success', { logged: true, actor: 'you' });
        vpnInterval = setInterval(() => {
          set((st) => {
            const dn = Math.max(64, Math.min(324, st.vpnDown + Math.round(Math.random() * 96 - 48)));
            const up = Math.max(12, Math.min(120, st.vpnUp + Math.round(Math.random() * 36 - 18)));
            const pg = 15 + Math.round(Math.random() * 7);
            return { vpnSecs: st.vpnSecs + 1, vpnDown: dn, vpnUp: up, vpnPing: pg };
          });
        }, 1000);
      }, 2200);
    } else if (s.vpn === 'on') {
      if (vpnInterval) clearInterval(vpnInterval);
      set({ vpn: 'off', vpnSecs: 0 });
      get().logActivity('tunnel', 'Secure tunnel disconnected', 'Traffic no longer routed through work', 'you');
      get().showToast('Secure tunnel disconnected', 'info', { logged: true, actor: 'you' });
    }
  },

  appAction: (id) => {
    const st = get().appSt[id];
    const name = APPS.find((a) => a.id === id)?.name || 'App';
    const wasUpdate = st === 'update';
    if (st === 'restricted') {
      set((s) => ({ appSt: { ...s.appSt, [id]: 'requested' } }));
      get().logActivity('app', `Requested ${name}`, 'Sent to IT for approval', 'you');
      get().showToast(`Requested ${name} — IT will review`, 'info', { logged: true, actor: 'you' });
      return;
    }
    if (st === 'available' || st === 'update') {
      set((s) => ({ appSt: { ...s.appSt, [id]: 'installing' }, progress: { ...s.progress, [id]: 0 } }));
      const int = setInterval(() => {
        const cur = get();
        const p = (cur.progress[id] || 0) + 4 + Math.random() * 7;
        if (p >= 100) {
          clearInterval(int);
          delete appInstallIntervals[id];
          set({ appSt: { ...cur.appSt, [id]: 'installed' }, progress: { ...cur.progress, [id]: 100 } });
          get().logActivity('app', `${wasUpdate ? 'Updated' : 'Installed'} ${name}`, 'Pushed by IT · work profile', 'you');
          get().showToast(`${wasUpdate ? 'Updated' : 'Installed'} ${name}`, 'success', { logged: true, actor: 'you' });
        } else {
          set({ progress: { ...cur.progress, [id]: p } });
        }
      }, 140);
      appInstallIntervals[id] = int;
    }
  },

  installCert: (id) => {
    const name = certDefs(ORG_NAME).find((c) => c.id === id)?.name || 'Certificate';
    set((s) => ({ certs: { ...s.certs, [id]: 'installing' } }));
    later(() => {
      set((s) => ({ certs: { ...s.certs, [id]: 'installed' } }));
      get().logActivity('cert', `Installed ${name}`, 'Issued by Acme Corp Certificate Authority', 'you');
      get().showToast('Certificate installed', 'success', { logged: true, actor: 'you' });
    }, 1500);
  },

  ackBroadcast: () => {
    if (get().broadcastAcked) return;
    set({ broadcastAcked: true });
    get().logActivity('broadcast', 'Acknowledged IT broadcast', 'Tunnel gateway maintenance notice', 'you');
    get().showToast('Broadcast acknowledged', 'success', { logged: true, actor: 'you' });
  },

  syncNow: () => {
    if (get().syncing) return;
    set({ syncing: true });
    later(() => {
      set({ syncing: false, lastSync: 'just now' });
      get().logActivity('sync', 'Synced with IT', 'Policy, inventory and compliance refreshed', 'you');
      get().showToast('Device synced', 'success', { logged: true, actor: 'you' });
    }, 1600);
  },

  openChat: (id) => {
    set((s) => ({ activeChat: id, unread: { ...s.unread, [id]: 0 } }));
  },

  startChatWithContact: (id) => {
    const contact = DIRECTORY.find((d) => d.id === id);
    if (!contact) return;
    set((s) => {
      const alreadyExists = s.chats.some((c) => c.id === id);
      return {
        chats: alreadyExists
          ? s.chats
          : [...s.chats, { ...contact, sub: (contact.role || '') + ' · online' }],
        activeChat: id,
        unread: { ...s.unread, [id]: 0 },
        messages: s.messages[id] ? s.messages : { ...s.messages, [id]: [] },
      };
    });
  },

  setDraft: (v) => set({ draft: v }),

  sendMsg: () => {
    const s = get();
    const text = s.draft.trim();
    const id = s.activeChat;
    if (!text || !id) return;
    const now = new Date();
    const t = now.getHours() + ':' + ('0' + now.getMinutes()).slice(-2);
    set((st) => ({
      draft: '',
      messages: { ...st.messages, [id]: [...(st.messages[id] || []), { mine: true, text, t }] },
    }));
    if (id === 'it' || id === 'ravi') {
      later(() => set({ typing: true }), 700);
      later(() => {
        const reply =
          id === 'it'
            ? 'Thanks — logged as ticket #4821. An agent will reply here shortly.'
            : "Great, thanks for confirming. I'll close the task.";
        set((st) => ({
          typing: false,
          messages: { ...st.messages, [id]: [...(st.messages[id] || []), { mine: false, text: reply, t }] },
        }));
      }, 2400);
    }
  },

  setDrive: (d) => set({ drive: d, currentFolderId: null }),
  openFolder: (id) => set({ currentFolderId: id }),
  goToFolder: (id) => set({ currentFolderId: id }),
  setFileFilter: (f) => set({ fileFilter: f }),

  startCast: (target) => {
    if (castInterval) clearInterval(castInterval);
    set({ cast: 'connecting', castTarget: target, castSecs: 0, incomingCastSession: false });
    later(() => {
      set({ cast: 'live', castSecs: 0 });
      const actor = target.isAssist ? 'IT · Ravi Kumar' : 'you';
      get().logActivity(
        'cast',
        'Screen share started',
        target.isAssist ? `${target.name} can see your screen` : target.name,
        actor,
      );
      get().showToast(
        target.isAssist ? 'IT can now see your screen' : 'Screen share started',
        'info',
        { logged: true, actor },
      );
      castInterval = setInterval(() => set((st) => ({ castSecs: st.castSecs + 1 })), 1000);
    }, 2200);
  },

  stopCast: () => {
    if (castInterval) clearInterval(castInterval);
    const s = get();
    if (s.castTarget) {
      const mm = Math.floor(s.castSecs / 60);
      const ss = ('0' + (s.castSecs % 60)).slice(-2);
      const entry: CastSession = {
        id: 'cs' + Date.now(),
        targetName: s.castTarget.isAssist ? `${s.castTarget.name}` : s.castTarget.name,
        initiatedBy: s.castTarget.isAssist ? 'admin' : 'me',
        startedAt: 'Just now',
        duration: `${mm}m ${ss}s`,
        quality: 'HD',
      };
      const actor = s.castTarget.isAssist ? 'IT · Ravi Kumar' : 'you';
      set((st) => ({ castHistory: [entry, ...st.castHistory] }));
      get().logActivity('cast', 'Screen share ended', `${entry.targetName} · ${entry.duration}`, actor);
      get().showToast('Screen share ended', 'info', { logged: true, actor });
    }
    set({ cast: 'idle', castTarget: null, castSecs: 0 });
  },

  dismissIncomingCast: () => set({ incomingCastSession: false }),

  markNotifRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotifsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  logActivity: (kind, title, detail, actor = 'you') =>
    set((s) => ({
      activity: [
        { id: 'a' + Date.now() + '-' + s.activity.length, kind, title, detail, time: 'Just now', actor },
        ...s.activity,
      ].slice(0, 60),
    })),

  showToast: (message, tone = 'success', opts) =>
    set({ toast: { id: toastSeq++, message, tone, logged: opts?.logged, actor: opts?.actor } }),
  hideToast: () => set({ toast: null }),

  setUnVal: (v) => set({ unVal: v }),

  resetAll: () => {
    if (vpnInterval) clearInterval(vpnInterval);
    if (castInterval) clearInterval(castInterval);
    Object.values(appInstallIntervals).forEach(clearInterval);
    timers.forEach(clearTimeout);
    set({
      ...initialState,
      appSt: { ...INITIAL_APP_STATUS },
      certs: { ...INITIAL_CERTS },
      chats: [...INITIAL_CHATS],
      messages: JSON.parse(JSON.stringify(INITIAL_MESSAGES)),
      unread: { ...INITIAL_UNREAD },
      castHistory: [...INITIAL_CAST_HISTORY],
      notifications: [...INITIAL_NOTIFICATIONS],
      activity: [...INITIAL_ACTIVITY],
      toast: null,
    });
  },
}));

export function pendingCertCount(certs: Record<string, string>) {
  return Object.values(certs).filter((v) => v === 'pending').length;
}

export function hasAnyUnread(unread: Record<string, number>) {
  return Object.values(unread).some((v) => v > 0);
}

export function unreadNotifCount(notifications: NotificationItem[]) {
  return notifications.filter((n) => !n.read).length;
}
