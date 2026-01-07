import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { Freelancer, Client } from "@/models/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_jwt_key"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Handle different JWT field names
    const userId = decoded.userId || decoded.id
    const userRole = decoded.role || decoded.userType

    if (!userId) {
      return NextResponse.json({ error: "Invalid token structure" }, { status: 401 })
    }

    let user
    if (userRole === "freelancer") {
      user = await Freelancer.findById(userId)
    } else if (userRole === "client") {
      user = await Client.findById(userId)
    } else {
      // Try to find in both collections if role is not specified
      user = (await Freelancer.findById(userId)) || (await Client.findById(userId))
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if the method exists, if not provide a fallback
    let completionStatus
    if (typeof user.getProfileCompletionStatus === "function") {
      completionStatus = user.getProfileCompletionStatus()
    } else {
      // Fallback: basic profile completion check
      const requiredFields = ["fullname", "email", "bio", "skills"]
      const missingFields = requiredFields.filter(
        (field) => !user[field] || (Array.isArray(user[field]) && user[field].length === 0),
      )

      completionStatus = {
        isComplete: missingFields.length === 0,
        completionPercentage: Math.round(
          ((requiredFields.length - missingFields.length) / requiredFields.length) * 100,
        ),
        missingFields,
        requiredFields,
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...completionStatus,
        userType: userRole || user.userType || (user.constructor.modelName === "Freelancer" ? "freelancer" : "client"),
      },
    })
  } catch (error) {
    console.error("Profile completion check error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
