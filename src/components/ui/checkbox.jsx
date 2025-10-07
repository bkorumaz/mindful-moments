import React from 'react'
export function Checkbox({ checked, onCheckedChange }) {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
      checked={!!checked}
      onChange={e => onCheckedChange?.(e.target.checked)}
    />
  )
}
export default Checkbox