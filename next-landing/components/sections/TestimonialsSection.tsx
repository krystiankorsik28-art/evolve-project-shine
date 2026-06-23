"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Anna Kowalska",
    role: "Nauczycielka Matematyki",
    school: "Liceum im. Kopernika, Kraków",
    image: "🧑‍🏫",
    content: "EduNex zmienił sposób, w jaki nauczam. AI generator testów oszczędził mi 10 godzin tygodniowo. Moi uczniowie lubią AI tutora, bo uczy w swoim tempie.",
    rating: 5,
  },
  {
    name: "Marek Lewandowski",
    role: "Dyrektor Szkoły",
    school: "Szkoła Podstawowa nr 5, Warszawa",
    image: "👨‍💼",
    content: "Wdrażamy EduNex w całej szkole. Zaoszczędziliśmy pieniądze na korepetycjach a wyniki uczniów znacznie się poprawiły. Wsparcie z EduNex było bezcenne.",
    rating: 5,
  },
  {
    name: "Karolina Szymańska",
    role: "Koordynatorka Nauczania",
    school: "Zespół Szkół Technicznych, Wrocław",
    image: "👩‍💼",
    content: "Ich platforma LMS to świetna integracja. Wiesz dokładnie, gdzie mają problemy uczniowie. Analytics są zachwycające i faktycznie pomagają w podejmowaniu decyzji.",
    rating: 5,
  },
  {
    name: "Piotr Nowak",
    role: "Nauczyciel Historii",
    school: "Gimnazjum Publiczne, Gdańsk",
    image: "👨‍🏫",
    content: "Moi uczniowie są bardziej zaangażowani niż kiedykolwiek. AI Tutor jest dostępny 24/7, więc mogą uczyć się o swojej porze. Rekomendację każdemu nauczycielowi!",
    rating: 5,
  },
  {
    name: "Dr. Barbara Dudek",
    role: "Kierownik Oddziału Edukacji",
    school: "Kuratoria Oświaty, Poznań",
    image: "👩‍🎓",
    content: "EduNex to przyszłość edukacji w Polsce. Technologia AI jest odpowiedzialna i wspiera tradycyjne nauczanie. Polecam instytucjom na całym kraju.",
    rating: 5,
  },
  {
    name: "Jakub Siwak",
    role: "Nauczyciel Programowania",
    school: "Liceum Ogólnokształcące, Kraków",
    image: "👨‍💻",
    content: "Praktycznie wszystko jest bardziej efektywne. Automatyczne ocenianie koduyu uczniów, spersonalizowana nauka. To jest dokładnie to, czego potrzebowałem.",
    rating: 5,
  },
];

const STATS = [
  { number: "36K+", label: "Active Students" },
  { number: "2.5K+", label: "Schools & Teachers" },
  { number: "500K+", label: "Exams Created" },
  { number: "4.9★", label: "Average Rating" },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Trusted by Teachers & Schools</h2>
          <p className="mt-3 text-sm text-white/40">Real stories from educators who are transforming their classrooms with EduNex</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-xs text-white/50 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-sm hover:border-cyan-500/30 transition-colors"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm text-white/70 mb-4 leading-relaxed">"{testimonial.content}"</p>

              {/* Author */}
              <div className="flex items-start gap-3">
                <div className="text-3xl">{testimonial.image}</div>
                <div>
                  <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                  <div className="text-xs text-white/50">{testimonial.role}</div>
                  <div className="text-xs text-white/40">{testimonial.school}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
