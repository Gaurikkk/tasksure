export default function Card({ title, children }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-md border border-slate-700">
      {title && (
        <h3 className="text-sm uppercase text-slate-400 mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
