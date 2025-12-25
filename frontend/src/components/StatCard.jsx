export default function StatCard({ label, value }) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
