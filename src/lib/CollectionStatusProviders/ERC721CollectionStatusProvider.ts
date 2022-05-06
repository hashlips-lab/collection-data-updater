import { BigNumber, Contract } from "ethers";
import CollectionStatusProviderInterface from "../CollectionStatusProviderInterface";

export default class ERC721CollectionStatusProvider implements CollectionStatusProviderInterface {
  private totalSupply: BigNumber = BigNumber.from(0);
  private tokenIds: BigNumber[] = [];
  private readonly startTokenId: BigNumber;

  public constructor(
    private contract: Contract,
    startTokenId: BigNumber|number = 1,
  ) {
    this.startTokenId = BigNumber.from(startTokenId);
  }

  public async getTokenIds(): Promise<BigNumber[]> {
    if (this.tokenIds.length === 0) {
      const maxSupply = await this.contract.maxSupply();
      
      for (let i = this.startTokenId; i.lte(maxSupply); i = i.add(1)) {
        this.tokenIds.push(i);
      }
    }

    return this.tokenIds;
  }

  public async isTokenRevealed(tokenId: BigNumber): Promise<boolean> {
    return tokenId.lte(this.totalSupply);
  }

  public async refresh(): Promise<void> {
    this.totalSupply = await this.contract.totalSupply();
  }
}
