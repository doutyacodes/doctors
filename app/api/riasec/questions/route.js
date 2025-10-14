import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { riasecQuestions, riasecOptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch all RIASEC questions with options
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Verify token if provided (for public access via shared link)
    if (token) {
      // Token validation will be handled in the middleware
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
    });
  } catch (error) {
    console.error('Get RIASEC questions error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching questions' },
      { status: 500 }
    );
  }
}
