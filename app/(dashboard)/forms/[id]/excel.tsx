"use client";  // This makes the component client-side

import { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // Import library XLSX

function ExportToExcelButton({ columns, rows }: { columns: any[], rows: any[] }) {
    // Fungsi untuk ekspor data ke Excel
    const exportToExcel = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            columns.map((column) => column.label), // Judul kolom
            ...rows.map((row) =>
                columns.map((column) => row[column.id]) // Data setiap baris
            ),
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Submissions");
        XLSX.writeFile(wb, "Submissions.xlsx");  // Nama file Excel yang diunduh
    };

    return (
        <button
            onClick={exportToExcel}
            className="mb-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
            Download as Excel
        </button>
    );
}

export default ExportToExcelButton;
