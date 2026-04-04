"use client"

import { useState } from "react"

export interface BaseJobFormData {
  title: string
  description: string
  category: string
  budgetEth: string
  deadlineDays: string
  experienceLevel: string
}

export interface Milestone {
  name: string
  description: string
  amount: string  // ETH string
}

export type JobType = "fixed" | "milestone"

export const useBasePostJobForm = () => {
  const [formData, setFormData] = useState<BaseJobFormData>({
    title: "",
    description: "",
    category: "",
    budgetEth: "",
    deadlineDays: "14",
    experienceLevel: "intermediate",
  })

  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [jobType, setJobType] = useState<JobType>("fixed")
  const [milestones, setMilestones] = useState<Milestone[]>([
    { name: "", description: "", amount: "" },
  ])

  const handleInputChange = (field: keyof BaseJobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove))
  }

  // Milestone helpers
  const addMilestone = () =>
    setMilestones(prev => [...prev, { name: "", description: "", amount: "" }])

  const removeMilestone = (index: number) =>
    setMilestones(prev => prev.filter((_, i) => i !== index))

  const updateMilestone = (index: number, field: keyof Milestone, value: string) =>
    setMilestones(prev =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    )

  /** Total ETH across all milestones */
  const milestoneTotalEth = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0
  )

  const validateForm = (): string[] => {
    const errors: string[] = []
    if (!formData.title.trim()) errors.push("Job title is required")
    if (!formData.description.trim()) errors.push("Job description is required")
    if (formData.description.trim().length < 100)
      errors.push("Description must be at least 100 characters")
    if (!formData.category) errors.push("Category is required")
    if (skills.length === 0) errors.push("At least one skill is required")
    if (!formData.deadlineDays || parseInt(formData.deadlineDays) < 1)
      errors.push("Deadline must be at least 1 day")

    if (jobType === "fixed") {
      if (!formData.budgetEth || parseFloat(formData.budgetEth) <= 0)
        errors.push("A valid ETH budget is required")
    } else {
      if (milestones.length === 0)
        errors.push("Add at least one milestone")
      milestones.forEach((m, i) => {
        if (!m.name.trim()) errors.push(`Milestone ${i + 1}: name is required`)
        if (!m.amount || parseFloat(m.amount) <= 0)
          errors.push(`Milestone ${i + 1}: amount must be greater than 0`)
      })
    }

    return errors
  }

  const getDeadlineTimestamp = (): bigint => {
    const days = parseInt(formData.deadlineDays) || 14
    return BigInt(Math.floor(Date.now() / 1000) + days * 86400)
  }

  const getProjectDuration = (): string => {
    const days = parseInt(formData.deadlineDays) || 14
    if (days < 7) return `${days} day${days === 1 ? "" : "s"}`
    if (days < 30) return `${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? "" : "s"}`
    if (days < 365) return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? "" : "s"}`
    return `${Math.round(days / 365)} year${Math.round(days / 365) === 1 ? "" : "s"}`
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      budgetEth: "",
      deadlineDays: "14",
      experienceLevel: "intermediate",
    })
    setSkills([])
    setNewSkill("")
    setJobType("fixed")
    setMilestones([{ name: "", description: "", amount: "" }])
  }

  return {
    formData,
    skills,
    newSkill,
    setNewSkill,
    handleInputChange,
    addSkill,
    removeSkill,
    jobType,
    setJobType,
    milestones,
    addMilestone,
    removeMilestone,
    updateMilestone,
    milestoneTotalEth,
    validateForm,
    getDeadlineTimestamp,
    getProjectDuration,
    resetForm,
  }
}