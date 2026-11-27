import type { MaskTemplate } from './mask';

export function localizedTemplate(
    key: string,
    options: MaskTemplate,
): () => Readonly<MaskTemplate> {
    const template = Object.freeze({
        ...options,
        incompleteMessage: Object.freeze({ key: `front-awesome::mask.${key}` }),
    });
    return () => template;
}
