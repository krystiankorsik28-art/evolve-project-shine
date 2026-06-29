import { motion } from "framer-motion";

export function EnterpriseMotionLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fafc,#eef2f7_44%,#f8fafc)]" />
      <motion.div
        className="absolute -left-32 top-24 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl"
        animate={{ x: [0, 28, 0], y: [0, -16, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 top-10 h-[560px] w-[560px] rounded-full bg-slate-400/12 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 18, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[.045]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "82px 82px",
        }}
      />
    </div>
  );
}
