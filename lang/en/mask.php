<?php

declare(strict_types=1);

return [
    'brazilian' => [
        'incomplete' => [
            'cpf' => 'Enter all eleven CPF digits.',
            'cnpjLegacy' => 'Enter all fourteen CNPJ digits.',
            'cnpj' => 'Enter twelve letters or digits followed by two digits.',
            'cep' => 'Enter all eight digits of the postal code.',
            'phone' => 'Enter a complete Brazilian phone number.',
            'landline' => 'Enter an eight-digit landline number starting with 2 through 6.',
            'mobile' => 'Enter a nine-digit mobile number starting with 7, 8, or 9.',
            'regionalLandline' => 'Enter the area code and an eight-digit landline number.',
            'regionalMobile' => 'Enter the area code and a nine-digit mobile number.',
            'regionalPhone' => 'Enter the area code and a complete phone number.',
            'shortCode3' => 'Enter a three-digit short code starting with 1.',
            'shortCode4' => 'Enter a four-digit short code starting with 1.',
            'shortCode5' => 'Enter a five-digit short code starting with 103 or 106.',
            'serviceCenter' => 'Enter an eight-digit number starting with 300 or 400.',
            'nonGeographicPhone' => 'Enter a complete 0300, 0303, 0500, 0800, or 0900 number.',
            'tollFree' => 'Enter a complete 0800 number.',
            'sharedCost' => 'Enter a complete 0300 number.',
            'donation' => 'Enter a complete 0500 number.',
            'premium' => 'Enter a complete 0900 number.',
            'telemarketing' => 'Enter a complete 0303 number.',
            'internationalPhone' => 'Enter country code 55, the area code, and a complete phone number.',
        ],
    ],
    'incomplete' => [
        'ipv4' => 'Enter a valid IPv4 address.',
        'ipv6' => 'Enter a valid IPv6 address.',
        'ip' => 'Enter a valid IPv4 or IPv6 address.',
        'hexColor' => 'Enter a color with 3, 4, 6, or 8 hexadecimal digits.',
        'uuid' => 'Enter all 32 hexadecimal digits of the UUID.',
        'macAddress' => 'Enter all 12 hexadecimal digits of the MAC address.',
    ],
];
