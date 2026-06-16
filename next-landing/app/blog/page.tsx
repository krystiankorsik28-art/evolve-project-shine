"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { NavBar } from "@/components/sections/NavBar";
import { Footer } from "@/components/sections/Footer";

const POSTS = [
  { title: "How AI is Transforming Polish Education in 2026", slug: "ai-transforming-polish-education", date: "Jun 12, 2026", readTime: "5 min", excerpt: "From personalized tutoring to automated grading — discover how Polish schools are leveraging AI to improve student outcomes.", tags: ["AI", "Education"] },
  { title: "Complete Guide: Matura Exam Preparation with AI", slug: "matura-preparation-ai-guide", date: "Jun 5, 2026", readTime: "8 min", excerpt: "Learn how teachers are using AI to create realistic matura practice tests and help students achieve better scores.", tags: ["Matura", "Guide"] },
  { title: "Why 800+ Polish Schools Chose EduNex This Year", slug: "why-schools-chose-edunex", date: "May 28, 2026", readTime: "6 min", excerpt: "The numbers behind the adoption: 40% reduction in teacher workload, 25% improvement in student scores.", tags: ["Case Study"] },
  { title: "AI Proctoring: The Future of Cheat-Proof Exams", slug: "ai-proctoring-future", date: "May 20, 2026", readTime: "7 min", excerpt: "How AI-powered monitoring is making remote exams as secure as in-person testing.", tags: ["Security", "AI"] },
  { title: "Teacher's Guide: Getting Started with AI Grading", slug: "getting-started-ai-grading", date: "May 12, 2026", readTime: "10 min", excerpt: "Step-by-step guide to setting up AI grading for essays, open-ended questions, and coding assignments.", tags: ["Guide", "AI"] },
  { title: "The ROI of AI in Education: Real Numbers from Polish Schools", slug: "roi-ai-education", date: "May 5, 2026", readTime: "6 min", excerpt: "Schools report 40% reduction in grading time, 30% lower administrative costs, and 25% better student outcomes.", tags: ["Research"] },
];

export default function BlogPage() {
  return (
    <main className="bg-[#0a0a12] min-h-screen">
      <NavBar />
      <div className="pt-28 pb-24 sm:pt-36 sm:pb-32 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-400 mb-4">
            <BookOpen className="w-3 h-3" />
            Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">EduNex Blog</h1>
          <p className="mt-3 text-sm text-white/40 max-w-md mx-auto">Insights, guides, and news about AI in education</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {POSTS.map((post, i) => (
            <motion.a
              key={post.slug}
              href={`/blog/${post.slug}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className="flex gap-1.5 mb-4">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/20 mb-3">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime} read</span>
              </div>
              <h2 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-xs text-white/40 leading-relaxed">{post.excerpt}</p>
            </motion.a>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
