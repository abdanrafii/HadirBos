interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl'; // More controlled size options
  className?: string;
}

const Avatar = ({ name = "", size = 'md', className = "" }: AvatarProps) => {
  const getInitials = (name: string): string => {
    const words = name.trim().split(" ");
    
    if (words.length === 0) return "??";
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[Math.min(1, words.length - 1)][0]).toUpperCase();
  };

  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  return (
    <div 
      className={`
        aspect-square
        rounded-full 
        ${sizeClasses[size]}
        ${className}
        bg-blue-100
        flex 
        items-center 
        justify-center 
        text-blue-600
        font-semibold
        shadow-md
        transition-transform
        hover:scale-105
        select-none
        overflow-hidden
      `}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;