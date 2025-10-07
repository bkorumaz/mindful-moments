import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error){ return { hasError: true, error } }
  componentDidCatch(error, info){ console.error('App crashed:', error, info) }
  render(){
    if(this.state.hasError){
      return (
        <div className="p-6 max-w-xl mx-auto text-sm">
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">The dashboard hit a runtime error. Try reloading the page. If it persists, click “Reset Local Data”.</p>
          <button
            className="inline-flex items-center rounded-2xl px-3 py-2 text-sm border bg-slate-100"
            onClick={()=>{ localStorage.clear(); location.reload(); }}
          >Reset Local Data</button>
          <pre className="mt-4 p-3 border rounded-2xl bg-white/70 dark:bg-slate-900/50 overflow-auto">{String(this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)