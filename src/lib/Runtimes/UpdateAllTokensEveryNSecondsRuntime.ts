import CollectionDataUpdater from '../../CollectionDataUpdater';
import RuntimeInterface from '../RuntimeInterface';

export default class UpdateAllTokensEveryNSecondsRuntime implements RuntimeInterface {
  public constructor(
    private delay: number,
  ) {
  }

  public async run(collectionDataUpdater: CollectionDataUpdater): Promise<void> {
    await collectionDataUpdater.updateAll();

    setTimeout(
      () => this.run(collectionDataUpdater),
      this.delay * 1000,
    );

    console.log(`Next full update will be run in ${this.delay} seconds...`);
  }
}
