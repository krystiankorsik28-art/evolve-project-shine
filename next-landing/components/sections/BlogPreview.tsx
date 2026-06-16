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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Latest from Blog</h2>
            <p className="mt-2 text-sm text-white/40">Insights, guides, and news from the EduNex team</p>
          </div>
          <a href="/blog" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
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
              className="group p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:border-cyan-500/30 transition-colors">
                <BookOpen className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/20 mb-3">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors mb-2">
                {post.title}
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">{post.excerpt}</p>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <a href="/blog" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            View all articles <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
