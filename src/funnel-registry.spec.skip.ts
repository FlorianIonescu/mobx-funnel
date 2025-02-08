import { expect, test } from "vitest"
import FunnelRegistry from "./funnel-registry"
import { All, ByType } from "@florianionescu/funnel-js"
import { v7 } from "uuid"

class Example {}
class Dummy extends Example {
  value = 5
  constructor() {
    super()
    this.value = 7
  }
}
class Dummy2 extends Example {}

test("Funnel registry works in the simple case", () => {
  const registry = new FunnelRegistry()

  const type = new ByType(Dummy)
  const type2 = new ByType(Dummy)
  const type3 = new ByType(Dummy2)

  const a = registry.get(type)
  const b = registry.get(type2)
  const c = registry.get(type3)

  expect(a).toBe(b)
  expect(a).not.toBe(c)
})

function normalize(arr: any[]): object[] {
  const result = new Set<object>()

  function collect(value: any) {
    if (value && typeof value === "object") {
      if (value.constructor !== Object && value.constructor !== Array) {
        result.add(value)
      }
      Object.values(value).forEach(collect)
    }
  }

  arr.forEach(collect)
  const objects = Array.from(result)
  replaceRefsWithIds(objects)
  return objects
}

function replaceRefsWithIds(objects: object[]): void {
  const idMap = new Map<object, string>()

  // First pass: assign IDs
  objects.forEach((obj) => {
    idMap.set(obj, v7())
  })

  // Second pass: replace refs with IDs
  objects.forEach((obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === "object") {
        if (idMap.has(value)) {
          ;(obj as any)[key] = idMap.get(value)
        } else if (Array.isArray(value)) {
          ;(obj as any)[key] = value.map((item) =>
            idMap.has(item) ? idMap.get(item) : item
          )
        }
      }
    }
  })
}

test.only("Funnel registry works for nested funnels", () => {
  // map the funnels to collection filters

  const registry = new FunnelRegistry<Example>()
  registry.add(new Dummy())
  registry.add(new Dummy())
  registry.add(new Dummy2())
  registry.add(new Dummy2())
  registry.add(new Dummy2())

  const query = new ByType(Dummy)
  const query2 = new ByType(Dummy2)

  const set = registry.get(query)
  const set2 = registry.get(query2)

  console.log(set === set2)
  console.log([...set])
  console.log([...set2])
})
