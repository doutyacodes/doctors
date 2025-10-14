import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Get a specific patient
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch patient - ensure it belongs to the logged-in doctor
    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, parseInt(id)),
          eq(patients.doctorId, user.id)
        )
      )
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching patient' },
      { status: 500 }
    );
  }
}

// PUT - Update a patient
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { fullName, email, phone, age, gender, address, notes, status } = body;

    // Verify patient belongs to doctor
    const [existingPatient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, parseInt(id)),
          eq(patients.doctorId, user.id)
        )
      )
      .limit(1);

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Update patient
    await db
      .update(patients)
      .set({
        fullName: fullName || existingPatient.fullName,
        email: email !== undefined ? email : existingPatient.email,
        phone: phone !== undefined ? phone : existingPatient.phone,
        age: age !== undefined ? age : existingPatient.age,
        gender: gender !== undefined ? gender : existingPatient.gender,
        address: address !== undefined ? address : existingPatient.address,
        notes: notes !== undefined ? notes : existingPatient.notes,
        status: status !== undefined ? status : existingPatient.status,
      })
      .where(eq(patients.id, parseInt(id)));

    // Fetch updated patient
    const [updatedPatient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, parseInt(id)))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully',
      patient: updatedPatient,
    });
  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating patient' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a patient
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify patient belongs to doctor
    const [existingPatient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, parseInt(id)),
          eq(patients.doctorId, user.id)
        )
      )
      .limit(1);

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Delete patient
    await db
      .delete(patients)
      .where(eq(patients.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting patient' },
      { status: 500 }
    );
  }
}
