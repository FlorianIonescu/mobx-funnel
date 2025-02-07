import { Funnel } from "@florianionescu/funnel-js"

function isClass(v: any) {
  return typeof v === "function" && v.prototype && v.prototype.constructor === v
}

export default class FunnelRegistry {
  get(funnel: Funnel) {}
}
