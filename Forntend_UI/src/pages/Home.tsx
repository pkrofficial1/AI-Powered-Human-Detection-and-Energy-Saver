import React, { useState, useEffect } from 'react';
import { ArrowRight, Lightbulb, Shield, BarChart3, Cpu, Zap, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AiChatBot from '../components/AiChatBot';
import AiLogo from '../components/AiLogo';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, image, delay = 0 }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {image && (
        <div className="relative h-48 rounded-t-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10" />
          <img 
            src={image} 
            alt={title} 
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
            {icon}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface TestimonialCardProps {
  text: string;
  author: string;
  role: string;
  image: string;
  delay?: number;
}

function TestimonialCard({ text, author, role, image, delay = 0 }: TestimonialCardProps) {
  return (
    <div 
      className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-lg rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-br-[64px] -z-10 transition-all duration-300 group-hover:bg-blue-500/20" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/10 rounded-tl-[64px] -z-10 transition-all duration-300 group-hover:bg-purple-500/20" />
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300">
          <img src={image} alt={author} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{author}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 italic">{text}</p>
    </div>
  );
}

interface StatProps {
  value: string;
  label: string;
  delay?: number;
}

function Stat({ value, label, delay = 0 }: StatProps) {
  return (
    <div 
      className="text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        {value}
      </div>
      <div className="mt-2 text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse animation-delay-4000"></div>
        <div className="absolute -bottom-8 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse"></div>
      </div>

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=2940" 
            alt="Smart Home Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/10 to-gray-900/30 dark:from-transparent dark:via-gray-900/40 dark:to-gray-900/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="flex justify-center mb-6 animate-bounce">
            <AiLogo />
          </div>
          <h1 className="slide-in-left text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            AI-Powered Smart Home Control
          </h1>
          <p className="slide-in-right text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the future of intelligent living with our AI-driven home automation system
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 slide-in-up">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={scrollToFeatures}
              className="px-8 py-3 text-lg font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-lg flex items-center space-x-2"
            >
              <span>Learn More</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value="10k+" label="Active Users" delay={100} />
            <Stat value="98%" label="Satisfaction Rate" delay={200} />
            <Stat value="50%" label="Energy Savings" delay={300} />
            <Stat value="24/7" label="AI Monitoring" delay={400} />
          </div>
        </div>
      </section>

      {/* Enhanced AI Features Section */}
      <section id="features" className="py-20 px-4 relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="slide-in-up text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powered by Advanced AI
            </h2>
            <p className="slide-in-up text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our AI system learns from your preferences and optimizes your home environment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="slide-in-left">
              <FeatureCard
                icon={<Cpu className="h-8 w-8 text-blue-500" />}
                title="Smart Learning"
                description="Our AI learns your preferences and daily routines to automate your home perfectly."
                image="https://media.istockphoto.com/id/1387900612/photo/automation-data-analytic-with-robot-and-digital-visualization-for-big-data-scientist.jpg?s=612x612&w=0&k=20&c=50maOJU6CpVC55mYnUqtff2aiaJZ7KlmMn4jNhWD_eo="
                delay={100}
              />
            </div>
            <div className="slide-in-up">
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-blue-500" />}
                title="Energy Optimization"
                description="AI-powered algorithms optimize energy usage while maintaining comfort."
                image="https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&q=80&w=2940"
                delay={200}
              />
            </div>
            <div className="slide-in-right">
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-blue-500" />}
                title="Predictive Security"
                description="Advanced AI monitoring detects and prevents potential security threats."
                image="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=2940"
                delay={300}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="slide-in-up text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Smart Features for a Smarter Home
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="slide-in-left">
              <FeatureCard
                icon={<Lightbulb className="h-8 w-8 text-blue-500" />}
                title="Smart Lighting"
                description="Control your home's lighting from anywhere. Set schedules and create the perfect ambiance."
                image="https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=2940"
                delay={100}
              />
            </div>
            <div className="slide-in-up">
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-blue-500" />}
                title="Security"
                description="Keep your home safe with smart locks and real-time camera monitoring."
                image="https://www.mcknightsseniorliving.com/wp-content/uploads/sites/3/2024/08/Cybersecurity_G-1599973349_1440X810-1-860x484.jpg"
                delay={200}
              />
            </div>
            <div className="slide-in-right">
              <FeatureCard
                icon={<BarChart3 className="h-8 w-8 text-blue-500" />}
                title="Energy Monitoring"
                description="Track and optimize your energy usage to save money and help the environment."
                image="https://www.shutterstock.com/shutterstock/videos/1080410918/thumb/1.jpg?ip=x480"
                delay={300}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-lg relative">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="slide-in-up text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="slide-in-left">
              <TestimonialCard
                text="The AI assistant is incredible! It learns my preferences and adjusts my home perfectly."
                author="Sarah Johnson"
                role="Home Owner"
                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=2940"
                delay={100}
              />
            </div>
            <div className="slide-in-up">
              <TestimonialCard
                text="Energy monitoring features helped me reduce my monthly bills by 30%. The AI suggestions are spot-on!"
                author="Michael Chen"
                role="Tech Enthusiast"
                image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=2940"
                delay={200}
              />
            </div>
            <div className="slide-in-right">
              <TestimonialCard
                text="The security features and AI monitoring give me peace of mind when I'm away."
                author="Emily Rodriguez"
                role="Business Owner"
                image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=2940"
                delay={300}
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Bot */}
      <AiChatBot />
    </div>
  );
}