export  const Button = ({ children, variant, size, className, ...props }) => (
	<button className={`px-4 py-2 rounded ${variant === 'ghost' ? 'hover:bg-gray-100' : 'bg-green-500 text-white hover:bg-green-600'} ${size === 'icon' ? 'p-2' : ''} ${className}`} {...props}>
	  {children}
	</button>
  )
