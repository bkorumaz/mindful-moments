import React from 'react'
export function Textarea({ className='', ...props }) {
  return <textarea className={['border rounded-2xl px-3 py-2 text-sm bg-white dark:bg-slate-950 min-h-[88px]', className].join(' ')} {...props} />
}
export default Textarea