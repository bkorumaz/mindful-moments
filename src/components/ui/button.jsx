import React from 'react'
export function Button({ children, className='', variant='default', size, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm transition focus:outline-none border';
  const variants = {
    default: 'bg-slate-900 text-white border-slate-900 hover:opacity-90 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100',
    secondary: 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700',
    outline: 'bg-transparent text-inherit border-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60',
    ghost: 'bg-transparent border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60',
  }
  const sizes = { sm: 'h-8 px-2 rounded-xl', icon: 'h-8 w-8 p-0 rounded-xl' }
  const cls = [base, variants[variant]||variants.default, size?sizes[size]:'', className].join(' ')
  return <button className={cls} {...props}>{children}</button>
}
export default Button