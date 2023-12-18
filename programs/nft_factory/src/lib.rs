use anchor_lang::prelude::*;


declare_id!("AvTZFahUT9JTG51LyFqHADr9CQ8yZsnh2E9WmGW4pP5r");

#[program]
pub mod nft_factory {
    use super::*;

    pub fn create_nft(
        ctx: Context<CreateNft>,
        props: NftProperties,
        starting_price: f64,
        nft_images: Vec<String>,
    ) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        let owner = &mut ctx.accounts.owner;

        nft.owner_address = *owner.key;
        nft.props = props;
        nft.starting_price = starting_price;
        nft.nft_images = nft_images;
        nft.bids = Vec::new();
        nft.bids_size = 0;

        Ok(())
    }

    pub fn create_bid(ctx: Context<CreateBid>, quantity: f64) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        let bidder = &mut ctx.accounts.authority;
        let refund_account = &mut ctx.accounts.refund_account;

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

        if let Some(last_bid) = nft.bids.last_mut() {
            if !last_bid.is_withdrawn {
                last_bid.is_withdrawn = true;

                let quantity = last_bid.quantity;

                **nft.to_account_info().try_borrow_mut_lamports()? -=
                    (quantity * 1000000000.0) as u64;
                **refund_account.to_account_info().try_borrow_mut_lamports()? +=
                    (quantity * 1000000000.0) as u64;
            }
        }

        let bids_size = nft.bids_size;

        nft.bids.push(Bid {
            index: bids_size + 1,
            bidder: bidder.key(),
            quantity: quantity,
            is_withdrawn: false,
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
    #[account
    (
        mut,
        constraint = authority.key() != nft.owner_address
    )]
    pub nft: Account<'info, NftData>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    /// CHECK:` doc comment explaining why no checks through types are necessary
    pub refund_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}


#[account]
pub struct NftData {
    owner_address: Pubkey,
    props: NftProperties,
    starting_price: f64,
    nft_images: Vec<String>,
    bids: Vec<Bid>,
    bids_size: u32,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct NftProperties {
    owner_full_name: String,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Bid {
    index: u32,
    bidder: Pubkey,
    quantity: f64,
    is_withdrawn: bool,
}
