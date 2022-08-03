import DataUpdaterInterface from "./lib/DataUpdaterInterface";
import RuntimeInterface from "./lib/RuntimeInterface";
import CollectionStatusProviderInterface from "./lib/CollectionStatusProviderInterface";
import EventDataInterface from "./lib/EventDataInterface";

export const EVENT_DATA_IS_FULL_UPDATE = "__isFullUpdate";

export const isFullUpdate = (eventData: EventDataInterface): boolean|undefined => {
  return eventData[EVENT_DATA_IS_FULL_UPDATE];
};

export default class CollectionDataUpdater {
  public constructor (
    private collectionStatusProvider: CollectionStatusProviderInterface,
    private dataRevealers: DataUpdaterInterface[],
    private runtimes: RuntimeInterface[],
  ) {
  }

  public async updateSingleToken(eventData: EventDataInterface): Promise<void> {
    let processedEventData: EventDataInterface = await this.collectionStatusProvider.processEventDataBeforeUpdate(eventData);

    for (const dataRevealer of this.dataRevealers) {
      processedEventData = await dataRevealer.updateToken(processedEventData);
    }
  }

  public async updateAllTokens(partialEventData: { [key: string]: any } = {}): Promise<void> {
    partialEventData[EVENT_DATA_IS_FULL_UPDATE] = true;

    for (const tokenId of await this.collectionStatusProvider.getTokenIds()) {
      const eventData = { tokenId, ...partialEventData };
      
      await this.updateSingleToken(eventData);
    }
  }

  public async start(): Promise<void> {
    if (this.runtimes.length === 0) {
      console.log("No runtime available, waiting for direct calls...");

      return;
    }

    for (const runtime of this.runtimes) {
      runtime.run(this);
    }
  }
}
