"use client"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, animate } from "framer-motion"
import Link from "next/link"
import {
  Check,
  Zap,
  Crown,
  Star,
  ArrowRight,
  Sparkles,
  Brain,
  Globe,
  Target,
  Trophy,
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  Mail,
  Quote,
  ArrowLeft
} from "lucide-react"
import dynamic from "next/dynamic"

const StarField = dynamic(() => import("@/components/landing/StarField"), { ssr: false })

const COLORS_TOP = ["#8B5CF6", "#A855F7", "#C084FC", "#E9D5FF"]

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ")

interface Feature {
  step: string
  title?: string
  content: string
  image: string
}

interface PricingTier {
  name: string
  subtitle: string
  price: { monthly: number; yearly: number }
  description: string
  icon: typeof Zap
  gradient: string
  borderGradient: string
  features: string[]
  highlight: boolean
  badge: string | null
}

interface Testimonial {
  name: string
  school: string
  quote: string
  avatar: string
  rating: number
  results: string[]
}

interface FAQ {
  question: string
  answer: string
}

const HeroSection = () => {
  const color = useMotionValue(COLORS_TOP[0])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    const element = document.querySelector(target)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    })
  }, [color])

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #080E1A 50%, ${color})`
  const border = useMotionTemplate`1px solid ${color}`
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`

  return (
    <motion.section style={{ backgroundImage }} className="relative min-h-screen overflow-hidden text-white">
      <nav className="relative z-20 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00B4D8] to-[#8B5CF6] rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-heading font-bold">Admio</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" onClick={(e) => smoothScroll(e, "#features")} className="hover:text-[#00B4D8] transition-colors cursor-pointer">Features</a>
          <a href="#pricing" onClick={(e) => smoothScroll(e, "#pricing")} className="hover:text-[#00B4D8] transition-colors cursor-pointer">Pricing</a>
          <a href="#faq" onClick={(e) => smoothScroll(e, "#faq")} className="hover:text-[#00B4D8] transition-colors cursor-pointer">FAQ</a>
          <Link href="/auth?mode=signin" className="text-white/80 hover:text-white transition-colors">Sign In</Link>
        </div>
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {mobileMenuOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-20 left-0 right-0 bg-[#080E1A]/95 backdrop-blur-lg z-20 p-6 md:hidden">
          <div className="flex flex-col space-y-4">
            <a href="#features" onClick={(e) => smoothScroll(e, "#features")} className="hover:text-[#00B4D8] transition-colors">Features</a>
            <a href="#pricing" onClick={(e) => smoothScroll(e, "#pricing")} className="hover:text-[#00B4D8] transition-colors">Pricing</a>
            <a href="#faq" onClick={(e) => smoothScroll(e, "#faq")} className="hover:text-[#00B4D8] transition-colors">FAQ</a>
            <Link href="/auth?mode=signin" className="hover:text-[#00B4D8] transition-colors">Sign In</Link>
          </div>
        </motion.div>
      )}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 leading-tight">
          Get Into Your
          <br />
          <span className="bg-gradient-to-r from-[#00B4D8] via-[#8B5CF6] to-[#FFD700] bg-clip-text text-transparent">
            Dream College
          </span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-xl md:text-2xl text-white/70 max-w-3xl mb-12">
          AI-powered college admissions planning with personalized roadmaps, scholarship matching, and gamified progress tracking
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
          <Link href="/auth">
            <motion.button style={{ border, boxShadow }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-2xl">
              Get Started Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} className="mt-8 flex items-center gap-6 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00B4D8]" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00B4D8]" />
            <span>Free forever plan</span>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-0 z-0">
        <StarField />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#00B4D8]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
    </motion.section>
  )
}

const HowItWorks = () => {
  const features: Feature[] = [
    { step: "Step 1", title: "Enter Your Profile", content: "Tell us about your grades, interests, and dream schools. Our AI analyzes your unique profile.", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80" },
    { step: "Step 2", title: "Get Your Personalized Roadmap", content: "Receive a detailed week-by-week plan with extracurriculars, competitions, and projects tailored to your goals.", image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80" },
    { step: "Step 3", title: "Get Into Your Dream School", content: "Follow your roadmap, track your progress with XP and streaks, and watch your college applications shine.", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" },
  ]
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / 30)
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length)
        setProgress(0)
      }
    }, 100)
    return () => clearInterval(timer)
  }, [progress, features.length])
  return (
    <div className="bg-[#080E1A] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-white/60">Three simple steps to college success</p>
        </motion.div>
        <div className="flex flex-col md:grid md:grid-cols-2 gap-10">
          <div className="order-2 md:order-1 space-y-8">
            {features.map((feature, index) => (
              <motion.div key={index} className="flex items-center gap-6" initial={{ opacity: 0.3 }} animate={{ opacity: index === currentFeature ? 1 : 0.3 }} transition={{ duration: 0.5 }}>
                <motion.div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2 flex-shrink-0", index === currentFeature ? "bg-[#00B4D8] border-[#00B4D8] text-white scale-110" : "bg-[#8B5CF6]/20 border-[#8B5CF6]")}>
                  {index <= currentFeature ? <Check className="w-6 h-6" /> : <span className="text-lg font-semibold">{index + 1}</span>}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2">{feature.title || feature.step}</h3>
                  <p className="text-lg text-white/60">{feature.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="order-1 md:order-2 relative h-[300px] md:h-[400px] overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              {features.map((feature, index) => index === currentFeature && (
                <motion.div key={index} className="absolute inset-0 rounded-2xl overflow-hidden" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} transition={{ duration: 0.5 }}>
                  <img src={feature.image} alt={feature.step} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080E1A] via-[#080E1A]/50 to-transparent" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

const KeyFeatures = () => {
  const features = [
    { icon: Brain, title: "AI Extracurricular Planner", description: "Get personalized recommendations for competitions, projects, and activities that match your target school and major.", gradient: "from-[#00B4D8]/20 to-[#0096C7]/20" },
    { icon: MessageSquare, title: "AI College Counselor", description: "24/7 access to personalized college advice. Ask anything about applications, essays, or admissions strategy.", gradient: "from-[#8B5CF6]/20 to-[#7C3AED]/20" },
    { icon: Target, title: "Smart College Finder", description: "Discover your perfect fit with AI-generated lists of Reach, Target, and Safety schools based on your profile.", gradient: "from-[#FFD700]/20 to-[#FFA500]/20" },
    { icon: Trophy, title: "Gamified Progress", description: "Level up from Explorer to Trailblazer with XP points, daily streaks, and progress tracking that keeps you motivated.", gradient: "from-[#FF8C42]/20 to-[#FF6B35]/20" },
  ]
  return (
    <section id="features" className="bg-gradient-to-b from-[#080E1A] to-[#0A1628] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">Powerful AI tools designed specifically for high school students aiming for top colleges</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.05, y: -5 }} className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-white/10 backdrop-blur-sm`}>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#8B5CF6] flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-white/70 text-lg">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const PricingSection = () => {
  const plans: PricingTier[] = [
    { name: "Free", subtitle: "Get started", price: { monthly: 0, yearly: 0 }, description: "Perfect for exploring your college options", icon: Zap, gradient: "from-[#00B4D8]/20 to-[#0096C7]/20", borderGradient: "from-[#00B4D8] to-[#0096C7]", features: ["AI college finder", "Basic scholarship search", "Progress tracking with XP", "Daily streaks", "5 AI counselor messages/month", "Community access"], highlight: false, badge: null },
    { name: "Pro", subtitle: "Most popular", price: { monthly: 10, yearly: 100 }, description: "Everything you need to get into your dream school", icon: Crown, gradient: "from-[#8B5CF6]/20 to-[#7C3AED]/20", borderGradient: "from-[#8B5CF6] to-[#7C3AED]", features: ["Everything in Free", "Detailed week-by-week roadmap", "Unlimited AI counselor messages", "Real competition names & deadlines", "Custom project ideas", "Essay review & feedback", "Priority support", "Advanced analytics"], highlight: true, badge: "Most Popular" },
  ]
  return (
    <section id="pricing" className="bg-[#080E1A] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-white/60">Start free, upgrade when you&apos;re ready</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.05, y: -10 }} className="relative flex flex-col">
              <div className={`relative flex flex-col flex-1 p-8 rounded-3xl border backdrop-blur-xl ${plan.highlight ? "bg-gradient-to-br from-white/[0.12] to-white/[0.04] border-[#8B5CF6]/50" : "bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/[0.15]"}`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white">{plan.badge}</div>
                )}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} border border-white/20 flex items-center justify-center mb-6`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/60 mb-6">{plan.description}</p>
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">${plan.price.monthly}</span>
                    <span className="text-white/60">/month</span>
                  </div>
                </div>
                <div className="mb-8 space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#00B4D8]/20 border border-[#00B4D8]/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#00B4D8]" />
                      </div>
                      <span className="text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${plan.highlight ? "bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white" : "bg-white/10 border border-white/20 text-white hover:bg-white/20"}`}>
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const ProofSection = () => {
  const stats = [
    { number: "10,000+", label: "Students Helped" },
    { number: "95%", label: "Acceptance Rate" },
    { number: "500+", label: "Top Schools" },
    { number: "$2M+", label: "Scholarships Won" },
  ]
  return (
    <section className="bg-gradient-to-b from-[#0A1628] to-[#080E1A] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Built for Students Aiming for Top Schools</h2>
          <p className="text-xl text-white/60">Join thousands of students already on their path to success</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
              <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#00B4D8] to-[#8B5CF6] bg-clip-text text-transparent mb-2">{stat.number}</div>
              <div className="text-white/60 text-lg">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    { name: "Sarah Chen", school: "Stanford University '27", quote: "Admio helped me discover competitions I never knew existed. I went from having no extracurriculars to winning a national science fair!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", rating: 5, results: ["National Science Fair Winner", "Top 10% GPA", "5 AP Classes"] },
    { name: "Marcus Johnson", school: "MIT '28", quote: "The gamification kept me motivated every single day. Watching my XP grow and maintaining my streak made college prep actually fun.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", rating: 5, results: ["365-Day Streak", "Level 50 Achieved", "10+ Competitions"] },
    { name: "Priya Patel", school: "Harvard '27", quote: "As an international student without access to counselors, Admio was a game-changer. The AI counselor answered all my questions at 2am!", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", rating: 5, results: ["International Student", "$50K Scholarship", "Perfect SAT Score"] },
  ]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const timer = setInterval(() => { setDirection(1); setCurrentIndex((prev) => (prev + 1) % testimonials.length) }, 6000)
    return () => clearInterval(timer)
  }, [testimonials.length])
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0, scale: 0.8, rotateY: dir > 0 ? 45 : -45 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1, rotateY: 0 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 1000 : -1000, opacity: 0, scale: 0.8, rotateY: dir < 0 ? 45 : -45 }),
  }
  const nextTestimonial = () => { setDirection(1); setCurrentIndex((prev) => (prev + 1) % testimonials.length) }
  const prevTestimonial = () => { setDirection(-1); setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length) }
  return (
    <section id="testimonials" className="relative py-32 bg-gradient-to-br from-[#080E1A] via-[#0A1628] to-[#080E1A] text-white overflow-hidden">
      <div className="absolute inset-0">
        <motion.div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/[0.08] via-[#00B4D8]/[0.05] to-[#FF8C42]/[0.08]" animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ backgroundSize: "400% 400%" }} />
        <motion.div className="absolute top-1/3 left-[20%] w-72 h-72 bg-[#8B5CF6]/15 rounded-full blur-3xl" animate={{ x: [0, 150, 0], y: [0, 80, 0], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-1/3 right-[20%] w-80 h-80 bg-[#00B4D8]/15 rounded-full blur-3xl" animate={{ x: [0, -100, 0], y: [0, -60, 0], scale: [1, 1.3, 1] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
        {[...Array(12)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 bg-white/30 rounded-full" style={{ left: `${15 + i * 7}%`, top: `${25 + i * 5}%` }} animate={{ y: [0, -50, 0], opacity: [0.2, 1, 0.2], scale: [1, 2, 1] }} transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }} />
        ))}
      </div>
      <motion.div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <motion.div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.15] backdrop-blur-sm mb-6" whileHover={{ scale: 1.05, borderColor: "rgba(255, 255, 255, 0.3)" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}><Sparkles className="h-4 w-4 text-[#FFD700]" /></motion.div>
            <span className="text-sm font-medium text-white/80">Student Success Stories</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-heading font-bold mb-8 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Real Students,</span>
            <br />
            <motion.span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00B4D8] via-[#8B5CF6] to-[#FFD700]" animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ backgroundSize: "200% 200%" }}>
              Real Results
            </motion.span>
          </h2>
          <p className="text-xl sm:text-2xl text-white/60 max-w-4xl mx-auto leading-relaxed">Join thousands of students already using Admio to get into their dream schools</p>
        </motion.div>
        <div className="relative max-w-6xl mx-auto mb-16">
          <div className="relative h-[500px] md:h-[400px]" style={{ perspective: "1000px" }}>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div key={currentIndex} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.4 }, scale: { duration: 0.4 }, rotateY: { duration: 0.6 } }} className="absolute inset-0">
                <div className="relative h-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.15] p-8 md:p-12 overflow-hidden group">
                  <motion.div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/[0.08] via-[#00B4D8]/[0.05] to-[#FF8C42]/[0.08] rounded-3xl" animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ backgroundSize: "300% 300%" }} />
                  <motion.div className="absolute top-8 right-8 opacity-20" animate={{ rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}><Quote className="w-16 h-16 text-white" /></motion.div>
                  <div className="relative z-10 h-full flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0 text-center md:text-left">
                      <motion.div className="relative mb-6" whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                        <div className="w-24 h-24 mx-auto md:mx-0 rounded-full overflow-hidden border-4 border-white/20 relative">
                          <img src={testimonials[currentIndex].avatar} alt={testimonials[currentIndex].name} className="w-full h-full object-cover" />
                        </div>
                        <motion.div className="absolute inset-0 border-2 border-[#8B5CF6]/30 rounded-full" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">{testimonials[currentIndex].name}</h3>
                      <p className="text-[#00B4D8] mb-1 font-medium">{testimonials[currentIndex].school}</p>
                      <div className="flex justify-center md:justify-start gap-1 mb-6 mt-4">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, duration: 0.3 }}><Star className="w-5 h-5 fill-yellow-400 text-yellow-400" /></motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <motion.blockquote className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 font-light italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
                        &ldquo;{testimonials[currentIndex].quote}&rdquo;
                      </motion.blockquote>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {testimonials[currentIndex].results.map((result, i) => (
                          <motion.div key={i} className="bg-white/[0.05] rounded-lg p-3 border border-white/[0.1] backdrop-blur-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }} whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                            <span className="text-sm text-white/70 font-medium">{result}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center items-center gap-6 mt-8">
            <motion.button onClick={prevTestimonial} className="p-3 rounded-full bg-white/[0.08] border border-white/[0.15] backdrop-blur-sm text-white hover:bg-white/[0.15] transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}><ArrowLeft className="w-5 h-5" /></motion.button>
            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <motion.button key={index} onClick={() => { setDirection(index > currentIndex ? 1 : -1); setCurrentIndex(index) }} className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-[#00B4D8] scale-125" : "bg-white/30 hover:bg-white/50"}`} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} />
              ))}
            </div>
            <motion.button onClick={nextTestimonial} className="p-3 rounded-full bg-white/[0.08] border border-white/[0.15] backdrop-blur-sm text-white hover:bg-white/[0.15] transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}><ArrowRight className="w-5 h-5" /></motion.button>
          </div>
        </div>
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          {[{ number: "10,000+", label: "Students Helped" }, { number: "95%", label: "Acceptance Rate" }, { number: "500+", label: "Top Schools" }, { number: "$2M+", label: "Scholarships Won" }].map((stat, index) => (
            <motion.div key={index} className="text-center group" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.05 }}>
              <motion.div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#00B4D8] to-[#8B5CF6] bg-clip-text text-transparent mb-2" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}>{stat.number}</motion.div>
              <div className="text-white/60 text-sm font-medium group-hover:text-white/80 transition-colors">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqs: FAQ[] = [
    { question: "Is Admio really free?", answer: "Yes! Our free tier includes AI college finder, basic scholarship search, progress tracking, and 5 AI counselor messages per month. Upgrade to Pro for unlimited access and detailed roadmaps." },
    { question: "How does the AI extracurricular planner work?", answer: "Our AI analyzes your profile, target schools, and intended major to recommend specific competitions, projects, and activities. Pro users get detailed timelines with real competition names and deadlines." },
    { question: "Can I use Admio if I'm an international student?", answer: "Absolutely! Admio is designed for students worldwide. Our AI counselor understands international admissions and can help with country-specific questions." },
    { question: "What makes Admio different from other college prep tools?", answer: "Admio combines AI-powered personalization with gamification to make college prep engaging and effective. Plus, at $10/month, it's accessible to students who can't afford expensive private counselors." },
    { question: "How do XP points and streaks work?", answer: "Earn XP by completing activities, logging in daily, adding awards, and using the AI counselor. Keep your daily streak alive to build momentum. You level up through 6 ranks — Explorer, Builder, Challenger, Contender, Standout, and Trailblazer." },
  ]
  return (
    <section id="faq" className="bg-gradient-to-b from-[#080E1A] to-[#0A1628] py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Frequently Asked Questions</h2>
        </motion.div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.15] rounded-xl overflow-hidden backdrop-blur-sm">
              <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full p-6 text-left flex items-center justify-between hover:bg-white/[0.05] transition-colors">
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                <ChevronDown className={cn("w-5 h-5 text-white/60 transition-transform", openIndex === index && "rotate-180")} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="px-6 pt-4 pb-6 text-white/70 border-t border-white/[0.08]">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const ContactSection = () => (
  <section id="contact" className="bg-[#080E1A] py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Ready to Start Your Journey?</h2>
        <p className="text-xl text-white/60 mb-8">Join thousands of students already using Admio to get into their dream schools</p>
        <Link href="/auth">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white font-semibold px-8 py-4 rounded-full text-lg inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <a href="mailto:admio.gen1@gmail.com" target="_blank" rel="noopener noreferrer" className="block group">
            <div className="w-12 h-12 rounded-full bg-[#00B4D8]/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#00B4D8]/30 transition-colors"><Mail className="w-6 h-6 text-[#00B4D8]" /></div>
            <h3 className="text-white font-semibold mb-2">Email Us</h3>
            <p className="text-white/60 group-hover:text-[#00B4D8] transition-colors">admio.gen1@gmail.com</p>
          </a>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mx-auto mb-4"><MessageSquare className="w-6 h-6 text-[#8B5CF6]" /></div>
          <h3 className="text-white font-semibold mb-2">Discord</h3>
          <p className="text-white/40 text-sm">Coming soon</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center mx-auto mb-4"><Zap className="w-6 h-6 text-[#FFD700]" /></div>
          <h3 className="text-white font-semibold mb-2">Fast Support</h3>
          <p className="text-white/60">We respond within 24 hours</p>
        </motion.div>
      </div>
    </div>
  </section>
)

const Footer = () => (
  <footer className="bg-[#0A1628] border-t border-white/10 py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00B4D8] to-[#8B5CF6] rounded-lg flex items-center justify-center"><Target className="w-6 h-6 text-white" /></div>
            <span className="text-xl font-heading font-bold text-white">Admio</span>
          </div>
          <p className="text-white/60 text-sm">Your roadmap to the school of your dreams</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="#features" className="hover:text-[#00B4D8] transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-[#00B4D8] transition-colors">Pricing</a></li>
            <li><a href="#faq" className="hover:text-[#00B4D8] transition-colors">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Connect</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="https://tristanpark.dev" target="_blank" rel="noopener noreferrer" className="hover:text-[#00B4D8] transition-colors">Built by Tristan</a></li>
            <li><a href="#contact" className="hover:text-[#00B4D8] transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="#" className="hover:text-[#00B4D8] transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[#00B4D8] transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-[#00B4D8] transition-colors">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-white/60 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Admio. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="https://instagram.com/admio.io" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#00B4D8] transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></a>
          <a href="https://tiktok.com/@admio.io" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#00B4D8] transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17v-3.45a4.85 4.85 0 01-3.77-1.46V6.69h3.77z" /></svg></a>
          <a href="https://youtube.com/@admio" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#00B4D8] transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></a>
        </div>
      </div>
    </div>
  </footer>
)

export default function AdmioLandingPage() {
  return (
    <div className="w-full bg-[#080E1A]">
      <HeroSection />
      <HowItWorks />
      <KeyFeatures />
      <CapabilitiesBanner />
      {/* Hidden until we have real users / testimonials */}
      {/* <ProofSection /> */}
      <PricingSection />
      {/* <TestimonialsSection /> */}
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

const CapabilitiesBanner = () => {
  const stats = [
    { number: "500+", label: "Colleges in our database" },
    { number: "1,200+", label: "Extracurriculars analyzed" },
    { number: "24/7", label: "AI college counselor" },
    { number: "$50M+", label: "In scholarships matched" },
  ]
  return (
    <section className="bg-gradient-to-b from-[#0A1628] to-[#080E1A] py-20 px-6 border-y border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 backdrop-blur-sm mb-4">
            <Sparkles className="h-4 w-4 text-[#FFD700]" />
            <span className="text-sm font-medium text-white/80">Built to help students get into top colleges</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white">
            Everything you need, in one place
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="text-center"
            >
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#00B4D8] to-[#8B5CF6] bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-white/60 text-sm md:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
