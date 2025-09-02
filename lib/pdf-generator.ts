import jsPDF from 'jspdf'

interface ContractData {
  _id: string
  title: string
  client: {
    fullname: string
    avatar?: string
  }
  freelancer: {
    fullname: string
    avatar?: string
  }
  budget: {
    amount: number
    currency: string
  }
  status: string
  milestones: Array<{
    name: string
    description: string
    amount: number
    duration: string
    completed: boolean
  }>
  paymentTerms: {
    escrowAmount: number
    releaseConditions: string
    penaltyClause: string
  }
  signatures: {
    client: {
      signed: boolean
      signature?: string
      signedAt?: string
    }
    freelancer: {
      signed: boolean
      signature?: string
      signedAt?: string
    }
  }
  escrow: {
    funded: boolean
    fundedAt?: string
  }
  createdAt: string
  startDate?: string
  endDate?: string
}

export const generateContractPDF = async (contract: ContractData): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = margin
  
  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, isBold: boolean = false) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y)
    return y + (lines.length * (fontSize * 0.35)) + 2
  }
  
  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
  }
  
  // Header
  pdf.setFillColor(59, 130, 246) // Blue background
  pdf.rect(0, 0, pageWidth, 40, 'F')
  pdf.setTextColor(255, 255, 255)
  yPosition = addText('FREELANCE CONTRACT AGREEMENT', margin, 25, contentWidth, 20, true)
  pdf.setTextColor(0, 0, 0)
  
  yPosition = 50
  
  // Contract Information
  yPosition = addText('CONTRACT DETAILS', margin, yPosition, contentWidth, 16, true)
  yPosition += 5
  
  yPosition = addText(`Contract ID: ${contract._id}`, margin, yPosition, contentWidth, 10)
  yPosition = addText(`Project Title: ${contract.title}`, margin, yPosition, contentWidth, 10, true)
  yPosition = addText(`Created: ${new Date(contract.createdAt).toLocaleDateString()}`, margin, yPosition, contentWidth, 10)
  yPosition = addText(`Status: ${contract.status.toUpperCase()}`, margin, yPosition, contentWidth, 10)
  yPosition += 10
  
  // Parties Information
  checkNewPage(40)
  yPosition = addText('PARTIES INVOLVED', margin, yPosition, contentWidth, 16, true)
  yPosition += 5
  
  yPosition = addText(`Client: ${contract.client.fullname}`, margin, yPosition, contentWidth, 12, true)
  yPosition = addText(`Freelancer: ${contract.freelancer.fullname}`, margin, yPosition, contentWidth, 12, true)
  yPosition += 10
  
  // Project Budget
  checkNewPage(30)
  yPosition = addText('PROJECT BUDGET', margin, yPosition, contentWidth, 16, true)
  yPosition += 5
  
  yPosition = addText(`Total Budget: ${contract.budget.amount} ${contract.budget.currency}`, margin, yPosition, contentWidth, 12, true)
  yPosition = addText(`Escrow Amount: ${contract.paymentTerms.escrowAmount} ${contract.budget.currency}`, margin, yPosition, contentWidth, 10)
  yPosition += 10
  
  // Milestones
  checkNewPage(60)
  yPosition = addText('PROJECT MILESTONES', margin, yPosition, contentWidth, 16, true)
  yPosition += 5
  
  contract.milestones.forEach((milestone, index) => {
    checkNewPage(25)
    yPosition = addText(`${index + 1}. ${milestone.name}`, margin, yPosition, contentWidth, 11, true)
    if (milestone.description) {
      yPosition = addText(`   Description: ${milestone.description}`, margin, yPosition, contentWidth, 9)
    }
    yPosition = addText(`   Payment: ${milestone.amount} ${contract.budget.currency}`, margin, yPosition, contentWidth, 9)
    yPosition = addText(`   Duration: ${milestone.duration}`, margin, yPosition, contentWidth, 9)
    yPosition = addText(`   Status: ${milestone.completed ? 'COMPLETED' : 'PENDING'}`, margin, yPosition, contentWidth, 9, milestone.completed)
    yPosition += 3
  })
  
  yPosition += 5
  
  // Payment Terms
  checkNewPage(50)
  yPosition = addText('PAYMENT TERMS & CONDITIONS', margin, yPosition, contentWidth, 16, true)
  yPosition += 5
  
  yPosition = addText(`Release Conditions:`, margin, yPosition, contentWidth, 10, true)
  yPosition = addText(contract.paymentTerms.releaseConditions, margin, yPosition, contentWidth, 9)
  yPosition += 3
  
  yPosition = addText(`Penalty Clause:`, margin, yPosition, contentWidth, 10, true)
  yPosition = addText(contract.paymentTerms.penaltyClause, margin, yPosition, contentWidth, 9)
  yPosition += 10
  
  // Rights & Ownership
  checkNewPage(40)
  yPosition = addText('RIGHTS & OWNERSHIP', margin, yPosition, contentWidth, 16, true)
  yPosition += 5
  
  yPosition = addText('The freelancer transfers all rights to the deliverables to the client once full payment is released.', margin, yPosition, contentWidth, 9)
  yPosition = addText('Freelancer retains the right to showcase the work in their portfolio (unless client requests NDA).', margin, yPosition, contentWidth, 9)
  yPosition += 10
  
  // Dispute Resolution
  checkNewPage(50)
  yPosition = addText('DISPUTE RESOLUTION', margin, yPosition, contentWidth, 16, true)
  yPosition += 5
  
  yPosition = addText('If disagreements arise:', margin, yPosition, contentWidth, 10, true)
  yPosition = addText('1. Client and freelancer attempt to resolve via FreelanceDAO chat.', margin, yPosition, contentWidth, 9)
  yPosition = addText('2. If unresolved, either party may open a Dispute Case.', margin, yPosition, contentWidth, 9)
  yPosition = addText('3. FreelanceDAO\'s arbitration process (DAO vote or admin decision) will determine the outcome.', margin, yPosition, contentWidth, 9)
  yPosition += 10
  
  // Termination
  checkNewPage(40)
  yPosition = addText('TERMINATION', margin, yPosition, contentWidth, 16, true)
  yPosition += 5
  
  yPosition = addText('Client may cancel the contract before completion.', margin, yPosition, contentWidth, 9)
  yPosition = addText('Freelancer may withdraw before starting work.', margin, yPosition, contentWidth, 9)
  yPosition = addText('If terminated mid-project, payment for completed milestones will still be released.', margin, yPosition, contentWidth, 9)
  yPosition += 15
  
  // Signatures Section
  checkNewPage(100)
  yPosition = addText('DIGITAL SIGNATURES', margin, yPosition, contentWidth, 16, true)
  yPosition += 10
  
  // Client Signature
  const clientSigX = margin
  const freelancerSigX = pageWidth / 2 + 10
  const sigWidth = (contentWidth - 20) / 2
  
  // Client signature box
  pdf.setDrawColor(200, 200, 200)
  pdf.rect(clientSigX, yPosition, sigWidth, 40)
  
  yPosition = addText('CLIENT SIGNATURE', clientSigX + 5, yPosition + 8, sigWidth - 10, 10, true)
  
  if (contract.signatures.client.signed && contract.signatures.client.signature) {
    try {
      // Add signature image if it exists
      pdf.addImage(contract.signatures.client.signature, 'PNG', clientSigX + 5, yPosition + 2, sigWidth - 10, 20)
    } catch (error) {
      yPosition = addText('DIGITALLY SIGNED', clientSigX + 5, yPosition + 10, sigWidth - 10, 8)
    }
  } else {
    yPosition = addText('NOT SIGNED', clientSigX + 5, yPosition + 10, sigWidth - 10, 8)
  }
  
  const clientSignedDate = contract.signatures.client.signedAt ? new Date(contract.signatures.client.signedAt).toLocaleDateString() : 'Not signed'
  addText(`Date: ${clientSignedDate}`, clientSigX + 5, yPosition + 25, sigWidth - 10, 8)
  addText(contract.client.fullname, clientSigX + 5, yPosition + 32, sigWidth - 10, 8)
  
  // Freelancer signature box
  pdf.rect(freelancerSigX, yPosition - 25, sigWidth, 40)
  
  addText('FREELANCER SIGNATURE', freelancerSigX + 5, yPosition - 17, sigWidth - 10, 10, true)
  
  if (contract.signatures.freelancer.signed && contract.signatures.freelancer.signature) {
    try {
      // Add signature image if it exists
      pdf.addImage(contract.signatures.freelancer.signature, 'PNG', freelancerSigX + 5, yPosition - 23, sigWidth - 10, 20)
    } catch (error) {
      addText('DIGITALLY SIGNED', freelancerSigX + 5, yPosition - 15, sigWidth - 10, 8)
    }
  } else {
    addText('NOT SIGNED', freelancerSigX + 5, yPosition - 15, sigWidth - 10, 8)
  }
  
  const freelancerSignedDate = contract.signatures.freelancer.signedAt ? new Date(contract.signatures.freelancer.signedAt).toLocaleDateString() : 'Not signed'
  addText(`Date: ${freelancerSignedDate}`, freelancerSigX + 5, yPosition, sigWidth - 10, 8)
  addText(contract.freelancer.fullname, freelancerSigX + 5, yPosition + 7, sigWidth - 10, 8)
  
  yPosition += 50
  
  // Footer
  checkNewPage(30)
  yPosition = addText('This contract is legally binding when signed by both parties and funds are escrowed.', margin, yPosition, contentWidth, 8)
  yPosition = addText(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition, contentWidth, 8)
  yPosition = addText('Powered by FreelanceDAO - Decentralized Freelancing Platform', margin, yPosition, contentWidth, 8)
  
  // Save the PDF
  const fileName = `contract-${contract.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
  pdf.save(fileName)
}