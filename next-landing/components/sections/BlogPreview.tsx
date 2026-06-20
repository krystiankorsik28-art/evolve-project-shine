"use client";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

const posts = [
  {
    title: "How AI is Transforming Polish Education in 2026",
    excerpt: "From personalized tutoring to automated grading — discover how Polish schools are leveraging AI to improve student outcomes.",
    date: "Jun 12, 2026",
    slug: "ai-transforming-polish-education",
    readTime: "5 min read",
  },
  {
    title: "Complete Guide: Matura Exam Preparation with AI",
    excerpt: "Learn how teachers are using AI to create realistic matura practice tests and help students achieve better scores.",
    date: "Jun 5, 2026",
    slug: "matura-preparation-ai-guide",
    readTime: "8 min read",
  },
  {
    title: "Why 800+ Polish Schools Chose EduNex This Year",
    excerpt: "The numbers behind the adoption: 40% reduction in teacher workload, 25% improvement in student scores.",
    date: "May 28, 2026",
    slug: "why-schools-chose-edunex",
    readTime: "6 min read",
  },
];

export function BlogPreview() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Latest from{" "}
              <span style={{
                background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Blog
              </span>
            </h2>
            <p className="mt-2 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>Insights, guides, and news from the EduNex team</p>
          </div>
          <a href="/blog" className="hidden sm:inline-flex items-center gap-1.5 text-xs transition-colors" style={{ color: "oklch(1 0 0 / 0.4)" }}>
            View all <ArrowRight className="w-3 h-3" />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((post, i) => (
            <motion.a
              key={post.slug}
              href={`/blog/${post.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group p-6 rounded-2xl transition-all duration-300"
              style={{
                background: "linear-gradient(180deg, oklch(0.08 0.03 270 / 0.4), oklch(0.04 0.02 270 / 0.2))",
                border: "1px solid oklch(1 0 0 / 0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                <BookOpen className="w-5 h-5" style={{ color: "oklch(1 0 0 / 0.4)" }} />
              </div>
              <div className="flex items-center gap-2 text-[10px] mb-3" style={{ color: "oklch(1 0 0 / 0.2)" }}>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors mb-2">{post.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "oklch(1 0 0 / 0.4)" }}>{post.excerpt}</p>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <a href="/blog" className="inline-flex items-center gap-1.5 text-xs transition-colors" style={{ color: "oklch(1 0 0 / 0.4)" }}>
            View all articles <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
