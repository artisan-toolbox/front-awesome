import { page } from 'vite-plus/test/browser';

export async function movePointerOutsideExamples() {
    const corner = document.createElement('div');
    corner.style.cssText = 'position:fixed;top:0;right:0;width:2px;height:2px;z-index:2147483647';
    document.body.append(corner);
    try {
        await page.elementLocator(corner).hover();
    } finally {
        corner.remove();
    }
}
