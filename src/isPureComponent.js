function isPureComponent (comp) {
  if (typeof comp === 'string') {
    return false
  }
  const p = comp.prototype
  return p.isPureReactComponent || !p.setState
}

export default isPureComponent
