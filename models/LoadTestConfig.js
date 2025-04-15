export class LoadTestConfig {
    constructor(url, body, threads, totalRequests, bearerToken = null) {
        this.url = url;
        this.body = body;
        this.threads = threads;
        this.totalRequests = totalRequests;
        this.bearerToken = bearerToken;
    }
}
