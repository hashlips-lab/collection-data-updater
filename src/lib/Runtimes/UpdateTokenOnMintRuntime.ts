import { BigNumber, ethers } from "ethers";
import CollectionDataUpdater from "../../CollectionDataUpdater";
import ERC721Contract from "../Util/Contracts/ERC721Contract";
import RuntimeInterface from "../RuntimeInterface";

export default class UpdateTokenOnMintRuntime implements RuntimeInterface {
  public constructor(
    private contract: ERC721Contract,
    private reactionDelay: number,
    private fromAddress: string = ethers.utils.getAddress("0x0000000000000000000000000000000000000000"),
  ) {
  }

  public async run(collectionDataUpdater: CollectionDataUpdater): Promise<void> {
    this.contract.on(
      this.contract.filters.Transfer(this.fromAddress),
      async (from: string, to: string, tokenId: BigNumber) => {
        console.log(`Token #${tokenId} was minted by ${to}...`);

        // A delay helps avoiding out-of-sync readings during the next steps...
        setTimeout(async () => {
          await collectionDataUpdater.updateSingleToken(tokenId);
        }, this.reactionDelay);
      },
    );
  }
}
