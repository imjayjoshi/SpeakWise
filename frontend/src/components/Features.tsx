import { Award, BarChart3, Gamepad2 } from 'lucide-react'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

const Features = () => {
  return (
    <div>
        {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">More Than Just a Tool, It's a Coach</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your all-in-one pronunciation toolkit
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Award className="w-8 h-8 text-action" />,
                title: "Instant, Intelligent Analysis",
                description: "Our cutting-edge AI doesn't just say \"right\" or \"wrong.\" It provides a detailed score and visual feedback on your pronunciation, helping you understand precisely how to adjust your accent to sound more natural."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-primary" />,
                title: "Celebrate Your Growth", 
                description: "Watch your confidence soar as you track your improvement over time. With beautiful, intuitive charts and statistics, you can see a clear visual representation of your hard work and dedication paying off."
              },
              {
                icon: <Gamepad2 className="w-8 h-8 text-success" />,
                title: "Make Learning Addictive",
                description: "Stay engaged and build consistent habits with our fun, motivating features. Earn badges for your accomplishments, build up daily practice streaks, and turn the challenge of learning into a rewarding game."
              }
            ].map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-soft transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Features