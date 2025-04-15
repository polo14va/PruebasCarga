export class ThreadsCombinedChart {
    constructor(canvasId, legendId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.legendId = legendId;
        this.lastData = null;
        this.canvas.onmousemove = this.handleMouseMove.bind(this);
        this.canvas.onmouseleave = this.handleMouseLeave.bind(this);
        const css = getComputedStyle(document.documentElement);
        this.threadColors = [
            css.getPropertyValue('--aqua').trim() || '#50B6FF',
            css.getPropertyValue('--lavender-blue').trim() || '#6389D9',
            css.getPropertyValue('--golden').trim() || '#D8BE75',
            css.getPropertyValue('--coral').trim() || '#F35E61',
            css.getPropertyValue('--blue').trim() || '#0F3D74',
            css.getPropertyValue('--light-blue').trim() || '#13599B',
            css.getPropertyValue('--navy-blue').trim() || '#1A2E54',
            css.getPropertyValue('--turquoise').trim() || '#2DCCC0',
            css.getPropertyValue('--bright-pink').trim() || '#EE3A6A',
            css.getPropertyValue('--yellow').trim() || '#FCE287'
        ];
        this.axisColor = css.getPropertyValue('--navy-blue').trim() || '#1A2E54';
    }
    draw(threadResults) {
        // threadResults: Array de arrays [{time, ok}, ...] por hilo
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.clearRect(0, 0, width, height);
        if (!threadResults || !threadResults.length) return;

        // Calcular el máximo de peticiones entre hilos
        const maxLen = Math.max(...threadResults.map(arr => arr.length));
        // Calcular el máximo tiempo para escalar eje Y
        const maxTime = Math.max(...threadResults.flat().map(r => r.time));

        // Margen para ejes
        const margin = 40;
        const chartW = width - margin * 2;
        const chartH = height - margin * 2;

        // Dibujar ejes
        ctx.strokeStyle = this.axisColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, height - margin);
        ctx.lineTo(width - margin, height - margin);
        ctx.stroke();

        // Dibujar líneas por hilo
        threadResults.forEach((arr, idx) => {
            if (!arr.length) return;
            ctx.beginPath();
            arr.forEach((r, i) => {
                const x = margin + (i / (maxLen - 1 || 1)) * chartW;
                const y = height - margin - (r.time / (maxTime || 1)) * chartH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = this.threadColors[idx % this.threadColors.length];
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Marcas y leyenda de ms en eje Y
        ctx.save();
        ctx.fillStyle = this.axisColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        const yDivs = 5;
        for (let i = 0; i <= yDivs; i++) {
            const val = maxTime * (i / yDivs);
            const y = height - margin - (val / maxTime) * chartH;
            ctx.beginPath();
            ctx.moveTo(margin - 6, y);
            ctx.lineTo(margin, y);
            ctx.stroke();
            ctx.fillText(`${Math.round(val)} ms`, margin - 10, y + 4);
        }
        // Etiqueta eje Y
        ctx.save();
        ctx.translate(margin - 32, height/2);
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
        ctx.fillText('Petición', width/2, height-8);

        // Leyenda
        const legendDiv = document.getElementById(this.legendId);
        legendDiv.innerHTML = threadResults.map((arr, idx) =>
            `<span style="display:inline-block;margin-right:12px;"><span style="display:inline-block;width:14px;height:4px;background:${this.threadColors[idx % this.threadColors.length]};margin-right:4px;"></span>Hilo ${idx+1}</span>`
        ).join('');

        // Etiquetas de ejes
        ctx.fillStyle = this.axisColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Tiempo (ms)', margin-6, margin+6);
        ctx.textAlign = 'center';
        ctx.fillText('Petición', width/2, height-8);
    }
    handleMouseMove(e) {
        // Implementación del método handleMouseMove aquí
    }
    handleMouseLeave() {
        // Implementación del método handleMouseLeave aquí
    }
}
