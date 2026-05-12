import React from 'react'

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-white/6' }) => {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${color} text-white/90`}>{children}</span>
  )
}

export default Badge
