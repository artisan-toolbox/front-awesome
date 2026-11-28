import assert from 'node:assert/strict';

export async function verifyThemeBoundaries(page, { legacy }) {
    const result = await page.evaluate(async () => {
        customElements.define(
            'test-spacing-control',
            class extends HTMLElement {
                constructor() {
                    super();
                    this.attachShadow({ mode: 'open' }).innerHTML =
                        '<style>:host { --spacing: 12px; } span { padding: var(--spacing); }</style><span>Native custom control</span>';
                }
            },
        );
        const fixture = document.createElement('section');
        fixture.innerHTML = `
            <h3 id="outside">Outside a slot</h3><small id="outside-small">Small text</small>
            <section style="--spacing:8px"><div id="outside-spacing" class="p-4">Custom spacing</div></section>
            <wa-button><span id="button-start" slot="start">S</span>Button</wa-button>
            <wa-input label="Amount"><span id="input-start" slot="start">$</span></wa-input>
            <wa-badge><span id="badge-start" slot="start">S</span>Badge</wa-badge>
            <wa-breadcrumb-item><span id="breadcrumb-start" slot="start">S</span>Item</wa-breadcrumb-item>
            <wa-callout><span id="callout-icon" slot="icon">!</span>Callout</wa-callout>
            <wa-select label="Choose"><small id="select-heading">Group</small></wa-select>
            <wa-card id="horizontal" orientation="horizontal"><div>Body</div><div id="actions" slot="actions">Actions</div></wa-card>
            <wa-card id="scoped-card" class="fa-theme block w-40 p-4" style="--radius-xl:40px">
                <div id="card-content" class="p-4 grid gap-4 -mt-4">Card</div>
                <section class="fa-theme" style="--spacing:5px"><div id="nested" class="p-4">Nested</div></section>
                <section class="fa-theme"><div id="nested-default" class="p-4">Inherited</div></section>
                <test-spacing-control id="custom-spacing"></test-spacing-control>
            </wa-card>
            <wa-details id="scoped-details" class="wa-dark" open><div id="details-content" class="p-4 grid gap-4">Details</div></wa-details>
            <wa-dialog id="scoped-dialog" class="wa-invert" label="Dialog"><div id="dialog-content" class="p-4 grid gap-4">Dialog</div></wa-dialog>
            <section class="fa-theme wa-brand-yellow" style="--radius-md:33px">
                <wa-button id="focus" variant="brand">Focus</wa-button>
                <span id="focus-color" style="color:var(--wa-color-focus)"></span>
            </section>`;
        document.body.append(fixture);
        try {
            const find = (id) => fixture.querySelector(`#${id}`);
            const css = (id) => getComputedStyle(find(id));
            await Promise.all(
                [...fixture.querySelectorAll('*')].map((host) => host.updateComplete),
            );
            await new Promise(requestAnimationFrame);
            const focus = find('focus').shadowRoot.querySelector('button');
            focus.focus();
            const focusStyle = getComputedStyle(focus);
            const focusResult = [
                focusStyle.borderRadius,
                focusStyle.outlineStyle,
                focusStyle.outlineColor,
                css('focus-color').color,
            ];
            const action = find('actions');
            const actionPadding = [css('actions').padding];
            find('horizontal').style.setProperty('--spacing', '31px');
            actionPadding.push(css('actions').padding);
            action.className = 'p-4';
            actionPadding.push(css('actions').padding);
            action.className = '';
            action.style.setProperty('--spacing', '12px');
            const customActionPadding = css('actions').padding;
            const slots = [
                'button-start',
                'input-start',
                'badge-start',
                'breadcrumb-start',
                'callout-icon',
            ].map((id) => parseFloat(css(id).marginInlineEnd));
            find('button-start').className = 'me-0';
            const internalPadding = [
                ['scoped-card', 'body'],
                ['scoped-details', 'header'],
                ['scoped-dialog', 'body'],
            ].map(
                ([id, part]) =>
                    getComputedStyle(find(id).shadowRoot.querySelector(`[part~="${part}"]`))
                        .padding,
            );
            return {
                slots,
                actionPadding,
                customActionPadding,
                focusResult,
                internalPadding,
                slotOverride: css('button-start').marginInlineEnd,
                headingPadding: css('select-heading').paddingBlockStart,
                headingSize: css('select-heading').fontSize,
                outsideMargin: css('outside').marginBlockStart,
                outsideSmall: css('outside-small').fontSize,
                outsideSpacing: css('outside-spacing').padding,
                card: [
                    css('scoped-card').padding,
                    css('scoped-card').width,
                    css('scoped-card').borderRadius,
                ],
                content: ['card-content', 'details-content', 'dialog-content'].map((id) => [
                    css(id).padding,
                    css(id).gap,
                ]),
                negativeMargin: css('card-content').marginTop,
                nested: css('nested').padding,
                nestedDefault: css('nested-default').padding,
                customSpacing: getComputedStyle(
                    find('custom-spacing').shadowRoot.querySelector('span'),
                ).padding,
            };
        } finally {
            fixture.remove();
        }
    });
    assert.ok(
        result.slots.every((margin) => margin > 0),
        JSON.stringify(result.slots),
    );
    const spacing = legacy ? 6 : 4;
    const small = `${spacing * 4}px`;
    const large = `${spacing * 6}px`;
    assert.deepEqual(result.actionPadding, [large, '31px', small]);
    assert.deepEqual(result.internalPadding, [large, small, large]);
    if (!legacy) {
        assert.deepEqual(result.card, ['16px', '160px', '40px']);
        assert.equal(result.customActionPadding, '12px');
    }
    assert.deepEqual(
        result.content,
        Array.from({ length: 3 }, () => [small, small]),
    );
    assert.equal(result.negativeMargin, `-${spacing * 4}px`);
    assert.equal(result.nested, '20px');
    assert.equal(result.nestedDefault, small);
    assert.equal(result.customSpacing, '12px');
    assert.equal(result.outsideSpacing, '32px');
    assert.equal(result.slotOverride, '0px');
    assert.ok(parseFloat(result.headingPadding) > 0);
    assert.equal(result.headingSize, '14px');
    assert.equal(result.outsideMargin, '0px');
    assert.equal(result.outsideSmall, '12.8px');
    const [radius, outline, outlineColor, tokenColor] = result.focusResult;
    assert.equal(radius, '33px');
    assert.equal(outline, 'solid');
    assert.equal(outlineColor, tokenColor);
}
