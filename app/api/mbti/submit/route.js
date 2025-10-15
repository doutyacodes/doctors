import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testProgress, mbtiResults, patients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculateMBTI } from '@/lib/mbti/calculateMBTI';

// POST - Submit MBTI test answer and calculate results
export async function POST(request) {
  try {
    const body = await request.json();
    const { token, patientId, answers } = body;

    if (!token && !patientId) {
      return NextResponse.json(
        { error: 'Token or Patient ID is required' },
        { status: 400 }
      );
    }

    // Find test progress by token or patientId
    let progress;
    if (token) {
      [progress] = await db
        .select()
        .from(testProgress)
        .where(eq(testProgress.testToken, token))
        .limit(1);
    } else {
      [progress] = await db
        .select()
        .from(testProgress)
        .where(
          and(
            eq(testProgress.patientId, patientId),
            eq(testProgress.testType, 'MBTI')
          )
        )
        .limit(1);
    }

    if (!progress) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Check if test is already completed
    if (progress.status === 'completed') {
      return NextResponse.json(
        { error: 'This test has already been completed' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (progress.tokenExpiresAt && new Date(progress.tokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Test link has expired' },
        { status: 403 }
      );
    }

    // Validate answers (should have 12 answers)
    if (!answers || answers.length !== 12) {
      return NextResponse.json(
        { error: 'All 12 questions must be answered' },
        { status: 400 }
      );
    }

    // Log answers for debugging
    console.log('Received answers:', JSON.stringify(answers, null, 2));

    // Calculate MBTI personality type
    const mbtiResult = calculateMBTI(answers);

    // Log calculation result
    console.log('MBTI calculation result:', JSON.stringify(mbtiResult, null, 2));

    // Update test progress
    await db
      .update(testProgress)
      .set({
        status: 'completed',
        answers: answers,
        completedAt: new Date(),
      })
      .where(eq(testProgress.id, progress.id));

    // Save MBTI results
    const [result] = await db
      .insert(mbtiResults)
      .values({
        patientId: progress.patientId,
        doctorId: progress.doctorId,
        personalityType: mbtiResult.personalityType,
        dimensions: mbtiResult.dimensionScores,
        testProgressId: progress.id,
      })
      .$returningId();

    // Fetch the created result
    const [mbtiResultData] = await db
      .select()
      .from(mbtiResults)
      .where(eq(mbtiResults.id, result.id))
      .limit(1);

    // Fetch patient name
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, progress.patientId))
      .limit(1);

    return NextResponse.json({
      success: true,
      result: {
        ...mbtiResultData,
        patientName: patient?.fullName,
      },
      message: 'Test completed successfully',
    });
  } catch (error) {
    console.error('Submit MBTI test error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting the test' },
      { status: 500 }
    );
  }
}
