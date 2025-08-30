import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("fitness");
    const plansCollection = db.collection("plans");

    const plans = await plansCollection
      .find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      plans,
    });

  } catch (error) {
    console.error("Error fetching user plans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user plans" },
      { status: 500 }
    );
  }
}
