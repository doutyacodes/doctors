import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { testProgress, mbtiResults } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { patientId } = await params;

    // Get test progress
    const [progress] = await db
      .select()
      .from(testProgress)
      .where(
        and(
          eq(testProgress.patientId, parseInt(patientId)),
          eq(testProgress.testType, 'MBTI')
        )
      )
      .limit(1);

    if (!progress) {
      return NextResponse.json({
        success: true,
        hasTest: false,
        status: 'not_started',
      });
    }

    // If completed, get results
    let result = null;
    if (progress.status === 'completed') {
      [result] = await db
        .select()
        .from(mbtiResults)
        .where(eq(mbtiResults.testProgressId, progress.id))
        .limit(1);
    }

    return NextResponse.json({
      success: true,
      hasTest: true,
      progress,
      result,
      testLink: progress.testToken
        ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/test/mbti?token=${progress.testToken}`
        : null,
    });
  } catch (error) {
    console.error('Get MBTI progress error:', error);
    return NextResponse.json({ error: 'Error fetching progress' }, { status: 500 });
  }
}
