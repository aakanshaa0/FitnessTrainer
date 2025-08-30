"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Apple, Calendar, Target, User, Plus } from "lucide-react";
import Link from "next/link";

interface FitnessPlan {
  _id: string;
  name: string;
  workoutPlan: {
    schedule: string[];
    exercises: Array<{
      day: string;
      routines: Array<{
        name: string;
        sets: number;
        reps: number;
        duration?: string;
        description?: string;
      }>;
    }>;
  };
  dietPlan: {
    dailyCalories: number;
    meals: Array<{
      name: string;
      foods: string[];
    }>;
  };
  isActive: boolean;
  createdAt: string;
}

const ProfilePage = () => {
  const { user } = useUser();
  const [plans, setPlans] = useState<FitnessPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserPlans();
    }
  }, [user?.id]);

  const fetchUserPlans = async () => {
    try {
      const response = await fetch(`/api/user-plans?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return (
      <div className="min-h-screen pt-24 pb-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your fitness plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/*Hero Section*/}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-primary/20">
              <img
                src={user?.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-muted-foreground">Welcome back to your fitness journey!</p>
            </div>
          </div>
        </div>

        {/*Plans Section*/}
        {plans.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Fitness Plans</h2>
              <Link href="/generate-program">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Plan
                </Button>
              </Link>
            </div>

            {plans.map((plan) => (
              <Card key={plan._id} className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Workout Plan */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Dumbbell className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Workout Plan</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Schedule: {plan.workoutPlan.schedule.join(", ")}</span>
                        </div>
                        
                        {plan.workoutPlan.exercises.map((day, index) => (
                          <div key={index} className="border-l-2 border-primary/30 pl-4">
                            <h4 className="font-medium text-primary mb-2">{day.day}</h4>
                            <div className="space-y-2">
                              {day.routines.map((routine, routineIndex) => (
                                <div key={routineIndex} className="text-sm">
                                  <span className="font-medium">{routine.name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    {routine.sets} sets × {routine.reps} reps
                                  </span>
                                  {routine.duration && (
                                    <span className="text-muted-foreground ml-2">
                                      ({routine.duration})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/*Diet Plan*/}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Apple className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Nutrition Plan</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-primary/10 rounded-lg p-3">
                          <span className="text-sm font-medium text-primary">
                            Daily Calories: {plan.dietPlan.dailyCalories}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {plan.dietPlan.meals.map((meal, index) => (
                            <div key={index} className="border-l-2 border-secondary/30 pl-4">
                              <h4 className="font-medium text-secondary mb-2">{meal.name}</h4>
                              <div className="space-y-1">
                                {meal.foods.map((food, foodIndex) => (
                                  <div key={foodIndex} className="text-sm text-muted-foreground">
                                    • {food}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /*Empty State*/
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Fitness Plans Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start your fitness journey by creating your first personalized workout and nutrition plan with our AI assistant.
            </p>
            <Link href="/generate-program">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg">
                <Target className="w-5 h-5 mr-2" />
                Create Your First Plan
              </Button>
            </Link>
          </div>
        )}

        {/*Quick Stats*/}
        {plans.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-6">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Dumbbell className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">Active Plans</h4>
                <p className="text-2xl font-bold text-primary">{plans.filter(p => p.isActive).length}</p>
              </Card>
              
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="font-semibold mb-1">Total Plans</h4>
                <p className="text-2xl font-bold text-secondary">{plans.length}</p>
              </Card>
              
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-semibold mb-1">Member Since</h4>
                <p className="text-2xl font-bold text-green-500">
                  {plans.length > 0 ? new Date(plans[0].createdAt).getFullYear() : 'N/A'}
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;