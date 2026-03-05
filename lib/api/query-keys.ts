/** Centralized query keys for consistent cache invalidation */
export const deviceKeys = {
    all: ['devices'] as const,
    lists: () => [...deviceKeys.all, 'list'] as const,
    list: (orgId: string) =>
        [...deviceKeys.lists(), orgId] as const,
    details: () => [...deviceKeys.all, 'detail'] as const,
    detail: (id: string) => [...deviceKeys.details(), id] as const,
};

export const locationKeys = {
    all: ['locations'] as const,
    lists: () => [...locationKeys.all, 'list'] as const,
    list: (orgId: string) =>
        [...locationKeys.lists(), orgId] as const,
};

export const playlistKeys = {
    all: ['playlists'] as const,
    lists: () => [...playlistKeys.all, 'list'] as const,
    list: (locationId: string) =>
        [...playlistKeys.lists(), locationId] as const,
    details: () => [...playlistKeys.all, 'detail'] as const,
    detail: (id: string) => [...playlistKeys.details(), id] as const,
};
