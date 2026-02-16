import { SkipToContent } from '@/lib/accessibility';
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  Check,
  X,
  AlertTriangle,
  QrCode,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Monitor,
  RefreshCw,
} from "lucide-react";

interface MFAStatus {
  enabled: boolean;
  methods: {
    totp: boolean;
    sms: boolean;
    email: boolean;
    webauthn: boolean;
  };
  preferredMethod: string | null;
  backupCodesRemaining: number;
}

interface TrustedDevice {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  lastUsedAt: string;
  lastIpAddress: string | null;
  createdAt: string;
}

export default function MFASettings() {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  useEffect(() => {
    loadMFAStatus();
    loadTrustedDevices();
  }, []);

  const loadMFAStatus = async () => {
    try {
      const response = await api.get("/auth/mfa/status");
      setMfaStatus(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadTrustedDevices = async () => {
    try {
      const response = await api.get("/auth/mfa/devices");
      // Safely extract devices array
      const data = response?.data;
      let deviceList: TrustedDevice[] = [];
      if (data) {
        if (Array.isArray(data.devices)) deviceList = data.devices;
        else if (Array.isArray(data.data)) deviceList = data.data;
        else if (Array.isArray(data)) deviceList = data;
      }
      setTrustedDevices(deviceList);
    } catch (error) {
      setTrustedDevices([]);
    }
  };

  const revokeDevice = async (deviceId: string) => {
    if (!confirm("Apakah Anda yakin ingin mencabut kepercayaan perangkat ini?")) return;

    try {
      await api.delete(`/auth/mfa/devices/${deviceId}`);
      loadTrustedDevices();
    } catch (error) {
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Keamanan Akun</h1>
        <p className="text-gray-500 mt-1">
          Kelola autentikasi dua faktor dan perangkat terpercaya
        </p>
      </div>

      {/* MFA Status Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                mfaStatus?.enabled ? "bg-green-100" : "bg-yellow-100"
              }`}
            >
              <Shield
                className={`h-6 w-6 ${
                  mfaStatus?.enabled ? "text-green-600" : "text-yellow-600"
                }`}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Autentikasi Dua Faktor (2FA)
              </h2>
              <p className="text-gray-500 mt-1">
                {mfaStatus?.enabled
                  ? "Akun Anda dilindungi dengan autentikasi dua faktor"
                  : "Tambahkan lapisan keamanan ekstra ke akun Anda"}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              mfaStatus?.enabled
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {mfaStatus?.enabled ? "Aktif" : "Tidak Aktif"}
          </span>
        </div>

        {/* MFA Methods */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* TOTP */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <div>
                  <div className="font-medium">Aplikasi Authenticator</div>
                  <div className="text-sm text-gray-500">Google Authenticator, Authy</div>
                </div>
              </div>
              {mfaStatus?.methods.totp ? (
                <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
              ) : (
                <X className="h-5 w-5 text-gray-300" />
              )}
            </div>
          </div>

          {/* Email */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-500">Kode verifikasi via email</div>
                </div>
              </div>
              {mfaStatus?.methods.email ? (
                <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
              ) : (
                <X className="h-5 w-5 text-gray-300" />
              )}
            </div>
          </div>

          {/* Backup Codes */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <div>
                  <div className="font-medium">Kode Cadangan</div>
                  <div className="text-sm text-gray-500">
                    {mfaStatus?.backupCodesRemaining || 0} kode tersisa
                  </div>
                </div>
              </div>
              {(mfaStatus?.backupCodesRemaining || 0) > 0 ? (
                <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {mfaStatus?.enabled ? (
            <>
              <button
                onClick={() => setShowDisableModal(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Nonaktifkan 2FA
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                Regenerasi Kode Cadangan
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSetupModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aktifkan 2FA
            </button>
          )}
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Perangkat Terpercaya</h2>
            <p className="text-gray-500 text-sm mt-1">
              Perangkat yang tidak memerlukan verifikasi 2FA
            </p>
          </div>
          <button
            onClick={loadTrustedDevices}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        {(Array.isArray(trustedDevices) ? trustedDevices : []).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" aria-hidden="true" />
            <p>Belum ada perangkat terpercaya</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(Array.isArray(trustedDevices) ? trustedDevices : []).map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-gray-400" aria-hidden="true" />
                  <div>
                    <div className="font-medium">
                      {device.deviceName || device.browser || "Perangkat Tidak Dikenal"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {device.os} • {device.browser}
                    </div>
                    <div className="text-xs text-gray-400">
                      Terakhir digunakan:{" "}
                      {new Date(device.lastUsedAt).toLocaleDateString("id-ID")} •{" "}
                      {device.lastIpAddress}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => revokeDevice(device.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Setup Modal */}
      {showSetupModal && (
        <TOTPSetupModal
          onClose={() => setShowSetupModal(false)}
          onSuccess={() => {
            setShowSetupModal(false);
            loadMFAStatus();
          }}
        />
      )}

      {/* Disable Modal */}
      {showDisableModal && (
        <DisableMFAModal
          onClose={() => setShowDisableModal(false)}
          onSuccess={() => {
            setShowDisableModal(false);
            loadMFAStatus();
          }}
        />
      )}
    </div>
  );
}

// TOTP Setup Modal
function TOTPSetupModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"qr" | "verify" | "backup">("qr");
  const [qrCode, setQrCode] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCodes, setShowCodes] = useState(false);

  useEffect(() => {
    initSetup();
  }, []);

  const initSetup = async () => {
    try {
      setLoading(true);
      const response = await api.post("/auth/mfa/totp/setup");
      setQrCode(response.data.qrCodeDataURL);
      const codes = response.data?.backupCodes;
      setBackupCodes(Array.isArray(codes) ? codes : []);
    } catch (error) {
      setError("Gagal memulai setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async () => {
    if (verifyCode.length !== 6) {
      setError("Kode harus 6 digit");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await api.post("/auth/mfa/totp/confirm", { code: verifyCode });
      const codes = response.data?.backupCodes;
      setBackupCodes(Array.isArray(codes) ? codes : []);
      setStep("backup");
    } catch (error: unknown) {
      setError(error.response?.data?.message || "Kode tidak valid");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codes = Array.isArray(backupCodes) ? backupCodes : [];
    navigator.clipboard.writeText(codes.join("\n"));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Setup Autentikasi 2FA</h2>
        </div>

        <div className="p-6">
          {step === "qr" && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Scan QR code ini dengan aplikasi authenticator Anda
              </p>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : qrCode ? (
                <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
              ) : null}
              <button
                onClick={() => setStep("verify")}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lanjutkan
              </button>
            </div>
          )}

          {step === "verify" && (
            <div>
              <p className="text-gray-600 mb-4">
                Masukkan kode 6 digit dari aplikasi authenticator Anda
              </p>
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep("qr")}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Kembali
                </button>
                <button
                  onClick={confirmSetup}
                  disabled={loading || verifyCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Memverifikasi..." : "Verifikasi"}
                </button>
              </div>
            </div>
          )}

          {step === "backup" && (
            <div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Simpan Kode Cadangan</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Simpan kode-kode ini di tempat yang aman. Anda akan membutuhkannya jika
                      kehilangan akses ke aplikasi authenticator.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Kode Cadangan</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCodes(!showCodes)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {showCodes ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    <button
                      onClick={copyBackupCodes}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Array.isArray(backupCodes) ? backupCodes : []).map((code, index) => (
                    <code
                      key={index}
                      className="px-2 py-1 bg-white rounded text-sm font-mono text-center"
                    >
                      {showCodes ? code : "••••-••••"}
                    </code>
                  ))}
                </div>
              </div>

              <button
                onClick={onSuccess}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Selesai
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <button onClick={onClose} className="w-full text-gray-500 hover:text-gray-700">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

// Disable MFA Modal
function DisableMFAModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDisable = async () => {
    if (code.length !== 6) {
      setError("Kode harus 6 digit");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/auth/mfa/disable", { code });
      onSuccess();
    } catch (error: unknown) {
      setError(error.response?.data?.message || "Gagal menonaktifkan 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Nonaktifkan 2FA</h2>
          <p className="text-gray-500 mt-2">
            Masukkan kode dari aplikasi authenticator untuk menonaktifkan 2FA
          </p>
        </div>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleDisable}
            disabled={loading || code.length !== 6}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Menonaktifkan..." : "Nonaktifkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
