import { motion } from "framer-motion";

const rows = [
  ["Matematyka", "82%"],
  ["Biologia", "76%"],
  ["Polski", "91%"],
];

export function EnterpriseDashboardMock() {
  return (
    <section className="mt-16 rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_30px_100px_rgba(15,23,42,.10)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">EduNex Command View</div>
          <div className="text-xs text-slate-500">Podgląd pracy klasy</div>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">online</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric value="128" label="uczniów" />
        <Metric value="94" label="oddane" />
        <Metric value="82%" label="średnia" />
      </div>
      <div className="mt-5 space-y-3">
        {rows.map(([name, value], index) => (
          <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between text-sm"><span>{name}</span><span className="text-slate-500">{value}</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <motion.div className="h-full rounded-full bg-blue-700" initial={{ width: 0 }} whileInView={{ width: value }} viewport={{ once: true }} transition={{ duration: 1, delay: index * .1 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-2xl font-semibold tracking-[-.04em]">{value}</div><div className="mt-1 text-xs text-slate-500">{label}</div></div>;
}
