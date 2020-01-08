(function () {
  'use strict'

  /**
   * wraps a promise in a timeout, allowing the promise to reject if not resolve with a specific period of time
   * @param {integer} ms - milliseconds to wait before rejecting promise if not resolved
   * @param {Promise} promise to monitor
   * @example
   *  promiseTimeout(1000, fetch('https://courseof.life/johndoherty.json'))
   *      .then(function(cvData){
   *          alert(cvData);
   *      })
   *      .catch(function(){
   *          alert('request either failed or timed-out');
   *      });
   * @returns {Promise} resolves as normal if not timed-out, otherwise rejects
   */
  function promiseTimeout (ms, promise) {
    return new Promise(function (resolve, reject) {
      // create a timeout to reject promise if not resolved
      var timer = requestTimeout(function () {
        reject(new Error('Promise Timed Out'))
      }, ms)

      promise.then(function (res) {
        clearRequestTimeout(timer)
        resolve(res)
      })
        .catch(function (err) {
          clearRequestTimeout(timer)
          reject(err)
        })
    })
  }

  /* #region helpers */

  var requestAnimFrame = window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60)
  }

  /**
   * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
   * @param {function} fn The callback function
   * @param {int} delay The delay in milliseconds
   * @returns {object} handle to the timeout object
   */
  function requestTimeout (fn, delay) {
    if (!window.requestAnimationFrame && !window.webkitRequestAnimationFrame &&
          !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
          !window.oRequestAnimationFrame && !window.msRequestAnimationFrame) return window.setTimeout(fn, delay)

    var start = new Date().getTime()
    var handle = {}

    var loop = function () {
      var current = new Date().getTime()
      var delta = current - start

      if (delta >= delay) {
        fn.call()
      } else {
        handle.value = requestAnimFrame(loop)
      }
    }

    handle.value = requestAnimFrame(loop)

    return handle
  }

  /**
   * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
   * @param {object} handle The callback function
   * @returns {void}
   */
  function clearRequestTimeout (handle) {
    if (handle) {
      window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value)
        : window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value)
          : window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) /* Support for legacy API */
            : window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value)
              // eslint-disable-next-line no-tabs
              : window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value)
                : window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value)
                  : clearTimeout(handle)
    }
  }

  /* #endregion */

  if (typeof window === 'undefined') {
    module.exports = promiseTimeout
  } else {
    window.promiseTimeout = promiseTimeout
  }
})()
