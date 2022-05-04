import CollectionStatusProviderInterface, { TokensRevealStatus } from '../CollectionStatusProviderInterface';

export default class TestingCollectionStatusProvider implements CollectionStatusProviderInterface {
  public constructor(
    private totalSupply: number = 1990,
    private maxSupply: number = 10000,
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
    return this.totalSupply;
  }

  private async getMaxSupply(): Promise<number> {
    return this.maxSupply;
  }
}
