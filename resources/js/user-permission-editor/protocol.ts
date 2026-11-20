import { http } from '@inertiajs/vue3';

export interface UserPermissionEditorSubject {
    subjectId: string | number;
    subjectLabel?: string;
}

export interface UserPermissionEditorHandle {
    show(subject: UserPermissionEditorSubject): void;
}

export interface Subject {
    id: string;
    label?: string;
}

export interface Ability {
    key: string;
    name: string;
    description: string;
    icon?: string;
}

export interface Section {
    kind: 'permissions' | 'roles';
    id: string;
    name: string;
    description: string;
    icon?: string;
    order: 'alphabetical' | 'locked';
    abilities: Ability[];
}

export type Values = Readonly<Record<string, boolean>>;

export interface Snapshot {
    subject: string;
    revision: string;
    canUpdate: boolean;
    isCurrentUser: boolean;
    iconFamily?: string;
    sections: Section[];
    values: Values;
}

export type Failure =
    | 'unavailable'
    | 'invalidSubject'
    | 'invalidResponse'
    | 'session'
    | 'forbidden'
    | 'missing'
    | 'loadFailure';

export interface Reply {
    status: number;
    data: string;
}

function object(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function iconName(value: unknown): string | undefined {
    return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
        ? value
        : undefined;
}

export function normalizeSubject({
    subjectId,
    subjectLabel,
}: UserPermissionEditorSubject): Subject | undefined {
    if (typeof subjectId === 'number' && !Number.isSafeInteger(subjectId)) return;
    if (typeof subjectId !== 'number' && !text(subjectId)) return;
    return { id: String(subjectId), label: subjectLabel };
}

export function subjectUrl(
    capability: unknown,
    subject: Subject,
    location: URL,
): string | undefined {
    if (!object(capability) || capability.version !== 1 || !text(capability.endpoint)) {
        return;
    }

    try {
        const endpoint = new URL(capability.endpoint, location);
        if (
            (endpoint.protocol !== 'https:' && endpoint.protocol !== 'http:') ||
            endpoint.origin !== location.origin ||
            endpoint.username ||
            endpoint.password
        ) {
            return;
        }
        endpoint.hash = '';
        endpoint.searchParams.set('user', subject.id);
        return endpoint.href;
    } catch {
        return;
    }
}

export function sectionKey(section: Section): string {
    return `${section.kind}:${section.id}`;
}

function isAbility(value: unknown): value is Ability {
    return (
        object(value) &&
        Object.hasOwn(value, 'key') &&
        text(value.key) &&
        text(value.name) &&
        typeof value.description === 'string'
    );
}

function isSection(value: unknown): value is Section {
    return (
        object(value) &&
        (value.kind === 'permissions' || value.kind === 'roles') &&
        text(value.id) &&
        text(value.name) &&
        typeof value.description === 'string' &&
        (value.order === 'alphabetical' || value.order === 'locked') &&
        Array.isArray(value.abilities) &&
        value.abilities.every(isAbility)
    );
}

function json(input: string): unknown {
    try {
        return JSON.parse(input);
    } catch {
        return undefined;
    }
}

export function readSnapshot(input: string, subject: Subject): Snapshot | undefined {
    const snapshot = json(input);
    if (
        !object(snapshot) ||
        snapshot.subject !== subject.id ||
        !text(snapshot.revision) ||
        typeof snapshot.canUpdate !== 'boolean' ||
        typeof snapshot.isCurrentUser !== 'boolean' ||
        !Array.isArray(snapshot.sections) ||
        !snapshot.sections.every(isSection) ||
        !object(snapshot.values)
    ) {
        return;
    }

    const sourceValues = snapshot.values;
    const iconFamily = iconName(snapshot.iconFamily);
    const sections = snapshot.sections.map((section) => ({
        ...section,
        icon: iconFamily ? iconName(section.icon) : undefined,
        abilities: section.abilities.map((ability) => ({
            ...ability,
            icon: iconFamily ? iconName(ability.icon) : undefined,
        })),
    }));
    const groups = new Set<string>();
    const entries = new Map<string, boolean>();
    for (const section of sections) {
        const group = sectionKey(section);
        if (groups.has(group)) return;
        groups.add(group);

        for (const { key } of section.abilities) {
            const value = sourceValues[key];
            if (
                entries.has(key) ||
                !Object.hasOwn(sourceValues, key) ||
                typeof value !== 'boolean'
            ) {
                return;
            }
            entries.set(key, value);
        }
    }
    if (entries.size !== Object.keys(sourceValues).length) return;

    return {
        subject: subject.id,
        revision: snapshot.revision,
        canUpdate: snapshot.canUpdate,
        isCurrentUser: snapshot.isCurrentUser,
        iconFamily,
        sections,
        values: Object.fromEntries(entries),
    };
}

export function fieldErrors(input: string, values: Values): Readonly<Record<string, string>> {
    const response = json(input);
    if (!object(response) || !object(response.errors)) return {};
    const entries: [string, string][] = [];
    for (const [field, messages] of Object.entries(response.errors)) {
        const key = field.startsWith('values.') ? field.slice('values.'.length) : field;
        const message = Array.isArray(messages) ? messages.find(text) : messages;
        if (Object.hasOwn(values, key) && text(message)) entries.push([key, message]);
    }

    return Object.fromEntries(entries);
}

export function responseFailure(status: number): Failure {
    switch (status) {
        case 401:
        case 419:
            return 'session';
        case 403:
            return 'forbidden';
        case 404:
            return 'missing';
        default:
            return 'loadFailure';
    }
}

export async function request(
    url: string,
    controller: AbortController,
    update?: { revision: string; values: Values },
): Promise<Reply> {
    const timeout = setTimeout(() => controller.abort(), 15000);
    const { signal } = controller;
    let rejectAborted = () => {};
    const aborted = new Promise<never>((_resolve, reject) => {
        rejectAborted = () => reject(new Error('The permissions request was interrupted.'));
        signal.addEventListener('abort', rejectAborted, { once: true });
    });

    try {
        return await Promise.race([
            http.getClient().request({
                url,
                method: update ? 'put' : 'get',
                headers: {
                    Accept: 'application/json',
                    ...(update && { 'Content-Type': 'application/json' }),
                },
                ...(update && { data: JSON.stringify(update) }),
                signal,
            }),
            aborted,
        ]);
    } catch (error) {
        if (error instanceof Error && 'response' in error && object(error.response)) {
            const { status, data } = error.response;
            if (typeof status === 'number' && typeof data === 'string') return { status, data };
        }
        throw error;
    } finally {
        clearTimeout(timeout);
        signal.removeEventListener('abort', rejectAborted);
    }
}
