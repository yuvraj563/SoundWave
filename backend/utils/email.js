const nodemailer = require('nodemailer')

/**
 * Create a reusable Nodemailer transporter.
 * Falls back to console logging if SMTP is not configured.
 */
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null // SMTP not configured — will log to console
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

/**
 * Send a password reset OTP email.
 * @param {string} email - Recipient email
 * @param {string} otp - The 6-digit OTP (plain text)
 * @param {string} userName - User's display name
 */
const sendResetOTP = async (email, otp, userName = 'there') => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background:#0a0a14; font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a14; padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:rgba(15,15,31,0.95); border:1px solid rgba(124,58,237,0.3); border-radius:24px; overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding:40px 40px 24px; text-align:center;">
                  <div style="width:56px; height:56px; border-radius:16px; background:linear-gradient(135deg,#7c3aed,#ec4899); display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
                    <span style="font-size:28px;">🎵</span>
                  </div>
                  <h1 style="color:#f0f0ff; font-size:24px; font-weight:800; margin:0 0 8px;">
                    Password Reset
                  </h1>
                  <p style="color:#9898b8; font-size:14px; margin:0;">
                    Hey ${userName}, we received a request to reset your password.
                  </p>
                </td>
              </tr>

              <!-- OTP Box -->
              <tr>
                <td style="padding:0 40px 24px; text-align:center;">
                  <div style="background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.3); border-radius:16px; padding:24px;">
                    <p style="color:#9898b8; font-size:13px; margin:0 0 12px; text-transform:uppercase; letter-spacing:2px;">
                      Your verification code
                    </p>
                    <div style="font-size:36px; font-weight:900; letter-spacing:12px; color:#f0f0ff; font-family:'Courier New',monospace;">
                      ${otp}
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Info -->
              <tr>
                <td style="padding:0 40px 40px; text-align:center;">
                  <p style="color:#5a5a7a; font-size:13px; margin:0 0 8px;">
                    ⏱️ This code expires in <strong style="color:#9898b8;">10 minutes</strong>.
                  </p>
                  <p style="color:#5a5a7a; font-size:13px; margin:0;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px; border-top:1px solid rgba(255,255,255,0.06); text-align:center;">
                  <p style="color:#5a5a7a; font-size:12px; margin:0;">
                    © ${new Date().getFullYear()} SoundWave — Your music, your way.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const transporter = createTransporter()

  if (!transporter) {
    // Fallback: log to console in development
    console.log('\n══════════════════════════════════════════════')
    console.log('📧 PASSWORD RESET OTP (SMTP not configured)')
    console.log(`   Email: ${email}`)
    console.log(`   OTP:   ${otp}`)
    console.log(`   Expires in 10 minutes`)
    console.log('══════════════════════════════════════════════\n')
    return
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"SoundWave" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🔐 SoundWave — Password Reset Code',
    html: htmlContent,
  })
}

module.exports = { sendResetOTP }
