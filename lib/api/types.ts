/** User profile from GET /users/me */
export interface UserProfile {
    id: string;
    clerkUserId: string;
    email?: string;
    name?: string;
    imageUrl?: string;
}

/** Organization from GET /orgs */
export interface Organization {
    id: string;
    clerkOrgId: string;
    name: string;
    slug?: string;
    role: string;
}

/** Location from locations API */
export interface Location {
    id: string;
    name: string;
    address?: string;
    timezone?: string;
}

/** Device from devices API */
export interface Device {
    id: string;
    deviceId: string;
    name: string;
    status: string;
    lastSeenAt?: string;
}

/** Media session from GET /media/sessions/:deviceId */
export interface MediaSession {
    deviceId: string;
    mediaUrl?: string | null;
    position: number;
    duration: number;
    playing: boolean;
    volume?: number | null;
}

/** Create device request body */
export interface CreateDevice {
    name: string;
    deviceId: string;
}

/** Pair device request body */
export interface PairDevice {
    code: string;
    deviceId: string;
    clerkOrgId: string;
    locationId: string;
}

/** Response from POST /devices/pairing-code */
export interface GeneratePairingCodeResponse {
    code: string;
}

/** Media command request body */
export interface MediaCommand {
    deviceId: string;
    command: 'play' | 'pause' | 'seek' | 'volume';
    payload?: Record<string, unknown>;
}

/** Create location request body */
export interface CreateLocation {
    name: string;
    address?: string | null;
    timezone?: string;
}

/** Update location request body */
export interface UpdateLocation {
    name?: string;
    address?: string | null;
    timezone?: string;
}
