type LoadingListener = (isLoading: boolean) => void;

class LoadingManager {
  private static instance: LoadingManager;
  private activeRequests = 0;
  private listeners: Set<LoadingListener> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private safetyTimer: ReturnType<typeof setTimeout> | null = null;
  private _isLoading = false;

  private constructor() {}

  public static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  public startRequest() {
    this.activeRequests++;
    this.updateState();
  }

  public stopRequest() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.updateState();
  }

  private clearSafetyTimer() {
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
  }

  private startSafetyTimer() {
    this.clearSafetyTimer();
    this.safetyTimer = setTimeout(() => {
      console.warn("LoadingManager: Safety timeout reached. Resetting state.");
      this.activeRequests = 0;
      this._isLoading = false;
      this.notify();
    }, 10000); // 10s safety net
  }

  private updateState() {
    const shouldBeLoading = this.activeRequests > 0;
    
    if (shouldBeLoading !== this._isLoading) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }

      // Remove debounce for instant feedback
      this._isLoading = shouldBeLoading;
      
      if (this._isLoading) {
        this.startSafetyTimer();
      } else {
        this.clearSafetyTimer();
      }
      
      this.notify();
    }
  }

  public subscribe(listener: LoadingListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this._isLoading));
  }

  public get isLoading() {
    return this._isLoading;
  }
}

export const loadingManager = LoadingManager.getInstance();
