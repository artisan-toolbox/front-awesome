import { cloneVNode, Comment, createTextVNode, Fragment, h, isVNode } from 'vue';
import type { VNode } from 'vue';

export function projectNativeSlot(
    nodes: VNode[],
    name?: string,
    omitted: readonly string[] = [],
): VNode[] {
    return nodes.flatMap((node) => {
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
            );
        }
        if ((name && omitted.includes(name)) || omitted.includes(node.props?.slot)) return [];
        if (!name || node.type === Comment || node.props?.slot != null) return [node];
        return [
            typeof node.type === 'string' || typeof node.type === 'object'
                ? cloneVNode(node, { slot: name })
                : h('span', { slot: name }, [node]),
        ];
    });
}
