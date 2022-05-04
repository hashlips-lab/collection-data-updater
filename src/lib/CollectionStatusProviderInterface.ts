import { BigNumber } from 'ethers';

export default interface CollectionStatusProviderInterface {
  getTokenIds: () => Promise<BigNumber[]>;
  isTokenRevealed: (tokenId: BigNumber) => Promise<boolean>;
  refresh: () => Promise<void>;
}
