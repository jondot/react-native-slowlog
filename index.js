import fbjsPerformanceNow from 'fbjs/lib/performanceNow'
const performanceNow = global.nativePerformanceNow || fbjsPerformanceNow

const bencherExcludes = {
  'constructor':true,
}

const defaultOpts={excludes: bencherExcludes, log: console, verbose: false, threshold: 16}

function slowlog(that, exp=/.*/, opts={}){
  if(!__DEV__){
    return []
  }

  let bound = []
  let componentName = that.constructor.displayName || that.constructor.name || 'Class'
  const { threshold, log:c, verbose, excludes } = {...defaultOpts, ...opts}

  c.log(`slowlog: DEV MODE SLOWLOG ENABLED FOR <${componentName}>`)

  for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(that))) {
    let f = that[name]
    const benchkey = `${componentName}.${name}`
    if(typeof f === 'function' && !excludes[name] &&  exp.test(name)){
      that[name] = function(){
          const start = performanceNow()
          const res = f.apply(that, arguments)
          const timing = performanceNow() - start

          if(timing > threshold){
            c.warn(`slowlog: ${benchkey} was slow at: ${timing.toFixed(3)}ms`)
          }else if(verbose){
            c.log(benchkey, timing.toFixed(6))
          }
          return res
      }
      bound.push(name)
    }
  }
  return bound
}

export default slowlog
