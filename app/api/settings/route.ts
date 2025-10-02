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

    // Return the settings data with defaults if not set
    const settings = user.settings || {}
    
    const responseData = {
      profileData: {
        fullname: user.fullname,
        email: user.email,
        title: user.title || "",
        bio: user.bio || "",
        location: user.location || "",
        hourlyRate: user.hourlyRate || 0,
        availability: user.availability || "Available now",
        skills: user.skills || [],
        languages: user.languages || ["English"],
        avatar: user.avatar,
        company: user.company || "",
      },
      privacySettings: {
        profileVisibility: settings.privacy?.profileVisibility || "public",
        showEmail: settings.privacy?.showEmail || false,
        showPhone: settings.privacy?.showPhone || false,
        showLocation: settings.privacy?.showLocation || true,
        showEarnings: settings.privacy?.showEarnings || false,
        showSpent: settings.privacy?.showSpent || false,
        allowDirectContact: settings.privacy?.allowDirectContact || true,
      },
      notificationSettings: {
        email: {
          jobAlerts: settings.notifications?.email?.jobAlerts !== false,
          messageAlerts: settings.notifications?.email?.messageAlerts !== false,
          paymentAlerts: settings.notifications?.email?.paymentAlerts !== false,
          marketingEmails: settings.notifications?.email?.marketingEmails || false,
        },
        push: {
          jobAlerts: settings.notifications?.push?.jobAlerts !== false,
          messageAlerts: settings.notifications?.push?.messageAlerts !== false,
          paymentAlerts: settings.notifications?.push?.paymentAlerts !== false,
        },
        sms: {
          jobAlerts: settings.notifications?.sms?.jobAlerts || false,
          paymentAlerts: settings.notifications?.sms?.paymentAlerts || false,
        },
      },
      securitySettings: {
        twoFactorEnabled: settings.security?.twoFactorEnabled || false,
        loginAlerts: settings.security?.loginAlerts !== false,
        sessionTimeout: settings.security?.sessionTimeout || 30,
      },
      userRole,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Settings fetch error:", error)

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    if (!userRole) {
      // Check if user exists in Freelancer collection
      const freelancerUser = await Freelancer.findById(userId)
      if (freelancerUser) {
        userRole = "freelancer"
      } else {
        // Check if user exists in Client collection
        const clientUser = await Client.findById(userId)
        if (clientUser) {
          userRole = "client"
        } else {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
      }
    }

    const updateData = await request.json()
    console.log("Settings update data received:", Object.keys(updateData))

    let updatedUser

    // Prepare the update object
    const settingsUpdate = {}

    // Handle profile data updates
    if (updateData.profileData) {
      const profileFields = {
        fullname: updateData.profileData.fullname,
        email: updateData.profileData.email,
        title: updateData.profileData.title,
        bio: updateData.profileData.bio,
        location: updateData.profileData.location,
        hourlyRate: updateData.profileData.hourlyRate,
        availability: updateData.profileData.availability,
        skills: updateData.profileData.skills,
        languages: updateData.profileData.languages,
        company: updateData.profileData.company,
      }

      // Filter out undefined values
      Object.entries(profileFields).forEach(([key, value]) => {
        if (value !== undefined) {
          settingsUpdate[key] = value
        }
      })
    }

    // Handle privacy settings
    if (updateData.privacySettings) {
      Object.entries(updateData.privacySettings).forEach(([key, value]) => {
        if (value !== undefined) {
          settingsUpdate[`settings.privacy.${key}`] = value
        }
      })
    }

    // Handle notification settings
    if (updateData.notificationSettings) {
      if (updateData.notificationSettings.email) {
        Object.entries(updateData.notificationSettings.email).forEach(([key, value]) => {
          if (value !== undefined) {
            settingsUpdate[`settings.notifications.email.${key}`] = value
          }
        })
      }
      if (updateData.notificationSettings.push) {
        Object.entries(updateData.notificationSettings.push).forEach(([key, value]) => {
          if (value !== undefined) {
            settingsUpdate[`settings.notifications.push.${key}`] = value
          }
        })
      }
      if (updateData.notificationSettings.sms) {
        Object.entries(updateData.notificationSettings.sms).forEach(([key, value]) => {
          if (value !== undefined) {
            settingsUpdate[`settings.notifications.sms.${key}`] = value
          }
        })
      }
    }

    // Handle security settings
    if (updateData.securitySettings) {
      Object.entries(updateData.securitySettings).forEach(([key, value]) => {
        if (value !== undefined) {
          settingsUpdate[`settings.security.${key}`] = value
        }
      })
    }

    console.log("Settings update object:", settingsUpdate)

    if (userRole === "freelancer") {
      updatedUser = await Freelancer.findByIdAndUpdate(
        userId,
        { $set: settingsUpdate },
        { new: true, runValidators: true }
      ).select("-password")
    } else if (userRole === "client") {
      updatedUser = await Client.findByIdAndUpdate(
        userId,
        { $set: settingsUpdate },
        { new: true, runValidators: true }
      ).select("-password")
    } else {
      return NextResponse.json({ error: "Invalid user role" }, { status: 400 })
    }

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }

    console.log("Settings updated successfully")

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        fullname: updatedUser.fullname,
        settings: updatedUser.settings,
      },
    })
  } catch (error) {
    console.error("Settings update error:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 })
    }

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}