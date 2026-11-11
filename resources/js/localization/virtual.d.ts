declare module 'virtual:front-awesome/web-awesome-locales' {
    const loaders: Record<string, () => Promise<unknown>>;
    export default loaders;
}
