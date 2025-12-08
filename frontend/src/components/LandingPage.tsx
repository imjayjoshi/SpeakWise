import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mic, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-soundwave.png";
import mockupImage from "@/assets/app-mockup.png";
import { Link } from "react-router";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";
import Works from "./Works";
import Features from "./Features";

const LandingPage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    const scroll = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      multiplier: 1,
      class: "is-reveal",
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  // Handle scrolling to section when page loads with hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Wait for page to render, then scroll
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      data-scroll-container
      className="min-h-screen bg-background"
    >
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <Badge variant="secondary" className="w-fit mx-auto lg:mx-0">
                AI-Powered Pronunciation Coach
              </Badge>

              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  Speak Any Language with{" "}
                  <span className="bg-gradient-hero bg-clip-text text-transparent">
                    Confidence
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Learning a new language is a journey, but pronunciation is
                  often the biggest hurdle. Mispronunciations can lead to
                  frustrating conversations and shattered confidence. SpeakWise
                  is your personal AI coach, designed to listen, analyze your
                  speech with incredible accuracy, and provide the clear,
                  instant feedback you need to sound like a native.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button variant="action" size="xl" className="group" asChild>
                  <Link to="/signup">
                    Start Learning Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  100% Free Forever
                </div>
              </div>
            </div>

            <div className="relative order-first lg:order-last">
              <div className="relative z-10">
                <img
                  src={heroImage}
                  alt="AI soundwave visualization transforming into success checkmark"
                  className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-action/5 rounded-2xl -z-10 transform rotate-3"></div>

              {/* Floating App Mockup */}
              <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 z-20">
                <img
                  src={mockupImage}
                  alt="SpeakWise app interface mockup"
                  className="w-24 sm:w-32 lg:w-48 drop-shadow-2xl animate-pulse"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Works />
      <Features />

      {/* Final CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6 lg:space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">
            Ready to Be Heard?
          </h2>
          <p className="text-lg sm:text-xl leading-relaxed opacity-90 max-w-2xl mx-auto">
            Your journey to confident, clear speech starts now. Join completely
            free and discover how rewarding it feels to speak a new language
            with the accent you've always dreamed of.
          </p>

          <Button
            variant="secondary"
            size="xl"
            className="bg-white text-primary hover:bg-white/90 shadow-soft"
            asChild
          >
            <Link to="/signup">
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          {/* <div className="text-white/80 text-sm">
            Join thousands of confident speakers worldwide
          </div> */}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
