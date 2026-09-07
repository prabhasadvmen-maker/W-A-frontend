export function Card({ title, action, children, className = '', ...rest }) {
  const hasPadding = !className.includes('p-')
  const hasBg = className.includes('bg-')
  const hasBorder = className.includes('border-')

  const defaultClasses = `${!hasBg ? 'bg-[#1E293B]' : ''} ${!hasBorder ? 'border border-[#334155] shadow-lg' : ''}`

  return (
    <div 
      className={`rounded-2xl ${defaultClasses} ${hasPadding ? 'p-5' : ''} ${className}`}
      {...rest}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="text-base font-bold text-[#F1F5F9]">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
