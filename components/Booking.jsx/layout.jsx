import React from 'react'

function Rightbar({children}) {
  return (
    <div className="w-full">
      <div className="w-full max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  )
}

export default Rightbar
