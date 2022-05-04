import { Contract } from 'ethers';
import CollectionStatusProviderInterface, { TokensRevealStatus } from '../CollectionStatusProviderInterface';

export default class ERC721CollectionStatusProvider implements CollectionStatusProviderInterface {
  public constructor(
    private contract: Contract,
    private startTokenId: number = 1,
  ) {
  }

  public async getTokensRevealStatus(): Promise<TokensRevealStatus[]> {
    const tokensRevealStatus: TokensRevealStatus[] = [];
    const totalSupply = await this.getTotalSupply();

    for (const tokenId of await this.getAllTokenIds()) {
      tokensRevealStatus.push({
        tokenId,
        isRevealed: tokenId <= totalSupply,
      });
    }

    return tokensRevealStatus;
  }

  private async getAllTokenIds(): Promise<number[]> {
    return [...Array(await this.getMaxSupply()).keys()].map(i => i + this.startTokenId);
  }

  private async getTotalSupply(): Promise<number> {
    return await (await this.contract.totalSupply()).toNumber();
  }

  private async getMaxSupply(): Promise<number> {
    return await (await this.contract.maxSupply()).toNumber();
  }
}
