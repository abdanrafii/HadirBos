const Loading = ({ fullscreen = false, size = 12 }) => {
  const containerClass = fullscreen
    ? "flex justify-center items-center min-h-screen transition-opacity duration-300 ease-in-out"
    : "flex justify-center items-center h-64 transition-opacity duration-300 ease-in-out";

  const spinnerSizeClass = `h-${size} w-${size}`;

  return (
    <div className={containerClass}>
      <div
        className={`animate-spin rounded-full ${spinnerSizeClass} border-t-4 border-b-4 border-indigo-600`}
      />
    </div>
  );
};

export default Loading;
