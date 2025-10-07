import React from 'react'
export function Switch({ checked, onCheckedChange }) {
  return (
    <button
      onClick={() => onCheckedChange?.(!checked)}
      className={['h-6 w-10 rounded-full relative transition border',
        checked ? 'bg-slate-900 border-slate-900 dark:bg-slate-100 dark:border-slate-100' : 'bg-slate-200 border-slate-300'
      ].join(' ')}
      aria-pressed={checked}
      role="switch"
    >
      <span className={['absolute top-0.5 h-5 w-5 rounded-full bg-white transition',
        checked ? 'right-0.5' : 'left-0.5'
      ].join(' ')} />
    </button>
  )
}
export default Switch