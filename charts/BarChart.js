export class BarChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tooltip = null;
        this.canvas.onmousemove = this.handleMouseMove.bind(this);
        this.canvas.onmouseleave = this.handleMouseLeave.bind(this);
        this.lastData = null;
        const css = getComputedStyle(document.documentElement);
        this.okColor = css.getPropertyValue('--turquoise').trim() || '#2DCCC0';
        this.koColor = css.getPropertyValue('--bright-pink').trim() || '#EE3A6A';
        this.refAvg = css.getPropertyValue('--blue').trim() || '#0F3D74';
        this.refMin = css.getPropertyValue('--golden').trim() || '#D8BE75';
        this.refMax = css.getPropertyValue('--coral').trim() || '#F35E61';
        this.axisColor = css.getPropertyValue('--navy-blue').trim() || '#1A2E54';
    }
    draw(times, statuses, opts = {}) {
        // times: array de ms, statuses: array de boolean (OK/KO)
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.clearRect(0, 0, width, height);
        if (!times || !times.length) return;
        // Margen generoso para que no se corte
        const marginLeft = 60;
        const marginRight = 30;
        const marginTop = 40;
        const marginBottom = 40;
        const chartW = width - marginLeft - marginRight;
        const chartH = height - marginTop - marginBottom;
        // Ejes
        ctx.strokeStyle = this.axisColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(marginLeft, marginTop);
        ctx.lineTo(marginLeft, height - marginBottom);
        ctx.lineTo(width - marginRight, height - marginBottom);
        ctx.stroke();
        // Escalado
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        // Barras
        const barW = Math.max(2, chartW / times.length - 1);
        times.forEach((t, i) => {
            const x = marginLeft + i * (chartW / times.length);
            const y = height - marginBottom - (t / maxTime) * chartH;
            ctx.beginPath();
            ctx.rect(x, y, barW, (t / maxTime) * chartH);
            ctx.fillStyle = statuses[i] ? this.okColor : this.koColor;
            ctx.fill();
        });
        // Líneas de referencia
        this.drawRefLine(avgTime, height, maxTime, this.refAvg, 'Media');
        this.drawRefLine(minTime, height, maxTime, this.refMin, 'Mínimo');
        this.drawRefLine(maxTime, height, maxTime, this.refMax, 'Máximo');
        // Etiquetas y marcas en el eje Y
        ctx.save();
        ctx.fillStyle = this.axisColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        // Marcas en el eje Y (cada 5 divisiones)
        const yDivs = 5;
        for (let i = 0; i <= yDivs; i++) {
            const val = maxTime * (i / yDivs);
            const y = height - marginBottom - (val / maxTime) * chartH;
            ctx.beginPath();
            ctx.moveTo(marginLeft - 8, y);
            ctx.lineTo(marginLeft, y);
            ctx.stroke();
            ctx.fillText(`${Math.round(val)} ms`, marginLeft - 12, y + 4);
        }
        // Etiqueta eje Y
        ctx.save();
        ctx.translate(marginLeft - 45, height/2);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign = 'center';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('Tiempo (ms)', 0, 0);
        ctx.restore();
        ctx.restore();
        // Etiqueta eje X
        ctx.fillStyle = this.axisColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Petición', marginLeft + chartW/2, height-8);
    }
    drawRefLine(val, h, maxTime, color, label) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        // Usar los mismos márgenes que en draw()
        const marginLeft = 60;
        const marginRight = 30;
        const marginTop = 40;
        const marginBottom = 40;
        const chartW = width - marginLeft - marginRight;
        const chartH = h - marginTop - marginBottom;
        const y = h - marginBottom - (val / maxTime) * chartH;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(marginLeft, y);
        ctx.lineTo(width - marginRight, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${label}: ${val.toFixed(1)} ms`, marginLeft + chartW/2, y - 6);
        ctx.restore();
    }
    handleMouseMove(e) {
        // Implementación del método handleMouseMove aquí
    }
    handleMouseLeave() {
        // Implementación del método handleMouseLeave aquí
    }
}
