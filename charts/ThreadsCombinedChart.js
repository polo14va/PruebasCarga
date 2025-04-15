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

        // Calcular el tiempo mínimo y máximo absoluto para eje X
        const allTimes = threadResults.flat();
        const minAbsTime = Math.min(...allTimes.map(r => r.timeStart !== undefined ? r.timeStart : r.time));
        const maxAbsTime = Math.max(...allTimes.map(r => r.timeEnd !== undefined ? r.timeEnd : (r.timeStart !== undefined ? r.timeStart + r.time : r.time)));
        const rangeAbsTime = maxAbsTime - minAbsTime;
        const extraMargin = rangeAbsTime * 0.1;
        const xMin = minAbsTime;
        const xMax = maxAbsTime + extraMargin;

        // Calcular el máximo tiempo para escalar eje Y (tiempo de respuesta)
        const maxTime = Math.max(...allTimes.map(r => r.time));

        // Margen para ejes
        const marginLeft = 90; // margen solo para textos verticales
        const margin = 40; // margen general para la gráfica
        const marginBottom = 30;
        const chartW = width - marginLeft - margin;
        const chartH = height - margin - marginBottom;

        // Dibujar ejes
        ctx.strokeStyle = this.axisColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(marginLeft, margin);
        ctx.lineTo(marginLeft, height - margin);
        ctx.lineTo(width - margin, height - margin);
        ctx.stroke();

        // Dibujar líneas por hilo (X = tiempo desde inicio, Y = tiempo de respuesta)
        threadResults.forEach((arr, idx) => {
            if (!arr.length) return;
            ctx.beginPath();
            arr.forEach((r, i) => {
                // Usar r.timeStart si existe, si no, usar r.time como tiempo absoluto
                const absTime = r.timeStart !== undefined ? r.timeStart : (i === 0 ? xMin : xMin + i * (rangeAbsTime / (arr.length-1||1)));
                const x = marginLeft + ((absTime - xMin) / (xMax - xMin)) * chartW;
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
            ctx.moveTo(marginLeft - 6, y);
            ctx.lineTo(marginLeft, y);
            ctx.stroke();
            ctx.fillText(`${Math.round(val)} ms`, marginLeft - 15, y + 4);
        }
        // Etiqueta eje Y
        ctx.save();
        ctx.translate(marginLeft - 50, height/2);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign = 'center';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('Tiempo respuesta (ms)', 0, 0);
        ctx.restore();
        ctx.restore();
        // Marcas en eje X (tiempo desde inicio)
        ctx.save();
        ctx.fillStyle = this.axisColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        const xDivs = 6;
        for (let i = 0; i <= xDivs; i++) {
            const val = xMin + (i / xDivs) * (xMax - xMin);
            const x = marginLeft + ((val - xMin) / (xMax - xMin)) * chartW;
            ctx.beginPath();
            ctx.moveTo(x, height - margin);
            ctx.lineTo(x, height - margin + 6);
            ctx.stroke();
            ctx.fillText(`${Math.round(val)} ms`, x, height - margin + 18);
        }
        // Etiqueta eje X
        ctx.font = 'bold 13px sans-serif';
        ctx.restore();

        // Leyenda
        const legendDiv = document.getElementById(this.legendId);
        legendDiv.innerHTML = threadResults.map((arr, idx) =>
            `<span style="display:inline-block;margin-right:12px;"><span style="display:inline-block;width:14px;height:4px;background:${this.threadColors[idx % this.threadColors.length]};margin-right:4px;"></span>Hilo ${idx+1}</span>`
        ).join('');

        // Etiquetas de ejes
        ctx.fillStyle = this.axisColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.textAlign = 'center';
    }
    handleMouseMove(e) {
        // Implementación del método handleMouseMove aquí
    }
    handleMouseLeave() {
        // Implementación del método handleMouseLeave aquí
    }
}
