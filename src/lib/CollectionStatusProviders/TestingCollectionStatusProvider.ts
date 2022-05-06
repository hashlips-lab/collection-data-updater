import { BigNumber } from "ethers";
import CollectionStatusProviderInterface from "../CollectionStatusProviderInterface";

export default class TestingCollectionStatusProvider implements CollectionStatusProviderInterface {
  private totalSupply: BigNumber;
  private maxSupply: BigNumber;
  private startTokenId: BigNumber;

  public constructor(
    totalSupply: number = 1990,
    maxSupply: number = 10000,
    startTokenId: number = 1,
  ) {
    this.totalSupply = BigNumber.from(totalSupply);
    this.maxSupply = BigNumber.from(maxSupply);
    this.startTokenId = BigNumber.from(startTokenId);
  }

  public async getTokenIds(): Promise<BigNumber[]> {
    return [...Array(this.maxSupply).keys()].map(i => this.startTokenId.add(i));
  }

  public async isTokenRevealed(tokenId: BigNumber): Promise<boolean> {
    return tokenId.lte(this.totalSupply);
  }

  public async refresh(): Promise<void> {
    // Nothing to do here...
  }
}
