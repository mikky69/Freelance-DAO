import nodemailer from 'nodemailer'

const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || ''
const host = process.env.EMAIL_HOST || ''
const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 0
const user = process.env.EMAIL_USER || ''
const pass = process.env.EMAIL_PASS || ''

function createTransport() {
  if (host && port) {
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  }
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
}

function template({ name, role, origin }: { name: string; role: string; origin: string }) {
  const brand = 'FreelanceDAO'
  const cta = role === 'freelancer' ? `${origin}/onboarding` : role === 'client' ? `${origin}/post-job` : `${origin}/admin`
  const ctaLabel = role === 'freelancer' ? 'Complete Your Profile' : role === 'client' ? 'Post a Job' : 'Open Admin Dashboard'
  const preheader = `Welcome to ${brand}`
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${brand}</title></head><body style="margin:0;padding:0;background:#0f172a;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0b1220;border-radius:12px;overflow:hidden;margin:24px"><tr><td style="padding:32px;background:linear-gradient(135deg,#0ea5e9,#6366f1)"><h1 style="margin:0;color:#fff;font-size:24px">${brand}</h1><p style="margin:8px 0 0;color:#dbeafe;font-size:14px">${preheader}</p></td></tr><tr><td style="padding:32px"><h2 style="margin:0 0 12px;color:#e2e8f0;font-size:22px">Hi ${name || 'there'},</h2><p style="margin:0 0 16px;color:#94a3b8;line-height:1.6">Welcome to ${brand}. Your account has been created successfully. You can start exploring features tailored for ${role}.</p><ul style="margin:0 0 16px;padding-left:18px;color:#94a3b8;line-height:1.6"><li>Secure escrow payments</li><li>Milestones and contracts</li><li>Real‑time messaging and notifications</li></ul><div style="text-align:center;margin:24px 0"><a href="${cta}" style="display:inline-block;padding:12px 18px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">${ctaLabel}</a></div><p style="margin:0 0 8px;color:#94a3b8;line-height:1.6">If the button above does not work, copy and paste this link:</p><p style="margin:0;color:#38bdf8;font-size:13px;word-break:break-all"><a href="${cta}" style="color:#38bdf8;text-decoration:none">${cta}</a></p></td></tr><tr><td style="padding:20px;background:#0b1220;border-top:1px solid #1f2937"><p style="margin:0;color:#64748b;font-size:12px">You received this email because you created an account on ${brand}. If this wasn’t you, please ignore this email.</p><p style="margin:8px 0 0;color:#475569;font-size:12px">© ${new Date().getFullYear()} ${brand}</p></td></tr></table></td></tr></table></body></html>`
}

export async function sendWelcomeEmail(to: string, name: string, role: 'freelancer' | 'client' | 'admin', origin: string) {
  const transporter = createTransport()
  const subject = role === 'freelancer' ? 'Welcome to FreelanceDAO' : role === 'client' ? 'Welcome to FreelanceDAO' : 'Admin Account Created'
  const html = template({ name, role, origin })
  const text = `Welcome to FreelanceDAO. Visit ${origin} to get started.`
  await transporter.sendMail({ from: fromAddress || user, to, subject, html, text, replyTo: fromAddress || user })
}