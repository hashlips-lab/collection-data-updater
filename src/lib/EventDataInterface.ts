import { BigNumber } from "ethers";

export default interface EventDataInterface {
  tokenId: BigNumber;
  [key: string]: any;
}
