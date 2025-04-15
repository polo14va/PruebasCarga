export class HistChart {
    // Histograma de distribución de tiempos
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }
    draw(times, bins = 20) {
        // Implementación del método draw aquí
    }
}
