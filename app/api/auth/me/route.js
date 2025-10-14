import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { doctors } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get full doctor details from database
    const [doctor] = await db
      .select({
        id: doctors.id,
        fullName: doctors.fullName,
        email: doctors.email,
        phone: doctors.phone,
        licenseNumber: doctors.licenseNumber,
        specialization: doctors.specialization,
        hospital: doctors.hospital,
        createdAt: doctors.createdAt,
      })
      .from(doctors)
      .where(eq(doctors.id, user.id))
      .limit(1);

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
