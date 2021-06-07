import { useState } from 'react'

import { useOnClickOutside } from '../hooks/useOnClickOutside'

const Dropdown = function ({ selector, children, disabled, ...props }) {
  const [isOpen, setIsOpen] = useState(false)
  const DropdownRef = useOnClickOutside(() => setIsOpen(false))
  return (
    <div
      onClick={() => !disabled && setIsOpen(!isOpen)}
      ref={DropdownRef}
      {...props}
    >
      {selector}
      {isOpen && children}
    </div>
  )
}

export default Dropdown
