import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-2">Something went wrong</h2>
          <p className="text-stone-400 text-sm mb-4">{this.state.error?.message}</p>
          <button className="btn-secondary" onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
