/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */
import { existsSync, unlinkSync } from "node:fs";
import { $ } from "bun";

export async function decryptSecretFile(gpgFile: string, targetFile: string): Promise<boolean> {
  if (!existsSync(gpgFile)) {
    return false;
  }

  console.log(`Decrypting secrets from ${gpgFile}...`);
  try {
    const passphrase = process.env.GPG_PASSPHRASE || "";
    if (passphrase) {
      // Use passphrase if provided
      await $`gpg --quiet --batch --yes --decrypt --passphrase=${passphrase} --output ${targetFile} ${gpgFile}`;
    } else {
      // Otherwise try without (gpg-agent might handle it)
      await $`gpg --quiet --batch --yes --decrypt --output ${targetFile} ${gpgFile}`;
    }
    return true;
  } catch (error) {
    console.error(`Failed to decrypt secrets from ${gpgFile}:`, error);
    process.exit(1);
  }
}

export function cleanupSecretFile(file: string) {
  if (existsSync(file)) {
    console.log(`Cleaning up decrypted secrets: ${file}`);
    unlinkSync(file);
  }
}
