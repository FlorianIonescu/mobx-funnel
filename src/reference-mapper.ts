import { v7 } from "uuid"
import BidirectionalMap from "./bidirectional-map"
import hash from "./utils/hash"

export class Reference {
  id: string
  type: string
  name: string
  hash: string
  attr: Record<string, any> = {}

  value: Object | Function

  constructor(value: Object | Function) {
    this.id = `###REF###${v7()}`
    this.value = value
  }

  calculate() {
    if (typeof this.value === "object") {
      this.type = "Object"
      this.name = this.value.constructor.name
      this.hash = hash(JSON.stringify(this.attr))
    } else {
      const _hash = hash(this.value.toString())
      if (this.value.name) {
        this.type = "Function"
        this.name = this.value.name
        this.hash = _hash
      } else {
        this.type = "Lambda"
        this.name = _hash
        this.hash = _hash
      }
    }
  }
}

export class ReferenceMapper {
  references = new BidirectionalMap<any, Reference>()

  map<T extends object | Function>(value: T): Reference {
    // If we already have a reference for this value, return it
    const existingRef = this.references.forward(value)
    if (existingRef) return existingRef

    // Create new reference
    // We have to do this up here because circular references go infinite otherwise
    const ref = new Reference(value)
    this.references.set(value, ref)

    // If it's an object, process its values
    if (typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value).forEach(([key, item]) => {
        if (
          item !== null &&
          (typeof item === "object" || typeof item === "function")
        ) {
          if (Array.isArray(item)) {
            // For arrays, process their elements but keep the array
            ref.attr[key] = item.map((element) => {
              if (
                element !== null &&
                (typeof element === "object" || typeof element === "function")
              ) {
                return this.map(element).id
              }
              return element
            })
          } else {
            // For non-array objects/functions, replace with reference
            ref.attr[key] = this.map(item).id
          }
        } else {
          // For primitives, keep original value
          ref.attr[key] = item
        }
      })
    }

    ref.calculate()

    return ref
  }
}
