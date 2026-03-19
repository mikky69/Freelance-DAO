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

  const validateForm = (): string[] => {
    const errors: string[] = []
    if (!formData.title.trim()) errors.push("Job title is required")
    if (!formData.description.trim()) errors.push("Job description is required")
    if (formData.description.trim().length < 100) errors.push("Description must be at least 100 characters")
    if (!formData.category) errors.push("Category is required")
    if (skills.length === 0) errors.push("At least one skill is required")
    if (!formData.budgetEth || parseFloat(formData.budgetEth) <= 0) errors.push("A valid ETH budget is required")
    if (!formData.deadlineDays || parseInt(formData.deadlineDays) < 1) errors.push("Deadline must be at least 1 day")
    return errors
  }

  /** Unix timestamp (seconds) for the deadline */
  const getDeadlineTimestamp = (): bigint => {
    const days = parseInt(formData.deadlineDays) || 14
    return BigInt(Math.floor(Date.now() / 1000) + days * 86400)
  }

  /** Human-readable duration string for the contract's projectDuration field */
  const getProjectDuration = (): string => {
    const days = parseInt(formData.deadlineDays) || 14
    if (days < 7)  return `${days} day${days === 1 ? '' : 's'}`
    if (days < 30) return `${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? '' : 's'}`
    if (days < 365) return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? '' : 's'}`
    return `${Math.round(days / 365)} year${Math.round(days / 365) === 1 ? '' : 's'}`
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
  }

  return {
    formData,
    skills,
    newSkill,
    setNewSkill,
    handleInputChange,
    addSkill,
    removeSkill,
    validateForm,
    getDeadlineTimestamp,
    getProjectDuration,
    resetForm,
  }
}
