use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

declare_id!("4vx3swKUwrx7T6NRKXkQfWjVJmAfjUsbsJdLj1GsoPY9");

#[program]
pub mod nft_factory {
    use super::*;

    pub fn create_nft(ctx: Context<CreateNft>, image_url: String) -> Result<()> {
        let nft = &mut ctx.accounts.nft;

        nft.image_url = image_url;
        nft.bids = Vec::new();
        nft.bids_size = 0;

        Ok(())
    }

    pub fn create_bid(ctx: Context<CreateBid>, quantity: f64) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        let bidder = &mut ctx.accounts.authority;
        let bids_size = nft.bids_size;

        if bids_size > 0 && quantity <= nft.bids.last_mut().unwrap().quantity {
            return err!(MyError::InvalidPrice);
        }

        // Create the transfer instruction
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            bidder.key,
            &nft.key(),
            (quantity * 1000000000.0) as u64,
        );

        // Invoke the transfer instruction
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                bidder.to_account_info(),
                nft.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let clock = Clock::get()?;
        nft.bids.push(Bid {
            index: bids_size + 1,
            bidder: bidder.key(),
            quantity,
            datetime: clock.unix_timestamp,
        });

        nft.bids_size += 1;

        Ok(())
    }

}

#[derive(Accounts)]
pub struct CreateNft<'info> {
    #[account(
        init,
        payer = owner,
        space = 2000
    )]
    pub nft: Account<'info, NftData>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateBid<'info> {
    #[account(mut)]
    pub nft: Account<'info, NftData>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NftData {
    image_url: String,
    bids: Vec<Bid>,
    bids_size: u32,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Bid {
    index: u32,
    bidder: Pubkey,
    quantity: f64,
    datetime: i64,
}

#[error_code]
pub enum MyError {
    #[msg("Price should be bigger than the last bid")]
    InvalidPrice,
}
