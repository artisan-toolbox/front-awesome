import type { Plugin } from 'vite';

export interface FrontAwesomeViteOptions {
    webAwesome?: 'core' | 'pro';
}

export function frontAwesome(options?: FrontAwesomeViteOptions): Plugin;
