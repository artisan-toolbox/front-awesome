<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\Facades\Toast;
use ArtisanToolbox\FrontAwesome\WebAwesome\Size;
use ArtisanToolbox\FrontAwesome\WebAwesome\ToastIcon;
use ArtisanToolbox\Mosaicast\Events\BroadcastMosaicastEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Middleware;
use Inertia\Response;

beforeEach(function (): void {
    config([
        'app.key' => str_repeat('a', 32),
        'mosaicast.broadcasting.session_channel_key' => 'toast-test-key',
    ]);
});

it('delivers dispatched toasts through the Inertia Mosaicast payload', function (): void {
    Route::middleware('web')->get('/orders', function (): Response {
        Toast::danger('Unsent.')->duration(50);
        Toast::neutral('Orders loaded.')->dispatch();
        Toast::success('Order <123> saved.')
            ->duration(0)
            ->icon(new ToastIcon('circle-check', library: 'system', family: 'classic', variant: 'solid'))
            ->size(Size::L)
            ->allowHtml(false)
            ->dispatch();

        return Inertia::render('Orders');
    });

    $this->get('/orders', ['X-Inertia' => 'true'])
        ->assertOk()
        ->assertJsonPath('props.mosaicast.events', [
            [
                'name' => 'front-awesome.toast',
                'payload' => ['message' => 'Orders loaded.', 'options' => ['variant' => 'neutral', 'icon' => 'circle-info']],
            ],
            [
                'name' => 'front-awesome.toast',
                'payload' => [
                    'message' => 'Order <123> saved.',
                    'options' => [
                        'variant' => 'success',
                        'duration' => 0,
                        'icon' => ['name' => 'circle-check', 'library' => 'system', 'family' => 'classic', 'variant' => 'solid'],
                        'size' => 'l',
                        'allowHtml' => false,
                    ],
                ],
            ],
        ])
        ->assertJsonMissingPath('flash');
});

it('delivers each flashed toast once and in order after a redirect', function (): void {
    Route::middleware(['web', Middleware::class])->post('/orders', function (): RedirectResponse {
        Inertia::flash('orderId', 123);
        Toast::success('<strong>Order saved.</strong>')
            ->duration(2500)
            ->icon('check')
            ->size(Size::S)
            ->allowHtml()
            ->flash();
        Toast::warning('Inventory is low.')->flash();

        return redirect('/orders');
    });
    Route::middleware(['web', Middleware::class])->get('/orders', fn (): Response => Inertia::render('Orders'));

    $this->post('/orders', [], ['X-Inertia' => 'true'])->assertRedirect('/orders');

    $sessionId = session()->getId();
    $this->withCookie(config('session.cookie'), $sessionId)
        ->get('/orders', ['X-Inertia' => 'true'])
        ->assertOk()
        ->assertJsonPath('flash', [
            'orderId' => 123,
            'front-awesome.toasts' => [
                [
                    'message' => '<strong>Order saved.</strong>',
                    'options' => ['variant' => 'success', 'duration' => 2500, 'icon' => 'check', 'size' => 's', 'allowHtml' => true],
                ],
                ['message' => 'Inventory is low.', 'options' => ['variant' => 'warning', 'icon' => 'triangle-exclamation']],
            ],
        ])
        ->assertJsonPath('props.mosaicast.events', []);

    $this->get('/orders', ['X-Inertia' => 'true'])
        ->assertOk()
        ->assertJsonMissingPath('flash');
});

it('includes a flashed toast in the initial Inertia page data', function (): void {
    Route::middleware(['web', Middleware::class])->get('/orders', function (): Response {
        Toast::neutral('Orders loaded.')->flash();

        return Inertia::render('Orders')->rootView('welcome');
    });

    $this->get('/orders')
        ->assertOk()
        ->assertViewHas('page.flash', fn (array $flash): bool => ($flash['front-awesome.toasts'] ?? null) === [
            ['message' => 'Orders loaded.', 'options' => ['variant' => 'neutral', 'icon' => 'circle-info']],
        ]);
});

it('starts a factory with the message and variant selected on the facade', function (string $variant): void {
    config(["front-awesome.webawesome.toast.icons.{$variant}" => null]);

    Route::middleware('web')->get('/toast-variant', function () use ($variant): Response {
        Toast::$variant('Orders loaded.')->duration(0)->flash();

        return Inertia::render('Orders');
    });

    $this->get('/toast-variant', ['X-Inertia' => 'true'])
        ->assertOk()
        ->assertJsonPath('flash', ['front-awesome.toasts' => [
            ['message' => 'Orders loaded.', 'options' => ['variant' => $variant, 'duration' => 0]],
        ]]);
})->with(['brand', 'success', 'warning', 'danger', 'neutral']);

it('broadcasts a dispatched toast privately when the route redirects', function (): void {
    Event::fake([BroadcastMosaicastEvent::class]);

    Route::middleware(['web', Middleware::class])->post('/orders', function (): RedirectResponse {
        Toast::success('Order saved.')->dispatch();

        return redirect('/orders');
    });

    $this->post('/orders', [], ['X-Inertia' => 'true'])->assertRedirect('/orders');

    Event::assertDispatchedOnce(BroadcastMosaicastEvent::class);
    Event::assertDispatched(
        fn (BroadcastMosaicastEvent $event): bool => $event->broadcastAs() === 'front-awesome.toast'
            && $event->broadcastWith() === ['message' => 'Order saved.', 'options' => ['variant' => 'success', 'icon' => 'circle-check']]
            && str_starts_with($event->broadcastOn()->name, 'private-mosaicast.sessions.'),
    );
});

it('rejects negative toast durations before delivery', function (string $method): void {
    Toast::neutral('Invalid duration.')->duration(-1)->{$method}();
})->with(['dispatch', 'flash'])->throws(InvalidArgumentException::class);
