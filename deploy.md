Terraform Setup Walkthrough
I have enhanced your Terraform configuration to support environment-specific variables and encrypted secrets using GPG.

1. Prerequisites
Before running Terraform, ensure you have the following checks:

GCP Credentials: Authenticate with gcloud auth application-default login.
State Bucket: Ensure the GCS bucket elysia-terraform-state exists.
GPG: Ensure gpg is installed on your machine.
Permissions: Your account needs permissions to create projects and assign billing.
2. Directory Structure
Configuration is now split by environment in cicd/infra/environments/:

text
cicd/infra/environments/
├── prod/
│   ├── terraform.tfvars      # Public variables
│   └── secrets.tfvars.gpg    # Encrypted secrets
├── staging/
│   ├── terraform.tfvars
│   └── secrets.tfvars.gpg
└── preview/
    ├── terraform.tfvars
    └── secrets.tfvars.gpg
3. Configuring Secrets
To set up secrets for an environment (e.g., prod):

Create a secrets.tfvars file in cicd/infra/environments/prod/ with your sensitive content:
hcl
billing_account = "YOUR_BILLING_ID"
org_id          = "YOUR_ORG_ID"
folder_id       = "YOUR_FOLDER_ID"
Encrypt it using GPG:
bash
gpg --symmetric --cipher-algo AES256 cicd/infra/environments/prod/secrets.tfvars
# Enter a passphrase when prompted
This creates secrets.tfvars.gpg.
Delete the plaintext secrets.tfvars file:
bash
rm cicd/infra/environments/prod/secrets.tfvars
4. Running Terraform
The helper script cicd/scripts/deploy.ts handles decryption automatically.

Run Plan:

bash
# If you used a passphrase for encryption:
GPG_PASSPHRASE="your-passphrase" bun cicd/scripts/deploy.ts plan prod
# If no passphrase:
bun cicd/scripts/deploy.ts plan prod
Run Apply:

bash
GPG_PASSPHRASE="your-passphrase" bun cicd/scripts/deploy.ts apply prod
5. What Changed
cicd/scripts/deploy.ts
Moved to cicd/scripts/.
Automatically decrypts secrets.tfvars.gpg to a temporary file before running Terraform.
Cleans up the plaintext secrets file after execution.
Loads variables from environments/<env>/terraform.tfvars.
cicd/infra/environments/*
Separate folders for prod, staging, and preview.
terraform.tfvars contains non-sensitive configs.
secrets.tfvars.gpg contains encrypted sensitive configs.