"use client";
import { motion } from "framer-motion";
import { Puzzle, Code2, Globe, GitBranch, Cpu, Workflow } from "lucide-react";

const integrations = [
  { icon: Puzzle, title: "Moodle", desc: "Full LMS integration. Sync courses, grades, and users.", accent: "oklch(0.7 0.15 200)" },
  { icon: Globe, title: "Microsoft Teams", desc: "Deep Teams integration. Create exams directly from chats.", accent: "oklch(0.65 0.2 240)" },
  { icon: Cpu, title: "Google Classroom", desc: "Seamless Classroom sync. One-click roster import.", accent: "oklch(0.75 0.15 85)" },
  { icon: Code2, title: "REST API", desc: "Comprehensive API for custom integrations and automation.", accent: "oklch(0.7 0.15 160)" },
  { icon: GitBranch, title: "Webhooks", desc: "Real-time event notifications for your external systems.", accent: "oklch(0.65 0.18 280)" },
  { icon: Workflow, title: "SSO / SAML", desc: "Single sign-on with Azure AD, Google Workspace, and more.", accent: "oklch(0.65 0.18 330)" },
];

export function Integrations() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Works with{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Your Tools
            </span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>Seamlessly connects with your existing ecosystem</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-4 p-5 rounded-xl transition-all duration-300"
              style={{
                background: "linear-gradient(180deg, oklch(0.08 0.03 270 / 0.4), oklch(0.04 0.02 270 / 0.2))",
                border: "1px solid oklch(1 0 0 / 0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${item.accent.replace(")", "/ 0.15)")}, ${item.accent.replace(")", "/ 0.05)")})`,
                  border: `1px solid ${item.accent.replace(")", "/ 0.15)")}`,
                }}>
                <item.icon className="w-5 h-5" style={{ color: item.accent }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">{item.title}</h3>
                <p className="text-xs mt-1" style={{ color: "oklch(1 0 0 / 0.4)" }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
