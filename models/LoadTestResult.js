export class LoadTestResult {
    constructor(numThreads) {
        this.startTime = null;
        this.endTime = null;
        this.ok = 0;
        this.ko = 0;
        this.okTimes = [];
        this.koTimes = [];
        this.allTimes = [];
        this.statuses = [];
        this.threadResults = Array.from({ length: numThreads }, () => []);
    }
    addResult(success, time, threadIdx) {
        if (this.startTime === null) this.startTime = performance.now();
        this.allTimes.push(time);
        this.statuses.push(success);
        if (success) {
            this.ok++;
            this.okTimes.push(time);
        } else {
            this.ko++;
            this.koTimes.push(time);
        }
        if (threadIdx !== undefined && this.threadResults[threadIdx]) {
            this.threadResults[threadIdx].push({ time, ok: success });
        }
    }
    get okAvg() {
        return this.okTimes.length ? (this.okTimes.reduce((a, b) => a + b, 0) / this.okTimes.length).toFixed(1) : '-';
    }
    get koAvg() {
        return this.koTimes.length ? (this.koTimes.reduce((a, b) => a + b, 0) / this.koTimes.length).toFixed(1) : '-';
    }
    get globalAvg() {
        return this.allTimes.length ? (this.allTimes.reduce((a, b) => a + b, 0) / this.allTimes.length).toFixed(1) : '-';
    }
}
