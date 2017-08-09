function getDisplayName (comp) {
  if (typeof comp === 'function') {
    return comp.displayName || comp.name
  }
  if (typeof comp === 'string') {
    return comp
  }
  return 'Unknown'
}

export default getDisplayName
