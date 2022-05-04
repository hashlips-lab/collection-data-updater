import DataUpdaterInterface from './lib/DataUpdaterInterface';
import RuntimeInterface from './lib/RuntimeInterface';
import CollectionStatusProviderInterface from './lib/CollectionStatusProviderInterface';

export default class CollectionDataUpdater {
  public constructor (
    private tokenRevealStatusProvider: CollectionStatusProviderInterface,
    private dataRevealers: DataUpdaterInterface[],
    private runtimes: RuntimeInterface[],
  ) {
  }

  public async updateSingle(tokenId: number, isRevealed: boolean): Promise<void> {
    for (const dataRevealer of this.dataRevealers) {
      await dataRevealer.updateToken(tokenId, isRevealed);
    }
  }

  public async updateAll(): Promise<void> {
    const tokensRevealStatus = await this.tokenRevealStatusProvider.getTokensRevealStatus();

    for (const tokenRevealStatus of tokensRevealStatus) {
      await this.updateSingle(tokenRevealStatus.tokenId, tokenRevealStatus.isRevealed);
    }
  }

  public async start(): Promise<void> {
    if (this.runtimes.length === 0) {
      console.log('No runtime available, waiting for direct calls...');

      return;
    }

    for (const runtime of this.runtimes) {
      runtime.run(this);
    }
  }
}
