// ============================================================================
// MAKHANIKHI SMART ESCROW PROTOCOL (Rust / Solana Anchor)
// Protocol Governance: Client Connection Fee, Platform Fee, Escrow Vault,
// and Strict 90%+ 3-Pillar Compliance Oracle Settlement.
//
// Dependencies required on host machine:
// - rustc & cargo (curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh)
// - solana CLI (sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)")
// - anchor-cli (cargo install --git https://github.com/coral-xyz/anchor avm --locked)
// ============================================================================

use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

declare_id!("MakhEscrow111111111111111111111111111111111");

#[program]
pub mod makhanikhi_escrow {
    use super::*;

    /// Initialize a new job escrow instance with defined platform fee schedules.
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        job_id: String,
        job_amount: u64,
        client_connection_fee_bps: u16, // Basis points, e.g., 500 = 5.0%
        mechanic_platform_fee_bps: u16, // Basis points, e.g., 800 = 8.0%
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        escrow.client = ctx.accounts.client.key();
        escrow.mechanic = ctx.accounts.mechanic.key();
        escrow.platform_treasury = ctx.accounts.platform_treasury.key();
        escrow.compliance_oracle = ctx.accounts.compliance_oracle.key();
        escrow.job_id = job_id;
        escrow.job_amount = job_amount;
        escrow.client_connection_fee = (job_amount * client_connection_fee_bps as u64) / 10_000;
        escrow.base_platform_fee = (job_amount * mechanic_platform_fee_bps as u64) / 10_000;
        escrow.applied_platform_fee = escrow.base_platform_fee;
        escrow.state = EscrowState::Created;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.bump = ctx.bumps.escrow_account;
        escrow.compliance_score_bps = 0; // 0 - 10,000 (0% - 100.00%)

        emit!(EscrowInitializedEvent {
            job_id: escrow.job_id.clone(),
            client: escrow.client,
            mechanic: escrow.mechanic,
            job_amount: escrow.job_amount,
            client_connection_fee: escrow.client_connection_fee,
        });

        Ok(())
    }

    /// Client deposits Job Amount + Client Connection Fee into the Escrow Vault PDA.
    pub fn deposit_client_funds(ctx: Context<DepositFunds>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.state == EscrowState::Created, EscrowError::InvalidState);

        let total_deposit = escrow.job_amount
            .checked_add(escrow.client_connection_fee)
            .ok_or(EscrowError::MathOverflow)?;

        // Transfer funds from client to Escrow PDA
        anchor_lang::solana_program::program::invoke(
            &anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.client.key(),
                &escrow.key(),
                total_deposit,
            ),
            &[
                ctx.accounts.client.to_account_info(),
                escrow.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        escrow.state = EscrowState::FundsLocked;
        escrow.locked_at = Clock::get()?.unix_timestamp;

        emit!(FundsLockedEvent {
            job_id: escrow.job_id.clone(),
            total_locked: total_deposit,
            timestamp: escrow.locked_at,
        });

        Ok(())
    }

    /// Apply Gamification Discount: Mechanics with 3 consecutive months of 5 stars +
    /// active apprentice mentorship receive a 15% discount off their platform fee.
    pub fn apply_rank_discount(
        ctx: Context<ApplyRankDiscount>,
        consecutive_5_star_months: u8,
        trains_and_compensates_apprentices: bool,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.state == EscrowState::FundsLocked, EscrowError::InvalidState);

        if consecutive_5_star_months >= 3 && trains_and_compensates_apprentices {
            // Apply 15% discount off mechanic's platform fee
            let discount = (escrow.base_platform_fee * 1500) / 10_000;
            escrow.applied_platform_fee = escrow.base_platform_fee - discount;
            escrow.rank_discount_applied = true;
        }

        Ok(())
    }

    /// Compliance Oracle submits the audit results across the 3 mandatory pillars:
    /// 1. Company Incorporation (CIPC SA or Bizee US or Global Registrar) -> Max 3,500 bps (35%)
    /// 2. Mechanic Safety (Timestamped Live Substance Test + Full PPE)     -> Max 3,500 bps (35%)
    /// 3. Site Readiness (Gazebo, 6 Sand Bottles/Cones, Specialized Box)  -> Max 3,000 bps (30%)
    /// * Disqualified tools (e.g. cooler box used as toolbox) invalidate Pillar 3!
    pub fn submit_compliance_audit(
        ctx: Context<SubmitComplianceAudit>,
        pillar1_incorporation_bps: u16,
        pillar2_safety_substance_bps: u16,
        pillar3_site_toolbox_bps: u16,
        cooler_box_disqualified: bool,
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.state == EscrowState::FundsLocked, EscrowError::InvalidState);

        // Immediate disqualification check for non-specialized tool containers
        require!(
            !cooler_box_disqualified,
            EscrowError::DisqualifiedToolboxDetected
        );

        let total_score = (pillar1_incorporation_bps as u32)
            .checked_add(pillar2_safety_substance_bps as u32)
            .and_then(|sum| sum.checked_add(pillar3_site_toolbox_bps as u32))
            .ok_or(EscrowError::MathOverflow)?;

        require!(total_score <= 10_000, EscrowError::ScoreExceedsMaximum);

        escrow.compliance_score_bps = total_score as u16;
        escrow.evidence_hash = evidence_hash;
        escrow.audited_at = Clock::get()?.unix_timestamp;

        emit!(ComplianceAuditCompletedEvent {
            job_id: escrow.job_id.clone(),
            compliance_score_bps: escrow.compliance_score_bps,
            passed_threshold: escrow.compliance_score_bps >= 9000, // 90.00%
        });

        Ok(())
    }

    /// Release Escrow:
    /// STRICT RULE: Payout to mechanic ONLY releases if compliance >= 90.00% (9,000 bps).
    /// Payout math:
    /// - Mechanic receives: (job_amount - applied_platform_fee)
    /// - Platform treasury receives: (client_connection_fee + applied_platform_fee)
    pub fn release_escrow(ctx: Context<ReleaseEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.state == EscrowState::FundsLocked, EscrowError::InvalidState);

        // CRITICAL: Compliance threshold check (>= 90%)
        require!(
            escrow.compliance_score_bps >= 9000,
            EscrowError::ComplianceBelowNinetyPercent
        );

        let mechanic_payout = escrow.job_amount
            .checked_sub(escrow.applied_platform_fee)
            .ok_or(EscrowError::MathOverflow)?;

        let total_platform_revenue = escrow.client_connection_fee
            .checked_add(escrow.applied_platform_fee)
            .ok_or(EscrowError::MathOverflow)?;

        // Disburse mechanic payout from PDA
        **escrow.to_account_info().try_borrow_mut_lamports()? -= mechanic_payout;
        **ctx.accounts.mechanic.try_borrow_mut_lamports()? += mechanic_payout;

        // Disburse platform revenue (Connection Fee + Platform Fee) to Treasury
        **escrow.to_account_info().try_borrow_mut_lamports()? -= total_platform_revenue;
        **ctx.accounts.platform_treasury.try_borrow_mut_lamports()? += total_platform_revenue;

        escrow.state = EscrowState::Completed;
        escrow.settled_at = Clock::get()?.unix_timestamp;

        emit!(EscrowSettledEvent {
            job_id: escrow.job_id.clone(),
            mechanic_payout,
            platform_revenue: total_platform_revenue,
            compliance_score_bps: escrow.compliance_score_bps,
        });

        Ok(())
    }

    /// In case of non-compliance, breach of safety, or job cancellation,
    /// refund the client their Job Amount (modest connection fee retained for dispatch costs).
    pub fn refund_client_on_breach(ctx: Context<RefundClient>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.state == EscrowState::FundsLocked, EscrowError::InvalidState);

        // Refund job amount to client
        **escrow.to_account_info().try_borrow_mut_lamports()? -= escrow.job_amount;
        **ctx.accounts.client.try_borrow_mut_lamports()? += escrow.job_amount;

        // Platform keeps connection fee to cover dispatch & oracle audit expenses
        **escrow.to_account_info().try_borrow_mut_lamports()? -= escrow.client_connection_fee;
        **ctx.accounts.platform_treasury.try_borrow_mut_lamports()? += escrow.client_connection_fee;

        escrow.state = EscrowState::Refunded;
        escrow.settled_at = Clock::get()?.unix_timestamp;

        emit!(EscrowRefundedEvent {
            job_id: escrow.job_id.clone(),
            refunded_amount: escrow.job_amount,
        });

        Ok(())
    }
}

// ----------------------------------------------------------------------------
// ACCOUNTS & DATA STRUCTURES
// ----------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(job_id: String)]
pub struct InitializeEscrow<'info> {
    #[account(
        init,
        payer = client,
        space = 8 + 32 + 32 + 32 + 32 + 64 + 8 + 8 + 8 + 8 + 2 + 1 + 1 + 8 + 8 + 8 + 8 + 32 + 1,
        seeds = [b"makhanikhi-escrow", job_id.as_bytes()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    #[account(mut)]
    pub client: Signer<'info>,
    /// CHECK: Mechanic recipient wallet
    pub mechanic: AccountInfo<'info>,
    /// CHECK: Makhanikhi Platform Treasury wallet
    pub platform_treasury: AccountInfo<'info>,
    /// CHECK: Authorized Makhanikhi Compliance Oracle authority
    pub compliance_oracle: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositFunds<'info> {
    #[account(mut, has_one = client)]
    pub escrow_account: Account<'info, EscrowAccount>,
    #[account(mut)]
    pub client: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApplyRankDiscount<'info> {
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitComplianceAudit<'info> {
    #[account(mut, has_one = compliance_oracle)]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub compliance_oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    #[account(mut, has_one = mechanic, has_one = platform_treasury)]
    pub escrow_account: Account<'info, EscrowAccount>,
    /// CHECK: Mechanic recipient wallet
    #[account(mut)]
    pub mechanic: AccountInfo<'info>,
    /// CHECK: Makhanikhi Platform Treasury
    #[account(mut)]
    pub platform_treasury: AccountInfo<'info>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RefundClient<'info> {
    #[account(mut, has_one = client, has_one = platform_treasury)]
    pub escrow_account: Account<'info, EscrowAccount>,
    /// CHECK: Client recipient wallet
    #[account(mut)]
    pub client: AccountInfo<'info>,
    /// CHECK: Makhanikhi Platform Treasury
    #[account(mut)]
    pub platform_treasury: AccountInfo<'info>,
    pub authority: Signer<'info>,
}

#[account]
pub struct EscrowAccount {
    pub client: Pubkey,
    pub mechanic: Pubkey,
    pub platform_treasury: Pubkey,
    pub compliance_oracle: Pubkey,
    pub job_id: String,
    pub job_amount: u64,
    pub client_connection_fee: u64,
    pub base_platform_fee: u64,
    pub applied_platform_fee: u64,
    pub compliance_score_bps: u16, // 0 - 10,000 (0% - 100.00%)
    pub rank_discount_applied: bool,
    pub state: EscrowState,
    pub created_at: i64,
    pub locked_at: i64,
    pub audited_at: i64,
    pub settled_at: i64,
    pub evidence_hash: [u8; 32],
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum EscrowState {
    Created,
    FundsLocked,
    Completed,
    Refunded,
}

// ----------------------------------------------------------------------------
// EVENTS
// ----------------------------------------------------------------------------

#[event]
pub struct EscrowInitializedEvent {
    pub job_id: String,
    pub client: Pubkey,
    pub mechanic: Pubkey,
    pub job_amount: u64,
    pub client_connection_fee: u64,
}

#[event]
pub struct FundsLockedEvent {
    pub job_id: String,
    pub total_locked: u64,
    pub timestamp: i64,
}

#[event]
pub struct ComplianceAuditCompletedEvent {
    pub job_id: String,
    pub compliance_score_bps: u16,
    pub passed_threshold: bool,
}

#[event]
pub struct EscrowSettledEvent {
    pub job_id: String,
    pub mechanic_payout: u64,
    pub platform_revenue: u64,
    pub compliance_score_bps: u16,
}

#[event]
pub struct EscrowRefundedEvent {
    pub job_id: String,
    pub refunded_amount: u64,
}

// ----------------------------------------------------------------------------
// ERROR CODES
// ----------------------------------------------------------------------------

#[error_code]
pub enum EscrowError {
    #[msg("Escrow account is in an invalid state for this operation.")]
    InvalidState,
    #[msg("Calculated score exceeds 10,000 basis points.")]
    ScoreExceedsMaximum,
    #[msg("COMPLIANCE VIOLATION: Disqualified tool container detected (cooler box, bucket, or loose parts).")]
    DisqualifiedToolboxDetected,
    #[msg("PAYOUT LOCKED: Compliance score is below the mandatory 90% (9,000 bps) threshold.")]
    ComplianceBelowNinetyPercent,
    #[msg("Arithmetic overflow during fee or payout calculation.")]
    MathOverflow,
}
