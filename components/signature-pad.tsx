"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Download, Pen } from "lucide-react"

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void
  width?: number
  height?: number
  className?: string
}

export function SignaturePad({ onSignatureChange, width = 400, height = 200, className = "" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    canvas.width = width
    canvas.height = height
    
    // Set drawing styles
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }, [width, height])
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    let clientX: number
    let clientY: number
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    let clientX: number
    let clientY: number
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.lineTo(x, y)
    ctx.stroke()
    
    setHasSignature(true)
  }
  
  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Convert canvas to base64 and notify parent
    const signature = canvas.toDataURL('image/png')
    onSignatureChange(signature)
  }
  
  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas and fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    
    setHasSignature(false)
    onSignatureChange('')
  }
  
  const downloadSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return
    
    const link = document.createElement('a')
    link.download = 'signature.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Pen className="w-5 h-5" />
          Draw Your Signature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
          <canvas
            ref={canvasRef}
            className="border border-slate-200 rounded bg-white cursor-crosshair touch-none"
            style={{ width: '100%', maxWidth: `${width}px`, height: `${height}px` }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault()
              startDrawing(e)
            }}
            onTouchMove={(e) => {
              e.preventDefault()
              draw(e)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              stopDrawing()
            }}
          />
        </div>
        
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!hasSignature}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSignature}
              disabled={!hasSignature}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          
          <div className="text-sm text-slate-500">
            {hasSignature ? 'Signature captured' : 'Draw your signature above'}
          </div>
        </div>
        
        <div className="text-xs text-slate-400 text-center">
          Use your mouse or finger to draw your signature. This will be used for contract signing.
        </div>
      </CardContent>
    </Card>
  )
}