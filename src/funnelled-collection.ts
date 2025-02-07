import { Funnel } from "@florianionescu/funnel-js"
import Collection from "@florianionescu/mobx-collection"
import { ObservableSet } from "mobx"

export default class FunnelledCollection<T> {
  collection: Collection<T> = new Collection()
  funnels: Funnel[]

  constructor(funnels: Funnel[]) {
    this.funnels = funnels
  }

  filter(funnel: Funnel): ObservableSet<T> {
    // create the tree of filters based on the tree of funnels
    // yeet them all into the collection

    // return the root filter

    return new ObservableSet()
  }
}
