I have identified two critical issues causing the problems you described:

1.  **Payment Recording Failure**: The `Payment` database model restricts the `purpose` field to specific values, and `job_post_fee_featured` (used by the frontend) is not in that list. This causes the database to reject the payment record, so it's not saved.
2.  **Featured Status Race Condition**: In the frontend (`app/post-job/page.tsx`), the job submission happens immediately after payment verification, but it uses a state variable (`paymentId`) that hasn't finished updating yet. This results in the job being sent without the payment ID, causing the backend to mark it as not featured.

Here is the plan to fix these issues:

### 1. Update Payment Model (`models/Payment.ts`)
Add `job_post_fee_featured` to the allowed values in the `purpose` enum. This will ensure that payments for featured jobs are successfully recorded in the database.

### 2. Fix Job Submission Logic (`app/post-job/page.tsx`)
Modify the `processJobSubmission` function to accept an optional `paymentId` argument. Update the `handlePaymentAndSubmit` function to pass the verified payment ID directly to `processJobSubmission`, ensuring the job is correctly linked to the payment and marked as featured.
