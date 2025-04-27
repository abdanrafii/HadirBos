const Avatar = ({ name = "", size = 10, className = "" }) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const sizeAva = `w-${size} h-${size}`;

  return (
    <div className={`rounded-full ${sizeAva} ${className} bg-blue-100 flex items-center justify-center text-blue-600 font-bold`}>
      {initials || "??"}
    </div>
  );
};

export default Avatar;
