import { BigNumber } from 'ethers';

export default interface DataUpdaterInterface {
  updateToken: (tokenId: BigNumber, isRevealed: boolean) => Promise<void>;
}
