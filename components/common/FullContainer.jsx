
export default function FullContainer({ children, className }) {
  return (
    <div className={`w-full h-full  ${className}`}>
      {children}
    </div>
  )
}