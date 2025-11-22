'use client'

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export const PostJobActions = ({ submitJob, isSubmitting, isDraft }: any) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 pt-6">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={() => submitJob(true)}
        disabled={isSubmitting}
      >
        {isDraft && isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving Draft...
          </>
        ) : (
          'Save as Draft'
        )}
      </Button>
      <Button
        type="submit"
        className={`flex-1 bg-blue-500 hover:bg-blue-600 ${!isDraft && isSubmitting ? 'opacity-50' : ''}`}
        disabled={isSubmitting}
      >
        {!isDraft && isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Posting Job...
          </>
        ) : (
          'Post Job'
        )}
      </Button>
    </div>
  )
}