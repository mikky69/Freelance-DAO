"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function AdminSignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminToken: "",
  })
  const [isFirstAdmin, setIsFirstAdmin] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  // Check if this is the first admin
  useState(() => {
    const checkFirstAdmin = async () => {
      try {
        // Only run on client side to avoid build-time URL parsing errors
        if (typeof window === 'undefined') return;
        
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/api/auth/admin/check-first`)
        const data = await res.json()
        setIsFirstAdmin(data.isFirstAdmin)
      } catch (error) {
        console.error("Error checking first admin:", error)
        // Set default value on error
        setIsFirstAdmin(false)
      }
    }
    checkFirstAdmin()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const success = await signUp(formData.email, formData.password, formData.name, "admin", formData.adminToken)
      if (success) {
        toast.success("Admin account created successfully!")
        router.push("/admin")
      }
    } catch (error) {
      toast.error("Failed to create admin account")
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Admin Signup</h1>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {!isFirstAdmin && (
            <div>
              <Label htmlFor="adminToken">Admin Token</Label>
              <Input
                id="adminToken"
                name="adminToken"
                value={formData.adminToken}
                onChange={handleChange}
                required
                placeholder="Token from existing admin"
              />
              <p className="text-sm text-gray-500 mt-1">
                Only existing admins can create new admin accounts.
              </p>
            </div>
          )}
          <Button type="submit" className="w-full">
            Create Admin Account
          </Button>
        </div>
      </form>
    </div>
  )
}