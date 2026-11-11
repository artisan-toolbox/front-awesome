export function printingPdfBase64(): string {
    const streams = [
        'BT /F1 18 Tf 32 720 Td (Invoice #1042) Tj 0 -40 Td /F1 12 Tf (Coffee beans 24.00) Tj 0 -24 Td (Paper filters 6.00) Tj 0 -40 Td (Total 30.00) Tj ET\n',
        'BT /F1 18 Tf 32 720 Td (Order #1042 - packing copy) Tj 0 -40 Td /F1 12 Tf (Thank you for your order.) Tj ET\n',
    ];
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>',
        `<< /Length ${streams[0].length} >>\nstream\n${streams[0]}endstream`,
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>',
        `<< /Length ${streams[1].length} >>\nstream\n${streams[1]}endstream`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];
    let pdf = '%PDF-1.7\n';
    const offsets = [0];
    for (const [index, object] of objects.entries()) {
        offsets.push(pdf.length);
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    }
    const xref = pdf.length;
    pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
    for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return btoa(pdf);
}
