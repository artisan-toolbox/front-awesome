<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Php74\Rector\Closure\ClosureToArrowFunctionRector;
use Rector\Php81\Rector\Array_\ArrayToFirstClassCallableRector;
use Rector\TypeDeclaration\Rector\Closure\AddClosureVoidReturnTypeWhereNoReturnRector;
use RectorLaravel\Rector\Class_\AddHasFactoryToModelsRector;
use RectorLaravel\Rector\ClassMethod\AddGenericReturnTypeToRelationsRector;
use RectorLaravel\Rector\Empty_\EmptyToBlankAndFilledFuncRector;
use RectorLaravel\Rector\FuncCall\RemoveDumpDataDeadCodeRector;
use RectorLaravel\Rector\MethodCall\WhereToWhereLikeRector;
use RectorLaravel\Rector\StaticCall\CarbonToDateFacadeRector;
use RectorLaravel\Set\LaravelSetList;

return RectorConfig::configure()
    ->withRootFiles()
    ->withPaths([
        __DIR__.'/src',
        __DIR__.'/tests',
    ])
    ->withComposerBased(laravel: true)
    ->withSets([
        LaravelSetList::LARAVEL_ARRAY_STR_FUNCTION_TO_STATIC_CALL,
        LaravelSetList::LARAVEL_CODE_QUALITY,
        LaravelSetList::LARAVEL_ELOQUENT_MAGIC_METHOD_TO_QUERY_BUILDER,
        LaravelSetList::LARAVEL_FACTORIES,
        LaravelSetList::LARAVEL_IF_HELPERS,
        LaravelSetList::LARAVEL_TESTING,
        LaravelSetList::LARAVEL_TYPE_DECLARATIONS,
    ])
    ->withRules([
        EmptyToBlankAndFilledFuncRector::class,
        WhereToWhereLikeRector::class,
        RemoveDumpDataDeadCodeRector::class,
    ])
    ->withSkip([
        // Carbon's macro API declares the closure's bound instance type.
        CarbonToDateFacadeRector::class => [__DIR__.'/src/Preferences/CarbonPreferences.php'],
        // This fixture uses query creation and has no model factory.
        AddHasFactoryToModelsRector::class => [__DIR__.'/tests/Fixtures/PreferenceUser.php'],
        ArrayToFirstClassCallableRector::class,
        AddClosureVoidReturnTypeWhereNoReturnRector::class,
        AddGenericReturnTypeToRelationsRector::class,
        ClosureToArrowFunctionRector::class,
    ])
    ->withTypeCoverageLevel(0)
    ->withDeadCodeLevel(0)
    ->withCodeQualityLevel(0);
