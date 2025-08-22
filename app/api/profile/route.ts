import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { Freelancer, Client } from "@/models/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_jwt_key"

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
    let userRole = decoded.role || decoded.userType

    if (!userId) {
      return NextResponse.json({ error: "Invalid token structure" }, { status: 401 })
    }

    let user
    if (!userRole) {
      // Check if user exists in Freelancer collection
      const freelancerUser = await Freelancer.findById(userId).select("-password")
      if (freelancerUser) {
        userRole = "freelancer"
        user = freelancerUser
      } else {
        // Check if user exists in Client collection
        const clientUser = await Client.findById(userId).select("-password")
        if (clientUser) {
          userRole = "client"
          user = clientUser
        } else {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
      }
    } else {
      if (userRole === "freelancer") {
        user = await Freelancer.findById(userId).select("-password")
      } else if (userRole === "client") {
        user = await Client.findById(userId).select("-password")
      }

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    // Return the profile data in the format expected by the profile page
    const responseData = {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.fullname,
        fullname: user.fullname,
        avatar: user.avatar,
        isVerified: user.verified || false,
        accountType: userRole,
        role: userRole,
        userType: userRole, // Add this for compatibility
        title: user.title,
        skills: user.skills,
        hourlyRate: user.hourlyRate,
        company: user.company,
        bio: user.bio,
        location: user.location,
        category: user.category,
        experienceLevel: user.experienceLevel,
        availability: user.availability,
        languages: user.languages,
        hiringNeeds: user.hiringNeeds,
        budgetPreference: user.budgetPreference,
      },
      stats: {
        // Add default stats - you can enhance this later
        totalEarnings: 0,
        completedJobs: 0,
        successRate: 0,
        rating: user.rating || 0,
        reviewCount: user.reviewCount || 0,
      },
      jobHistory: [],
      reviews: []
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Profile fetch error:", error)

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("[v0] Starting profile update request")
    await connectDB()
    console.log("[v0] Database connected successfully")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] Missing or invalid authorization header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log("[v0] Token extracted, attempting to verify")

    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log("[v0] Token decoded:", { userId: decoded.userId || decoded.id, role: decoded.role || decoded.userType })

    // Handle different JWT field names
    const userId = decoded.userId || decoded.id
    let userRole = decoded.role || decoded.userType

    if (!userId) {
      console.log("[v0] No userId found in token")
      return NextResponse.json({ error: "Invalid token structure" }, { status: 401 })
    }

    if (!userRole) {
      console.log("[v0] Role not found in token, looking up in database")

      // Check if user exists in Freelancer collection
      const freelancerUser = await Freelancer.findById(userId)
      if (freelancerUser) {
        userRole = "freelancer"
        console.log("[v0] Found user in Freelancer collection")
      } else {
        // Check if user exists in Client collection
        const clientUser = await Client.findById(userId)
        if (clientUser) {
          userRole = "client"
          console.log("[v0] Found user in Client collection")
        } else {
          console.log("[v0] User not found in either collection")
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
      }
    }

    const updateData = await request.json()
    console.log("[v0] Update data received:", Object.keys(updateData))

    let user
    let updatedUser

    if (userRole === "freelancer") {
      console.log("[v0] Updating freelancer profile")
      user = await Freelancer.findById(userId)
      if (!user) {
        console.log("[v0] Freelancer not found")
        return NextResponse.json({ error: "Freelancer not found" }, { status: 404 })
      }

      const cleanUpdateData = Object.fromEntries(
        Object.entries({
          fullname: updateData.fullname,
          email: updateData.email,
          title: updateData.title,
          bio: updateData.bio,
          location: updateData.location,
          category: updateData.category,
          hourlyRate: updateData.hourlyRate,
          experienceLevel: updateData.experienceLevel,
          availability: updateData.availability,
          skills: updateData.skills,
          languages: updateData.languages,
          avatar: updateData.avatar,
        }).filter(([_, value]) => value !== undefined),
      )

      console.log("[v0] Clean update data for freelancer:", cleanUpdateData)

      updatedUser = await Freelancer.findByIdAndUpdate(
        userId,
        { $set: cleanUpdateData },
        { new: true, runValidators: true },
      )
    } else if (userRole === "client") {
      console.log("[v0] Updating client profile")
      user = await Client.findById(userId)
      if (!user) {
        console.log("[v0] Client not found")
        return NextResponse.json({ error: "Client not found" }, { status: 404 })
      }

      const cleanUpdateData = Object.fromEntries(
        Object.entries({
          fullname: updateData.fullname,
          email: updateData.email,
          company: updateData.company,
          bio: updateData.bio,
          location: updateData.location,
          languages: updateData.languages,
          hiringNeeds: updateData.hiringNeeds,
          budgetPreference: updateData.budgetPreference,
          avatar: updateData.avatar, // Add avatar field
        }).filter(([_, value]) => value !== undefined),
      )

      console.log("[v0] Clean update data for client:", cleanUpdateData)

      updatedUser = await Client.findByIdAndUpdate(
        userId,
        { $set: cleanUpdateData },
        { new: true, runValidators: true },
      )
    } else {
      console.log("[v0] Invalid user role:", userRole)
      return NextResponse.json({ error: "Invalid user role" }, { status: 400 })
    }

    if (!updatedUser) {
      console.log("[v0] Failed to update user")
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    console.log("[v0] User updated successfully")

    const responseUser = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.fullname,
      fullname: updatedUser.fullname,
      avatar: updatedUser.avatar,
      isVerified: updatedUser.verified || false,
      accountType: userRole,
      role: userRole,
      userType: userRole,
      // Include all profile fields directly on user object for compatibility
      title: updatedUser.title,
      skills: updatedUser.skills,
      hourlyRate: updatedUser.hourlyRate,
      company: updatedUser.company,
      bio: updatedUser.bio,
      location: updatedUser.location,
      category: updatedUser.category,
      experienceLevel: updatedUser.experienceLevel,
      availability: updatedUser.availability,
      languages: updatedUser.languages,
      hiringNeeds: updatedUser.hiringNeeds,
      budgetPreference: updatedUser.budgetPreference,
      createdAt: updatedUser.createdAt,
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: responseUser,
    })
  } catch (error) {
    console.error("[v0] Profile update error:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 })
    }

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
