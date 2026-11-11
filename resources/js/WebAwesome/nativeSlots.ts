import { cloneVNode, Comment, createTextVNode, Fragment, h, isVNode } from 'vue';
import type { VNode } from 'vue';

const symbolKeys = new Map<symbol, number>();
function keyIdentity(key: VNode['key'], index: number): string | number {
    if (typeof key !== 'symbol') return key ?? index;
    if (!symbolKeys.has(key)) symbolKeys.set(key, symbolKeys.size);
    return symbolKeys.get(key) ?? index;
}

export function projectNativeSlot(
    nodes: VNode[],
    name?: string,
    omitted: readonly string[] = [],
    scope = name ?? 'default',
): VNode[] {
    return nodes.flatMap((node, index) => {
        const key = JSON.stringify([scope, typeof node.key, keyIdentity(node.key, index)]);
        if (node.type === Fragment && Array.isArray(node.children)) {
            return projectNativeSlot(
                node.children.flatMap((child) => {
                    if (isVNode(child)) return [child];
                    if (typeof child === 'string' || typeof child === 'number')
                        return [createTextVNode(String(child))];
                    return [];
                }),
                name,
                omitted,
                key,
            );
        }
        if ((name && omitted.includes(name)) || omitted.includes(node.props?.slot)) return [];
        if (!name || node.type === Comment || node.props?.slot != null)
            return [cloneVNode(node, { key })];
        return [
            typeof node.type === 'string' || typeof node.type === 'object'
                ? cloneVNode(node, { slot: name, key })
                : h('span', { slot: name, key }, [node]),
        ];
    });
}
