const Button = function ({
  children,
  onClick,
  disabled,
  className = '',
  ...props
}) {
  const handleClick = () => (disabled || !onClick ? null : onClick())
  return (
    <button
      {...props}
      className={`w-32 bg-vesper rounded-md py-1 text-white text-center font-bold text-sm focus:outline-none uppercase ${
        disabled ? 'bg-opacity-25 cursor-not-allowed' : 'hover:bg-opacity-75'
      } ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

export default Button
