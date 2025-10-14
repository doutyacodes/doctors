import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { testProgress } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateTestToken, getTokenExpiration } from '@/lib/mbti/calculateMBTI';

// POST - Start MBTI test for a patient
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Check if test progress already exists
    const [existing] = await db
      .select()
      .from(testProgress)
      .where(
        and(
          eq(testProgress.patientId, patientId),
          eq(testProgress.testType, 'MBTI')
        )
      )
      .limit(1);

    if (existing) {
      // Return existing progress
      return NextResponse.json({
        success: true,
        progress: existing,
        message: 'Test already started',
      });
    }

    // Create new test progress
    const testToken = generateTestToken();
    const tokenExpiresAt = getTokenExpiration(7); // 7 days expiration

    const [newProgress] = await db
      .insert(testProgress)
      .values({
        patientId: parseInt(patientId),
        doctorId: user.id,
        testType: 'MBTI',
        status: 'in_progress',
        currentQuestion: 1,
        answers: [],
        testToken,
        tokenExpiresAt,
        startedAt: new Date(),
      })
      .$returningId();

    const [progress] = await db
      .select()
      .from(testProgress)
      .where(eq(testProgress.id, newProgress.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      progress,
      testLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/test/mbti?token=${testToken}`,
      message: 'Test started successfully',
    });
  } catch (error) {
    console.error('Start MBTI test error:', error);
    return NextResponse.json(
      { error: 'An error occurred while starting the test' },
      { status: 500 }
    );
  }
}
