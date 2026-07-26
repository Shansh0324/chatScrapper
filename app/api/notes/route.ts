import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Note from "@/models/Note";

// Verify auth token helper
async function getUserIdFromToken() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "fallback-secret-for-dev";
    const decoded: any = jwt.verify(token, secret);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    // Fetch user's notes sorted by newest first
    const notes = await Note.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, author, markdown, platform } = await req.json();

    if (!markdown) {
      return NextResponse.json({ error: "Markdown content is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const newNote = await Note.create({
      userId,
      title,
      author,
      markdown,
      platform,
    });

    return NextResponse.json({ message: "Note saved", note: newNote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
