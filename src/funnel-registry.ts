import { Funnel } from "@florianionescu/funnel-js"
import Collection from "@florianionescu/mobx-collection"
import { ObservableSet } from "mobx"
import { v7 } from "uuid"

function handleAttribute(value: unknown) {
  if (value !== null) {
    console.log(typeof value)
  }

  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
    case "bigint":
      return value.toString()
    case "object":
      if (value === null) {
        return "NULL"
      } else if (Array.isArray(value)) {
        // handle array
      } else {
        // handle object
      }
      break
    case "undefined":
      return ""
    case "function":
      return value.toString()
    case "symbol":
      throw Error(`Tried to handle symbol attribute`)
    default:
      throw Error(`Unexpected type ${typeof value}`)
  }
}

export default class FunnelRegistry<T> {
  collection: Collection<T> = new Collection()
  sets: Map<string, ObservableSet<T>> = new Map()

  add(item: T) {
    this.collection.add(item)
  }

  remove(item: T) {
    this.collection.remove(item)
  }

  // maps funnels to keys that are the same for all funnels that are funtionally the same
  key(funnel: Funnel) {
    const attributes = {
      name: funnel.constructor.name,
    }

    for (const key of Object.keys(funnel)) {
      console.log(key, funnel[key], handleAttribute(funnel[key]))
      attributes[key] = handleAttribute(funnel[key])
    }

    return JSON.stringify(attributes)
  }

  get(funnel: Funnel): ObservableSet<T> {
    const key = this.key(funnel)

    const existing = this.sets.get(key)
    if (existing) return existing

    const set = this.collection.filter((item: T) => !!funnel.run([item]).length)
    this.sets.set(key, set)

    return set
  }
}
