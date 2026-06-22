interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 48, text }: LoadingSpinnerProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-3">
        <img
          src="/logo.png"
          alt="Loading..."
          className="animate-spin rounded-full"
          style={{ width: size, height: size, objectFit: "contain" }}
        />
      </div>
      {text && <p className="text-gray-500">{text}</p>}
    </div>
  );
}