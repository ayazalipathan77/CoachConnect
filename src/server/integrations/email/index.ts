import { config } from "@/server/config";

/** Transactional email port (BRD §7.1, §11 — SendGrid/Postmark). */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<{ id: string }>;
}

/** Dev provider: logs to the server console instead of sending. */
class MockEmailProvider implements EmailProvider {
  readonly name = "mock";
  async send(message: EmailMessage) {
    console.info(
      `[email:mock] → ${message.to} | ${message.subject}`,
    );
    return { id: `mock_${Date.now()}` };
  }
}

// Real provider (Postmark/SendGrid) is wired here when keys are provided.
// class PostmarkEmailProvider implements EmailProvider { ... }

export function createEmailProvider(): EmailProvider {
  switch (config.INTEGRATION_EMAIL) {
    case "real":
      // return new PostmarkEmailProvider();
      return new MockEmailProvider();
    default:
      return new MockEmailProvider();
  }
}
