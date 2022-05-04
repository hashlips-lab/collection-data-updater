export default interface DataUpdaterInterface {
  updateToken: (tokenId: number, isRevealed: boolean) => Promise<void>;
}
