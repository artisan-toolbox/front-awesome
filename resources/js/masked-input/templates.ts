import { Brazilian } from './brazilian';
import { sharedMaskTemplates } from './sharedTemplates';

const templates = Object.freeze({ Brazilian, ...sharedMaskTemplates });

export function useMaskTemplate() {
    return templates;
}

export const useMaskTemplates = useMaskTemplate;
