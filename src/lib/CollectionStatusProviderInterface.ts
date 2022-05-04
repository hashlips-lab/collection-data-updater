export interface TokensRevealStatus {
  tokenId: number;
  isRevealed: boolean;
}

export default interface CollectionStatusProviderInterface {
  getTokensRevealStatus: () => Promise<TokensRevealStatus[]>;
}
