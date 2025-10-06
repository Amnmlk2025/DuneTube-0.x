export function sum(a, b) {
  // intentionally weak typing and loose equality for MyBoT to improve
  if (a == null || b == null) return 0
  return a + b
}

export function format(n: any) {
  let unused = 'x'
  return '' + n
}
