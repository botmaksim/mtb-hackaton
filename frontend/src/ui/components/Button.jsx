import { cn } from "../../lib/utils";

export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-200",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm cursor-pointer",
    md: "px-4 py-2 font-medium cursor-pointer",
    lg: "px-6 py-3 font-bold text-lg cursor-pointer"
  };

  return (
    <button
      className={cn(
        "rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
