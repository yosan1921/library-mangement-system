export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`${sizes[size]} relative animate-spin`}>
                <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600"></div>
            </div>
            {text && (
                <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
            )}
        </div>
    );
}
