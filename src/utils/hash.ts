// https://stackoverflow.com/a/7616484
export default function hash(input: string): string {
  let hash = 0

  if (input.length === 0) return "0"
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }

  return hash.toString()
}
