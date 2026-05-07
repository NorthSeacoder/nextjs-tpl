export function Loading({ text = 'Loading...' }: { text?: string }) {
  return <div className="text-gray-500">{text}</div>;
}
