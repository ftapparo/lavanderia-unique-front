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
  role: "USER" | "ADMIN";
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export interface UnitPayload {
  id: string;
  name: string;
  code: string;
  floor: number | null;
  unitNumber: number | null;
  active: boolean;
}

export interface UserListItemPayload {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string | null;
  role: "USER" | "ADMIN";
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
  unitId: string;
  unitName: string;
  unitCode: string;
  profile: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
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
    me: () => request<ApiUser>("GET", "/auth/me"),
  },
  units: {
    list: () => request<UnitPayload[]>("GET", "/units"),
    create: (input: { floor: number; unitNumber: number; active?: boolean }) =>
      request<UnitPayload>("POST", "/units", input),
    update: (id: string, input: { floor?: number; unitNumber?: number; active?: boolean }) =>
      request<UnitPayload>("PATCH", `/units/${id}`, input),
    remove: (id: string) =>
      request<{ id: string; removed: boolean }>("DELETE", `/units/${id}`),
  },
  users: {
    list: () => request<UserListItemPayload[]>("GET", "/users"),
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
    create: (input: { unitId: string; machinePairId: string; startAt: string; userId?: string }) =>
      request<ReservationPayload>("POST", "/reservations", input),
    cancel: (id: string) =>
      request<ReservationPayload>("POST", `/reservations/${id}/cancel`),
    checkIn: (id: string) =>
      request<LaundrySessionPayload>("POST", `/reservations/${id}/check-in`),
  },
  sessions: {
    getById: (id: string) =>
      request<LaundrySessionDetailsPayload>("GET", `/sessions/${id}`),
    finish: (id: string) =>
      request<LaundrySessionPayload>("POST", `/sessions/${id}/finish`),
  },
};
