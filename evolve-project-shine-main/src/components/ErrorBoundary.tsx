import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-[oklch(0.06_0.04_260)]">
          <AlertTriangle className="w-10 h-10 text-red-400" />
          <h2 className="text-lg font-semibold text-white/80">Coś poszło nie tak</h2>
          <p className="text-sm text-white/40 max-w-md">{this.state.error.message}</p>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all text-sm">
            <RefreshCw className="w-4 h-4" />Spróbuj ponownie
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
