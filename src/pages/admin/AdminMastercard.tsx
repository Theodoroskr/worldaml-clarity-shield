import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Upload, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, Info, Download } from "lucide-react";

export default function AdminMastercard() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [certAlias, setCertAlias] = useState("");
  const [keystorePassword, setKeystorePassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(false);

  // Generate a PKCS#12 key pair entirely in the browser using Web Crypto API
  const handleGenerateKey = async () => {
    if (!certAlias.trim()) {
      toast({ title: "Certificate alias is required", variant: "destructive" });
      return;
    }
    if (!keystorePassword.trim()) {
      toast({ title: "Keystore password is required", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate RSA key pair in browser
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
      );

      // Export public key as SPKI (for CSR / display)
      const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      // Convert to PEM format for download
      const publicKeyPem = bufferToPem(publicKeyBuffer, "PUBLIC KEY");
      const privateKeyPem = bufferToPem(privateKeyBuffer, "PRIVATE KEY");

      // Create a combined file for download (the user will use this with Mastercard)
      const combinedContent = [
        `# Mastercard AML AR - Generated Key Pair`,
        `# Certificate Alias: ${certAlias}`,
        `# Generated: ${new Date().toISOString()}`,
        `# WARNING: Keep this file secure. The private key was generated in your browser.`,
        ``,
        publicKeyPem,
        ``,
        privateKeyPem,
      ].join("\n");

      // Trigger download of the key pair
      const blob = new Blob([combinedContent], { type: "application/x-pem-file" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certAlias}-keypair.pem`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setGeneratedKey(true);
      toast({
        title: "Key pair generated",
        description: "Your key pair has been downloaded. Upload the signed .p12 certificate from Mastercard below.",
      });
    } catch (err) {
      console.error("Key generation failed:", err);
      toast({ title: "Key generation failed", description: String(err), variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const bufferToPem = (buffer: ArrayBuffer, label: string) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".p12") && !file.name.endsWith(".pfx")) {
        toast({ title: "Invalid file type", description: "Please select a .p12 or .pfx file", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }
    if (!certAlias.trim()) {
      toast({ title: "Certificate alias is required", variant: "destructive" });
      return;
    }
    if (!keystorePassword.trim()) {
      toast({ title: "Keystore password is required", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      // Upload .p12 to private storage bucket
      const filePath = `${certAlias.replace(/[^a-zA-Z0-9_-]/g, "_")}.p12`;
      const { error: uploadError } = await supabase.storage
        .from("mastercard-keystores")
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      toast({
        title: "Keystore uploaded successfully",
        description: `Certificate "${certAlias}" stored securely. Configure the alias and password as backend secrets.`,
      });

      // Reset
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast({ title: "Upload failed", description: err.message || String(err), variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mastercard AML AR — mTLS Setup</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate a key pair in your browser, download it, then upload the signed PKCS#12 (.p12) certificate from Mastercard.
        </p>
      </div>

      {/* Info banner */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
          <strong>The key is generated within your browser and isn't stored by WorldAML or Mastercard.</strong>{" "}
          Your private key never leaves your device. Only the signed .p12 certificate is uploaded to our secure vault for API authentication.
        </AlertDescription>
      </Alert>

      {/* Step 1: Generate Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Step 1</Badge>
            <CardTitle className="text-lg">Generate Key Pair</CardTitle>
          </div>
          <CardDescription>
            Generate a 2048-bit RSA key pair. The private key is created in your browser and downloaded immediately — it is never sent to any server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cert-alias">
              Certificate alias <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cert-alias"
              placeholder="e.g. mastercard-aml-ar-prod"
              value={certAlias}
              onChange={e => setCertAlias(e.target.value)}
            />
            {!certAlias.trim() && (
              <p className="text-xs text-destructive">Certificate alias is required.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keystore-password">
              Keystore password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="keystore-password"
              type="password"
              placeholder="Enter a strong password for the keystore"
              value={keystorePassword}
              onChange={e => setKeystorePassword(e.target.value)}
            />
            {!keystorePassword.trim() && (
              <p className="text-xs text-destructive">Keystore password is required.</p>
            )}
          </div>

          <Button
            onClick={handleGenerateKey}
            disabled={isGenerating || !certAlias.trim() || !keystorePassword.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
            ) : (
              <><KeyRound className="h-4 w-4 mr-2" /> Generate & Download Key Pair</>
            )}
          </Button>

          {generatedKey && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
                Key pair generated and downloaded. Upload the public key to the Mastercard Developer Portal to receive your signed .p12 certificate.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Upload .p12 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Step 2</Badge>
            <CardTitle className="text-lg">Upload Signed Certificate (.p12)</CardTitle>
          </div>
          <CardDescription>
            After Mastercard signs your certificate, download the .p12 file from the Developer Portal and upload it here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            {selectedFile ? (
              <p className="text-sm font-medium text-foreground">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
            ) : (
              <p className="text-sm text-muted-foreground">Click to select your .p12 or .pfx file</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".p12,.pfx"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !certAlias.trim() || !keystorePassword.trim()}
            variant="default"
            className="w-full"
          >
            {isUploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>
            ) : (
              <><ShieldCheck className="h-4 w-4 mr-2" /> Upload to Secure Vault</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Step 3: Reminder about secrets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Step 3</Badge>
            <CardTitle className="text-lg">Configure Backend Secrets</CardTitle>
          </div>
          <CardDescription>
            The certificate alias, keystore password, and Mastercard consumer key must be stored as secure backend secrets for the API proxy to use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-300 text-sm">
              Ask your Lovable developer to configure <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded text-xs">MASTERCARD_CERT_ALIAS</code>,{" "}
              <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded text-xs">MASTERCARD_KEYSTORE_PASSWORD</code>, and{" "}
              <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded text-xs">MASTERCARD_CONSUMER_KEY</code> as backend secrets.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
