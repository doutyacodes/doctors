import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { testProgress, riasecResults } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Get RIASEC test progress for a patient
export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Fetch test progress
    const [progress] = await db
      .select()
      .from(testProgress)
      .where(
        and(
          eq(testProgress.patientId, parseInt(patientId)),
          eq(testProgress.testType, 'RIASEC')
        )
      )
      .limit(1);

    if (!progress) {
      return NextResponse.json({
        success: true,
        status: 'not_started',
        progress: null,
        result: null,
      });
    }

    // If completed, fetch results
    let result = null;
    if (progress.status === 'completed') {
      const [riasecResult] = await db
        .select()
        .from(riasecResults)
        .where(eq(riasecResults.testProgressId, progress.id))
        .limit(1);

      result = riasecResult;
    }

    return NextResponse.json({
      success: true,
      status: progress.status,
      progress,
      result,
      testLink: progress.testToken
        ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/test/riasec?token=${progress.testToken}`
        : null,
    });
  } catch (error) {
    console.error('Get RIASEC progress error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching progress' },
      { status: 500 }
    );
  }
}
