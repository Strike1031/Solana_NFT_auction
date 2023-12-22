import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, SYSVAR_RENT_PUBKEY, Transaction, RpcResponseAndContext, sendAndConfirmTransaction, SignatureResult, Signer, VersionedTransaction } from "@solana/web3.js";
import { NftFactory } from '../target/types/nft_factory'
import { expect } from 'chai';

export const airdropSol = async (
  connection: Connection,
  target: PublicKey,
  lamps: number
): Promise<void> => {
  try {
    const airdropSignature: string = await connection.requestAirdrop(target, lamps * LAMPORTS_PER_SOL);
    const latestBlockHash: {blockhash: string, lastValidBlockHeight: number} = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });
  } catch (error) {
    console.error(error);
  }
};

describe('Test Script', async() => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  
  const nftFactoryProgram = anchor.workspace.NftFactory as Program<NftFactory>

  let NFT = Keypair.generate();
  const buyer_secretKey = [160,83,200,31,56,148,63,119,135,87,143,189,185,189,194,89,19,218,165,70,43,148,249,178,165,210,87,23,148,7,62,15,97,106,117,103,91,134,18,32,109,73,8,61,238,138,234,116,44,123,93,28,170,88,63,173,115,195,77,217,217,99,36,226]
  .slice(0,32);
  let buyer = Keypair.fromSeed(Uint8Array.from(buyer_secretKey)); //fixed address for testing: 7ZGhZAPHbAmPUhu1gqgcFRhLXDu5Nvd2zJHNTixtJitR    
  // await airdropSol(provider.connection, buyer.publicKey, 4);
  const nftImageName: string = "nft1.jpg";
  it('Create NFT', async () => {
    await nftFactoryProgram.methods
      .createNft(nftImageName)
      .accounts({
        nft: NFT.publicKey,
        owner: provider.wallet.publicKey, 
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([NFT])
      .rpc()
    
    const nftData = await nftFactoryProgram.account.nftData.fetch(NFT.publicKey);
    expect(nftImageName).to.be.equal(nftData.imageUrl, "NFT image name is not same.");
  })

  it('Create Bid', async () => {
    const nftData = await nftFactoryProgram.account.nftData.fetch(NFT.publicKey);
    const oldNftBidCount: number = nftData.bids.length;
    const oldNftWalletBalance: number = await provider.connection.getBalance(NFT.publicKey);
    const oldBuyerBalance: number = await provider.connection.getBalance(buyer.publicKey);

    const bidPrice: number = 0.1;
    await nftFactoryProgram.methods
      .createBid(bidPrice)
      .accounts({
        nft: NFT.publicKey,
        authority: buyer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc()

    const newNftData = await nftFactoryProgram.account.nftData.fetch(NFT.publicKey);
    const newNftWalletBalance: number = await provider.connection.getBalance(NFT.publicKey);
    const newBuyerBalance: number = await provider.connection.getBalance(buyer.publicKey);

    expect(newNftData.bids.length).to.be.equal(oldNftBidCount + 1, "New bid is not inserted.");
    expect(oldNftWalletBalance).to.be.equal(newNftWalletBalance - bidPrice * LAMPORTS_PER_SOL, "NFT wallet's balance is not correct");
    expect(oldBuyerBalance).to.be.equal(newBuyerBalance + bidPrice * LAMPORTS_PER_SOL, "Buyer's balance is not correct");

  })
})
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, SYSVAR_RENT_PUBKEY, Transaction, RpcResponseAndContext, sendAndConfirmTransaction, SignatureResult, Signer, VersionedTransaction } from "@solana/web3.js";
import { NftFactory } from '../target/types/nft_factory'
import { expect } from 'chai';

export const airdropSol = async (
  connection: Connection,
  target: PublicKey,
  lamps: number
): Promise<void> => {
  try {
    const airdropSignature: string = await connection.requestAirdrop(target, lamps * LAMPORTS_PER_SOL);
    const latestBlockHash: {blockhash: string, lastValidBlockHeight: number} = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });
  } catch (error) {
    console.error(error);
  }
};

describe('Test Script', async() => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  
  const nftFactoryProgram = anchor.workspace.NftFactory as Program<NftFactory>

  let NFT = Keypair.generate();
  const buyer_secretKey = [160,83,200,31,56,148,63,119,135,87,143,189,185,189,194,89,19,218,165,70,43,148,249,178,165,210,87,23,148,7,62,15,97,106,117,103,91,134,18,32,109,73,8,61,238,138,234,116,44,123,93,28,170,88,63,173,115,195,77,217,217,99,36,226]
  .slice(0,32);
  let buyer = Keypair.fromSeed(Uint8Array.from(buyer_secretKey)); //fixed address for testing: 7ZGhZAPHbAmPUhu1gqgcFRhLXDu5Nvd2zJHNTixtJitR    
  // await airdropSol(provider.connection, buyer.publicKey, 4);
  const nftImageName: string = "nft1.jpg";
  it('Create NFT', async () => {
    await nftFactoryProgram.methods
      .createNft(nftImageName)
      .accounts({
        nft: NFT.publicKey,
        owner: provider.wallet.publicKey, 
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([NFT])
      .rpc()
    
    const nftData = await nftFactoryProgram.account.nftData.fetch(NFT.publicKey);
    expect(nftImageName).to.be.equal(nftData.imageUrl, "NFT image name is not same.");
  })

  it('Create Bid', async () => {
    const nftData = await nftFactoryProgram.account.nftData.fetch(NFT.publicKey);
    const oldNftBidCount: number = nftData.bids.length;
    const oldNftWalletBalance: number = await provider.connection.getBalance(NFT.publicKey);
    const oldBuyerBalance: number = await provider.connection.getBalance(buyer.publicKey);

    const bidPrice: number = 0.1;
    await nftFactoryProgram.methods
      .createBid(bidPrice)
      .accounts({
        nft: NFT.publicKey,
        authority: buyer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc()

    const newNftData = await nftFactoryProgram.account.nftData.fetch(NFT.publicKey);
    const newNftWalletBalance: number = await provider.connection.getBalance(NFT.publicKey);
    const newBuyerBalance: number = await provider.connection.getBalance(buyer.publicKey);

    expect(newNftData.bids.length).to.be.equal(oldNftBidCount + 1, "New bid is not inserted.");
    expect(oldNftWalletBalance).to.be.equal(newNftWalletBalance - bidPrice * LAMPORTS_PER_SOL, "NFT wallet's balance is not correct");
    expect(oldBuyerBalance).to.be.equal(newBuyerBalance + bidPrice * LAMPORTS_PER_SOL, "Buyer's balance is not correct");

  })
})
