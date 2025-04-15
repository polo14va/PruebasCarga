export class DonutChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svgNS = "http://www.w3.org/2000/svg";
        this.size = 210;
        this.radius = 88;
        this.stroke = 28;
        const css = getComputedStyle(document.documentElement);
        this.okColor = css.getPropertyValue('--turquoise').trim() || '#2DCCC0';
        this.koColor = css.getPropertyValue('--bright-pink').trim() || '#EE3A6A';
        this.bgColor = css.getPropertyValue('--gray').trim() || '#F3F2F3';
        this.svg = null;
        this.okArc = null;
        this.koArc = null;
        this.valueDiv = null;
        this.init();
    }
    init() {
        this.container.innerHTML = '';
        this.container.classList.add('donut-elegant');
        this.svg = document.createElementNS(this.svgNS, 'svg');
        this.svg.setAttribute('width', this.size);
        this.svg.setAttribute('height', this.size);
        const bg = document.createElementNS(this.svgNS, 'circle');
        bg.setAttribute('cx', this.size / 2);
        bg.setAttribute('cy', this.size / 2);
        bg.setAttribute('r', this.radius);
        bg.setAttribute('stroke', this.bgColor);
        bg.setAttribute('stroke-width', this.stroke);
        bg.setAttribute('fill', 'none');
        this.svg.appendChild(bg);
        this.okArc = document.createElementNS(this.svgNS, 'circle');
        this.okArc.setAttribute('cx', this.size / 2);
        this.okArc.setAttribute('cy', this.size / 2);
        this.okArc.setAttribute('r', this.radius);
        this.okArc.setAttribute('stroke', this.okColor);
        this.okArc.setAttribute('stroke-width', this.stroke);
        this.okArc.setAttribute('fill', 'none');
        this.okArc.setAttribute('stroke-dasharray', 2 * Math.PI * this.radius);
        this.okArc.setAttribute('stroke-dashoffset', 2 * Math.PI * this.radius);
        this.okArc.setAttribute('stroke-linecap', 'round');
        this.svg.appendChild(this.okArc);
        this.koArc = document.createElementNS(this.svgNS, 'circle');
        this.koArc.setAttribute('cx', this.size / 2);
        this.koArc.setAttribute('cy', this.size / 2);
        this.koArc.setAttribute('r', this.radius);
        this.koArc.setAttribute('stroke', this.koColor);
        this.koArc.setAttribute('stroke-width', this.stroke);
        this.koArc.setAttribute('fill', 'none');
        this.koArc.setAttribute('stroke-dasharray', 2 * Math.PI * this.radius);
        this.koArc.setAttribute('stroke-dashoffset', 2 * Math.PI * this.radius);
        this.koArc.setAttribute('stroke-linecap', 'round');
        this.svg.appendChild(this.koArc);
        this.svg.style.transform = 'rotate(-90deg)';
        this.container.appendChild(this.svg);
        this.valueDiv = document.createElement('div');
        this.valueDiv.className = 'donut-value';
        this.container.appendChild(this.valueDiv);
    }
    update(ok, ko, totalRequests) {
        const processed = ok + ko;
        const total = totalRequests || processed;
        // Fracciones
        const okPct = total ? ok / total : 0;
        const koPct = total ? ko / total : 0;
        const donePct = total ? processed / total : 0;
        const arcLen = 2 * Math.PI * this.radius;
        // Pintar OK, KO y pendientes
        const pending = Math.max(0, total - ok - ko);
        const okFrac = total ? ok / total : 0;
        const koFrac = total ? ko / total : 0;
        const pendingFrac = total ? pending / total : 0;
        // Pintar arcos: primero el fondo gris (ya está como bg), luego OK, luego KO
        // OK: desde 0 hasta okFrac
        this.okArc.setAttribute('stroke-dasharray', arcLen);
        this.okArc.setAttribute('stroke-dashoffset', arcLen * (1 - okFrac));
        this.okArc.setAttribute('stroke', this.okColor);
        // KO: desde okFrac hasta okFrac+koFrac
        this.koArc.setAttribute('stroke-dasharray', arcLen);
        this.koArc.setAttribute('stroke-dashoffset', arcLen * (1 - (okFrac + koFrac)));
        this.koArc.setAttribute('stroke', this.koColor);
        // El fondo gris (pendientes) es el círculo base, ya visible
        // Texto central: porcentaje de avance real (ok+ko sobre total)
        const pct = total ? Math.round(((ok + ko) / total) * 100) : 0;
        this.valueDiv.textContent = pct + '%';
    }
}
