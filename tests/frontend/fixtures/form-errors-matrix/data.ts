import { useForm } from '@inertiajs/vue3';

export type MatrixData = {
    input: string | null | undefined;
    checkbox: boolean;
    switch: boolean;
    textarea: string | null;
    numberInput: string | null;
    radioGroup: string | number | null;
    slider: number;
    rating: number;
    otpInput: string;
    colorPicker: string | null;
    select: string | null;
    tagInput: string[];
    knownDate: string;
    timeInput: string;
};

export function matrixForm() {
    return useForm<MatrixData>({
        input: 'Ada',
        checkbox: true,
        switch: true,
        textarea: 'Initial notes',
        numberInput: '1.50',
        radioGroup: 'one',
        slider: 5,
        rating: 2,
        otpInput: '1234',
        colorPicker: '#112233',
        select: 'one',
        tagInput: ['one'],
        knownDate: '2026-11-09',
        timeInput: '12:30',
    });
}
