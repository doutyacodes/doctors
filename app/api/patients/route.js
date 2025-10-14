import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq, and, or, like } from 'drizzle-orm';

// GET - Get all patients for the logged-in doctor
export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Build query
    let query = db.select().from(patients).where(eq(patients.doctorId, user.id));

    // Add search filter if provided
    if (search) {
      query = db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.doctorId, user.id),
            or(
              like(patients.fullName, `%${search}%`),
              like(patients.email, `%${search}%`),
              like(patients.phone, `%${search}%`)
            )
          )
        );
    }

    const allPatients = await query;

    return NextResponse.json({
      success: true,
      patients: allPatients,
    });
  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching patients' },
      { status: 500 }
    );
  }
}

// POST - Create a new patient
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
    const { fullName, email, phone, age, gender, address, notes } = body;

    // Validate required fields
    if (!fullName) {
      return NextResponse.json(
        { error: 'Patient name is required' },
        { status: 400 }
      );
    }

    // Insert new patient
    const [newPatient] = await db
      .insert(patients)
      .values({
        doctorId: user.id,
        fullName,
        email: email || null,
        phone: phone || null,
        age: age || null,
        gender: gender || null,
        address: address || null,
        notes: notes || null,
        status: 'active',
      })
      .$returningId();

    // Fetch the created patient
    const [createdPatient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, newPatient.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Patient added successfully',
      patient: createdPatient,
    });
  } catch (error) {
    console.error('Create patient error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating patient' },
      { status: 500 }
    );
  }
}
