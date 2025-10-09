const Card = ({ children, className = '', padding = 'default', ...props }) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  const classes = `bg-white rounded-lg shadow-sm border border-gray-200 ${paddingClasses[padding]} ${className}`.trim()
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = '', ...props }) => {
  const classes = `border-b border-gray-200 pb-4 mb-4 ${className}`.trim()
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

const CardTitle = ({ children, className = '', ...props }) => {
  const classes = `text-lg font-semibold text-gray-900 ${className}`.trim()
  
  return (
    <h3 className={classes} {...props}>
      {children}
    </h3>
  )
}

const CardContent = ({ children, className = '', ...props }) => {
  const classes = `text-gray-600 ${className}`.trim()
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className = '', ...props }) => {
  const classes = `border-t border-gray-200 pt-4 mt-4 ${className}`.trim()
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter }
