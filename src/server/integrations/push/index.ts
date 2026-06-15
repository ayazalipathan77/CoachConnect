import { config } from "@/server/config";

/** Push notification port (BRD §7.1 — Firebase FCM). */
export interface PushMessage {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushProvider {
  readonly name: string;
  send(message: PushMessage): Promise<void>;
}

class MockPushProvider implements PushProvider {
  readonly name = "mock";
  async send(message: PushMessage) {
    console.info(`[push:mock] → ${message.userId} | ${message.title}`);
  }
}

export function createPushProvider(): PushProvider {
  switch (config.INTEGRATION_PUSH) {
    case "real":
      // return new FcmPushProvider();
      return new MockPushProvider();
    default:
      return new MockPushProvider();
  }
}
