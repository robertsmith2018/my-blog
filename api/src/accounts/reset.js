import crypto from "crypto"
const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env

function createResetToken(email, expTimestamp) {
  try {
    // Auth String, JWT Signature, email
    const authString = `${JWT_SIGNATURE}:${email}:${expTimestamp}`
    return crypto.createHash("sha256").update(authString).digest("hex")
  } catch (e) {
    console.log("e", e)
  }
}

function validateExpTimestamp(expTimestamp) {
  // One day in milliseconds
  const expTime = 24 * 60 * 60 * 1000
  // Difference between now and expired time
  const dateDiff = Number(expTimestamp) - Date.now()
  // We're expired if not in past OR difference in time is less than allowed
  const isValid = dateDiff > 0 && dateDiff < expTime
  return isValid
}

export async function createResetEmailLink(email) {
  try {
    // Encode url string
    const URIencodedEmail = encodeURIComponent(email)
    // create timestamp
    const expTimestamp = Date.now() + 24 * 60 * 60 * 1000
    // Create token
    const token = createResetToken(email, expTimestamp)

    // Link email contains user email, token, expiration date
    return `https://${ROOT_DOMAIN}:8443/reset/${URIencodedEmail}/${expTimestamp}/${token}`
  } catch (e) {
    console.log("e", e)
  }
}

export async function createResetLink(email) {
  try {
    const { user } = await import("../user/user.js")
    // Check to see if a user exists with that email
    const foundUser = await user.findOne({
      "email.address": email,
    })
    console.log("foundUser", foundUser)
    // If user exists
    if (foundUser) {
      // Create email link
      const link = await createResetEmailLink(email)
      return link
    }
    return ""
  } catch (e) {
    console.log("e", e)
    return false
  }
}

export async function validateResetEmail(token, email, expTimestamp) {
  try {
    // Create a hash aka token
    const resetToken = createResetToken(email, expTimestamp)

    // Compare hash with token
    const isValid = resetToken === token

    // Time is not expired
    const isTimestampValid = validateExpTimestamp(expTimestamp)
    console.log("isTimestampValid", isTimestampValid)
    return isValid && isTimestampValid
  } catch (e) {
    console.log("e", e)
    return false
  }
}
