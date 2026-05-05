module.exports = {
  plugins: [],
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vesper: '#4138AC',
        vusd: '#596AEC'
      },
      fontSize: {
        '1.5xl': '1.375rem'
      },
      maxWidth: {
        customscreen: '1085px'
      },
      minHeight: {
        content: '700px'
      },
      spacing: {
        5.5: '1.375rem',
        7.5: '1.875rem',
        15: '3.75rem',
        19: '4.75rem',
        54: '13.5rem',
        63: '15.75rem',
        88: '22rem',
        105: '26.25rem',
        160: '40rem'
      }
    },
    fontFamily: {
      sans: ['Inter']
    }
  },
  variants: {}
}
