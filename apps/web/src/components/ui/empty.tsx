export function Empty({ text = 'No items found.' }: { text?: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
      {text}
    </div>
  );
}
