"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { NavBar } from "@/components/sections/NavBar";
import { Footer } from "@/components/sections/Footer";

const POSTS: Record<string, { title: string; date: string; content: string; tags: string[] }> = {
  "ai-transforming-polish-education": {
    title: "How AI is Transforming Polish Education in 2026",
    date: "Jun 12, 2026",
    tags: ["AI", "Education"],
    content: `
      Polish education is undergoing a radical transformation. With over 800 schools now using AI-powered platforms like EduNex, the way teachers teach and students learn is changing faster than ever.

      ## The Numbers Don't Lie

      Schools using AI-powered tools report:
      - **40% reduction** in teacher grading time
      - **25% improvement** in student test scores
      - **60% faster** exam creation
      - **90% detection rate** for cheating attempts

      ## How AI is Being Used

      ### Automated Grading
      Teachers are saving 12+ hours per week by letting AI handle grading of multiple-choice, open-ended, and even essay questions.

      ### Personalized Tutoring
      AI tutors adapt to each student's learning style, providing 24/7 support that was previously impossible with human teachers alone.

      ### Smart Proctoring
      AI-powered monitoring detects cheating attempts in real-time, making remote exams as secure as in-person testing.

      ## What Teachers Say

      "EduNex transformed how I prepare my students for matura exams. The AI generates realistic practice tests in seconds, and the analytics show exactly where each student struggles." — Katarzyna Mazurek, Mathematics Teacher

      ## The Future

      As AI technology continues to advance, we can expect even more transformative changes:
      - Predictive analytics that identify at-risk students before they fall behind
      - Fully automated curriculum personalization
      - Real-time translation and accessibility features
      - AI-generated interactive learning materials

      The future of Polish education is here, and it's powered by AI.
    `,
  },
};

import { use } from "react";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = POSTS[slug];

  if (!post || !slug) {
    return (
      <main className="bg-[#0a0a12] min-h-screen">
        <NavBar />
        <div className="pt-36 pb-32 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <a href="/blog" className="text-sm text-cyan-400 hover:text-cyan-300">← Back to blog</a>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-[#0a0a12] min-h-screen">
      <NavBar />
      <article className="pt-28 pb-24 sm:pt-36 sm:pb-32 max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <a href="/blog" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-8">
            <ArrowLeft className="w-3 h-3" />
            Back to blog
          </a>

          <div className="flex gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
          <p className="text-xs text-white/30 mb-8">{post.date}</p>

          <div className="prose prose-invert max-w-none prose-sm prose-headings:text-white prose-headings:font-semibold prose-p:text-white/60 prose-li:text-white/60 prose-strong:text-white/80">
            {post.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-white mt-8 mb-3">{line.slice(3)}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-white mt-6 mb-2">{line.slice(4)}</h3>;
              if (line.startsWith('- **')) {
                const match = line.match(/- \*\*(.+?)\*\*(.+)/);
                if (match) return <li key={i} className="text-sm text-white/60 ml-4 mb-1"><strong className="text-white/80">{match[1]}</strong>{match[2]}</li>;
              }
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="text-sm text-white/60 leading-relaxed mb-3">{line}</p>;
            })}
          </div>
        </motion.div>
      </article>
      <Footer />
    </main>
  );
}
