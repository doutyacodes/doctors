import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mbtiQuestions, mbtiOptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch all MBTI questions with options
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Verify token if provided (for public access via shared link)
    if (token) {
      // Token validation will be added in the middleware
    }

    // Fetch all questions
    const questions = await db.select().from(mbtiQuestions).where(eq(mbtiQuestions.quizId, 1));

    // Fetch all options
    const options = await db.select().from(mbtiOptions);

    // Organize questions with their options
    const questionsWithOptions = questions.map((question) => ({
      ...question,
      options: options.filter((opt) => opt.questionId === question.id),
    }));

    return NextResponse.json({
      success: true,
      questions: questionsWithOptions,
      total: questions.length,
    });
  } catch (error) {
    console.error('Get MBTI questions error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching questions' },
      { status: 500 }
    );
  }
}
