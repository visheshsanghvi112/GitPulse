import React from 'react'

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`skeleton-shimmer rounded-md ${className}`} />
}

export default Skeleton
