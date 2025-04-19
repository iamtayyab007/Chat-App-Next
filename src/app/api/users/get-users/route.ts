import { getServerSession } from "next-auth";
import { connectToDatabase } from "../../../../../lib/connectDB";
import UserModel from "../../../../../models/User";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function GET() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  let userId;
  if (session) {
    userId = session.user._id;
    console.log("userid", session.user._id);
  }

  try {
    const user = await UserModel.find({});

    if (!user) {
      return Response.json({
        success: false,
        message: "no user found",
      });
    }

    return Response.json({
      success: true,
      message: "All the user data",
      user,
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
