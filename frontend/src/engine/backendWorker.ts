"use client"

export class BackendWorker {
    private ws: WebSocket | null = null
    private listeners: ((e: MessageEvent) => void)[] = []
    private pendingMessages: string[] = []
    private url: string

    constructor(url: string) {
        this.url = url
        this.connect()
    }

    private connect() {
        this.ws = new WebSocket(this.url)
        this.ws.onopen = () => {
            const msgs = [...this.pendingMessages]
            this.pendingMessages = []
            msgs.forEach(m => this.postMessage(m))
        }
        this.ws.onmessage = (e) => {
            this.listeners.forEach(cb => {
                cb(new MessageEvent("message", { data: e.data }))
            })
        }
        this.ws.onclose = () => {
            logMessage("BackendWorker WS Closed")
        }
        this.ws.onerror = (err) => {
            logMessage("BackendWorker WS Error: " + JSON.stringify(err))
        }
    }

    public postMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(String(message))
        } else {
            this.pendingMessages.push(String(message))
        }
    }

    public addEventListener(type: string, callback: any) {
        if (type === "message") {
            this.listeners.push(callback)
        }
    }

    public removeEventListener(type: string, callback: any) {
        if (type === "message") {
            this.listeners = this.listeners.filter(cb => cb !== callback)
        }
    }

    public terminate() {
        if (this.ws) {
            this.ws.close()
        }
    }
}

function logMessage(msg: string) {
    if (process.env.NODE_ENV !== "production") {
        console.log(msg)
    }
}
