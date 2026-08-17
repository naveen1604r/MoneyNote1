/**
 * Utility function to convert array data into a CSV string and trigger browser download
 */
export const exportToCSV = (filename, headers, rows) => {
  if (!rows || rows.length === 0) return;

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((field) => {
          if (field === null || field === undefined) return '""';
          const stringField = String(field).replace(/"/g, '""');
          return `"${stringField}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Triggers browser print dialog formatted for PDF export
 */
export const triggerPDFPrint = () => {
  window.print();
};
