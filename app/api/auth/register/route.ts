import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validations";
import { notifyRole } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { employeeId, name, email, password } = parsed.data;

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { employeeId }
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or Employee ID already exists.",
        },
        { status: 409 }
      );
    }

    // Default Role
    const role = await prisma.role.findFirst({
      where: {
        name: "Viewer",
      },
    });

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message: "Default role 'Viewer' not found. Seed the database first.",
        },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        employeeId,
        name,
        email,
        password: hashedPassword,
        roleId: role.id,
      },
      include: {
        role: true,
      },
    });

    // ── Notify all admins that a new user was created ───────────────────
    // Best-effort: failure here must not break registration.
    try {
      await notifyRole('Admin', {
        title: 'User Created',
        message: `New user "${user.name}" (${user.email}) registered with role ${user.role.name}.`,
        category: 'system',
        link: '/dashboard/users',
      })
    } catch { /* non-fatal */ }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: user.id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          role: user.role.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}// Replace with your latest register route.
