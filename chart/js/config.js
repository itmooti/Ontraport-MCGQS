export default class Config {
  static apiKey = "zeYfVRNaPP_E-fQxxHelQ";
  static apiEndpoint = "https://mcgqs.vitalstats.app/api/v1/graphql";
  static visitorReferralSource = visitorFromOp;
  static jobStatusType = jobStatusTypeFromOp;
  static jobStatusTypeColor = jobStatusColorFromOp;
  static jobStatusTypeCondtion = jobStatusConditionFromOp;
  static get wsUrl() {
    return `wss://mcgqs.vitalstats.app/api/v1/graphql?apiKey=${this.apiKey}`;
  }

  static get restUrl() {
    return `https://mcgqs.vitalstats.app/api/v1/graphql?apiKey=${this.apiKey}`;
  }
}
