I will fix the 404 error by implementing a proper job application modal that can be used in the featured jobs section, replacing the broken link.

1.  **Create `components/jobs/ApplyJobModal.tsx`**: Extract the job application logic (form state, submission handler, validation) from `app/jobs/page.tsx` into a reusable component. This component will accept the `job` and a `trigger` button as props.
2.  **Refactor `app/jobs/page.tsx`**: Update the main jobs page to use this new `ApplyJobModal` component, ensuring consistent behavior across the app and reducing code duplication.
3.  **Update `components/homepage/featured-jobs.tsx`**: Replace the "Apply Now" link (which currently causes the 404) with the `ApplyJobModal` component, passing the job details and the "Apply Now" button as the trigger.

This will ensure that clicking "Apply Now" opens the application form as expected, instead of navigating to a non-existent page.