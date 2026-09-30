# Makhanikhi Blockchain Smart Escrow (Rust / Solana Anchor)

## Prerequisites & Dependencies (from video setup)
As shown in the setup instructions:
1. **Rust & Cargo**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   rustc --version
   ```
2. **Solana Tool Suite**:
   ```bash
   sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   solana --version
   ```
3. **Anchor Framework**:
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   anchor --version
   ```

## Protocol Architecture & Governance
- **Client Connection Fee**: 5% of job total, deposited alongside job amount into the program's Program Derived Address (PDA) vault.
- **Mechanic Platform Fee**: 8% base fee, deducted upon payout disbursement.
- **Ranking Discount**: 15% discount applied to the platform fee (reducing fee to 6.8%) for mechanics with 3 consecutive months of 5 stars who train and fairly compensate apprentices.
- **The 3-Pillar Compliance Oracle (>= 90% Required for Payout)**:
  1. **Company Incorporation (35%)**:
     - South Africa: CIPC Registration (CoR 14.3) + Proof of Annual Returns submission.
     - United States: Secretary of State Articles of Organization (e.g. via Bizee/Incfile) + Annual report.
     - Global: Official national business registrar credentials.
  2. **Mechanic Safety & Readiness (35%)**:
     - Proof of Live Substance Test: Live timestamped video/photo scan (breathalyzer / drug strip).
     - Full PPE: Steel-toe boots, flame-retardant overalls, safety eye goggles, heavy nitrile mechanic gloves.
  3. **Site Readiness & Specialized Toolset (30%)**:
     - Branded Makhanikhi Gazebo / Shelter.
     - Site Demarcation: 6 branded sand bottles or road cones + high-visibility danger tape perimeter.
     - Specialized Mechanic Toolbox Scanner: AI / OCR parsed.
     - **Disqualification Rule**: Any non-specialized container (cooler box, cardboard carton, paint bucket) triggers an immediate automatic disqualification (`DisqualifiedToolboxDetected`).
- **Release Condition**:
  - If `compliance_score_bps >= 9000` (90.00%): Payout executes smoothly.
  - If `compliance_score_bps < 9000`: Payout is hard-locked on-chain (`ComplianceBelowNinetyPercent`).

## Compile & Deploy
```bash
# Build the smart contract binary
anchor build

# Run local validator test
anchor test

# Deploy to Solana Devnet or Localnet
anchor deploy --provider.cluster devnet
```
