import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testProgress, riasecResults, riasecTypes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculateRIASEC } from '@/lib/riasec/calculateRIASEC';

// POST - Submit RIASEC test answers and calculate results
export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, answers, token } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }

    let progress;

    // If token is provided, find test progress by token
    if (token) {
      const [tokenProgress] = await db
        .select()
        .from(testProgress)
        .where(
          and(
            eq(testProgress.testToken, token),
            eq(testProgress.testType, 'RIASEC')
          )
        )
        .limit(1);

      if (!tokenProgress) {
        return NextResponse.json(
          { error: 'Invalid test token' },
          { status: 403 }
        );
      }

      progress = tokenProgress;
    } else if (patientId) {
      // If patientId is provided, find test progress by patientId
      const [patientProgress] = await db
        .select()
        .from(testProgress)
        .where(
          and(
            eq(testProgress.patientId, parseInt(patientId)),
            eq(testProgress.testType, 'RIASEC')
          )
        )
        .limit(1);

      if (!patientProgress) {
        return NextResponse.json(
          { error: 'Test progress not found' },
          { status: 404 }
        );
      }

      progress = patientProgress;
    } else {
      return NextResponse.json(
        { error: 'Either patient ID or token is required' },
        { status: 400 }
      );
    }

    // Check if test is already completed
    if (progress.status === 'completed') {
      return NextResponse.json(
        { error: 'This test has already been completed' },
        { status: 400 }
      );
    }

    // Check if token expired
    if (progress.tokenExpiresAt && new Date() > new Date(progress.tokenExpiresAt)) {
      return NextResponse.json(
        { error: 'Test token has expired' },
        { status: 403 }
      );
    }

    // Fetch RIASEC types for calculation
    const types = await db.select().from(riasecTypes);

    // Calculate RIASEC results
    const result = calculateRIASEC(answers, types);

    // Update test progress to completed
    await db
      .update(testProgress)
      .set({
        status: 'completed',
        answers: answers,
        completedAt: new Date(),
      })
      .where(eq(testProgress.id, progress.id));

    // Check if result already exists
    const [existingResult] = await db
      .select()
      .from(riasecResults)
      .where(eq(riasecResults.testProgressId, progress.id))
      .limit(1);

    if (existingResult) {
      // Update existing result
      await db
        .update(riasecResults)
        .set({
          riasecCode: result.riasecCode,
          scores: result.scores,
          topThree: result.topThree,
        })
        .where(eq(riasecResults.id, existingResult.id));
    } else {
      // Insert new result
      await db.insert(riasecResults).values({
        patientId: progress.patientId,
        doctorId: progress.doctorId,
        riasecCode: result.riasecCode,
        scores: result.scores,
        topThree: result.topThree,
        testProgressId: progress.id,
      });
    }

    return NextResponse.json({
      success: true,
      result: {
        topThree: result.topThree,
        riasecCode: result.riasecCode,
        scores: result.scores,
        percentages: result.percentages,
      },
      message: 'Test completed successfully',
    });
  } catch (error) {
    console.error('Submit RIASEC test error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting the test' },
      { status: 500 }
    );
  }
}
