import { canonicalLocale } from './catalog';

type Listener = (locale: string | undefined) => void;
interface DocumentController {
    listeners: Set<Listener>;
    observer: MutationObserver;
    synchronize(): void;
}
const documents = new WeakMap<Document, DocumentController>();

export function observeLocale(document: Document, listener: Listener): () => void {
    let controller = documents.get(document);
    if (!controller) {
        const listeners = new Set<Listener>();
        const synchronize = () => {
            const locale = canonicalLocale(document.documentElement.lang);
            for (const notify of listeners) notify(locale);
        };
        const Observer = document.defaultView?.MutationObserver ?? MutationObserver;
        const observer = new Observer(synchronize);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
        controller = { listeners, observer, synchronize };
        documents.set(document, controller);
    }
    controller.listeners.add(listener);
    listener(canonicalLocale(document.documentElement.lang));
    const owned = controller;
    return () => {
        owned.listeners.delete(listener);
        if (!owned.listeners.size) {
            owned.observer.disconnect();
            documents.delete(document);
        }
    };
}

export function writeLocale(document: Document, locale: string): void {
    document.documentElement.lang = locale;
    documents.get(document)?.synchronize();
}
