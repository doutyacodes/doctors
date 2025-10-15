import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { riasecQuestions, riasecOptions, testProgress, patients, riasecResults } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production-min-32-characters-long'
);

// GET - Fetch all RIASEC questions with options
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    let patientId = null;
    let patientName = null;
    let alreadyCompleted = false;
    let testResult = null;

    // Get patient ID from token or from authenticated session
    if (token) {
      // Find test progress by token
      const [progress] = await db
        .select()
        .from(testProgress)
        .where(eq(testProgress.testToken, token));

      if (!progress) {
        return NextResponse.json(
          { error: 'Invalid or expired test link' },
          { status: 400 }
        );
      }

      patientId = progress.patientId;

      // Check if test is already completed
      if (progress.status === 'completed') {
        alreadyCompleted = true;
        // Fetch the result
        const [result] = await db
          .select()
          .from(riasecResults)
          .where(eq(riasecResults.testProgressId, progress.id));

        if (result) {
          testResult = result;
        }
      }
    } else {
      // Get from authenticated session
      const cookieStore = cookies();
      const authToken = cookieStore.get('auth-token');

      if (authToken) {
        try {
          await jwtVerify(authToken.value, JWT_SECRET);
          // Get patientId from query params
          const urlPatientId = searchParams.get('patientId');
          if (urlPatientId) {
            patientId = parseInt(urlPatientId);
          }
        } catch (error) {
          console.error('JWT verification failed:', error);
        }
      }
    }

    // Fetch patient name if we have patientId
    if (patientId) {
      const [patient] = await db
        .select({ fullName: patients.fullName })
        .from(patients)
        .where(eq(patients.id, patientId));

      if (patient) {
        patientName = patient.fullName;
      }

      // Check if test is already completed (if not checked via token)
      if (!token && !alreadyCompleted) {
        const [progress] = await db
          .select()
          .from(testProgress)
          .where(
            and(
              eq(testProgress.patientId, patientId),
              eq(testProgress.testType, 'RIASEC')
            )
          );

        if (progress && progress.status === 'completed') {
          alreadyCompleted = true;
          // Fetch the result
          const [result] = await db
            .select()
            .from(riasecResults)
            .where(eq(riasecResults.testProgressId, progress.id));

          if (result) {
            testResult = result;
          }
        }
      }
    }

    // Fetch all questions
    const questions = await db.select().from(riasecQuestions).where(eq(riasecQuestions.quizId, 2));

    // Fetch all options (same for all questions - Likert scale)
    const options = await db.select().from(riasecOptions);

    // Organize questions with options
    const questionsWithOptions = questions.map((question) => ({
      ...question,
      options: options, // All questions use the same Likert scale options
    }));

    return NextResponse.json({
      success: true,
      questions: questionsWithOptions,
      total: questions.length,
      patientName,
      alreadyCompleted,
      result: testResult,
    });
  } catch (error) {
    console.error('Get RIASEC questions error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching questions' },
      { status: 500 }
    );
  }
}
