import CollectionDataUpdater from '../CollectionDataUpdater';

export default interface RuntimeInterface {
  run: (collectionDataUpdater: CollectionDataUpdater) => Promise<void>;
}
