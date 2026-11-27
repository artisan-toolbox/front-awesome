import { brazilian } from './brazilian';
import { sharedMaskTemplates } from './sharedTemplates';

const templates = Object.freeze({ brazilian, Brazilian: brazilian, ...sharedMaskTemplates });

export function useMaskTemplate() {
    return templates;
}

export const useMaskTemplates = useMaskTemplate;
