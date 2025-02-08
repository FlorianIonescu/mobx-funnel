import { expect, test } from "vitest"
import { ReferenceMapper } from "./reference-mapper"
import { ByType } from "@florianionescu/funnel-js"
import hash from "./utils/hash"

class Example {}
class Dummy extends Example {}
class Dummy2 extends Example {}

test("ReferenceMapper works", () => {
  const rm = new ReferenceMapper()

  const a = new ByType(Dummy)
  const b = new ByType(Dummy)

  // ids are always different for different inputs
  expect(rm.map(a).id).not.toBe(rm.map(b).id)

  // and the same for the same objects
  expect(rm.map(a).id).toBe(rm.map(a).id)

  // types depend on, well, type
  expect(rm.map(a).type).toBe("Object")
  expect(rm.map(Dummy).type).toBe("Function")
  expect(rm.map(() => {}).type).toBe("Lambda")

  // names depend on what it was instantiated from
  expect(rm.map(a).name).toBe("ByType")
  expect(rm.map(Dummy).name).toBe("Dummy")
  // lambda functions are instantiated without a name, we use the hash of the constructor
  expect(rm.map(() => {}).name).toBe(hash((() => {}).toString()))

  // hashes make things unique based on what they're instantiated with
  // same constructor, different instances, same inputs => same hash
  expect(rm.map(new ByType(Dummy)).hash).toBe(rm.map(new ByType(Dummy)).hash)
  // same everything, different input => different hash
  expect(rm.map(new ByType(Dummy)).hash).not.toBe(
    rm.map(new ByType(Dummy2)).hash
  )
  // for functions there's no way to determine closure variables, so the hashes are the same
  let bound = 5
  const c = rm.map(() => bound).hash
  bound = 3
  const d = rm.map(() => bound).hash
  expect(c).toBe(d)
})
