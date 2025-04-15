import { NextResponse } from "next/server";
import UserModel from "../../../../../models/User";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../../../../../lib/connectDB";
import { z } from "zod";
import { signupSchema } from "../../../../../schemas/signupSchema";

export async function POST(req: Request) {
  const { username, email, password, confirmPassword } = await req.json();

  const parsed = signupSchema.safeParse({
    username,
    email,
    password,
    confirmPassword,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid Inputs",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const user = await UserModel.findOne({ email });
  if (user) {
    return NextResponse.json(
      {
        success: false,
        message: "User already exists",
      },
      { status: 400 }
    );
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({
    username,
    email,
    password: hashPassword,
  });

  await newUser.save();

  return NextResponse.json(
    {
      success: true,
      message: "user registered successfully",
      user: newUser,
    },
    { status: 201 }
  );
}
