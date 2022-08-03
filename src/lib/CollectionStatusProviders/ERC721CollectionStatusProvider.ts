import { BigNumber, Contract } from "ethers";
import CollectionStatusProviderInterface from "../CollectionStatusProviderInterface";
import EventDataInterface from "../EventDataInterface";
import { isFullUpdate } from "../../CollectionDataUpdater";
import { isNewMint } from "../Runtimes/UpdateTokenOnMintRuntime";

export const EVENT_DATA_IS_REVEALED = "__isRevealed";

export const isRevealed = (eventData: EventDataInterface): boolean|undefined => {
  return eventData[EVENT_DATA_IS_REVEALED];
};

export const EVENT_DATA_FORCED_COLLECTION_STATUS_REFRESH = "__forcedCollectionStatusRefresh";

export const forcedCollectionStatusRefresh = (eventData: EventDataInterface): boolean|undefined => {
  return eventData[EVENT_DATA_FORCED_COLLECTION_STATUS_REFRESH];
};

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

  public async processEventDataBeforeUpdate(eventData: EventDataInterface): Promise<EventDataInterface> {
    if (isNewMint(eventData) === true) {
      if (eventData.tokenId.gt(this.totalSupply)) {
        this.totalSupply = eventData.tokenId;
      }

      return { [EVENT_DATA_IS_REVEALED]: true, ...eventData }
    }

    if (forcedCollectionStatusRefresh(eventData) === true || (isFullUpdate(eventData) === true && eventData.tokenId.eq(this.startTokenId))) {
      this.totalSupply = await this.contract.totalSupply();
    }

    return { [EVENT_DATA_IS_REVEALED]: eventData.tokenId.lte(this.totalSupply), ...eventData }
  }
}
