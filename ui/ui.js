// ui.js: Lógica de UI y eventos principales
import { DonutChart } from '../charts/DonutChart.js';
import { BarChart } from '../charts/BarChart.js';
import { ThreadsCombinedChart } from '../charts/ThreadsCombinedChart.js';

let donutChart = null;
let barChart = null;
let threadsCombinedChart = null;

// Inicializar DonutChart una sola vez
function ensureDonutChart() {
    if (!donutChart) {
        donutChart = new DonutChart('donutChart');
    }
}

// Inicializar BarChart una sola vez
function ensureBarChart() {
    if (!barChart) {
        barChart = new BarChart('barChart');
    }
}

export function updateTotalRequestsCalc() {
    // Calcula y actualiza el campo "totalRequestsCalc" automáticamente
    const threads = parseInt(document.getElementById('threads').value, 10) || 0;
    const requests = parseInt(document.getElementById('requests').value, 10) || 0;
    document.getElementById('totalRequestsCalc').value = threads * requests;
}

export function setChartsWidthForPDF(widthPx) {
    const bar = document.getElementById('barChart');
    const threads = document.getElementById('threadsCombinedChart');
    if (bar) bar.width = widthPx;
    if (threads) threads.width = widthPx;
    // Redibujar los gráficos con el nuevo ancho
    if (window.currentLoadTestResult) {
        if (window.barChart && window.barChart.draw) {
            const result = window.currentLoadTestResult;
            window.barChart.draw(result.allTimes, result.statuses);
        }
        if (window.threadsCombinedChart && window.threadsCombinedChart.draw) {
            const result = window.currentLoadTestResult;
            window.threadsCombinedChart.draw(result.threadResults);
        }
    }
}

function resizeCanvasToParent(canvas) {
    const parent = canvas.parentElement;
    if (!parent) return;
    // Obtener el ancho del padre (menos padding)
    const style = window.getComputedStyle(parent);
    const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const w = parent.clientWidth - padding;
    if (canvas.width !== w) {
        canvas.width = w;
    }
}

export function updateUI(isFinished = false) {
    const result = window.currentLoadTestResult;
    if (!result) return;
    // Actualiza los contadores y medias
    document.getElementById('okCount').textContent = result.ok;
    document.getElementById('koCount').textContent = result.ko;
    document.getElementById('okAvg').textContent = result.okAvg;
    document.getElementById('koAvg').textContent = result.koAvg;
    document.getElementById('totalCount').textContent = result.ok + result.ko;
    // El total debe ser SIEMPRE threads*requests (lo que se configuró al lanzar la prueba)
    // Leer siempre desde localStorage para asegurar persistencia
    const threadsLS = parseInt(localStorage.getItem('loadtest_threads'), 10) || 0;
    const requestsLS = parseInt(localStorage.getItem('loadtest_requests'), 10) || 0;
    const totalConfigured = threadsLS * requestsLS;
    // Actualizar tanto el campo de tabla como el input de arriba
    const totalRequestsCell = document.getElementById('totalRequests');
    if (totalRequestsCell) totalRequestsCell.textContent = totalConfigured > 0 ? totalConfigured : 0;
    const totalRequestsCalcInput = document.getElementById('totalRequestsCalc');
    if (totalRequestsCalcInput) totalRequestsCalcInput.value = totalConfigured > 0 ? totalConfigured : 0;

    // Mostrar duración total en tiempo real
    const durationDiv = document.getElementById('durationRealtime');
    if (durationDiv) {
        let duration = '-';
        if (result.startTime) {
            const end = result.endTime ? result.endTime : performance.now();
            duration = ((end - result.startTime) / 1000).toFixed(2) + ' s';
        }
        durationDiv.textContent = duration;
    }

    // Actualiza el gráfico de donut en tiempo real
    ensureDonutChart();
    // El total del donut debe ser el mismo que el mostrado arriba
    // (threads * requestsPerThread), NO totalRequests
    // Así el donut progresa correctamente
    // Si aún no hay respuestas, fuerza el donut a 0%
    if ((result.ok + result.ko) === 0) {
        donutChart.update(0, 0, totalConfigured);
    } else {
        donutChart.update(result.ok, result.ko, totalConfigured);
    }
    // Oculta visualmente la parte KO si no hay KO
    if (donutChart && donutChart.koArc) {
        donutChart.koArc.style.display = result.ko > 0 ? '' : 'none';
    }

    // Si la prueba ha terminado, mostrar el gráfico de barras
    if (isFinished) {
        document.getElementById('resultSection').classList.remove('hidden');
        ensureBarChart();
        // Ajustar tamaño del canvas al contenedor
        resizeCanvasToParent(barChart.canvas);
        // Prepara los datos para el gráfico de barras
        const times = result.allTimes;
        const statuses = result.statuses;
        barChart.draw(times, statuses);

        // Mostrar resumen global
        showGlobalReport(result);

        // Mostrar gráfico combinado de hilos
        ensureThreadsCombinedChart();
        resizeCanvasToParent(threadsCombinedChart.canvas);
        threadsCombinedChart.draw(result.threadResults);
    } else {
        // Oculta resultados mientras no termina
        document.getElementById('resultSection').classList.add('hidden');
    }
}

function ensureThreadsCombinedChart() {
    if (!threadsCombinedChart) {
        threadsCombinedChart = new ThreadsCombinedChart('threadsCombinedChart', 'threadsCombinedLegend');
    }
}

function showGlobalReport(result) {
    const div = document.getElementById('globalReport');
    if (!result) { div.innerHTML = ''; return; }
    const total = result.ok + result.ko;
    const max = result.allTimes.length ? Math.max(...result.allTimes).toFixed(1) : '-';
    const min = result.allTimes.length ? Math.min(...result.allTimes).toFixed(1) : '-';
    const avg = result.globalAvg;
    // Usar el endTime real si existe, si no, performance.now()
    let duration = '-';
    if (result.startTime) {
        const end = result.endTime ? result.endTime : performance.now();
        duration = ((end - result.startTime) / 1000).toFixed(2);
    }
    div.innerHTML = `
      <table class="results-table">
        <thead>
          <tr>
            <th>Total OK</th>
            <th>Total KO</th>
            <th>Tiempo medio global</th>
            <th>Tiempo mínimo</th>
            <th>Tiempo máximo</th>
            <th>Duración total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${result.ok}</td>
            <td>${result.ko}</td>
            <td>${avg} <span class="unit">ms</span></td>
            <td>${min} <span class="unit">ms</span></td>
            <td>${max} <span class="unit">ms</span></td>
            <td>${duration} <span class="unit">s</span></td>
          </tr>
        </tbody>
      </table>
    `;
}


// Puedes agregar otros handlers y utilidades aquí según lo necesites
