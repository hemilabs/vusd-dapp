import React from 'react'

const DaiIcon = props => (
  <svg
    height="45"
    viewBox="0 0 45 45"
    width="45"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient
        gradientUnits="objectBoundingBox"
        id="a"
        x1="0.146"
        x2="0.854"
        y1="0.854"
        y2="0.146"
      >
        <stop offset="0" stopColor="#97ebff" />
        <stop offset="1" stopColor="#4f5fe8" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    <g transform="translate(-1103.247 -639.882)">
      <circle
        cx="22.5"
        cy="22.5"
        fill="url(#a)"
        r="22.5"
        transform="translate(1103.247 639.882)"
      />
      <path
        d="M1143.576,663.085h-2.481a10.093,10.093,0,0,0-9.463-6.583h-8.88v6.583h-2.824v2.4h2.824v2.382h-2.824v2.4h2.824v6.408h8.88a10.092,10.092,0,0,0,9.4-6.408h2.548v-2.4h-1.938a10.1,10.1,0,0,0,.081-1.278h0a10.183,10.183,0,0,0-.062-1.1h1.919Zm-18.463-4.437h6.26a7.945,7.945,0,0,1,7.132,4.437h-13.391Zm6.26,15.891h-6.26v-4.265h13.3a7.945,7.945,0,0,1-7.043,4.263Zm7.946-7.946h0a8,8,0,0,1-.1,1.278h-14.1v-2.381h14.128a8,8,0,0,1,.077,1.1Z"
        fill="#596aec"
        transform="translate(-4.315 -4.299)"
      />
    </g>
  </svg>
)
export default DaiIcon
