import { Funnel } from "@florianionescu/funnel-js"
import { ObservableSet } from "mobx"
import { ReferenceMapper } from "./reference-mapper"

type Filter<T> = {
  predicate: (value: T, props: boolean[]) => boolean
  dependencies: ObservableSet<T>[]
}

// take in a funnel, return a de-duped predicate and dependencies
export default class FunnelRegistry<T> {
  mapper: ReferenceMapper = new ReferenceMapper()
  filters: Map<string, Filter<T>> = new Map()

  // make a funnel into a Filter
  make(funnel: Funnel): Filter<T> {
    const predicate = (item: T, props: boolean[]) => !!funnel.run([item]).length
    const dependencies = []

    return {
      predicate,
      dependencies,
    }
  }

  // first, register all funnels
  register(funnel: Funnel) {
    this.mapper.map(funnel)
  }

  build() {
    // take all funnel references
    const references = this.mapper.references
      .b()
      .filter((r) => r.value instanceof Funnel)

    // prepare empty filters for each of them
    references.forEach((r) => {
      if (this.filters.get(r.hash)) return

      this.filters.set(r.hash, {
        predicate: () => false,
        dependencies: [],
      })
    })

    // calculate their dependencies and make their predicates
    references.forEach((r) => {
      if (this.filters.get(r.hash)) return

      this.make(r.value as Funnel)
    })

    // return them to be thrown into the collection
    return [...this.filters.values()]
  }

  get(funnel: Funnel): Filter<T> {
    const r = this.mapper.map(funnel)
    const filter = this.filters.get(r.hash)
    if (!filter) {
      throw Error("Tried to get Filter for a Funnel that isn't registered.")
    }

    return filter
  }
}
