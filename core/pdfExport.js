// ui/pdfExport.js
// Exporta el resumen de resultados y progreso como PDF, incluyendo los gráficos.

export function exportLoadTestPDF() {
  // 1. Clonar solo la sección de progreso y resultados
  const progressSection = document.getElementById('progressSection');
  const resultSection = document.getElementById('resultSection');
  const clone = document.createElement('div');
  clone.style.background = '#fff';
  clone.style.padding = '20px';
  if (progressSection) clone.appendChild(progressSection.cloneNode(true));
  if (resultSection) clone.appendChild(resultSection.cloneNode(true));
  // 2. Insertar el clon al final del contenedor principal, visible pero invisible
  clone.className = 'pdf-export-clone';
  clone.style.position = 'static';
  clone.style.opacity = '0';
  clone.style.pointerEvents = 'none';
  clone.style.width = '100%';
  const container = document.querySelector('.container');
  if (container) container.appendChild(clone);
  else document.body.appendChild(clone);

  // 3. Quitar la clase 'hidden' de las secciones relevantes en el clon
  const resultSectionClone = clone.querySelector('#resultSection');
  if (resultSectionClone) resultSectionClone.classList.remove('hidden');
  const progressSectionClone = clone.querySelector('#progressSection');
  if (progressSectionClone) progressSectionClone.classList.remove('hidden');

  // 4. Sustituir los canvas del clon por imágenes
  const canvasIds = ['barChart', 'threadsCombinedChart'];
  canvasIds.forEach(id => {
    const orig = document.getElementById(id);
    const cl = clone.querySelector(`#${id}`);
    if (orig && cl) {
      const img = document.createElement('img');
      img.src = orig.toDataURL('image/png');
      img.style.width = '900px';
      img.style.display = 'block';
      img.style.margin = 'auto';
      img.height = orig.height;
      cl.parentNode.replaceChild(img, cl);
    }
  });

  // 4b. Sustituir el donut SVG del clon por imagen rasterizada
  const donutOrig = document.querySelector('.donut-elegant svg');
  const donutCl = clone.querySelector('.donut-elegant svg');
  if (donutOrig && donutCl) {
    const svgData = new XMLSerializer().serializeToString(donutOrig);
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    const img = document.createElement('img');
    img.onload = function() {
      URL.revokeObjectURL(url);
    };
    img.src = url;
    img.style.display = 'block';
    img.style.margin = 'auto';
    img.style.width = '210px';
    img.style.height = '210px';
    donutCl.parentNode.replaceChild(img, donutCl);
  }

  // 5. Esperar un poco para asegurar renderizado antes de exportar
  setTimeout(() => {
    window.html2pdf()
      .set({ margin: 0, filename: 'pruebas-carga.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' } })
      .from(clone)
      .save()
      .then(() => {
        // 6. Eliminar el clon
        if (container && container.contains(clone)) container.removeChild(clone);
        else if (document.body.contains(clone)) document.body.removeChild(clone);
      });
  }, 120);
}
