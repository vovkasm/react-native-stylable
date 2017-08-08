function isPureComponent (comp) {
  const p = comp.prototype
  return p.isPureReactComponent || !p.setState
}

export default isPureComponent
