"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  span?: "default" | "wide" | "tall";
}

interface FeatureSectionProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  className?: string;
}

const spanClasses = {
  default: "col-span-1 row-span-1",
  wide: "col-span-1 md:col-span-2 row-span-1",
  tall: "col-span-1 row-span-1 md:row-span-2",
};

// NOTE: adapted from the shadcn "feature-section" bento component to Admio's
// dark theme (this project uses custom Tailwind tokens, not shadcn semantic
// tokens like bg-card / text-foreground).
export function Component({
  title = "Everything you need",
  subtitle = "Powerful features to help you build, ship, and scale — without the complexity.",
  features,
  className,
}: FeatureSectionProps) {
  return (
    <section className={cn("w-full max-w-5xl mx-auto px-4 py-20", className)}>
      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-white mb-3">
          {title}
        </h2>
        <p className="text-white/60 text-base md:text-lg max-w-lg mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          const span = feature.span || "default";

          return (
            <motion.div
              key={feature.title}
              className={cn(
                "group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06] overflow-hidden",
                spanClasses[span],
                span === "tall" && "min-h-[280px]"
              )}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.07,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center size-10 rounded-lg bg-purple/10 border border-purple/20">
                  <Icon className="size-5 text-purple" />
                </div>

                <h3 className="text-base font-semibold text-white mb-2 tracking-tight">
                  {feature.title}
                </h3>

                <p className="text-sm text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom accent line on hover */}
              <div className="relative z-10 mt-4">
                <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-accent to-purple transition-all duration-500" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
