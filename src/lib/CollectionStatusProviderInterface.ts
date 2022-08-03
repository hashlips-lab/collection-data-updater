import { BigNumber } from "ethers";
import EventDataInterface from "./EventDataInterface";

export default interface CollectionStatusProviderInterface {
  getTokenIds: () => Promise<BigNumber[]>;
  processEventDataBeforeUpdate: (eventData: EventDataInterface) => Promise<EventDataInterface>;
}
