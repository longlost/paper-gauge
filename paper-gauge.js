
/**
  * `paper-gauge`
  *
  *   Based off the hard work done by the creator naikus 
  *   and contributers of the 'svg-gauge' library.
  *
  *   https://github.com/naikus/svg-gauge
  * 
  *
  * @customElement
  * @polymer
  * @demo demo/index.html
  *
  *
  **/

import {AppElement} from '@longlost/app-core/app-element.js';
import {clamp}      from '@longlost/app-core/lambda.js';
import {ease}       from '@longlost/app-core/animation.js';
import template     from './paper-gauge.html';


/**
 * Simplistic animation function for animating the gauge.
 * Options are:
 * {
 *  duration: 1,        // In seconds.
 *  start:    0,        // The start value.
 *  end:      100,      // The end value.
 *  step:     Function, // REQUIRED! The step function that will be passed the value and does something.
 *  easing:   Function  // The easing function.
 * }
 */
const runAnimation = options => {

  const {duration, easing, end, start, step} = options;

  const iterations = 60 * duration;
  const change     = end - start;

  let currentIteration = 1;

  const animate = () => {
    const progress = currentIteration / iterations;
    const value    = change * easing(progress) + start;

    step(value, currentIteration);

    currentIteration += 1;

    if (progress < 1) {
      window.requestAnimationFrame(animate);
    }
  };

  // Start animating.
  window.requestAnimationFrame(animate);
};


/**
 * Translates percentage value to angle. 
 * e.g. If gauge span angle is 180deg, 
 * then 50% will be 90deg.
 */
const getAngle = (percentage, gaugeSpanAngle) => percentage * gaugeSpanAngle / 100;

const getValueInPercentage = (value, min, max) => {

  const newMax = max   - min;
  const newVal = value - min;

  return 100 * newVal / newMax;
};

/**
 * Gets cartesian co-ordinates for a specified radius and angle (in degrees).
 * @param cx {Number} The center x co-oriinate.
 * @param cy {Number} The center y co-ordinate.
 * @param radius {Number} The radius of the circle.
 * @param angle {Number} The angle in degrees.
 * @return An object with x,y co-ordinates.
 */
const getCartesian = (cx, cy, radius, angle) => {

  const rad = angle * Math.PI / 180;

  return {
    x: Math.round((cx + radius * Math.cos(rad)) * 1000) / 1000,
    y: Math.round((cy + radius * Math.sin(rad)) * 1000) / 1000
  };
};

// Returns start and end points for dial.
// i.e. Starts at 135deg ends at 45deg with large arc flag.
// REMEMBER!! angle = 0 starts on X axis and then increases clockwise.
const getDialCoords = (radius, startAngle, endAngle) => {

  const cx = 50;
  const cy = 50;

  return {
    end:   getCartesian(cx, cy, radius, endAngle),
    start: getCartesian(cx, cy, radius, startAngle)
  };
};

// Creates the svg <path/> 'd' value.
const pathString = (radius, startAngle, endAngle, largeArc) => {

  const {end, start} = getDialCoords(radius, startAngle, endAngle);
  const largeArcFlag = typeof largeArc === 'undefined' ? 1 : largeArc;

  return [
    'M', start.x, start.y, 
    'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
  ].join(' ');
};


class PaperGauge extends AppElement {

  static get is() { return 'paper-gauge'; }

  static get template() {
    return template;
  }


  static get properties() {
    return {

      // Easing function power.
      // 1 is a linear ease.
      // 4 gives a nice cubic curve.
      easingPower: {
        type: Number,
        value: 4
      },

      // The angle in degrees to end the dial. 
      // This MUST be less than startAngle.
      end: {
        type: Number,
        value: 45
      },

      // A transformation function applied to the label value.
      // ie. num => num.toFixed(2).
      labelFunc: {
        type: Object,
        value: () => Math.round
      },

      // The maximum value for the gauge.
      max: {
        type: Number,
        value: 100
      },

      // The minimum value for the gauge. 
      // This can be a negative value.
      min: {
        type: Number,
        value: 0
      },

      noAnimation: {
        type: Boolean,
        value: false
      },

      // The radius of the gauge.
      radius: {
        type: Number,
        value: 40
      },

      // Whether to show the value at the center of the gauge.
      label: {
        type: Boolean,
        value: false
      },

      // The angle in degrees to start the dial.
      start: {
        type: Number,
        value: 135
      },

      // Animation timing in ms.
      timing: {
        type: Number,
        value: 1000
      },

      // Sets/gets the gauge value.
      value: {
        type: Number,
        observer: '__valueChanged'
      },

      _dialPath: {
        type: String,
        computed: '__computeDialPath(radius, start, end)'
      },

      _labelVal: {
        type: Number,
        computed: '__computeLabelVal(labelFunc, _immediateVal)'
      },

      _normalize: {
        type: Object,
        computed: '__computeNormalize(min, max)'
      },

      _immediateVal: Number,

      _valuePath: {
        type: String,
        computed: '__computeValuePath(radius, start, end, min, max, _immediateVal)'
      }

    };
  }


  __computeDialPath(radius, start, end) {

    const angle = getAngle(100, 360 - Math.abs(Number(start) - Number(end)));
    const flag  = angle <= 180 ? 0 : 1;
    
    return pathString(Number(radius), Number(start), Number(end), flag);
  }


  __computeLabelVal(fn, value) {

    if (typeof value !== 'number') { return; }

    return fn(Number(value));
  }


  __computeNormalize(min, max) {

    const clamper = clamp(Number(min), Number(max));

    return value => clamper(Number(value));
  }


  __computeValuePath(radius, start, end, min, max, value) {

    if (typeof value !== 'number' || min === max) { return; }

    const percentage = getValueInPercentage(value, Number(min), Number(max));
    const angle      = getAngle(percentage, 360 - Math.abs(Number(start) - Number(end)));

    // This is because we are using arc greater than 180deg.
    const flag = angle <= 180 ? 0 : 1;

    return pathString(Number(radius), Number(start), angle + Number(start), flag);
  }


  __valueChanged(newVal, oldVal = 0) {
    
    if (newVal === undefined || oldVal === newVal) {
      return;
    }

    if (this.noAnimation) {
      this._immediateVal = this._normalize(newVal);
    }
    else {

      const easing   = ease(Number(this.easingPower));
      const duration = Number(this.timing) / 1000;
      const start    = this._normalize(oldVal);
      const end      = this._normalize(newVal);

      // Called for each animation frame during the animation.
      const step = val => {
        this._immediateVal = this._normalize(val);
      };

      runAnimation({easing, end, duration, start, step});
    }          
  }

}

window.customElements.define(PaperGauge.is, PaperGauge);
