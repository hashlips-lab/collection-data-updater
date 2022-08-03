import EventDataInterface from "./EventDataInterface";

export default interface DataUpdaterInterface {
  updateToken: (eventData: EventDataInterface) => Promise<EventDataInterface>;
}
