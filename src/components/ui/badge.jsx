import React from 'react'
export function Badge({ children, className='', variant='default' }) {
  const variants = {
    default: 'bg-slate-900 text-white',
    secondary: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white',
    outline: 'border border-slate-300 bg-transparent',
  }
  return <span className={['inline-flex items-center px-2 py-1 rounded-full text-xs', variants[variant]||variants.default, className].join(' ')}>{children}</span>
}
export default Badge