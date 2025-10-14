import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      licenseNumber,
      specialization,
      hospital,
      password,
    } = body;

    // Validate input
    if (!fullName || !email || !phone || !licenseNumber || !specialization || !hospital || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if doctor already exists with email or license number
    const existingDoctor = await db
      .select()
      .from(doctors)
      .where(
        or(
          eq(doctors.email, email),
          eq(doctors.licenseNumber, licenseNumber)
        )
      )
      .limit(1);

    if (existingDoctor.length > 0) {
      if (existingDoctor[0].email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
      if (existingDoctor[0].licenseNumber === licenseNumber) {
        return NextResponse.json(
          { error: 'License number already registered' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new doctor
    const [newDoctor] = await db
      .insert(doctors)
      .values({
        fullName,
        email,
        phone,
        licenseNumber,
        specialization,
        hospital,
        password: hashedPassword,
      })
      .$returningId();

    // Create JWT token
    const token = await createToken({
      id: newDoctor.id,
      email,
      fullName,
    });

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      doctor: {
        id: newDoctor.id,
        fullName,
        email,
        phone,
        licenseNumber,
        specialization,
        hospital,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during sign up' },
      { status: 500 }
    );
  }
}
