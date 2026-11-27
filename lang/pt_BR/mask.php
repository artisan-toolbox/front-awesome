<?php

declare(strict_types=1);

return [
    'brazilian' => [
        'incomplete' => [
            'cpf' => 'Digite os onze dígitos do CPF.',
            'cnpjLegacy' => 'Digite os catorze dígitos do CNPJ.',
            'cnpj' => 'Digite doze letras ou dígitos seguidos de dois dígitos.',
            'cep' => 'Digite os oito dígitos do CEP.',
            'phone' => 'Digite um número de telefone brasileiro completo.',
            'landline' => 'Digite um telefone fixo de oito dígitos que comece com um dígito de 2 a 6.',
            'mobile' => 'Digite um número de celular de nove dígitos que comece com 7, 8 ou 9.',
            'regionalLandline' => 'Digite o DDD e um telefone fixo de oito dígitos.',
            'regionalMobile' => 'Digite o DDD e um número de celular de nove dígitos.',
            'regionalPhone' => 'Digite o DDD e um número de telefone completo.',
            'shortCode3' => 'Digite um código curto de três dígitos que comece com 1.',
            'shortCode4' => 'Digite um código curto de quatro dígitos que comece com 1.',
            'shortCode5' => 'Digite um código curto de cinco dígitos que comece com 103 ou 106.',
            'serviceCenter' => 'Digite um número de oito dígitos que comece com 300 ou 400.',
            'nonGeographicPhone' => 'Digite um número 0300, 0303, 0500, 0800 ou 0900 completo.',
            'tollFree' => 'Digite um número 0800 completo.',
            'sharedCost' => 'Digite um número 0300 completo.',
            'donation' => 'Digite um número 0500 completo.',
            'premium' => 'Digite um número 0900 completo.',
            'telemarketing' => 'Digite um número 0303 completo.',
            'internationalPhone' => 'Digite o código do país 55, o DDD e um número de telefone completo.',
        ],
    ],
    'incomplete' => [
        'ipv4' => 'Digite um endereço IPv4 válido.',
        'ipv6' => 'Digite um endereço IPv6 válido.',
        'ip' => 'Digite um endereço IPv4 ou IPv6 válido.',
        'hexColor' => 'Digite uma cor com 3, 4, 6 ou 8 dígitos hexadecimais.',
        'uuid' => 'Digite os 32 dígitos hexadecimais do UUID.',
        'macAddress' => 'Digite os 12 dígitos hexadecimais do endereço MAC.',
    ],
];
