import type { Plugin } from 'vite';

export interface FrontAwesomeViteOptions {
    webAwesome?: 'core' | 'pro';
    translations?:
        | boolean
        | {
              php?: string;
              artisan?: string;
              cwd?: string;
          };
}

export function frontAwesome(options?: FrontAwesomeViteOptions): Plugin;
