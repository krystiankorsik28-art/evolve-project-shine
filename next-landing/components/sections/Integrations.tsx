"use client";
import { motion } from "framer-motion";
import { Puzzle, Code2, Globe, GitBranch, Cpu, Workflow } from "lucide-react";

const integrations = [
  { icon: Puzzle, title: "Moodle", desc: "Full LMS integration. Sync courses, grades, and users." },
  { icon: Globe, title: "Microsoft Teams", desc: "Deep Teams integration. Create exams directly from chats." },
  { icon: Cpu, title: "Google Classroom", desc: "Seamless Classroom sync. One-click roster import." },
  { icon: Code2, title: "REST API", desc: "Comprehensive API for custom integrations and automation." },
  { icon: GitBranch, title: "Webhooks", desc: "Real-time event notifications for your external systems." },
  { icon: Workflow, title: "SSO / SAML", desc: "Single sign-on with Azure AD, Google Workspace, and more." },
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
            Works with Your Tools
          </h2>
          <p className="mt-3 text-sm text-white/40">Seamlessly connects with your existing ecosystem</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <item.icon className="w-5 h-5 text-white/50" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">{item.title}</h3>
                <p className="text-xs text-white/40 mt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
