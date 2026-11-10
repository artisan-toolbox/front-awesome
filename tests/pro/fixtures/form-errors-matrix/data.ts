import { useForm } from '@inertiajs/vue3';

export type MatrixData = {
    combobox: string | null;
    dateInput: string;
    datePicker: string;
    fileInput: File[];
};

export function matrixForm() {
    return useForm<MatrixData>({
        combobox: 'one',
        dateInput: '2026-11-09',
        datePicker: '2026-11-09',
        fileInput: [new File(['initial'], 'initial.txt', { type: 'text/plain' })],
    });
}
