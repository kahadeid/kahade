export interface SmsResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export interface SmsConfig {
  provider: "twilio" | "nexmo" | "zenziva" | "wavecell" | "infobip" | "mock";
  apiKey?: string;
  apiSecret?: string;
  senderId?: string;
  baseUrl?: string;
}

export interface SendSmsOptions {
  phoneNumber: string;
  message: string;
  priority?: "high" | "normal" | "low";
}
