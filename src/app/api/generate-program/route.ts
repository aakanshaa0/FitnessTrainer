import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import clientPromise from '@/lib/mongodb';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface WorkoutPlan {
  schedule: string[];
  exercises: Array<{
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
  dailyCalories: number;
  meals: Array<{
    name: string;
    foods: string[];
  }>;
}

function validateWorkoutPlan(plan: WorkoutPlan) {
  console.log('Validating workout plan:', plan);
  
  const validatedPlan: WorkoutPlan = {
    schedule: plan.schedule || [],
    exercises: plan.exercises?.map((day) => ({
      day: day.day,
      routines: day.routines?.map((routine) => ({
        name: routine.name,
        sets: typeof routine.sets === 'number' ? routine.sets : 3,
        reps: typeof routine.reps === 'number' ? routine.reps : 10,
        duration: routine.duration,
        description: routine.description,
        exercises: routine.exercises,
      })) || [],
    })) || [],
  };
  
  console.log('Validated workout plan:', validatedPlan);
  return validatedPlan;
}

function validateDietPlan(plan: DietPlan) {
  console.log('Validating diet plan:', plan);
  
  const validatedPlan: DietPlan = {
    dailyCalories: typeof plan.dailyCalories === 'number' ? plan.dailyCalories : 2000,
    meals: plan.meals?.map((meal) => ({
      name: meal.name,
      foods: meal.foods || [],
    })) || [],
  };
  
  console.log('Validated diet plan:', validatedPlan);
  return validatedPlan;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== GENERATE PROGRAM API CALLED ===');
    
    const payload = await request.json();
    console.log("Payload received:", JSON.stringify(payload, null, 2));

    const {
      user_id,
      age,
      height,
      weight,
      injuries,
      workoutDays,
      workout_days,
      fitnessGoal,
      fitness_goal,
      fitnessLevel,
      fitness_level,
      dietaryRestrictions,
      dietary_restrictions,
    } = payload;

    const workout_days_final = workoutDays || workout_days;
    const fitness_goal_final = fitnessGoal || fitness_goal;
    const fitness_level_final = fitnessLevel || fitness_level;
    const dietary_restrictions_final = dietaryRestrictions || dietary_restrictions;

    if (!user_id) {
      console.error('Missing user_id in payload');
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!age || !height || !weight || !fitness_goal_final || !fitness_level_final || !workout_days_final) {
      console.error('Missing required fitness data:', { age, height, weight, fitness_goal: fitness_goal_final, fitness_level: fitness_level_final, workout_days: workout_days_final });
      return NextResponse.json(
        { success: false, error: "Missing required fitness data" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    console.log('Initializing Gemini AI with model...');
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        responseMimeType: "application/json",
      },
    });

    console.log('Generating workout plan...');
    const workoutPrompt = `You are an experienced fitness coach creating a personalized workout plan based on:
    Age: ${age}
    Height: ${height}
    Weight: ${weight}
    Injuries or limitations: ${injuries || 'None'}
    Available days for workout: ${workout_days_final}
    Fitness goal: ${fitness_goal_final}
    Fitness level: ${fitness_level_final}
    
    As a professional coach:
    - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
    - Design exercises that match the fitness level and account for any injuries
    - Structure the workouts to specifically target the user's fitness goal
    
    CRITICAL SCHEMA INSTRUCTIONS:
    - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
    - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
    - For example: "sets": 3, "reps": 10
    - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
    - Instead use specific numbers like "reps": 12 or "reps": 15
    - For cardio, use "sets": 1, "reps": 1 or another appropriate number
    - NEVER include strings for numerical fields
    - NEVER add extra fields not shown in the example below
    
    Return a JSON object with this EXACT structure:
    {
      "schedule": ["Monday", "Wednesday", "Friday"],
      "exercises": [
        {
          "day": "Monday",
          "routines": [
            {
              "name": "Exercise Name",
              "sets": 3,
              "reps": 10
            }
          ]
        }
      ]
    }
    
    DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

    console.log('Sending workout prompt to Gemini...');
    const workoutResult = await model.generateContent(workoutPrompt);
    const workoutPlanText = workoutResult.response.text();
    console.log('Workout plan response from Gemini:', workoutPlanText);

    // VALIDATE THE INPUT COMING FROM AI
    let workoutPlan: WorkoutPlan;
    try {
      workoutPlan = JSON.parse(workoutPlanText);
      console.log('Parsed workout plan:', workoutPlan);
    } catch (parseError) {
      console.error('Failed to parse workout plan JSON:', parseError);
      console.error('Raw response:', workoutPlanText);
      return NextResponse.json(
        { success: false, error: "Invalid workout plan response from AI" },
        { status: 500 }
      );
    }
    
    workoutPlan = validateWorkoutPlan(workoutPlan);

    console.log('Generating diet plan...');
    const dietPrompt = `You are an experienced nutrition coach creating a personalized diet plan based on:
      Age: ${age}
      Height: ${height}
      Weight: ${weight}
      Fitness goal: ${fitness_goal_final}
      Dietary restrictions: ${dietary_restrictions_final || 'None'}
      
      As a professional nutrition coach:
      - Calculate appropriate daily calorie intake based on the person's stats and goals
      - Create a balanced meal plan with proper macronutrient distribution
      - Include a variety of nutrient-dense foods while respecting dietary restrictions
      - Consider meal timing around workouts for optimal performance and recovery
      
      CRITICAL SCHEMA INSTRUCTIONS:
      - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
      - "dailyCalories" MUST be a NUMBER, not a string
      - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
      - ONLY include the EXACT fields shown in the example below
      - Each meal should include ONLY a "name" and "foods" array

      Return a JSON object with this EXACT structure and no other fields:
      {
        "dailyCalories": 2000,
        "meals": [
          {
            "name": "Breakfast",
            "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
          },
          {
            "name": "Lunch",
            "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
          }
        ]
      }
      
      DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

    console.log('Sending diet prompt to Gemini...');
    const dietResult = await model.generateContent(dietPrompt);
    const dietPlanText = dietResult.response.text();
    console.log('Diet plan response from Gemini:', dietPlanText);

    let dietPlan: DietPlan;
    try {
      dietPlan = JSON.parse(dietPlanText);
      console.log('Parsed diet plan:', dietPlan);
    } catch (parseError) {
      console.error('Failed to parse diet plan JSON:', parseError);
      console.error('Raw response:', dietPlanText);
      return NextResponse.json(
        { success: false, error: "Invalid diet plan response from AI" },
        { status: 500 }
      );
    }
    
    dietPlan = validateDietPlan(dietPlan);

    console.log('Saving to MongoDB...');
    const client = await clientPromise;
    const db = client.db("fitness");
    const plansCollection = db.collection("plans");

    const planData = {
      userId: user_id,
      name: `${fitness_goal_final} Fitness Plan`,
      workoutPlan,
      dietPlan,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Plan data to save:', JSON.stringify(planData, null, 2));
    const result = await plansCollection.insertOne(planData);
    console.log('Plan saved to MongoDB with ID:', result.insertedId);

    return NextResponse.json({
      success: true,
      planId: result.insertedId,
      workoutPlan,
      dietPlan,
    });

  } 
  catch (error) {
    console.error("Error generating fitness program:", error);
    
    let errorMessage = "Failed to generate fitness program";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
