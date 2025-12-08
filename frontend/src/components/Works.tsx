import { Mic, Play, TrendingUp } from 'lucide-react'
import React from 'react'
import { Card, CardContent } from './ui/card'

const Works = () => {
  return (
    <div>
      <section id="works" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Three Simple Steps to Perfect Pronunciation</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your simple path to fluency starts here
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Play className="w-8 h-8" />,
                title: "Listen",
                subtitle: "Absorb the Rhythm",
                description: "Start by listening to crystal-clear audio from native speakers. Our library is full of common phrases and real-world conversations, allowing you to internalize the correct accent, intonation, and flow before you even speak."
              },
              {
                icon: <Mic className="w-8 h-8" />,
                title: "Record", 
                subtitle: "Find Your Voice",
                description: "When you're ready, simply press the record button and speak. There's no pressure and no judgment. Our advanced AI is designed to be a patient and supportive listener, capturing your unique voice for analysis."
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Improve",
                subtitle: "See Your Progress", 
                description: "This is where the magic happens. Receive an instant, easy-to-understand score on your accuracy and fluency. SpeakWise breaks down your performance, highlighting exactly what to work on so every practice session is incredibly effective."
              }
            ].map((step, index) => (
              <Card key={index} className="text-center p-8 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-white mx-auto">
                    {step.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
                    <p className="text-primary font-medium">{step.subtitle}</p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Works