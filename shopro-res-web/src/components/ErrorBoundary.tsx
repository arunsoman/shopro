import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional label shown in the error panel for context (e.g. screen name) */
  label?: string;
}

interface State {
  error: Error | null;
}

/**
 * ErrorBoundary — catches render errors in any subtree so a single
 * broken screen cannot crash the entire app (header, sidenav, footer
 * all stay alive). Place around each routed screen in Canvas or at the
 * Canvas root level.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', this.props.label ?? 'unknown', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-950 space-y-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 text-2xl font-black">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Something went wrong</h2>
            {this.props.label && (
              <p className="text-sm text-muted-foreground/60">{this.props.label}</p>
            )}
            <p className="text-xs font-mono text-rose-500/70 max-w-sm break-words">
              {this.state.error.message}
            </p>
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-80 transition-opacity"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
