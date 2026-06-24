import Groq from 'groq-sdk'

const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY })

// Predicts if a blood type will run critical within 48hrs
// based on current stock and 7-day usage history
export const predictShortage = (bloodType, currentStock, usageHistory) => {
  const recentUsage = usageHistory
    .filter((h) => h.bloodType === bloodType)
    .slice(-7)

  if (recentUsage.length === 0) return { critical: false, daysLeft: null }

  const avgDailyUsage = recentUsage.reduce((sum, h) => sum + h.unitsUsed, 0) / recentUsage.length
  if (avgDailyUsage === 0) return { critical: false, daysLeft: null }

  const daysLeft = currentStock / avgDailyUsage
  return {
    critical: daysLeft < 2,
    daysLeft: Math.round(daysLeft * 10) / 10
  }
}

// Generates a personalized urgent donor notification using Groq (Llama 3)
export const generateDonorAlert = async ({ donorName, bloodType, bankName, bankAddress, daysSinceLastDonation }) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: 'You write short, warm, urgent blood donation alerts. Max 2 sentences. Never alarming, always respectful.'
        },
        {
          role: 'user',
          content: `Write a donation alert for ${donorName} who has ${bloodType} blood.
            Bank: ${bankName} at ${bankAddress} is critically low.
            They last donated ${daysSinceLastDonation} days ago.
            Make it personal and urgent but not scary.`
        }
      ]
    })
    return completion.choices[0].message.content.trim()
  } catch (error) {
    // Fallback message if Groq call fails
    return `Hi ${donorName}, ${bankName} urgently needs ${bloodType} blood. Your donation could save lives today.`
  }
}