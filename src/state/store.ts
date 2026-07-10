import { create } from 'zustand';
import {
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
  VpnStatus,
} from '../types';
import { BrandTheme } from '../theme/colors';
import {
  APPS,
  CAST_TARGETS,
  DIRECTORY,
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
  unVal: '',
};

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
    later(() => set({ approved: true }), 7000);
    return true;
  },

  setApproved: (v) => set({ approved: v }),

  setPerm: (key, v) => set((s) => ({ perms: { ...s.perms, [key]: v } })),

  setThemeMode: (m) => set({ themeMode: m }),
  setBrandTheme: (b) => set({ brandTheme: b }),

  toggleVpn: () => {
    const s = get();
    if (s.vpn === 'off') {
      set({ vpn: 'connecting' });
      later(() => {
        set({ vpn: 'on', vpnSecs: 0, vpnDown: 186, vpnUp: 42, vpnPing: 18 });
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
    }
  },

  appAction: (id) => {
    const st = get().appSt[id];
    if (st === 'restricted') {
      set((s) => ({ appSt: { ...s.appSt, [id]: 'requested' } }));
      return;
    }
    if (st === 'available' || st === 'update') {
      set((s) => ({ appSt: { ...s.appSt, [id]: 'installing' }, progress: { ...s.progress, [id]: 0 } }));
      const int = setInterval(() => {
        set((s) => {
          const p = (s.progress[id] || 0) + 4 + Math.random() * 7;
          if (p >= 100) {
            clearInterval(int);
            delete appInstallIntervals[id];
            return { appSt: { ...s.appSt, [id]: 'installed' }, progress: { ...s.progress, [id]: 100 } };
          }
          return { progress: { ...s.progress, [id]: p } };
        });
      }, 140);
      appInstallIntervals[id] = int;
    }
  },

  installCert: (id) => {
    set((s) => ({ certs: { ...s.certs, [id]: 'installing' } }));
    later(() => set((s) => ({ certs: { ...s.certs, [id]: 'installed' } })), 1500);
  },

  ackBroadcast: () => set({ broadcastAcked: true }),

  syncNow: () => {
    if (get().syncing) return;
    set({ syncing: true });
    later(() => set({ syncing: false, lastSync: 'just now' }), 1600);
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
      set((st) => ({ castHistory: [entry, ...st.castHistory] }));
    }
    set({ cast: 'idle', castTarget: null, castSecs: 0 });
  },

  dismissIncomingCast: () => set({ incomingCastSession: false }),

  markNotifRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotifsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

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
