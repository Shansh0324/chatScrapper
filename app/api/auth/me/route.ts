import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const secret = process.env.JWT_SECRET || "fallback-secret-for-dev";
    const decoded: any = jwt.verify(token, secret);

    await connectToDatabase();
    const user = await User.findById(decoded.userId).select("email");

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({ authenticated: true, user: { email: user.email } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
