// export const Button = ({ children, className, variant = 'default', type, onClick }) => {
// 	const baseStyle = "px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
// 	const variantStyles = {
// 	  default: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
// 	  link: "text-gray-600 hover:text-green-700 underline",
// 	}

// 	return (
// 	  <button
// 		className={`${baseStyle} ${variantStyles[variant]} ${className}`}
// 		type={type}
// 		onClick={onClick}
// 	  >
// 		{children}
// 	  </button>
// 	)
//   }

export  const Button = ({ children, variant, size, className, ...props }) => (
	<button className={`px-4 py-2 rounded ${variant === 'ghost' ? 'hover:bg-gray-100' : 'bg-green-500 text-white hover:bg-green-600'} ${size === 'icon' ? 'p-2' : ''} ${className}`} {...props}>
	  {children}
	</button>
  )
