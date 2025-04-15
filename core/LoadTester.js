import { LoadTestConfig } from '../models/LoadTestConfig.js';
import { LoadTestResult } from '../models/LoadTestResult.js';

export class LoadTester {
    constructor(config, result, onUpdate, onFinish) {
        this.config = config;
        this.result = result;
        this.onUpdate = onUpdate;
        this.onFinish = onFinish;
        this.running = false;
    }
    async start() {
        this.running = true;
        const threads = this.config.threads;
        let finishedThreads = 0;

        const onThreadFinish = () => {
            finishedThreads++;
            if (finishedThreads === threads) {
                this.running = false;
                if (this.result) this.result.endTime = performance.now();
                if (typeof this.onFinish === 'function') this.onFinish();
            }
        };

        // Lanzar "hilos" (promesas)
        for (let i = 0; i < threads; i++) {
            this.threadFunc(i, onThreadFinish);
        }
    }

    // Formatea timestamp a DD/MM/YY HH:MM:SS.MMM
    static formatDate(ts) {
        const d = new Date(ts);
        const pad = n => n.toString().padStart(2, '0');
        const ms = d.getMilliseconds().toString().padStart(3, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear().toString().slice(-2)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`;
    }

    async threadFunc(threadIdx, onThreadFinish) {
        if (!this.koLog) this.koLog = [];
        if (!this.okLog) this.okLog = [];
        const url = this.config.url;
        const body = this.config.body;
        // Cada hilo debe hacer exactamente 'requests' peticiones
        const requests = this.config.totalRequests / this.config.threads;
        // Si el usuario pone números no divisibles, redondea hacia arriba para no perder peticiones
        const requestsPerThread = Math.ceil(requests);
        const bearerToken = this.config.bearerToken;
        const headers = {
            'Content-Type': 'application/json'
        };
        if (bearerToken) headers['Authorization'] = `Bearer ${bearerToken}`;

        for (let i = 0; i < requestsPerThread; i++) {
            // Pausa cooperativa
            while (this.paused) {
                await new Promise(res => {
                    if (!this._resumeCallbacks) this._resumeCallbacks = [];
                    this._resumeCallbacks.push(res);
                });
            }
            if (!this.running) break;
            let reqBody = body;
            let uniqueNum = null;
            if (typeof this.onBeforeRequest === 'function') {
                reqBody = this.onBeforeRequest(body, i + threadIdx * totalRequests) || body;
                // Extrae el número único si se reemplaza en el body
                if (typeof window.getCurrentUniqueNumber === 'function') {
                    uniqueNum = window.getCurrentUniqueNumber();
                }
            }
            const start = performance.now();
            let ok = false;
            let respText = '';
            let timestamp = Date.now();
            let timestampFmt = LoadTester.formatDate(timestamp);
            let response = null;
            try {
                const fetchOptions = {
                    method: 'POST',
                    headers
                };
                if (reqBody !== null && reqBody !== undefined && !(typeof reqBody === 'string' && reqBody.trim() === '')) {
                    fetchOptions.body = JSON.stringify(reqBody);
                }
                response = await fetch(url, fetchOptions);
                ok = response.ok;
                if (!ok) {
                    try { respText = await response.text(); } catch { respText = ''; }
                }
            } catch (e) {
                ok = false;
                respText = e && e.message ? e.message : String(e);
            }
            if (!ok) {
                let responseStatus = null;
                let responseBody = null;
                if (response) {
                    try {
                        responseStatus = response.status;
                        const contentType = response.headers.get('content-type') || '';
                        if (contentType.includes('application/json')) {
                            responseBody = await response.clone().json();
                        } else {
                            responseBody = await response.clone().text();
                        }
                    } catch (e) {
                        responseBody = respText || null;
                    }
                } else {
                    responseBody = respText || null;
                }
                this.koLog.push({
                    timestamp: timestampFmt,
                    uniqueNumber: uniqueNum ?? (i + threadIdx * totalRequests),
                    status: responseStatus,
                    response: responseBody,
                    request: {
                        url,
                        headers,
                        body: reqBody
                    }
                });
            } else {
                let responseStatus = null;
                let responseBody = null;
                if (response) {
                    try {
                        responseStatus = response.status;
                        const contentType = response.headers.get('content-type') || '';
                        if (contentType.includes('application/json')) {
                            responseBody = await response.clone().json();
                        } else {
                            responseBody = await response.clone().text();
                        }
                    } catch (e) {
                        responseBody = null;
                    }
                }
                this.okLog.push({
                    timestamp: timestampFmt,
                    uniqueNumber: uniqueNum ?? (i + threadIdx * totalRequests),
                    body: reqBody,
                    status: responseStatus,
                    response: responseBody
                });
            }
            const elapsed = performance.now() - start;
            this.result.addResult(ok, elapsed, threadIdx);
            // Actualiza el donut y la UI en tiempo real
            if (typeof window.updateUI === 'function') window.updateUI(false);
            if (typeof this.onUpdate === 'function') this.onUpdate();
        }
        if (typeof onThreadFinish === 'function') onThreadFinish();
        // Exponer el log de KO y OK globalmente si ya han terminado todos los hilos
        if (!this.running) {
            if (this.koLog && this.koLog.length) window.lastKOPetitionLog = this.koLog;
            if (this.okLog && this.okLog.length) window.lastOKPetitionLog = this.okLog;
        }
    }

    // Reanudar hilos pausados
    resume() {
        this.paused = false;
        if (this._resumeCallbacks && this._resumeCallbacks.length) {
            this._resumeCallbacks.forEach(cb => cb());
            this._resumeCallbacks = [];
        }
    }
}


