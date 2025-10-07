import React from 'react'
export function Input({ className='', ...props }) {
  return <input className={['border rounded-2xl px-3 py-2 text-sm bg-white dark:bg-slate-950', className].join(' ')} {...props} />
}
export default Input