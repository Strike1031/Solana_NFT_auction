import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { NftFactory } from '../target/types/nft_factory'

describe('nft_factory', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)


  const nftFactoryProgram = anchor.workspace.nftFactory as Program<NftFactory>
})
