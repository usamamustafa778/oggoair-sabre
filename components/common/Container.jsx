
export default function Container({ children, className }) {
  return (
    <div className={`max-w-screen-2xl mx-auto w-11/12 lg:px-3  ${className}`}>
      {children}
    </div>
  );
}
