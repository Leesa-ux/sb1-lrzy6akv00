import { BrevoContact, BrevoEmailParams, BrevoSMSParams } from "./brevo-types";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = "https://api.brevo.com/v3";

if (!BREVO_API_KEY) {
  console.warn("Warning: BREVO_API_KEY is not set");
}

export async function upsertBrevoContact(contact: BrevoContact): Promise<void> {
  if (!BREVO_API_KEY) {
    console.log("Skipping Brevo contact upsert (no API key)");
    return;
  }

  const response = await fetch(`${BREVO_API_URL}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      email: contact.email,
      attributes: {
        FIRSTNAME: contact.firstName || "",
        SMS: contact.phone || "",
        ...contact.attributes,
      },
      updateEnabled: true,
    }),
  });

  if (!response.ok && response.status !== 400) {
    const error = await response.text();
    throw new Error(`Failed to upsert Brevo contact: ${error}`);
  }
}

export async function sendBrevoEmail(params: BrevoEmailParams): Promise<void> {
  if (!BREVO_API_KEY) {
    console.log("Skipping Brevo email (no API key)");
    return;
  }

  const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send Brevo email: ${error}`);
  }
}

export async function sendBrevoSMS(params: BrevoSMSParams): Promise<void> {
  if (!BREVO_API_KEY) {
    console.log("Skipping Brevo SMS (no API key)");
    return;
  }

  const response = await fetch(`${BREVO_API_URL}/transactionalSMS/sms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      type: "transactional",
      recipient: params.phone,
      content: params.message,
      sender: "Afroe",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send Brevo SMS: ${error}`);
  }
}

export async function checkEmailOpened(
  email: string,
  since: Date
): Promise<boolean> {
  if (!BREVO_API_KEY) {
    return false;
  }

  try {
    const response = await fetch(
      `${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`,
      {
        headers: {
          "api-key": BREVO_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.statistics?.opened > 0 || data.statistics?.clicked > 0;
  } catch (error) {
    console.error("Error checking email opened status:", error);
    return false;
  }
}
