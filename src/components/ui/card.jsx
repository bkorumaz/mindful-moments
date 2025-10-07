import React from 'react'
export function Card({ className='', children }) {
  return <div className={['rounded-2xl border bg-white/80 dark:bg-slate-900/50', className].join(' ')}>{children}</div>
}
export function CardHeader({ className='', children }) { return <div className={['p-5 border-b border-transparent', className].join(' ')}>{children}</div> }
export function CardTitle({ className='', children }) { return <div className={['text-lg font-semibold', className].join(' ')}>{children}</div> }
export function CardDescription({ className='', children }) { return <div className={['text-sm text-muted-foreground', className].join(' ')}>{children}</div> }
export function CardContent({ className='', children }) { return <div className={['p-5', className].join(' ')}>{children}</div> }
export default Card