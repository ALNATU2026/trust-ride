type EventCallback = (data: any) => void;

export class RealtimeService {
  private static instance: RealtimeService;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private eventSource: EventSource | null = null;
  private isConnected: boolean = false;
  private reconnectTimeout: any = null;

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  constructor() {
    this.connectEventStream();
  }

  private connectEventStream() {
    if (typeof window === 'undefined') return;

    try {
      this.eventSource = new EventSource('/api/realtime/stream');

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.emit('connection:status', { connected: true });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.event) {
            this.emit(parsed.event, parsed.payload);
          }
        } catch (e) {
          // ignore parsing error
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.emit('connection:status', { connected: false });
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        // Auto-reconnect after 4s
        if (!this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connectEventStream();
          }, 4000);
        }
      };
    } catch (e) {
      // fallback
    }
  }

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.off(event, callback);
    };
  }

  off(event: string, callback: EventCallback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}
