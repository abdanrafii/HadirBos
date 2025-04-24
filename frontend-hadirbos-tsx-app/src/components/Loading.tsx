const Loading = ({ fullscreen = false }) => {
  const containerClass = fullscreen
    ? "flex justify-center items-center min-h-screen transition-opacity duration-300 ease-in-out"
    : "flex justify-center items-center h-64 transition-opacity duration-300 ease-in-out";

  return (
    <div className={containerClass}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
    </div>
  );
};

export default Loading;
