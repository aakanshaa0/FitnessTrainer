"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

interface FitnessData {
  age?: number;
  height?: string;
  weight?: string;
  fitnessLevel?: string;
  fitnessGoal?: string;
  workoutDays?: number;
  injuries?: string;
  dietaryRestrictions?: string;
  activityLevel?: string;
}

interface Message {
  content: string;
  role: string;
}

interface WorkoutPlan {
  title: string;
  weekly_schedule: WeeklySchedule[];
  description: string;
  exercises?: Array<{
    day: string;
    routines: Array<{
      name: string;
      sets: number;
      reps: number;
      duration?: string;
      description?: string;
      exercises?: string[];
    }>;
  }>;
}

interface DietPlan {
  title: string;
  daily_calories: string;
  macros: Macros;
  meal_examples: MealExample[];
  description: string;
  meals?: Array<{
    name: string;
    foods: string[];
  }>;
}

interface GeneratedPlan {
  workoutPlan?: WorkoutPlan;
  dietPlan?: DietPlan;
}

interface VapiMessage {
  type: string;
  transcriptType: string;
  transcript: string;
  role: string;
}

interface VapiError {
  message?: string;
  code?: string;
}

const GenerateProgramPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callEnded, setCallEnded] = useState(false);
  const [fitnessData, setFitnessData] = useState<FitnessData>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  const { user } = useUser();
  const router = useRouter();

  const messageContainerRef = useRef<HTMLDivElement>(null);

  //Voice call handler
  const extractFitnessData = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    console.log("Processing transcript:", transcript);
    
    //Extract age
    if (!fitnessData.age) {
      const agePatterns = [
        /(\d+)\s*(?:years?\s*old|y\.?o\.?|age)/i,
        /age\s*(?:is\s*)?(\d+)/i,
        /(\d+)\s*(?:years?)/i
      ];
      
      for (const pattern of agePatterns) {
        const ageMatch = transcript.match(pattern);
        if (ageMatch && parseInt(ageMatch[1]) >= 10 && parseInt(ageMatch[1]) <= 100) {
          setFitnessData(prev => ({ ...prev, age: parseInt(ageMatch[1]) }));
          console.log("Age extracted:", parseInt(ageMatch[1]));
          break;
        }
      }
    }

    //Extract height
    if (!fitnessData.height) {
      //Handle feet and inches format
      const feetInchesMatch = transcript.match(/(\d+)\s*(?:foot|feet|ft|')\s*(\d+)\s*(?:inch|inches|in|")/i);
      if (feetInchesMatch) {
        const feet = feetInchesMatch[1];
        const inches = feetInchesMatch[2];
        console.log("Height parsed (feet-inches):", feet, inches);
        setFitnessData(prev => ({ ...prev, height: `${feet}'${inches}"` }));
      } 
      else {
        //Handle format like 5 4
        const shortMatch = transcript.match(/(\d+)\s+(\d+)/);
        if (shortMatch && parseInt(shortMatch[1]) <= 8 && parseInt(shortMatch[2]) <= 12) {
          //Make sure this looks like height & not other measurements
          const context = transcript.toLowerCase();
          if (context.includes('height') || context.includes('tall') || context.includes('foot') || 
              context.includes('inch') || context.includes('feet') || context.includes('cm')) {
            const feet = shortMatch[1];
            const inches = shortMatch[2];
            console.log("Height parsed (short):", feet, inches);
            setFitnessData(prev => ({ ...prev, height: `${feet}'${inches}"` }));
          }
        } else {
          //Handle other formats
          const heightMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimeters?|feet?|ft|inches?|in|'|")/i);
          if (heightMatch) {
            console.log("Height parsed (other):", heightMatch[0]);
            setFitnessData(prev => ({ ...prev, height: heightMatch[0] }));
          }
        }
      }
    }

    //Extract weight
    if (!fitnessData.weight) {
      console.log("Looking for weight in transcript:", transcript);
      
      //Handle various weight formats with more specific patterns
      const weightPatterns = [
        /(\d+(?:\.\d+)?)\s*(?:kg|kilograms?|lbs?|pounds?|lb|pound)/i,
        /weight\s*(?:is\s*)?(\d+(?:\.\d+)?)\s*(?:kg|kilograms?|lbs?|pounds?|lb|pound)/i,
        /(\d+(?:\.\d+)?)\s*(?:weight|weighs?)/i
      ];
      
      for (const pattern of weightPatterns) {
        const weightMatch = transcript.match(pattern);
        if (weightMatch) {
          const weight = weightMatch[1];
          if (parseInt(weight) >= 30 && parseInt(weight) <= 500) {
            console.log("Weight parsed:", weightMatch[0]);
            setFitnessData(prev => ({ ...prev, weight: weightMatch[0] }));
            break;
          }
        }
      }
    }

    //Extract fitness level
    if (!fitnessData.fitnessLevel) {
      if (lowerTranscript.includes("beginner") || lowerTranscript.includes("beginning")) {
        setFitnessData(prev => ({ ...prev, fitnessLevel: "beginner" }));
        console.log("Fitness level extracted: beginner");
      } else if (lowerTranscript.includes("intermediate") || lowerTranscript.includes("medium")) {
        setFitnessData(prev => ({ ...prev, fitnessLevel: "intermediate" }));
        console.log("Fitness level extracted: intermediate");
      } else if (lowerTranscript.includes("advanced") || lowerTranscript.includes("expert")) {
        setFitnessData(prev => ({ ...prev, fitnessLevel: "advanced" }));
        console.log("Fitness level extracted: advanced");
      }
    }

    //Extract fitness goal
    if (!fitnessData.fitnessGoal) {
      if (lowerTranscript.includes("weight loss") || lowerTranscript.includes("lose weight") || lowerTranscript.includes("slim down")) {
        setFitnessData(prev => ({ ...prev, fitnessGoal: "weight loss" }));
        console.log("Fitness goal extracted: weight loss");
      } 
      else if (lowerTranscript.includes("muscle gain") || lowerTranscript.includes("build muscle") || lowerTranscript.includes("get stronger")) {
        setFitnessData(prev => ({ ...prev, fitnessGoal: "muscle gain" }));
        console.log("Fitness goal extracted: muscle gain");
      } 
      else if (lowerTranscript.includes("endurance") || lowerTranscript.includes("stamina") || lowerTranscript.includes("cardio")) {
        setFitnessData(prev => ({ ...prev, fitnessGoal: "endurance" }));
        console.log("Fitness goal extracted: endurance");
      } 
      else if (lowerTranscript.includes("strength") || lowerTranscript.includes("power")) {
        setFitnessData(prev => ({ ...prev, fitnessGoal: "strength" }));
        console.log("Fitness goal extracted: strength");
      } 
      else if (lowerTranscript.includes("flexibility") || lowerTranscript.includes("mobility") || lowerTranscript.includes("stretching")) {
        setFitnessData(prev => ({ ...prev, fitnessGoal: "flexibility" }));
        console.log("Fitness goal extracted: flexibility");
      }
    }

    // Extract workout days
    if (!fitnessData.workoutDays) {
      const daysMatch = transcript.match(/(\d+)\s*(?:days?|times?|per week)/i);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        if (days >= 1 && days <= 7) {
          setFitnessData(prev => ({ ...prev, workoutDays: days }));
          console.log("Workout days extracted:", days);
        }
      }
    }

    //Extract injuries/limitations
    if (!fitnessData.injuries) {
      if (lowerTranscript.includes("none") || lowerTranscript.includes("no injuries") || 
          lowerTranscript.includes("no limitations") || lowerTranscript.includes("no conditions") ||
          lowerTranscript.includes("no pain") || lowerTranscript.includes("nothing")) {
        setFitnessData(prev => ({ ...prev, injuries: "None" }));
        console.log("Injuries extracted: None");
      } 
      else if (lowerTranscript.includes("injury") || lowerTranscript.includes("pain") || 
          lowerTranscript.includes("limitation") || lowerTranscript.includes("condition") ||
          lowerTranscript.includes("hurt") || lowerTranscript.includes("sore")) {
        setFitnessData(prev => ({ ...prev, injuries: transcript }));
        console.log("Injuries extracted:", transcript);
      }
    }

    //Extract dietary restrictions
    if (!fitnessData.dietaryRestrictions) {
      if (lowerTranscript.includes("none") || lowerTranscript.includes("no restrictions") || 
          lowerTranscript.includes("no dietary restrictions") || lowerTranscript.includes("nothing") ||
          lowerTranscript.includes("no allergies")) {
        setFitnessData(prev => ({ ...prev, dietaryRestrictions: "None" }));
        console.log("Dietary restrictions extracted: None");
      } 
      else if (lowerTranscript.includes("vegetarian") || lowerTranscript.includes("vegan") ||
          lowerTranscript.includes("gluten") || lowerTranscript.includes("dairy") ||
          lowerTranscript.includes("allergy") || lowerTranscript.includes("intolerant")) {
        setFitnessData(prev => ({ ...prev, dietaryRestrictions: transcript }));
        console.log("Dietary restrictions extracted:", transcript);
      }
    }

    //Extract activity level
    if (!fitnessData.activityLevel) {
      if (lowerTranscript.includes("sedentary") || lowerTranscript.includes("desk job") || lowerTranscript.includes("mostly sitting")) {
        setFitnessData(prev => ({ ...prev, activityLevel: "sedentary" }));
        console.log("Activity level extracted: sedentary");
      } else if (lowerTranscript.includes("lightly active") || lowerTranscript.includes("some walking") || lowerTranscript.includes("occasional exercise")) {
        setFitnessData(prev => ({ ...prev, activityLevel: "lightly active" }));
        console.log("Activity level extracted: lightly active");
      } else if (lowerTranscript.includes("moderately active") || lowerTranscript.includes("regular exercise") || lowerTranscript.includes("active lifestyle")) {
        setFitnessData(prev => ({ ...prev, activityLevel: "moderately active" }));
        console.log("Activity level extracted: moderately active");
      } else if (lowerTranscript.includes("very active") || lowerTranscript.includes("intense exercise") || lowerTranscript.includes("athlete")) {
        setFitnessData(prev => ({ ...prev, activityLevel: "very active" }));
        console.log("Activity level extracted: very active");
      }
    }

    //Log the current state for debugging
    console.log("Current fitness data:", fitnessData);
    console.log("Total fields collected:", Object.keys(fitnessData).length);
  };

  const handleGeneratePlan = async () => {
    console.log("Starting plan generation...");
    console.log("User ID:", user?.id);
    console.log("Fitness data:", fitnessData);
    
    if (!user?.id) {
      console.log("No user ID, cannot generate plan");
      setMessages(prev => [...prev, {
        content: "Error: User not authenticated. Please log in again.",
        role: "assistant"
      }]);
      return;
    }
    
    //Check if we have all required data
    const requiredFields = ['age', 'height', 'weight', 'fitnessLevel', 'fitnessGoal', 'workoutDays', 'injuries', 'dietaryRestrictions', 'activityLevel'];
    const missingFields = requiredFields.filter(field => !fitnessData[field as keyof FitnessData]);
    
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      setMessages(prev => [...prev, {
        content: `Missing required information: ${missingFields.join(', ')}. Please complete all fields first.`,
        role: "assistant"
      }]);
      return;
    }

    //Validate data values are reasonable
    if (fitnessData.age && (fitnessData.age < 10 || fitnessData.age > 100)) {
      console.log("Invalid age:", fitnessData.age);
      setMessages(prev => [...prev, {
        content: `Please enter a valid age between 10 and 100 years.`,
        role: "assistant"
      }]);
      return;
    }

    if (fitnessData.workoutDays && (fitnessData.workoutDays < 1 || fitnessData.workoutDays > 7)) {
      console.log("Invalid workout days:", fitnessData.workoutDays);
      setMessages(prev => [...prev, {
        content: `Please enter a valid number of workout days between 1 and 7.`,
        role: "assistant"
      }]);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      console.log("Sending request to /api/generate-program");
      const response = await fetch('/api/generate-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...fitnessData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Fitness plan generated:', result);
        
        // Store the generated plan
        setGeneratedPlan(result);
        
        // Add success message
        setMessages(prev => [...prev, {
          content: "Perfect! I've generated your personalized fitness and diet plan. Here it is:",
          role: "assistant"
        }]);
      } 
      else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } 
    catch (error) {
      console.error('Error generating plan:', error);
      setMessages(prev => [...prev, {
        content: `I apologize, but there was an error generating your fitness plan: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        role: "assistant"
      }]);
    } 
    finally {
      setIsGenerating(false);
      setCallEnded(true);
    }
  };

  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
    } 
    else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);
        setFitnessData({});
        console.log("Reset fitness data for new call");

        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
        console.log("Vapi call started successfully");
      } 
      catch (error) {
        console.log("Failed to start call", error);
        setConnecting(false);
      }
    }
  };

  //Auto scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (callEnded && !isGenerating && !generatedPlan) {
      console.log("Call ended without generating plan");
      
      if (Object.keys(fitnessData).length >= 9) {
        console.log("Attempting to generate plan after call ended");
        setTimeout(() => {
          handleGeneratePlan();
        }, 500);
      }
    }
  }, [callEnded, isGenerating, generatedPlan, fitnessData]);

  useEffect(() => {
    console.log("Fitness data updated:", fitnessData);
    console.log("Total fields collected:", Object.keys(fitnessData).length);
    
    if (Object.keys(fitnessData).length >= 9 && callActive) {
      console.log("All data collected, ending call automatically");
      setTimeout(() => {
        vapi.stop();
      }, 2000);
    }
  }, [fitnessData, callActive]);

  //Setup event listeners for vapi
  useEffect(() => {
    const handleCallStart = () => {
      console.log("Call started");
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    const handleCallEnd = () => {
      console.log("Call ended");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      
      if (Object.keys(fitnessData).length >= 9) {
        console.log("Call ended with all data, generating plan...");
        setTimeout(() => {
          handleGeneratePlan();
        }, 1000);
      } else {
        console.log("Call ended without complete data");
        setCallEnded(true);
      }
    };

    const handleSpeechStart = () => {
      console.log("AI started Speaking");
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      console.log("AI stopped Speaking");
      setIsSpeaking(false);
    };

    const handleMessage = (message: VapiMessage) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage: Message = { content: message.transcript, role: message.role };
        setMessages((prev) => [...prev, newMessage]);
        
        //Try to extract fitness data from user responses
        if (message.role === "user") {
          extractFitnessData(message.transcript);
        }
      }
    };

    const handleError = (error: VapiError) => {
      console.log("Vapi Error", error);
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    //Cleanup event listeners on unmount
    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, []); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white grid-bg pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/*Hero Section*/}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="relative inline-block">
            <h1 className="text-6xl font-bold mb-4 gradient-text">
              Generate Your
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-lg blur opacity-25 animate-glow-pulse"></div>
          </div>
          <h2 className="text-5xl font-bold neon-text mb-4">
            FITNESS PROGRAM
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Experience the future of fitness with our AI-powered voice assistant. 
            Create personalized workout and diet plans through natural conversation.
          </p>
        </div>

        {/*Video Call Area*/}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/*AI Card*/}
          <Card className="glass border-2 border-green-400/20 rounded-2xl overflow-hidden relative group hover:border-green-400/40 transition-all duration-500 animate-float">
            <div className="aspect-video flex flex-col items-center justify-center p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/*Voice Animation*/}
              <div
                className={`absolute inset-0 ${
                  isSpeaking ? "opacity-40" : "opacity-0"
                } transition-opacity duration-300`}
              >
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-24">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 h-20 w-2 bg-gradient-to-t from-green-400 to-green-600 rounded-full ${
                        isSpeaking ? "animate-sound-wave" : ""
                      }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: isSpeaking ? `${Math.random() * 60 + 20}%` : "5%",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/*Image*/}
              <div className="relative size-36 mb-6 group-hover:scale-110 transition-transform duration-500">
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur-xl ${
                    isSpeaking ? "animate-pulse" : "opacity-50"
                  }`}
                />

                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-2 border-green-400/30 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent"></div>
                  <img
                    src="/ai-avatar.jpg"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 neon-text">FitAI Coach</h2>
              <p className="text-green-400 font-medium">Your Personal Fitness Guide</p>

              {/*Speaking*/}
              <div
                className={`mt-6 flex items-center gap-3 px-4 py-2 rounded-full glass border ${
                  isSpeaking ? "border-green-400 shadow-lg shadow-green-400/25" : "border-gray-600"
                } transition-all duration-300`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSpeaking ? "bg-green-400 animate-pulse" : "bg-gray-500"
                  }`}
                />

                <span className="text-sm font-medium text-gray-300">
                  {isGenerating
                    ? "Generating plan..."
                    : isSpeaking
                    ? "Speaking..."
                    : callActive
                      ? "Listening..."
                      : callEnded
                          ? "Call ended"
                        : "Ready"}
                </span>
              </div>
            </div>
          </Card>

          {/*User Card*/}
          <Card className="glass border-2 border-gray-600/20 rounded-2xl overflow-hidden relative group hover:border-gray-400/40 transition-all duration-500">
            <div className="aspect-video flex flex-col items-center justify-center p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/*User Image*/}
              <div className="relative size-36 mb-6 group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full blur-xl opacity-50"></div>
                <img
                  src={user?.imageUrl}
                  alt="User"
                  className="relative w-full h-full object-cover rounded-full border-2 border-gray-400/30"
                />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">You</h2>
              <p className="text-gray-400 font-medium">
                {user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : "Guest"}
              </p>

              {/*User Status*/}
              <div className="mt-6 flex items-center gap-3 px-4 py-2 rounded-full glass border border-gray-600/30">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-300">Ready</span>
              </div>
            </div>
          </Card>
        </div>

        {/*Input Form*/}
        <Card className="glass border-2 border-green-400/20 rounded-2xl p-8 mb-12 group hover:border-green-400/40 transition-all duration-500">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4 gradient-text">Enter Your Information</h3>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Fill in your details to generate a personalized fitness and diet plan
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-400">Age</label>
              <input
                type="number"
                placeholder="e.g., 25"
                className="input-modern w-full"
                value={fitnessData.age || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFitnessData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }));
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-400">Height</label>
              <input
                type="text"
                placeholder="e.g., 5'8 or 170 cm"
                className="input-modern w-full"
                value={fitnessData.height || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFitnessData(prev => ({ ...prev, height: e.target.value }));
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-400">Weight</label>
              <input
                type="text"
                placeholder="e.g., 150 lbs or 68 kg"
                className="input-modern w-full"
                value={fitnessData.weight || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFitnessData(prev => ({ ...prev, weight: e.target.value }));
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-400">Fitness Level</label>
              <select
                className="input-modern w-full"
                value={fitnessData.fitnessLevel || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFitnessData(prev => ({ ...prev, fitnessLevel: e.target.value }));
                }}
              >
                <option value="">Select fitness level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-400">Fitness Goal</label>
              <select
                className="input-modern w-full"
                value={fitnessData.fitnessGoal || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFitnessData(prev => ({ ...prev, fitnessGoal: e.target.value }));
                }}
              >
                <option value="">Select fitness goal</option>
                <option value="weight loss">Weight Loss</option>
                <option value="muscle gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="strength">Strength</option>
                <option value="flexibility">Flexibility</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-400">Workout Days per Week</label>
              <select
                className="input-modern w-full"
                value={fitnessData.workoutDays || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFitnessData(prev => ({ ...prev, workoutDays: parseInt(e.target.value) || undefined }));
                }}
              >
                <option value="">Select workout days</option>
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
                <option value="7">7 days</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-400">Activity Level</label>
              <select
                className="input-modern w-full"
                value={fitnessData.activityLevel || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFitnessData(prev => ({ ...prev, activityLevel: e.target.value }));
                }}
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightly active">Lightly Active</option>
                <option value="moderately active">Moderately Active</option>
                <option value="very active">Very Active</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-400">Injuries/Limitations</label>
              <textarea
                placeholder="e.g., None, knee pain, etc."
                className="input-modern w-full min-h-[100px]"
                value={fitnessData.injuries || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setFitnessData(prev => ({ ...prev, injuries: e.target.value }));
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-400">Dietary Restrictions</label>
              <textarea
                placeholder="e.g., None, vegetarian, etc."
                className="input-modern w-full min-h-[100px]"
                value={fitnessData.dietaryRestrictions || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setFitnessData(prev => ({ ...prev, dietaryRestrictions: e.target.value }));
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-lg text-gray-300">
              <span className="font-semibold text-green-400">
                {Object.keys(fitnessData).filter(key => fitnessData[key as keyof FitnessData]).length}
              </span>
              <span className="text-gray-400"> / 9 fields completed</span>
            </div>
          </div>
        </Card>

        {/*Generate Plan Button*/}
        <div className="flex justify-center mb-12">
          <Button
            onClick={handleGeneratePlan}
            disabled={Object.keys(fitnessData).filter(key => fitnessData[key as keyof FitnessData]).length < 9 || isGenerating}
            className="btn-modern text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating Plan...' : 'Generate Fitness & Diet Plan'}
          </Button>
        </div>

        {Object.keys(fitnessData).filter(key => fitnessData[key as keyof FitnessData]).length < 9 && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-center font-medium">
              Please fill in all 9 fields to generate your plan
            </p>
          </div>
        )}

        {/*Fitness Data Progress*/}
        {Object.keys(fitnessData).length > 0 && (
          <Card className="glass border-2 border-green-400/20 rounded-2xl p-6 mb-8 group hover:border-green-400/40 transition-all duration-500">
            <h3 className="text-2xl font-bold mb-6 gradient-text text-center">Information Collected</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(fitnessData).map(([key, value]) => (
                <div key={key} className="glass border border-green-400/20 rounded-xl p-4 text-center group-hover:border-green-400/40 transition-all duration-300">
                  <div className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-2">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-white font-bold">{value}</div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="text-lg text-gray-300 mb-4">
                Progress: <span className="text-green-400 font-bold">{Object.keys(fitnessData).length}/9</span> fields collected
              </div>
              {Object.keys(fitnessData).length >= 9 && !generatedPlan && !isGenerating && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 font-medium mb-4">All information collected!</p>
                  <Button 
                    onClick={handleGeneratePlan}
                    className="btn-modern w-full"
                    size="lg"
                  >
                    Generate My Fitness & Diet Plan
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/*Message Box*/}
        {messages.length > 0 && (
          <Card className="glass border-2 border-green-400/20 rounded-2xl p-6 mb-8 group hover:border-green-400/40 transition-all duration-500">
            <div
              ref={messageContainerRef}
              className="h-80 overflow-y-auto space-y-4 scroll-smooth"
            >
              {messages.map((msg, index) => (
                <div key={index} className="message-item animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      msg.role === "assistant" 
                        ? "bg-gradient-to-br from-green-400 to-green-600 text-black" 
                        : "bg-gradient-to-br from-gray-400 to-gray-600 text-white"
                    }`}>
                      {msg.role === "assistant" ? "AI" : "U"}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-green-400 mb-1">
                        {msg.role === "assistant" ? "FitAI Coach" : user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'You' : 'You'}
                      </div>
                      <p className="text-white leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="message-item animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-green-400 mb-1">System</div>
                      <p className="text-white">Generating your personalized fitness plan... Please wait.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/*Generated Plaan will be displayed here*/}
        {generatedPlan && (
          <Card className="glass border-2 border-green-400/20 rounded-2xl p-8 mb-8 group hover:border-green-400/40 transition-all duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold gradient-text">Your Personalized Fitness & Diet Plan</h3>
              <Button 
                onClick={() => router.push("/profile")}
                className="btn-modern"
              >
                Save to Profile
              </Button>
            </div>
            
            <div className="mb-12">
              <h4 className="text-2xl font-bold mb-6 neon-text flex items-center gap-3">
                <span className="text-3xl">🍽️</span>
                Diet Plan
              </h4>
              <div className="glass border border-green-400/20 rounded-xl p-6 mb-6">
                <p className="text-xl font-medium text-center">
                  {generatedPlan.dietPlan?.title}
                </p>
                <p className="text-center text-green-400">
                  {generatedPlan.dietPlan?.daily_calories}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedPlan.dietPlan?.meal_examples?.map((meal: MealExample, index: number) => (
                  <div key={index} className="glass border border-green-400/20 rounded-xl p-6 mb-6">
                    <h5 className="font-bold text-xl mb-4 text-green-400">{meal.meal}</h5>
                    <p className="text-white">{meal.example}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-2xl font-bold mb-6 neon-text flex items-center gap-3">
                <span className="text-3xl">💪</span>
                Workout Plan
              </h4>
              <div className="glass border border-green-400/20 rounded-xl p-6 mb-6">
                <p className="text-xl font-medium text-center">
                  Program: <span className="text-green-400 font-bold">{generatedPlan.workoutPlan?.title || 'N/A'}</span>
                </p>
              </div>
            </div>
          </Card>
        )}

        {isGenerating && (
          <div className="message-item animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-green-400 mb-1">System</div>
                <p className="text-white">Generating your personalized fitness plan... Please wait.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateProgramPage;