"use client"
import { useState } from "react"

export const usePostJobForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budgetType: "fixed",
    budgetMin: "",
    budgetMax: "",
    duration: "",
    experienceLevel: "intermediate",
    featured: false,
    urgent: false,
    useEscrow: true
  })

  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.title.trim()) errors.push("Job title is required")
    if (!formData.description.trim()) errors.push("Job description is required")
    if (formData.description.trim().length < 100) errors.push("Description must be at least 100 characters")
    if (!formData.category) errors.push("Category is required")
    if (skills.length === 0) errors.push("At least one skill is required")
    if (!formData.budgetMin || parseFloat(formData.budgetMin) <= 0) errors.push("Valid minimum budget is required")
    if (formData.budgetMax && parseFloat(formData.budgetMax) <= parseFloat(formData.budgetMin)) {
      errors.push("Maximum budget must be greater than minimum budget")
    }
    if (!formData.duration) errors.push("Project duration is required")

    return errors
  }

  return {
    formData,
    skills,
    newSkill,
    setNewSkill,
    handleInputChange,
    addSkill,
    removeSkill,
    validateForm
  }
}