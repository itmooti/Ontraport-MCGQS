export default class Config {
  static apiKey = apiKey;
  static apiEndpoint = apiEndpoint;
  static visitorReferralSource = visitorFromOp;
  static jobStatuses = allJobStatusAndColorAndConditions;
  static get wsUrl() {
    return `wss://mcgqs.vitalstats.app/api/v1/graphql?apiKey=${this.apiKey}`;
  }
  static get restUrl() {
    return `https://mcgqs.vitalstats.app/api/v1/graphql?apiKey=${this.apiKey}`;
  }
}
