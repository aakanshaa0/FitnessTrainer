import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Flame,
  HeartPulse,
  Leaf,
  Moon,
  Sun,
  Zap,
  Dumbbell,
  Apple,
  Shield,
  Calendar,
  Clock as ClockIcon,
  TrendingUp,
  Target,
  CheckCircle2
} from "lucide-react";
import { USER_PROGRAMS } from "@/constants";

// Background pattern component for better organization
const BackgroundPattern = () => (
  <div 
    className="absolute inset-0 opacity-5"
    style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2300ff88\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      backgroundSize: '60px 60px'
    }}
  />
);

const UserPrograms = () => {
  return (
    <section className="w-full py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/*Hero Section*/}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>TRANSFORMATIONS IN ACTION</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Real People, <span className="text-primary">Real Results</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            See how our AI-powered fitness programs are helping people like you achieve their goals
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            {[
              { value: '10K+', label: 'Active Members', icon: <Flame className="h-6 w-6" /> },
              { value: '94%', label: 'Success Rate', icon: <TrendingUp className="h-6 w-6" /> },
              { value: '24/7', label: 'AI Support', icon: <Moon className="h-6 w-6" /> },
              { value: '3min', label: 'Plan Creation', icon: <Zap className="h-6 w-6" /> }
            ].map((stat, index) => (
              <div key={index} className="p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border">
                <div className="text-primary mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Transformation Stories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {USER_PROGRAMS.map((program) => {
            const programType = program.fitness_goal.toLowerCase();
            let typeColor = 'bg-blue-500';
            let typeIcon = <Flame className="h-4 w-4" />;
            
            if (programType.includes('weight')) {
              typeColor = 'bg-green-500';
              typeIcon = <Leaf className="h-4 w-4" />;
            } else if (programType.includes('muscle')) {
              typeColor = 'bg-amber-500';
              typeIcon = <Dumbbell className="h-4 w-4" />;
            } else if (programType.includes('fitness')) {
              typeColor = 'bg-purple-500';
              typeIcon = <HeartPulse className="h-4 w-4" />;
            }
            
            return (
              <div 
                key={program.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              >
                {/*User info*/}
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20">
                          <img 
                            src={program.profilePic} 
                            alt={program.first_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${typeColor}`}></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {program.first_name} <span className="text-muted-foreground">{program.age}</span>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {program.workout_days} days/week • {program.fitness_level}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {typeIcon}
                      {program.fitness_goal}
                    </div>
                  </div>
                </div>
                
                {/*Program highlights*/}
                <div className="px-6 pb-6">
                  <h4 className="text-lg font-bold mb-3 text-foreground">{program.workout_plan.title}</h4>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground">Workout Style</h5>
                        <p className="text-sm text-muted-foreground">{program.equipment_access}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 mt-0.5">
                        <Apple className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground">Nutrition Plan</h5>
                        <p className="text-sm text-muted-foreground">
                          {program.diet_plan.title} • Tailored macros
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground">Key Results</h5>
                        <p className="text-sm text-muted-foreground">
                          {program.workout_plan.description.substring(0, 70)}...
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors"
                  >
                    <Link href={`/programs/${program.id}`} className="flex items-center justify-center gap-2">
                      View Full Transformation
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
                
                <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-transparent"></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
            <BackgroundPattern />
          </div>
          
          <div className="max-w-2xl mx-auto relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready for <span className="text-primary">Your Transformation</span>?
            </h3>
            
            <p className="text-lg text-muted-foreground mb-8">
              Get a personalized fitness and nutrition plan crafted by AI, tailored to your unique goals and lifestyle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium group"
              >
                <Link href="/generate-program" className="flex items-center">
                  Create My Plan Now
                  <Zap className="ml-2 h-5 w-5 group-hover:animate-pulse" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg font-medium"
              >
                <Link href="/#how-it-works" className="flex items-center">
                  How It Works
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserPrograms;