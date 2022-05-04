import { BigNumber } from 'ethers';
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

  public async updateSingleToken(tokenId: BigNumber): Promise<void> {
    await this.tokenRevealStatusProvider.refresh();

    await this.updateSingleTokenWithoutRefreshing(tokenId);
  }

  public async updateAllTokens(): Promise<void> {
    await this.tokenRevealStatusProvider.refresh();

    for (const tokenId of await this.tokenRevealStatusProvider.getTokenIds()) {
      await this.updateSingleTokenWithoutRefreshing(tokenId);
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

  private async updateSingleTokenWithoutRefreshing(tokenId: BigNumber): Promise<void> {
    for (const dataRevealer of this.dataRevealers) {
      await dataRevealer.updateToken(tokenId, await this.tokenRevealStatusProvider.isTokenRevealed(tokenId));
    }
  }
}
