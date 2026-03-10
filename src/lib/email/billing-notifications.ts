import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'BigDataCorp <noreply@bigdatacorp.com>' // Update with your verified domain

export async function sendPaymentSuccessEmail(
  email: string,
  amount: number,
  planType: string,
  nextBillingDate: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Payment Successful - BigDataCorp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0069FF;">Payment Successful!</h2>
          <p>Thank you for your payment. Your subscription has been renewed.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Payment Details</h3>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Plan:</strong> ${planType.charAt(0).toUpperCase() + planType.slice(1)}</p>
            <p><strong>Next Billing Date:</strong> ${new Date(nextBillingDate).toLocaleDateString()}</p>
          </div>

          <p>You can view your invoices and manage your subscription in your dashboard.</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing"
             style="display: inline-block; background-color: #0069FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Billing Dashboard
          </a>

          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
    })

    console.log('Payment success email sent to:', email)
  } catch (error) {
    console.error('Error sending payment success email:', error)
  }
}

export async function sendPaymentFailedEmail(
  email: string,
  amount: number,
  planType: string,
  retryDate?: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Payment Failed - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">Payment Failed</h2>
          <p>We were unable to process your recent payment for your BigDataCorp subscription.</p>

          <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
            <h3>Payment Details</h3>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Plan:</strong> ${planType.charAt(0).toUpperCase() + planType.slice(1)}</p>
            ${retryDate ? `<p><strong>Next Retry:</strong> ${new Date(retryDate).toLocaleDateString()}</p>` : ''}
          </div>

          <p><strong>What happens next?</strong></p>
          <ul>
            <li>We'll automatically retry the payment in a few days</li>
            <li>Your service will continue during the retry period</li>
            <li>Please update your payment method to avoid service interruption</li>
          </ul>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing"
             style="display: inline-block; background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Update Payment Method
          </a>

          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            If you believe this is an error, please contact our support team immediately.
          </p>
        </div>
      `,
    })

    console.log('Payment failed email sent to:', email)
  } catch (error) {
    console.error('Error sending payment failed email:', error)
  }
}

export async function sendTrialEndingEmail(
  email: string,
  daysRemaining: number,
  planType: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your Trial Ends in ${daysRemaining} Days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0069FF;">Your Trial is Ending Soon</h2>
          <p>Your ${planType} plan trial will end in ${daysRemaining} days.</p>

          <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0069FF;">
            <h3>What happens next?</h3>
            <p>After your trial ends, you'll be automatically charged for the ${planType} plan unless you cancel or downgrade.</p>
          </div>

          <p><strong>Your Options:</strong></p>
          <ul>
            <li>Continue with the ${planType} plan (no action needed)</li>
            <li>Downgrade to a different plan</li>
            <li>Cancel your subscription</li>
          </ul>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing"
             style="display: inline-block; background-color: #0069FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Manage Subscription
          </a>

          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            Questions? Contact our support team anytime.
          </p>
        </div>
      `,
    })

    console.log('Trial ending email sent to:', email)
  } catch (error) {
    console.error('Error sending trial ending email:', error)
  }
}

export async function sendSubscriptionCanceledEmail(
  email: string,
  planType: string,
  endDate: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Subscription Canceled - BigDataCorp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Subscription Canceled</h2>
          <p>Your ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan subscription has been canceled.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Important Information</h3>
            <p><strong>Access Until:</strong> ${new Date(endDate).toLocaleDateString()}</p>
            <p>You'll continue to have access to your ${planType} features until ${new Date(endDate).toLocaleDateString()}.</p>
          </div>

          <p>After this date, your account will be downgraded to the Free plan.</p>

          <p><strong>We're sorry to see you go!</strong></p>
          <p>If you change your mind, you can reactivate your subscription anytime from your billing dashboard.</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing"
             style="display: inline-block; background-color: #0069FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reactivate Subscription
          </a>

          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            We'd love your feedback! Let us know how we can improve.
          </p>
        </div>
      `,
    })

    console.log('Subscription canceled email sent to:', email)
  } catch (error) {
    console.error('Error sending subscription canceled email:', error)
  }
}

export async function sendPlanUpgradeEmail(
  email: string,
  oldPlan: string,
  newPlan: string,
  amount: number
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Plan Upgraded Successfully - BigDataCorp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Plan Upgraded Successfully!</h2>
          <p>Congratulations! Your subscription has been upgraded.</p>

          <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <h3>Upgrade Details</h3>
            <p><strong>Previous Plan:</strong> ${oldPlan.charAt(0).toUpperCase() + oldPlan.slice(1)}</p>
            <p><strong>New Plan:</strong> ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}</p>
            <p><strong>Prorated Amount:</strong> $${amount.toFixed(2)}</p>
          </div>

          <p>You now have access to all ${newPlan} features!</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Explore New Features
          </a>

          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            Need help getting started? Check out our documentation or contact support.
          </p>
        </div>
      `,
    })

    console.log('Plan upgrade email sent to:', email)
  } catch (error) {
    console.error('Error sending plan upgrade email:', error)
  }
}
