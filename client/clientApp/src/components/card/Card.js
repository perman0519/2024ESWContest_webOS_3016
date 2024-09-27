export const Card = ({ children, className, ...props }) => (
	<div className={`${className}`} {...props}>{children}</div>
  )

export const CardHeader = ({ children }) => (
	<div className="px-6 py-4 text-center border-b border-gray-200">{children}</div>
  )

export const CardContent = ({ children, className, ...props }) => (
	<div className={`${className}`} {...props}>
	  {children}
	</div>
  )

export const CardFooter = ({ children }) => (
	<div className="px-6 py-4 bg-gray-50 rounded-b-lg">{children}</div>
  )

export const CardTitle = ({ children }) => (
	<h2 className="text-2xl font-bold text-gray-900">{children}</h2>
  )
