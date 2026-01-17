I will update the `components/homepage/featured-jobs.tsx` file to improve the featured job card design.

1.  **Update `Job` Interface**: Add the `description` field to the `Job` interface so TypeScript knows about it.
2.  **Import Button**: Import the `Button` component from `@/components/ui/button`.
3.  **Refactor Card Structure**:
    *   Remove the outer `Link` wrapper to avoid invalid nested anchor tags.
    *   Make the **Job Title** clickable (linking to the job details).
    *   Add the **Job Description** (truncated to 3 lines) below the client info.
    *   Add an **Apply Now** button at the bottom of the card (also linking to the job details).

This will satisfy the requirements to show job details and an apply button within the card.