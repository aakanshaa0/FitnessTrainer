"use client";

import TerminalOverlay from "@/components/TerminalOverlay";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Flame, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { vapi } from "@/lib/vapi";

type WeeklySchedule = {
  day: string;
  focus: string;
  duration: string;
};

type MealExample = {
  meal: string;
  example: string;
};

type Macros = {
  protein: string;
  carbs: string;
  fats: string;
};

type WorkoutPlan = {
  title: string;
  weekly_schedule: WeeklySchedule[];
  description: string;
};

type DietPlan = {
  title: string;
  daily_calories: string;
  macros: Macros;
  meal_examples: MealExample[];
  description: string;
};

type UserProgram = {
  id: number;
  first_name: string;
  profilePic: string;
  fitness_goal: string;
  height: string;
  weight: string;
  age: number;
  workout_days: number;
  injuries: string;
  fitness_level: string;
  equipment_access: string;
  dietary_restrictions: string;
  workout_plan: WorkoutPlan;
  diet_plan: DietPlan;
};

const sarahProgram: UserProgram = {
  id: 1,
  first_name: "Sarah",
  profilePic: "https://randomuser.me/api/portraits/men/74.jpg",
  fitness_goal: "Weight Loss",
  height: "5'6\"",
  weight: "165 lbs",
  age: 34,
  workout_days: 4,
  injuries: "Lower back pain",
  fitness_level: "Beginner",
  equipment_access: "Home gym",
  dietary_restrictions: "Lactose intolerant",
  workout_plan: {
    title: "Beginner Weight Loss Program",
    weekly_schedule: [
      { day: "Monday", focus: "Full Body Cardio", duration: "30 min" },
      { day: "Wednesday", focus: "Core & Lower Body", duration: "30 min" },
      { day: "Friday", focus: "HIIT Training", duration: "25 min" },
      { day: "Saturday", focus: "Active Recovery", duration: "40 min" },
    ],
    description: "This program focuses on building a consistent exercise habit with joint-friendly movements that protect your lower back. The mix of cardio and strength training supports weight loss while preserving muscle mass.",
  },
  diet_plan: {
    title: "Balanced Nutrition Plan (Lactose-Free)",
    daily_calories: "1,600 calories",
    macros: { protein: "30%", carbs: "40%", fats: "30%" },
    meal_examples: [
      { meal: "Breakfast", example: "Oatmeal with almond milk, berries, and chia seeds" },
      { meal: "Lunch", example: "Grilled chicken salad with olive oil dressing" },
      { meal: "Dinner", example: "Baked salmon with quinoa and roasted vegetables" },
      { meal: "Snacks", example: "Apple with almond butter, dairy-free yogurt with nuts" },
    ],
    description: "This meal plan avoids dairy products while providing balanced nutrition to support weight loss goals. Focus is on whole foods with adequate protein to preserve muscle during weight loss.",
  },
};

const michaelProgram: UserProgram = {
  id: 2,
  first_name: "Michael",
  profilePic: "https://randomuser.me/api/portraits/men/75.jpg",
  fitness_goal: "Muscle Gain",
  height: "5'10\"",
  weight: "170 lbs",
  age: 28,
  workout_days: 5,
  injuries: "None",
  fitness_level: "Intermediate",
  equipment_access: "Full gym",
  dietary_restrictions: "None",
  workout_plan: {
    title: "Hypertrophy-Focused Muscle Building",
    weekly_schedule: [
      { day: "Monday", focus: "Chest & Triceps", duration: "45 min" },
      { day: "Tuesday", focus: "Back & Biceps", duration: "45 min" },
      { day: "Wednesday", focus: "Recovery/Cardio", duration: "30 min" },
      { day: "Thursday", focus: "Shoulders & Abs", duration: "45 min" },
      { day: "Friday", focus: "Legs", duration: "50 min" },
    ],
    description: "This program implements a traditional body-part split with emphasis on progressive overload. Each muscle group is trained with moderate volume and adequate recovery to maximize muscle growth.",
  },
  diet_plan: {
    title: "Muscle Building Nutrition Plan",
    daily_calories: "2,800 calories",
    macros: { protein: "30%", carbs: "50%", fats: "20%" },
    meal_examples: [
      { meal: "Breakfast", example: "Protein oatmeal with banana and whey protein" },
      { meal: "Lunch", example: "Chicken, rice, and vegetables with olive oil" },
      { meal: "Dinner", example: "Steak with sweet potato and green vegetables" },
      { meal: "Snacks", example: "Protein shake with fruit, Greek yogurt with honey" },
    ],
    description: "This high-protein, calorie-surplus diet supports muscle growth while minimizing fat gain. Carbohydrates are timed around workouts for optimal performance and recovery.",
  },
};

const elenaProgram: UserProgram = {
  id: 3,
  first_name: "Elena",
  profilePic: "https://randomuser.me/api/portraits/men/76.jpg",
  fitness_goal: "General Fitness",
  height: "5'4\"",
  weight: "130 lbs",
  age: 45,
  workout_days: 3,
  injuries: "Knee pain",
  fitness_level: "Intermediate",
  equipment_access: "Bodyweight only",
  dietary_restrictions: "Vegetarian",
  workout_plan: {
    title: "Functional Fitness Program",
    weekly_schedule: [
      { day: "Monday", focus: "Bodyweight Strength", duration: "40 min" },
      { day: "Wednesday", focus: "Mobility & Balance", duration: "35 min" },
      { day: "Saturday", focus: "Cardio & Core", duration: "40 min" },
    ],
    description: "This program focuses on functional movement patterns that improve everyday performance while being gentle on the knees. Emphasis is on core strength, mobility, and cardiovascular health.",
  },
  diet_plan: {
    title: "Balanced Vegetarian Nutrition",
    daily_calories: "1,800 calories",
    macros: { protein: "25%", carbs: "50%", fats: "25%" },
    meal_examples: [
      { meal: "Breakfast", example: "Tofu scramble with vegetables and whole grain toast" },
      { meal: "Lunch", example: "Lentil soup with mixed green salad" },
      { meal: "Dinner", example: "Chickpea curry with brown rice and vegetables" },
      { meal: "Snacks", example: "Mixed nuts, hummus with vegetables, protein smoothie" },
    ],
    description: "This vegetarian meal plan ensures adequate protein intake from plant sources. It focuses on whole foods and supports your active lifestyle while accommodating knee issues with anti-inflammatory food choices.",
  },
};

const USER_PROGRAMS = [sarahProgram, michaelProgram, elenaProgram];

const HomePage = () => {
  const { user } = useUser();
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [messages, setMessages] = useState([]);

  //Voice call handler
  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
    } else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '');
        setCallActive(true);
      } catch (error) {
        console.error('Error starting call:', error);
      } finally {
        setConnecting(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden">
      <section className="relative z-10 pt-28 pb-16 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            <div className="absolute -top-10 left-0 w-40 h-40 border-l-2 border-t-2" />

            {/*Hero Left*/}
            <div className="lg:col-span-7 space-y-8 relative">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <div className="leading-tight text-foreground">
                  Your Personal
                </div>
                <div className="leading-tight text-primary">
                  AI Fitness
                </div>
                <div className="leading-tight text-foreground">
                  Training Coach
                </div>
              </h1>

              <div className="h-px w-full bg-gradient-to-r from-primary via-secondary to-primary opacity-50"></div>

              <p className="text-xl text-muted-foreground w-2/3">
                Experience a new era of fitness with AI-customized workouts and nutrition plans that adapt to your goals, lifestyle, and progress in real-time.
              </p>

              {/*Stats*/}
              <div className="flex items-center gap-10 py-6 font-mono">
                <div className="flex flex-col">
                  <div className="text-2xl text-primary">10K+</div>
                  <div className="text-xs uppercase tracking-wider">TRANSFORMATIONS</div>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div className="flex flex-col">
                  <div className="text-2xl text-primary">94%</div>
                  <div className="text-xs uppercase tracking-wider">SUCCESS RATE</div>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div className="flex flex-col">
                  <div className="text-2xl text-primary">24/7</div>
                  <div className="text-xs uppercase tracking-wider">AI COACHING</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  size="lg"
                  asChild
                  className="overflow-hidden bg-primary text-primary-foreground px-8 py-6 text-lg font-medium"
                >
                  <Link href={"/generate-program"} className="flex items-center font-mono">
                    Build Your Program
                    <ArrowRightIcon className="ml-2 size-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/*Hero Right*/}
            <div className="lg:col-span-5 relative">
              {/*Corner*/}
              <div className="absolute -inset-4 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-border" />
                <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-border" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-border" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-border" />
              </div>

              {/*Image*/}
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="relative overflow-hidden rounded-lg bg-cyber-black">
                  <img
                    src="/hero-ai3.webp"
                    alt="AI Fitness Coach"
                    className="size-full object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,transparent_calc(50%-1px),var(--cyber-glow-primary)_50%,transparent_calc(50%+1px),transparent_100%)] bg-[length:100%_8px] animate-scanline pointer-events-none" />

                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border border-primary/40 rounded-full" />

                    <div className="absolute top-1/2 left-0 w-1/4 h-px bg-primary/50" />
                    <div className="absolute top-1/2 right-0 w-1/4 h-px bg-primary/50" />
                    <div className="absolute top-0 left-1/2 h-1/4 w-px bg-primary/50" />
                    <div className="absolute bottom-0 left-1/2 h-1/4 w-px bg-primary/50" />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>

                <TerminalOverlay />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*How It Works Section*/}
      <section className="py-20 bg-cyber-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-border rounded-lg">
              <div className="text-2xl font-mono text-primary mb-4">01</div>
              <h3 className="text-xl font-semibold mb-3">Share Your Goals</h3>
              <p className="text-muted-foreground">Tell us about your fitness aspirations, lifestyle, and any specific requirements.</p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <div className="text-2xl font-mono text-primary mb-4">02</div>
              <h3 className="text-xl font-semibold mb-3">Get Your AI Plan</h3>
              <p className="text-muted-foreground">Our AI crafts a personalized fitness and nutrition plan tailored just for you.</p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <div className="text-2xl font-mono text-primary mb-4">03</div>
              <h3 className="text-xl font-semibold mb-3">Transform</h3>
              <p className="text-muted-foreground">Follow your custom plan, track progress, and see real results with our guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/*Success Stories*/}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.05)_0%,rgba(0,0,0,0)_70%)]"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real People, Real Results</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Join thousands who've transformed their lives with our AI-powered fitness programs</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="group relative p-6 bg-cyber-black/50 border border-border/50 rounded-2xl hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                    <img
                      src="/review-girl.jpeg"
                      alt="Sarah's transformation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Sarah K.</span>
                    <span className="text-xs text-muted-foreground">• 34 y/o</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span>Weight Loss</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                    <span>3 months</span>
                  </div>
                  <p className="text-foreground italic mb-4">"The AI trainer understood my busy schedule and created workouts I can do anywhere. Lost 20lbs in 3 months!"</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>15K+ kcal burned</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-transparent to-transparent"></div>
              </div>
            </div>

            <div className="group relative p-6 bg-cyber-black/50 border border-border/50 rounded-2xl hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                    <img
                      src="/review-guy.jpeg"
                      alt="Michael's transformation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Michael T.</span>
                    <span className="text-xs text-muted-foreground">• 28 y/o</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span>Muscle Gain</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                    <span>6 months</span>
                  </div>
                  <p className="text-foreground italic mb-4">"Never thought I'd enjoy working out until I got my personalized plan. The AI adapts as I progress!"</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <span>+12lbs muscle</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" className="px-8 py-6 text-base">
              View More Success Stories
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/*Programs Display Section*/}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Fitness Programs</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our AI-powered fitness programs tailored to different goals and fitness levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[sarahProgram, michaelProgram, elenaProgram].map((program) => (
              <div key={program.id} className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={program.profilePic} 
                      alt={program.first_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/50"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{program.first_name}'s Plan</h3>
                      <p className="text-primary">{program.fitness_goal}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Workout Plan</h4>
                      <p className="text-sm text-muted-foreground">{program.workout_plan.title}</p>
                      <div className="mt-2 space-y-1">
                        {program.workout_plan.weekly_schedule.map((day, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{day.day}</span>
                            <span className="text-primary">{day.focus}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Nutrition Plan</h4>
                      <p className="text-sm text-muted-foreground">{program.diet_plan.title}</p>
                      <p className="text-xs text-primary mt-1">{program.diet_plan.daily_calories}</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6"
                    asChild
                  >
                    <Link href="/generate-program">
                      Start This Program
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;