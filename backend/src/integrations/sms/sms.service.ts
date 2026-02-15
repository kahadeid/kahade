import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";

import axios from "axios";

// ============================================================================
// SMS SERVICE
// Multi-provider SMS service supporting various Indonesian SMS gateways
// ============================================================================

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

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly config: SmsConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      provider: this.configService.get<string>(
        "sms.provider",
        "mock",
      ) as SmsConfig["provider"],
      apiKey: this.configService.get<string>("sms.apiKey"),
      apiSecret: this.configService.get<string>("sms.apiSecret"),
      senderId: this.configService.get<string>("sms.senderId", "KAHADE"),
      baseUrl: this.configService.get<string>("sms.baseUrl"),
    };
  }

  /**
   * Send SMS to a phone number
   */
  async sendSms(phoneNumber: string, message: string): Promise<SmsResult> {
    try {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    this.logger.log(`Sending SMS to ${this.maskPhoneNumber(normalizedPhone)}`);

    try {
      switch (this.config.provider) {
        case "twilio":
          return this.sendViaTwilio(normalizedPhone, message);
        case "nexmo":
          return this.sendViaNexmo(normalizedPhone, message);
        case "zenziva":
          return this.sendViaZenziva(normalizedPhone, message);
        case "wavecell":
          return this.sendViaWavecell(normalizedPhone, message);
        case "infobip":
          return this.sendViaInfobip(normalizedPhone, message);
        case "mock":
        default:
          return this.sendViaMock(normalizedPhone, message);
      }
    } catch (error: unknown) {
      this.logger.error(`SMS send failed: ${(error as Error).message}`);
      return {
        success: false,
        provider: this.config.provider,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send OTP SMS
   */
  async sendOtp(phoneNumber: string, otp: string): Promise<SmsResult> {
    try {
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    const message = `Kode verifikasi Kahade Anda adalah: ${otp}. Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.`;
    return this.sendSms(phoneNumber, message);
  }

  /**
   * Send transaction notification SMS
   */
  async sendTransactionNotification(
    phoneNumber: string,
    transactionId: string,
    status: string,
    amount: number,
  ): Promise<SmsResult> {
    const formattedAmount = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

    const message = `[Kahade] Transaksi ${transactionId} ${status}. Nominal: ${formattedAmount}. Cek aplikasi untuk detail.`;
    return this.sendSms(phoneNumber, message);
  }

  // ============================================================================
  // PROVIDER IMPLEMENTATIONS
  // ============================================================================

  /**
   * Send via Twilio
   */
  private async sendViaTwilio(
    phoneNumber: string,
    message: string,
  ): Promise<SmsResult> {
    const accountSid = this.config.apiKey;
    const authToken = this.config.apiSecret;
    const fromNumber = this.config.senderId;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Twilio credentials not configured");
    }

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        To: phoneNumber,
        From: fromNumber,
        Body: message,
      }),
      {
        auth: {
          username: accountSid,
          password: authToken,
        },
      },
    );

    return {
      success: true,
      messageId: response.data.sid,
      provider: "twilio",
    };
  }

  /**
   * Send via Nexmo (Vonage)
   */
  private async sendViaNexmo(
    phoneNumber: string,
    message: string,
  ): Promise<SmsResult> {
    const apiKey = this.config.apiKey;
    const apiSecret = this.config.apiSecret;
    const from = this.config.senderId;

    if (!apiKey || !apiSecret) {
      throw new Error("Nexmo credentials not configured");
    }

    const response = await axios.post("https://rest.nexmo.com/sms/json", {
      api_key: apiKey,
      api_secret: apiSecret,
      to: phoneNumber.replace("+", ""),
      from: from,
      text: message,
    });

    const result = response.data.messages?.[0];
    if (result?.status === "0") {
      return {
        success: true,
        messageId: result["message-id"],
        provider: "nexmo",
      };
    }

    throw new Error(result?.["error-text"] || "Nexmo send failed");
  }

  /**
   * Send via Zenziva (Indonesian provider)
   */
  private async sendViaZenziva(
    phoneNumber: string,
    message: string,
  ): Promise<SmsResult> {
    const userKey = this.config.apiKey;
    const passKey = this.config.apiSecret;
    const baseUrl =
      this.config.baseUrl || "https://console.zenziva.net/wareguler/api";

    if (!userKey || !passKey) {
      throw new Error("Zenziva credentials not configured");
    }

    const response = await axios.post(`${baseUrl}/sendWA/`, null, {
      params: {
        userkey: userKey,
        passkey: passKey,
        to: phoneNumber.replace("+62", "0"),
        message: message,
      },
    });

    if (response.data.status === "1") {
      return {
        success: true,
        messageId: response.data.messageId,
        provider: "zenziva",
      };
    }

    throw new Error(response.data.text || "Zenziva send failed");
  }

  /**
   * Send via Wavecell
   */
  private async sendViaWavecell(
    phoneNumber: string,
    message: string,
  ): Promise<SmsResult> {
    const apiKey = this.config.apiKey;
    const subAccountId = this.config.apiSecret;
    const source = this.config.senderId;

    if (!apiKey || !subAccountId) {
      throw new Error("Wavecell credentials not configured");
    }

    const response = await axios.post(
      `https://api.wavecell.com/sms/v1/${subAccountId}/single`,
      {
        source: source,
        destination: phoneNumber,
        text: message,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      messageId: response.data.umid,
      provider: "wavecell",
    };
  }

  /**
   * Send via Infobip
   */
  private async sendViaInfobip(
    phoneNumber: string,
    message: string,
  ): Promise<SmsResult> {
    const apiKey = this.config.apiKey;
    const baseUrl = this.config.baseUrl || "https://api.infobip.com";
    const from = this.config.senderId;

    if (!apiKey) {
      throw new Error("Infobip credentials not configured");
    }

    const response = await axios.post(
      `${baseUrl}/sms/2/text/advanced`,
      {
        messages: [
          {
            destinations: [{ to: phoneNumber }],
            from: from,
            text: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `App ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = response.data.messages?.[0];
    return {
      success: true,
      messageId: result?.messageId,
      provider: "infobip",
    };
  }

  /**
   * Mock SMS provider for development/testing
   */
  private async sendViaMock(
    phoneNumber: string,
    message: string,
  ): Promise<SmsResult> {
    this.logger.log(`[MOCK SMS] To: ${phoneNumber}`);
    this.logger.log(`[MOCK SMS] Message: ${message}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: "mock",
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Normalize phone number to international format
   */
  private _normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, "");

    // Handle Indonesian numbers
    if (normalized.startsWith("0")) {
      normalized = "+62" + normalized.substring(1);
    } else if (normalized.startsWith("62") && !normalized.startsWith("+")) {
      normalized = "+" + normalized;
    } else if (!normalized.startsWith("+")) {
      normalized = "+" + normalized;
    }

    return normalized;
  }

  /**
   * Mask phone number for logging
   */
  private _maskPhoneNumber(phone: string): string {
    if (phone.length <= 6) return "***";
    return phone.substring(0, 4) + "****" + phone.substring(phone.length - 4);
  }
}
