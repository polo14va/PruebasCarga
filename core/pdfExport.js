// ui/pdfExport.js
// Exporta el resumen de resultados y progreso como PDF, incluyendo los gráficos.

export async function exportLoadTestPDF() {
  // Obtener los datos del resumen
  let result = window.currentLoadTestResult;
  // Si no hay objeto global, intentar leer del DOM
  if (!result) {
    result = {
      ok: parseInt(document.getElementById('okCount')?.textContent) || 0,
      ko: parseInt(document.getElementById('koCount')?.textContent) || 0,
      okAvg: document.getElementById('okAvg')?.textContent || '-',
      okMin: document.getElementById('okMin')?.textContent || '-',
      okMax: document.getElementById('okMax')?.textContent || '-',
      duration: document.getElementById('durationRealtime')?.textContent || '-'
    };
  }

  // Construir tabla manualmente
  const html = `
    <div style="font-family: Arial, sans-serif; width: 100%; max-width: 500px; margin: 0 auto;">
      <h2 style="text-align:center;">Resumen de resultados</h2>
      <table style="border-collapse: collapse; width: 100%; font-size: 1.1em;">
        <tr><th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Total OK</th><td style="border:1px solid #ccc; padding:6px 10px;">${result.ok}</td></tr>
        <tr><th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Total KO</th><td style="border:1px solid #ccc; padding:6px 10px;">${result.ko}</td></tr>
        <tr><th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Tiempo medio global</th><td style="border:1px solid #ccc; padding:6px 10px;">${result.okAvg} ms</td></tr>
        <tr><th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Tiempo mínimo</th><td style="border:1px solid #ccc; padding:6px 10px;">${result.okMin} ms</td></tr>
        <tr><th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Tiempo máximo</th><td style="border:1px solid #ccc; padding:6px 10px;">${result.okMax} ms</td></tr>
        <tr><th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Duración total</th><td style="border:1px solid #ccc; padding:6px 10px;">${result.duration}</td></tr>
      </table>
    </div>
  `;

  // Crear elemento temporal visible
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '40px';
  tempDiv.style.left = '0';
  tempDiv.style.right = '0';
  tempDiv.style.zIndex = '9999';
  tempDiv.style.background = '#fff';
  tempDiv.style.opacity = '1';
  tempDiv.style.display = 'block';
  tempDiv.style.pointerEvents = 'auto';
  document.body.appendChild(tempDiv);

  // Esperar 200ms para asegurar render
  setTimeout(() => {
    window.html2pdf()
      .set({ margin: 10, filename: 'pruebas-carga.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' } })
      .from(tempDiv)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      });
  }, 200);
}
