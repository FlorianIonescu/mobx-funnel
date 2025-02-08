import { expect, test } from "vitest"
import FunnelRegistry from "./funnel-registry"
import { All, ByType } from "@florianionescu/funnel-js"

class Example {}
class Dummy extends Example {}
class Dummy2 extends Example {}

test("Funnel registry de-dupes similar funnels", () => {
  const registry = new FunnelRegistry()

  const a = new ByType(Dummy)
  const b = new ByType(Dummy)
  const c = new ByType(Dummy2)

  // step 1: register all queries
  registry.register(a)
  registry.register(b)
  registry.register(c)

  // step 2: make query -> hash and hash -> Filter<T> map
  registry.build()

  // step 3: get each query's filter
  const filterA = registry.get(a)
  const filterB = registry.get(b)
  const filterC = registry.get(c)

  expect(filterA).toBe(filterB)
  expect(filterA).not.toBe(filterC)
})

test.only("Funnel registry works with composite funnels", () => {
  const registry = new FunnelRegistry()

  const a = new All(new ByType(Dummy))
  const b = new All(new ByType(Dummy))
  const c = new All(new ByType(Dummy2))

  registry.register(a)
  registry.register(b)
  registry.register(c)
  registry.build()

  const filterA = registry.get(a)
  const filterB = registry.get(b)
  const filterC = registry.get(c)

  console.log(filterA)
  console.log(filterB)
  console.log(filterC)

  expect(filterA).toBe(filterB)
  expect(filterA).toBe(filterB)
  expect(filterA).not.toBe(filterC)
})
