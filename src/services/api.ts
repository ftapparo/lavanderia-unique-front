import axios, { AxiosError, type AxiosInstance } from "axios";
import { APP_API_BASE_URL } from "@/config/app-config";

interface ApiResponse<T> {
  data: T;
  message: string | null;
  errors: unknown | null;
}

type ApiError = Error & { status?: number; payload?: unknown };

const BASE_URL = APP_API_BASE_URL.replace(/\/+$/, "");
let authToken: string | null = null;
let serverTimeOffsetMs = 0;

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const requestContextInterceptor = (config: any) => {
  if (typeof window !== "undefined") {
    const requestId = typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    config.headers = config.headers || {};
    (config.headers as Record<string, string>)["x-request-id"] = requestId;

    if (authToken) {
      (config.headers as Record<string, string>).authorization = `Bearer ${authToken}`;
    }
  }

  return config;
};

http.interceptors.request.use(requestContextInterceptor);

const syncServerTimeOffset = (headerValue: unknown) => {
  if (typeof headerValue !== "string" || !headerValue.trim()) return;
  const parsed = new Date(headerValue);
  if (Number.isNaN(parsed.getTime())) return;
  serverTimeOffsetMs = parsed.getTime() - Date.now();
};

// ── Auto-refresh on 401 ──────────────────────────────────────────────────────
// doRefresh: deve persistir os novos tokens e retornar o novo accessToken, ou null se falhar
// onAuthFailure: chamado quando o refresh também falha (faz logout)
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let isRefreshing = false;
let refreshQueue: QueueEntry[] = [];
let doRefresh: (() => Promise<string | null>) | null = null;
let onAuthFailure: (() => void) | null = null;

export const setAuthHandlers = (
  refreshFn: () => Promise<string | null>,
  failureFn: () => void,
) => {
  doRefresh = refreshFn;
  onAuthFailure = failureFn;
};

const flushQueue = (error: unknown, token: string | null) => {
  refreshQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token!));
  refreshQueue = [];
};

http.interceptors.response.use(
  (res) => {
    syncServerTimeOffset(res.headers?.date);
    return res;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      throw error;
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.authorization = `Bearer ${token}`;
        return http(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const newToken = doRefresh ? await doRefresh() : null;
      if (!newToken) {
        flushQueue(error, null);
        onAuthFailure?.();
        throw error;
      }
      authToken = newToken;
      flushQueue(null, newToken);
      original.headers.authorization = `Bearer ${newToken}`;
      return http(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      onAuthFailure?.();
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  },
);

const parseApiMessage = (payload: unknown, fallback: string): string => {
  if (payload && typeof payload === "object" && "message" in payload && typeof (payload as { message?: unknown }).message === "string") {
    return (payload as { message: string }).message;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return fallback;
};

const mapAxiosToApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError(error)) {
    const unexpected = new Error(error instanceof Error ? error.message : "Erro desconhecido") as ApiError;
    unexpected.payload = error;
    return unexpected;
  }

  const axiosError = error as AxiosError<unknown>;
  const status = axiosError.response?.status;
  const payload = axiosError.response?.data;
  const fallback = status ? `Erro ${status}` : axiosError.message || "Erro de comunicacao";
  const mapped = new Error(parseApiMessage(payload, fallback)) as ApiError;
  mapped.status = status;
  mapped.payload = payload;

  return mapped;
};

const requestFrom = async <T>(
  client: AxiosInstance,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> => {
  try {
    const response = await client.request<ApiResponse<T>>({
      method,
      url: path,
      data: body,
    });

    return response.data.data;
  } catch (error: unknown) {
    throw mapAxiosToApiError(error);
  }
};

const request = async <T>(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<T> =>
  requestFrom<T>(http, method, path, body);

export const setApiAuthToken = (token: string | null) => {
  authToken = token;
};

export const getEstimatedServerNow = (): Date => new Date(Date.now() + serverTimeOffsetMs);

export interface HealthResponse {
  status: string;
  environment: string;
}

export interface ApiUser {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string | null;
  role: "USER" | "ADMIN" | "SUPER";
  cargo: string | null;
  mustChangePassword?: boolean;
  hasPin?: boolean;
  hasProfilePhoto?: boolean;
  profilePhotoBase64?: string | null;
  profilePhotoMime?: string | null;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  user: ApiUser;
}

export interface UnitPayload {
  id: string;
  name: string;
  code: string;
  floor: number | null;
  unitNumber: number | null;
  active: boolean;
  allowGuestReservations?: boolean;
}

export interface UserListItemPayload {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string | null;
  role: "USER" | "ADMIN" | "SUPER";
  cargo: string | null;
  mustChangePassword: boolean;
  hasProfilePhoto?: boolean;
  profilePhotoBase64?: string | null;
  profilePhotoMime?: string | null;
  createdAt: string;
}

export type UsersListFilters = {
  q?: string;
  unitId?: string;
  slotPosition?: 1 | 2 | 3;
  profile?: "PROPRIETARIO" | "LOCATARIO" | "HOSPEDE" | "ADMINISTRADOR" | "SUPER";
};

export interface CreateUserPayload {
  name: string;
  cpf: string;
  email: string;
  phone?: string | null;
  role: "USER" | "ADMIN" | "SUPER";
  cargo?: string | null;
  password?: string;
  mustChangePassword?: boolean;
  profilePhotoBase64?: string | null;
  profilePhotoMime?: string | null;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: "USER" | "ADMIN" | "SUPER";
  cargo?: string | null;
  profilePhotoBase64?: string | null;
  profilePhotoMime?: string | null;
}

export interface CreateUserResponse {
  user: UserListItemPayload;
  generatedPin: string | null;
}

export interface ResetPasswordResponse {
  generatedPin: string | null;
}

export type MachineType = "WASHER" | "DRYER";

export interface MachinePayload {
  id: string;
  number: number;
  brand: string;
  model: string;
  name: string;
  type: MachineType;
  tuyaDeviceId: string | null;
  active: boolean;
}

export interface MembershipPayload {
  id: string;
  userId: string;
  userName?: string | null;
  userCpf?: string | null;
  unitId: string;
  unitName: string;
  unitCode: string;
  slotPosition: number;
  profile: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
}

export interface MembershipSlotPayload {
  slotPosition: 1 | 2 | 3;
  current: MembershipPayload | null;
  history: MembershipPayload[];
}

export interface SaveMembershipSlotPayload {
  slotPosition: 1 | 2 | 3;
  userId: string | null;
  profile: "PROPRIETARIO" | "LOCATARIO" | "HOSPEDE" | "ADMINISTRADOR" | "SUPER" | null;
  startDate: string | null;
  endDate?: string | null;
  active?: boolean;
}

export interface MembershipProfilePayload {
  code: "PROPRIETARIO" | "LOCATARIO" | "HOSPEDE" | "ADMINISTRADOR" | "SUPER";
  name: string;
  description: string;
}

export interface MachinePairPayload {
  id: string;
  name: string;
  washerMachineId: string;
  washerMachineName: string;
  dryerMachineId: string;
  dryerMachineName: string;
  active: boolean;
}

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELED" | "IN_PROGRESS" | "FINISHED";

export interface ReservationPayload {
  id: string;
  unitId: string;
  unitName: string;
  unitCode: string;
  machinePairId: string;
  machinePairName: string;
  userId: string;
  userName: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  canceledAt: string | null;
}

export interface ReservationBusyPayload {
  id: string;
  machinePairId: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
}

export type LaundrySessionStatus = "ACTIVE" | "FINISHED" | "FORCED_FINISHED";

export interface LaundrySessionPayload {
  id: string;
  reservationId: string;
  reservationStartAt: string;
  reservationEndAt: string;
  unitId: string;
  unitName: string;
  unitCode: string;
  machinePairId: string;
  machinePairName: string;
  userId: string;
  userName: string;
  checkinAt: string;
  startedAt: string;
  finishedAt: string | null;
  status: LaundrySessionStatus;
  overtimeStartedAt: string | null;
  overtimeEndedAt: string | null;
}

export interface LaundrySessionDevicePayload {
  machineId: string;
  machineName: string;
  machineType: MachineType;
  deviceId: string;
  isOn: boolean;
  powerWatts: number;
  energyKwh: number;
  sampledAt: string;
}

export interface LaundrySessionDetailsPayload extends LaundrySessionPayload {
  devices: LaundrySessionDevicePayload[];
}

export interface IncidentPayload {
  id: string;
  type: "NO_SHOW" | "OVERTIME" | "FORCED_SHUTDOWN" | "TUYA_ERROR";
  reservationId: string | null;
  laundrySessionId: string | null;
  unitId: string | null;
  unitName: string | null;
  userId: string | null;
  userName: string | null;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SystemSettingsPayload {
  checkinWindowBeforeMinutes: number;
  checkinWindowAfterMinutes: number;
  reservationDurationHours: number;
  reservationStartMode: "ANY_TIME" | "FULL_HOUR";
  overtimeThresholdWatts: number;
  consumptionPollSeconds: number;
  billingMode: "PER_USE" | "PER_KWH";
  pricePerUse: number;
  pricePerKwh: number;
  chargeNoShow: boolean;
  updatedByUserId: string | null;
  updatedAt: string;
}

export interface InvoicePayload {
  id: string;
  competence: string;
  userId: string;
  userName: string;
  unitId: string | null;
  unitName: string | null;
  billingMode: "PER_USE" | "PER_KWH";
  totalAmount: number;
  generatedAt: string;
  createdAt: string;
}

export interface InvoiceItemPayload {
  id: string;
  invoiceId: string;
  reservationId: string | null;
  laundrySessionId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface InvoiceDetailsPayload extends InvoicePayload {
  items: InvoiceItemPayload[];
}

export interface AdminDashboardPayload {
  reservationsTotal: number;
  sessionsTotal: number;
  incidentsTotal: number;
  invoicesTotal: number;
  activeSessionsTotal: number;
  tuyaErrorsLast24h: number;
  jobs: {
    enabled: boolean;
    started: boolean;
    retry: { attempts: number; baseDelayMs: number };
    jobs: Record<string, {
      lastStartedAt: string | null;
      lastFinishedAt: string | null;
      lastStatus: "SUCCESS" | "ERROR" | "RUNNING" | "IDLE";
      lastError: string | null;
      runCount: number;
      successCount: number;
      errorCount: number;
    }>;
  };
  generatedAt: string;
}

export interface AdminOpsHealthPayload {
  db: "ok" | "error";
  tuya: "ok" | "error";
  tuyaDetails: unknown;
  jobs: AdminDashboardPayload["jobs"];
  checkedAt: string;
}

export interface AdminActiveSessionPayload {
  id: string;
  reservationId: string;
  userName: string;
  unitName: string;
  machinePairName: string;
  startedAt: string;
  overtimeStartedAt: string | null;
}

export interface AdminJobRuntimeStatePayload {
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastStatus: "SUCCESS" | "ERROR" | "RUNNING" | "IDLE";
  lastError: string | null;
  runCount: number;
  successCount: number;
  errorCount: number;
  cronExpression: string;
  active: boolean;
}

export interface AdminJobConfigPayload {
  name: string;
  description: string;
  cron_expression: string;
  active: boolean;
  need_update: boolean;
  updated_by_user_id: string | null;
  updated_at: string;
  runtimeState: AdminJobRuntimeStatePayload | null;
}

export const api = {
  health: () => request<HealthResponse>("GET", "/health"),
  healthcheck: () => request<HealthResponse>("GET", "/healthcheck"),
  auth: {
    register: (input: { name: string; cpf: string; email: string; phone?: string; password: string }) =>
      request<AuthPayload>("POST", "/auth/register", input),
    login: (input: { identity: string; password: string }) =>
      request<AuthPayload>("POST", "/auth/login", input),
    refresh: (refreshToken: string) =>
      request<{ accessToken: string; refreshToken: string }>("POST", "/auth/refresh", { refreshToken }),
    forgotPassword: (input: { identity: string }) =>
      request<{ requested: boolean }>("POST", "/auth/forgot-password", input),
    resetPassword: (input: { identity: string; pin: string; newPassword: string }) =>
      request<{ changed: boolean }>("POST", "/auth/reset-password", input),
    me: () => request<ApiUser>("GET", "/auth/me"),
    updateMe: (input: { email?: string; phone?: string | null; profilePhotoBase64?: string | null; profilePhotoMime?: string | null }) =>
      request<ApiUser>("PATCH", "/auth/me", input),
    changePassword: (input: { currentPassword: string; newPassword: string }) =>
      request<{ changed: boolean }>("PATCH", "/auth/change-password", input),
  },
  units: {
    list: () => request<UnitPayload[]>("GET", "/units"),
    create: (input: { floor: number; unitNumber: number; active?: boolean }) =>
      request<UnitPayload>("POST", "/units", input),
    update: (id: string, input: { floor?: number; unitNumber?: number; active?: boolean }) =>
      request<UnitPayload>("PATCH", `/units/${id}`, input),
    getMembershipSlots: (id: string) =>
      request<MembershipSlotPayload[]>("GET", `/units/${id}/membership-slots`),
    saveMembershipSlots: (id: string, slots: SaveMembershipSlotPayload[]) =>
      request<MembershipSlotPayload[]>("PUT", `/units/${id}/membership-slots`, { slots }),
    remove: (id: string) =>
      request<{ id: string; removed: boolean }>("DELETE", `/units/${id}`),
  },
  users: {
    list: (filters?: UsersListFilters) => {
      const params = new URLSearchParams();
      if (filters?.q?.trim()) params.set("q", filters.q.trim());
      if (filters?.unitId?.trim()) params.set("unitId", filters.unitId.trim());
      if (filters?.slotPosition) params.set("slotPosition", String(filters.slotPosition));
      if (filters?.profile) params.set("profile", filters.profile);
      const qs = params.toString();
      return request<UserListItemPayload[]>("GET", qs ? `/users?${qs}` : "/users");
    },
    getById: (id: string) => request<UserListItemPayload>("GET", `/users/${id}`),
    create: (input: CreateUserPayload) => request<CreateUserResponse>("POST", "/users", input),
    update: (id: string, input: UpdateUserPayload) => request<UserListItemPayload>("PATCH", `/users/${id}`, input),
    resetPassword: (id: string, input: { password?: string; mustChangePassword?: boolean }) => request<ResetPasswordResponse>("PATCH", `/users/${id}/reset-password`, input),
    remove: (id: string) => request<{ deleted: boolean }>("DELETE", `/users/${id}`),
  },
  machines: {
    list: () => request<MachinePayload[]>("GET", "/machines"),
    create: (input: { number: number; brand: string; model: string; type: MachineType; tuyaDeviceId?: string; active?: boolean }) =>
      request<MachinePayload>("POST", "/machines", input),
    update: (id: string, input: { number?: number; brand?: string; model?: string; type?: MachineType; tuyaDeviceId?: string | null; active?: boolean }) =>
      request<MachinePayload>("PATCH", `/machines/${id}`, input),
    remove: (id: string) =>
      request<{ id: string; removed: boolean }>("DELETE", `/machines/${id}`),
  },
  memberships: {
    listProfiles: () => request<MembershipProfilePayload[]>("GET", "/membership-profiles"),
    list: () => request<MembershipPayload[]>("GET", "/unit-memberships"),
    create: (input: { userId: string; unitId: string; profile: string; startDate: string; endDate?: string | null; active?: boolean }) =>
      request<MembershipPayload>("POST", "/unit-memberships", input),
    update: (id: string, input: { profile?: string; startDate?: string; endDate?: string | null; active?: boolean }) =>
      request<MembershipPayload>("PATCH", `/unit-memberships/${id}`, input),
  },
  machinePairs: {
    list: () => request<MachinePairPayload[]>("GET", "/machine-pairs"),
    create: (input: { name: string; washerMachineId: string; dryerMachineId: string; active?: boolean }) =>
      request<MachinePairPayload>("POST", "/machine-pairs", input),
  },
  reservations: {
    list: () => request<ReservationPayload[]>("GET", "/reservations"),
    listBusy: () => request<ReservationBusyPayload[]>("GET", "/reservations/busy"),
    create: (input: { unitId: string; machinePairId: string; startAt: string; userId?: string }) =>
      request<ReservationPayload>("POST", "/reservations", input),
    cancel: (id: string) =>
      request<ReservationPayload>("POST", `/reservations/${id}/cancel`),
    checkIn: (id: string) =>
      request<LaundrySessionPayload>("POST", `/reservations/${id}/check-in`),
  },
  sessions: {
    getByReservationId: (reservationId: string) =>
      request<LaundrySessionPayload>("GET", `/sessions/by-reservation/${reservationId}`),
    getById: (id: string) =>
      request<LaundrySessionDetailsPayload>("GET", `/sessions/${id}`),
    finish: (id: string) =>
      request<LaundrySessionPayload>("POST", `/sessions/${id}/finish`),
  },
  incidents: {
    list: () => request<IncidentPayload[]>("GET", "/incidents"),
  },
  settings: {
    get: () => request<SystemSettingsPayload>("GET", "/settings"),
    update: (input: Partial<SystemSettingsPayload>) => request<SystemSettingsPayload>("PATCH", "/settings", input),
  },
  billing: {
    run: (input: { competence?: string }) => request<{ competence: string; billingMode: "PER_USE" | "PER_KWH"; invoicesCreated: number; itemsCreated: number; totalAmount: number }>("POST", "/billing/run", input),
    exportDownload: async (competence: string, format: "csv" | "xlsx" = "csv"): Promise<void> => {
      const response = await http.get(`/billing/exports/${competence}?format=${format}`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `billing-${competence}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  },
  invoices: {
    list: () => request<InvoicePayload[]>("GET", "/invoices"),
    getById: (id: string) => request<InvoiceDetailsPayload>("GET", `/invoices/${id}`),
  },
  admin: {
    dashboard: () => request<AdminDashboardPayload>("GET", "/admin/dashboard"),
    opsHealth: () => request<AdminOpsHealthPayload>("GET", "/admin/ops/health"),
    activeSessions: () => request<AdminActiveSessionPayload[]>("GET", "/admin/ops/active-sessions"),
    reconcileSession: (id: string) => request<LaundrySessionPayload>("POST", `/admin/ops/reconcile-session/${id}`),
    listJobs: () => request<AdminJobConfigPayload[]>("GET", "/admin/jobs"),
    updateJob: (name: string, input: { description?: string; cronExpression?: string; active?: boolean }) =>
      request<AdminJobConfigPayload>("PATCH", `/admin/jobs/${name}`, input),
  },
};
