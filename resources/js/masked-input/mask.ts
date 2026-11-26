export interface MaskToken {
    accept: RegExp;
    /** Return one code point. Applying the transform to its own output must preserve that output. */
    transform?: (character: string) => string;
}

type TokenDefinition = RegExp | MaskToken;
export type MaskCell = string | TokenDefinition | { optional: readonly MaskCell[] };
export type MaskPattern = string | { parts: readonly MaskCell[] };
export type MaskChoices = MaskPattern | readonly MaskPattern[];
export interface MaskContext {
    raw: string;
    formatted: string;
    /** Browser selection offsets in UTF-16 code units. */
    selection: readonly [number, number];
}
export type Mask = MaskChoices | ((proposed: string, context: MaskContext) => MaskChoices);

export interface MaskOptions {
    mask: Mask;
    tokens?: Readonly<Record<string, TokenDefinition>>;
    guide?: 'never' | 'focus' | 'always';
    guideChar?: string;
    overwrite?: boolean;
    prefix?: string;
    suffix?: string;
    isComplete?: (raw: string, formatted: string) => boolean;
}

export type MaskInputMode =
    | 'none'
    | 'text'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url';

export interface MaskTemplate extends Readonly<MaskOptions> {
    readonly inputMode?: MaskInputMode;
    readonly valueMode?: 'raw' | 'formatted';
}

export interface MaskState {
    raw: string;
    formatted: string;
    display: string;
    complete: boolean;
    /** Display extent of each accepted code point, excluding literals and affixes. */
    spans: readonly (readonly [number, number])[];
    /** End of the accepted input, or the next guided cell, before any suffix. */
    end: number;
    /** Empty editable cells before each accepted ordinal, used when a mixed mask retains its tail. */
    gaps: ReadonlyMap<number, { offset: number; count: number }>;
    match: ReturnType<typeof match>;
}

export interface MaskEdit {
    selection: readonly [number, number];
    inputType: string;
    data?: string | null;
}

const builtins: Readonly<Record<string, RegExp>> = {
    '#': /[0-9]/u,
    A: /\p{L}/u,
    '*': /[\p{L}\p{N}]/u,
};

function syntax(message: string): never {
    throw new TypeError(`Front Awesome MaskedInput: ${message}`);
}

function parsePattern(pattern: string, tokens: MaskOptions['tokens']) {
    const root: MaskCell[] = [];
    const stack = [root];
    let escaped = false;
    for (const char of pattern) {
        const current = stack[stack.length - 1];
        if (escaped) {
            current.push(char);
            escaped = false;
        } else if (char === '\\') {
            escaped = true;
        } else if (char === '[') {
            const optional: MaskCell[] = [];
            current.push({ optional });
            stack.push(optional);
        } else if (char === ']') {
            if (stack.length === 1) syntax('unmatched closing bracket.');
            stack.pop();
        } else {
            current.push(tokens?.[char] ?? builtins[char] ?? char);
        }
    }
    if (escaped || stack.length !== 1) syntax('unfinished escape or optional group.');
    return root;
}

type Step =
    | { kind: 'optional'; end: number }
    | { kind: 'literal'; characters: string[]; groups: readonly number[] }
    | {
          kind: 'cell';
          accept: RegExp;
          transform?: MaskToken['transform'];
          groups: readonly number[];
      };

interface StructuredProgram {
    steps: Step[];
    unchanged: Array<() => boolean>;
}
type NamedToken = readonly [name: string, accept: RegExp, transform: MaskToken['transform']];
const structuredPatterns = new WeakMap<Exclude<MaskPattern, string>, StructuredProgram>();
const patternCache = new Map<string, Step[]>();
const customPatternCaches = new WeakMap<
    NonNullable<MaskOptions['tokens']>,
    {
        definitions: NamedToken[];
        patterns: Map<string, Step[]>;
    }
>();

function tokenParts(token: TokenDefinition): MaskToken {
    return 'accept' in token ? token : { accept: token };
}

function compile(pattern: MaskPattern, tokens: MaskOptions['tokens']) {
    let cache = patternCache;
    const unchanged: StructuredProgram['unchanged'] = [];
    if (typeof pattern !== 'string') {
        const cached = structuredPatterns.get(pattern);
        if (cached?.unchanged.every((check) => check())) return cached.steps;
        const root = pattern.parts;
        unchanged.push(() => pattern.parts === root);
    } else {
        if (tokens) {
            let custom = customPatternCaches.get(tokens);
            if (
                !custom ||
                Object.keys(tokens).length !== custom.definitions.length ||
                custom.definitions.some(([key, accept, transform]) => {
                    const definition = tokens[key];
                    if (!definition) return true;
                    const token = tokenParts(definition);
                    return token.accept !== accept || token.transform !== transform;
                })
            ) {
                const definitions = Object.entries(tokens).map(([key, definition]): NamedToken => {
                    const { accept, transform } = tokenParts(definition);
                    return [key, accept, transform];
                });
                custom = { definitions, patterns: new Map() };
                customPatternCaches.set(tokens, custom);
            }
            cache = custom.patterns;
        }
        const cached = cache.get(pattern);
        if (cached) return cached;
    }
    const steps: Step[] = [];
    function append(parts: readonly MaskCell[], groups: readonly number[]) {
        if (typeof pattern !== 'string') {
            const original = [...parts];
            unchanged.push(
                () =>
                    original.length === parts.length &&
                    original.every((cell, i) => parts[i] === cell),
            );
        }
        for (const part of parts) {
            if (typeof part === 'string') {
                if (!part) continue;
                if (/[\r\n]/.test(part)) syntax('mask literals must fit on one line.');
                const previous = steps[steps.length - 1];
                if (previous?.kind === 'literal' && previous.groups === groups) {
                    for (const character of part) previous.characters.push(character);
                } else {
                    steps.push({ kind: 'literal', characters: Array.from(part), groups });
                }
            } else if ('optional' in part) {
                const index = steps.length;
                steps.push({ kind: 'optional', end: index + 1 });
                const children = part.optional;
                if (typeof pattern !== 'string') unchanged.push(() => part.optional === children);
                append(children, [...groups, index]);
                steps[index] = { kind: 'optional', end: steps.length };
            } else {
                const { accept, transform } = tokenParts(part);
                if (typeof pattern !== 'string' && 'accept' in part)
                    unchanged.push(() => part.accept === accept && part.transform === transform);
                steps.push({
                    kind: 'cell',
                    accept: new RegExp(`^(?:${accept.source})$`, accept.flags.replace(/[gy]/g, '')),
                    transform,
                    groups,
                });
            }
        }
    }
    append(typeof pattern === 'string' ? parsePattern(pattern, tokens) : pattern.parts, []);
    if (!steps.some((step) => step.kind === 'cell')) syntax('a mask needs an editable cell.');
    if (typeof pattern === 'string') {
        // A resolver can generate indefinitely many strings over the lifetime of an application.
        if (cache.size >= 32) cache.delete(cache.keys().next().value ?? '');
        cache.set(pattern, steps);
    } else {
        structuredPatterns.set(pattern, { steps, unchanged });
    }
    return steps;
}

interface Character {
    previous?: Character;
    step: number;
    input: number;
    value: string;
}

interface Match {
    count: number;
    literals: number;
    required: number;
    missing: number;
    last?: Character;
}

interface Input {
    characters: string[];
    /** Only these source characters can consume a formatted literal. */
    editStart: number;
    formattedEnd: number;
    /** Existing data after an edit may retain a later cell when an earlier cell is cleared. */
    preserveFrom: number;
    /** Earlier empty cells can remain empty when the caret is already at a later occupied cell. */
    afterGap: boolean;
}

function accept(step: Extract<Step, { kind: 'cell' }>, character: string) {
    const value = step.transform ? step.transform(character) : character;
    if (
        !value ||
        value === '\n' ||
        value === '\r' ||
        (step.transform && Array.from(value).length !== 1)
    )
        return;
    if (step.accept.exec(value)?.[0] === value) return value;
}

/** Optional branches rejoin by program position and input offset. A mask never expands into every combination. */
function match(steps: Step[], input: Input) {
    const initial: Match = { count: 0, literals: 0, required: 0, missing: 0 };
    function compare(left: Match, right: Match, leftComplete = false, rightComplete = false) {
        return (
            left.count + left.literals - right.count - right.literals ||
            Number(leftComplete) - Number(rightComplete) ||
            right.missing - left.missing ||
            left.literals - right.literals ||
            left.required - right.required
        );
    }
    const pending = new Map<number, Map<number, Match>>();
    function queue(index: number, offset: number, path: Match) {
        const paths = pending.get(index) ?? new Map<number, Match>();
        const previous = paths.get(offset);
        if (!previous || compare(path, previous) > 0) {
            paths.set(offset, path);
            pending.set(index, paths);
        }
    }
    let best = initial;
    let complete = false;
    function finish(path: Match, reachedEnd: boolean) {
        const finished = reachedEnd && path.missing === 0;
        if (compare(path, best, finished, complete) > 0) {
            best = path;
            complete = finished;
        }
    }
    queue(0, 0, initial);
    for (let index = 0; index <= steps.length; index++) {
        const paths = pending.get(index);
        if (!paths) continue;
        pending.delete(index);
        const step = steps[index];
        // Scan each part of the pasted input at most once for this cell, even after optional branches merge.
        const entries = [...paths].sort(([a], [b]) => b - a);
        let scanned = input.characters.length;
        let next = scanned;
        let value: string | undefined;
        for (const [offset, path] of entries) {
            if (!step) {
                finish(path, true);
            } else if (step.kind === 'optional') {
                queue(step.end, offset, path);
                queue(index + 1, offset, path);
            } else if (step.kind === 'literal') {
                const end = offset + step.characters.length;
                const consumes =
                    offset >= input.editStart &&
                    end <= input.formattedEnd &&
                    step.characters.every(
                        (char, distance) => char === input.characters[offset + distance],
                    );
                queue(
                    index + 1,
                    consumes ? end : offset,
                    consumes ? { ...path, literals: path.literals + step.characters.length } : path,
                );
            } else {
                for (let cursor = offset; cursor < scanned; cursor++) {
                    const accepted = accept(step, input.characters[cursor]);
                    if (accepted !== undefined) {
                        next = cursor;
                        value = accepted;
                        break;
                    }
                }
                scanned = offset;
                const preserved =
                    offset < input.editStart || input.afterGap
                        ? offset
                        : Math.max(offset, input.preserveFrom);
                if (preserved < next) {
                    // Keeping a hole can preserve a differently typed tail before the next match.
                    queue(index + 1, preserved, { ...path, missing: path.missing + 1 });
                }
                if (value === undefined) {
                    finish(path, false);
                } else {
                    queue(index + 1, next + 1, {
                        count: path.count + 1,
                        literals: path.literals,
                        required: path.required + Number(step.groups.length === 0),
                        missing: path.missing,
                        last: { previous: path.last, step: index, input: next, value },
                    });
                }
            }
        }
    }
    return { steps, path: best, complete };
}

function candidates(
    options: MaskOptions,
    proposed: string,
    context: MaskContext,
): readonly MaskPattern[] {
    const choices =
        typeof options.mask === 'function' ? options.mask(proposed, context) : options.mask;
    if (typeof choices === 'string' || 'parts' in choices) return [choices];
    if (!choices.length) syntax('provide at least one candidate mask.');
    return choices;
}

function project(
    input: Input,
    choices: readonly MaskPattern[],
    options: MaskOptions,
    focused: boolean,
) {
    const fit = (pattern: MaskPattern) => match(compile(pattern, options.tokens), input);
    let selected = fit(choices[0]);
    for (const choice of choices.slice(1)) {
        const result = fit(choice);
        if (
            result.path.count > selected.path.count ||
            (result.path.count === selected.path.count &&
                result.path.literals > selected.path.literals)
        ) {
            selected = result;
        }
    }
    return renderMatch(selected, options, focused);
}

function renderMatch(selected: ReturnType<typeof match>, options: MaskOptions, focused: boolean) {
    const characters = new Map<number, Character>();
    const groups = new Set<number>();
    for (let char = selected.path.last; char; char = char.previous) {
        characters.set(char.step, char);
        const cell = selected.steps[char.step];
        if (cell.kind === 'cell') for (const group of cell.groups) groups.add(group);
    }
    const showGuide = options.guide === 'always' || (options.guide === 'focus' && focused);
    const guideChar = options.guideChar ?? '_';
    if (Array.from(guideChar).length !== 1 || /[\r\n]/.test(guideChar))
        syntax('guideChar must be one single-line Unicode code point.');
    const prefix = options.prefix ?? '';
    const suffix = options.suffix ?? '';
    if (/[\r\n]/.test(prefix) || /[\r\n]/.test(suffix))
        syntax('prefix and suffix must fit on one line.');
    const hasValue = characters.size > 0;
    let raw = '';
    let formatted = hasValue ? prefix : '';
    let display = hasValue || showGuide ? prefix : '';
    const spans: [number, number][] = [];
    const sourceOffsets: number[] = [];
    const gaps = new Map<number, { offset: number; count: number }>();
    let end: number | undefined;
    const last = selected.path.last?.step ?? -1;
    for (const [index, step] of selected.steps.entries()) {
        if (step.kind === 'optional' || step.groups.some((group) => !groups.has(group))) continue;
        if (step.kind === 'literal') {
            const visible = hasValue && (index < last || selected.complete);
            const literal = step.characters.join('');
            if (visible) formatted += literal;
            if (visible || showGuide) display += literal;
        } else {
            const char = characters.get(index);
            if (char) {
                sourceOffsets.push(char.input);
                spans.push([display.length, display.length + char.value.length]);
                display += char.value;
                formatted += char.value;
                raw += char.value;
            } else {
                if (index > last) end ??= display.length;
                else {
                    const gap = gaps.get(spans.length);
                    if (gap) gap.count++;
                    else gaps.set(spans.length, { offset: display.length, count: 1 });
                }
                if (showGuide) display += guideChar;
            }
        }
    }
    end ??= spans.at(-1)?.[1] ?? display.length;
    if (hasValue) formatted += suffix;
    if (hasValue || showGuide) display += suffix;
    const state: MaskState = {
        raw,
        formatted,
        display,
        complete: selected.complete && (options.isComplete?.(raw, formatted) ?? true),
        spans,
        end,
        gaps,
        match: selected,
    };
    return { state, sourceOffsets };
}

export function withMaskFocus(state: MaskState, options: MaskOptions, focused: boolean) {
    return options.guide === 'focus' ? renderMatch(state.match, options, focused).state : state;
}

function withoutAffixes(text: string, options: MaskOptions) {
    const { prefix, suffix } = options;
    if (prefix && text.startsWith(prefix)) text = text.slice(prefix.length);
    if (suffix && text.endsWith(suffix)) text = text.slice(0, -suffix.length);
    return text;
}

export function formatMask(
    text: string,
    options: MaskOptions,
    source: 'raw' | 'formatted' = 'raw',
    focused = false,
): MaskState {
    const proposed = source === 'formatted' ? withoutAffixes(text, options) : text;
    const characters = Array.from(proposed);
    const choices = candidates(options, proposed, { raw: '', formatted: '', selection: [0, 0] });
    return project(
        {
            characters,
            editStart: 0,
            formattedEnd: source === 'formatted' ? characters.length : 0,
            preserveFrom: 0,
            afterGap: false,
        },
        choices,
        options,
        focused,
    ).state;
}

export function editMask(
    previous: MaskState,
    edit: MaskEdit,
    options: MaskOptions,
    focused = true,
): { state: MaskState; caret: number } {
    const [left, right] = edit.selection;
    const raw = Array.from(previous.raw);
    let start = previous.spans.filter((span) => span[1] <= left).length;
    let stop = left === right ? start : previous.spans.filter((span) => span[0] < right).length;
    const deletion = edit.inputType.startsWith('delete');
    if (deletion && left === right) {
        if (edit.inputType.endsWith('Backward')) start = Math.max(0, start - 1);
        if (edit.inputType.endsWith('Forward')) stop = Math.min(raw.length, stop + 1);
    }
    const mayBeFormatted = [
        'insertFromPaste',
        'insertFromDrop',
        'insertReplacementText',
        'insertFromYank',
    ].includes(edit.inputType);
    const data = deletion ? '' : (edit.data ?? '');
    const inserted = Array.from(mayBeFormatted ? withoutAffixes(data, options) : data);
    const before = raw.slice(0, start);
    const build = (after: number): Input => ({
        characters: [...before, ...inserted, ...raw.slice(after)],
        preserveFrom: start + inserted.length,
        afterGap: previous.gaps.has(start) && left >= (previous.spans[start]?.[0] ?? previous.end),
        editStart: start,
        formattedEnd: mayBeFormatted ? start + inserted.length : start,
    });
    const context = { raw: previous.raw, formatted: previous.formatted, selection: edit.selection };
    const apply = (after: number) => {
        const input = build(after);
        const choices = candidates(
            options,
            typeof options.mask === 'function' ? input.characters.join('') : '',
            context,
        );
        return project(input, choices, options, focused);
    };
    let result = apply(stop);
    const insertedCount = result.sourceOffsets.filter(
        (index) => index >= start && index < start + inserted.length,
    ).length;
    if (!deletion && data && !insertedCount) return { state: previous, caret: left };
    if (options.overwrite && left === right && insertedCount > 0 && stop < raw.length) {
        const gap = previous.gaps.get(start);
        let remaining = 0;
        if (gap) {
            for (let ordinal = start; ordinal <= start + insertedCount; ordinal++) {
                remaining += result.state.gaps.get(ordinal)?.count ?? 0;
            }
        }
        const emptyCells = gap ? Math.max(0, gap.count - remaining) : 0;
        if (insertedCount > emptyCells) result = apply(stop + insertedCount - emptyCells);
    }
    const ordinal = result.sourceOffsets.filter((index) => index < start + inserted.length).length;
    return {
        state: result.state,
        caret:
            result.state.gaps.get(ordinal)?.offset ??
            result.state.spans[ordinal]?.[0] ??
            result.state.end,
    };
}
