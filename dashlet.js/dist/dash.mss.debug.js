(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
"use strict";

var bigInt = (function (undefined) {
  "use strict";var BASE = 1e7,
      LOG_BASE = 7,
      MAX_INT = 9007199254740992,
      MAX_INT_ARR = smallToArray(MAX_INT),
      DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";var supportsNativeBigInt = typeof BigInt === "function";function Integer(v, radix, alphabet, caseSensitive) {
    if (typeof v === "undefined") return Integer[0];if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);return parseValue(v);
  }function BigInteger(value, sign) {
    this.value = value;this.sign = sign;this.isSmall = false;
  }BigInteger.prototype = Object.create(Integer.prototype);function SmallInteger(value) {
    this.value = value;this.sign = value < 0;this.isSmall = true;
  }SmallInteger.prototype = Object.create(Integer.prototype);function NativeBigInt(value) {
    this.value = value;
  }NativeBigInt.prototype = Object.create(Integer.prototype);function isPrecise(n) {
    return -MAX_INT < n && n < MAX_INT;
  }function smallToArray(n) {
    if (n < 1e7) return [n];if (n < 1e14) return [n % 1e7, Math.floor(n / 1e7)];return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }function arrayToSmall(arr) {
    trim(arr);var length = arr.length;if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
      switch (length) {case 0:
          return 0;case 1:
          return arr[0];case 2:
          return arr[0] + arr[1] * BASE;default:
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;}
    }return arr;
  }function trim(v) {
    var i = v.length;while (v[--i] === 0);v.length = i + 1;
  }function createArray(length) {
    var x = new Array(length);var i = -1;while (++i < length) {
      x[i] = 0;
    }return x;
  }function truncate(n) {
    if (n > 0) return Math.floor(n);return Math.ceil(n);
  }function add(a, b) {
    var l_a = a.length,
        l_b = b.length,
        r = new Array(l_a),
        carry = 0,
        base = BASE,
        sum,
        i;for (i = 0; i < l_b; i++) {
      sum = a[i] + b[i] + carry;carry = sum >= base ? 1 : 0;r[i] = sum - carry * base;
    }while (i < l_a) {
      sum = a[i] + carry;carry = sum === base ? 1 : 0;r[i++] = sum - carry * base;
    }if (carry > 0) r.push(carry);return r;
  }function addAny(a, b) {
    if (a.length >= b.length) return add(a, b);return add(b, a);
  }function addSmall(a, carry) {
    var l = a.length,
        r = new Array(l),
        base = BASE,
        sum,
        i;for (i = 0; i < l; i++) {
      sum = a[i] - base + carry;carry = Math.floor(sum / base);r[i] = sum - carry * base;carry += 1;
    }while (carry > 0) {
      r[i++] = carry % base;carry = Math.floor(carry / base);
    }return r;
  }BigInteger.prototype.add = function (v) {
    var n = parseValue(v);if (this.sign !== n.sign) {
      return this.subtract(n.negate());
    }var a = this.value,
        b = n.value;if (n.isSmall) {
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }return new BigInteger(addAny(a, b), this.sign);
  };BigInteger.prototype.plus = BigInteger.prototype.add;SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);var a = this.value;if (a < 0 !== n.sign) {
      return this.subtract(n.negate());
    }var b = n.value;if (n.isSmall) {
      if (isPrecise(a + b)) return new SmallInteger(a + b);b = smallToArray(Math.abs(b));
    }return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };SmallInteger.prototype.plus = SmallInteger.prototype.add;NativeBigInt.prototype.add = function (v) {
    return new NativeBigInt(this.value + parseValue(v).value);
  };NativeBigInt.prototype.plus = NativeBigInt.prototype.add;function subtract(a, b) {
    var a_l = a.length,
        b_l = b.length,
        r = new Array(a_l),
        borrow = 0,
        base = BASE,
        i,
        difference;for (i = 0; i < b_l; i++) {
      difference = a[i] - borrow - b[i];if (difference < 0) {
        difference += base;borrow = 1;
      } else borrow = 0;r[i] = difference;
    }for (i = b_l; i < a_l; i++) {
      difference = a[i] - borrow;if (difference < 0) difference += base;else {
        r[i++] = difference;break;
      }r[i] = difference;
    }for (; i < a_l; i++) {
      r[i] = a[i];
    }trim(r);return r;
  }function subtractAny(a, b, sign) {
    var value;if (compareAbs(a, b) >= 0) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a);sign = !sign;
    }value = arrayToSmall(value);if (typeof value === "number") {
      if (sign) value = -value;return new SmallInteger(value);
    }return new BigInteger(value, sign);
  }function subtractSmall(a, b, sign) {
    var l = a.length,
        r = new Array(l),
        carry = -b,
        base = BASE,
        i,
        difference;for (i = 0; i < l; i++) {
      difference = a[i] + carry;carry = Math.floor(difference / base);difference %= base;r[i] = difference < 0 ? difference + base : difference;
    }r = arrayToSmall(r);if (typeof r === "number") {
      if (sign) r = -r;return new SmallInteger(r);
    }return new BigInteger(r, sign);
  }BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v);if (this.sign !== n.sign) {
      return this.add(n.negate());
    }var a = this.value,
        b = n.value;if (n.isSmall) return subtractSmall(a, Math.abs(b), this.sign);return subtractAny(a, b, this.sign);
  };BigInteger.prototype.minus = BigInteger.prototype.subtract;SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);var a = this.value;if (a < 0 !== n.sign) {
      return this.add(n.negate());
    }var b = n.value;if (n.isSmall) {
      return new SmallInteger(a - b);
    }return subtractSmall(b, Math.abs(a), a >= 0);
  };SmallInteger.prototype.minus = SmallInteger.prototype.subtract;NativeBigInt.prototype.subtract = function (v) {
    return new NativeBigInt(this.value - parseValue(v).value);
  };NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };SmallInteger.prototype.negate = function () {
    var sign = this.sign;var small = new SmallInteger(-this.value);small.sign = !sign;return small;
  };NativeBigInt.prototype.negate = function () {
    return new NativeBigInt(-this.value);
  };BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false);
  };SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math.abs(this.value));
  };NativeBigInt.prototype.abs = function () {
    return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
  };function multiplyLong(a, b) {
    var a_l = a.length,
        b_l = b.length,
        l = a_l + b_l,
        r = createArray(l),
        base = BASE,
        product,
        carry,
        i,
        a_i,
        b_j;for (i = 0; i < a_l; ++i) {
      a_i = a[i];for (var j = 0; j < b_l; ++j) {
        b_j = b[j];product = a_i * b_j + r[i + j];carry = Math.floor(product / base);r[i + j] = product - carry * base;r[i + j + 1] += carry;
      }
    }trim(r);return r;
  }function multiplySmall(a, b) {
    var l = a.length,
        r = new Array(l),
        base = BASE,
        carry = 0,
        product,
        i;for (i = 0; i < l; i++) {
      product = a[i] * b + carry;carry = Math.floor(product / base);r[i] = product - carry * base;
    }while (carry > 0) {
      r[i++] = carry % base;carry = Math.floor(carry / base);
    }return r;
  }function shiftLeft(x, n) {
    var r = [];while (n-- > 0) r.push(0);return r.concat(x);
  }function multiplyKaratsuba(x, y) {
    var n = Math.max(x.length, y.length);if (n <= 30) return multiplyLong(x, y);n = Math.ceil(n / 2);var b = x.slice(n),
        a = x.slice(0, n),
        d = y.slice(n),
        c = y.slice(0, n);var ac = multiplyKaratsuba(a, c),
        bd = multiplyKaratsuba(b, d),
        abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));trim(product);return product;
  }function useKaratsuba(l1, l2) {
    return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
  }BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value,
        sign = this.sign !== n.sign,
        abs;if (n.isSmall) {
      if (b === 0) return Integer[0];if (b === 1) return this;if (b === -1) return this.negate();abs = Math.abs(b);if (abs < BASE) {
        return new BigInteger(multiplySmall(a, abs), sign);
      }b = smallToArray(abs);
    }if (useKaratsuba(a.length, b.length)) return new BigInteger(multiplyKaratsuba(a, b), sign);return new BigInteger(multiplyLong(a, b), sign);
  };BigInteger.prototype.times = BigInteger.prototype.multiply;function multiplySmallAndArray(a, b, sign) {
    if (a < BASE) {
      return new BigInteger(multiplySmall(b, a), sign);
    }return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }SmallInteger.prototype._multiplyBySmall = function (a) {
    if (isPrecise(a.value * this.value)) {
      return new SmallInteger(a.value * this.value);
    }return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
  };BigInteger.prototype._multiplyBySmall = function (a) {
    if (a.value === 0) return Integer[0];if (a.value === 1) return this;if (a.value === -1) return this.negate();return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
  };SmallInteger.prototype.multiply = function (v) {
    return parseValue(v)._multiplyBySmall(this);
  };SmallInteger.prototype.times = SmallInteger.prototype.multiply;NativeBigInt.prototype.multiply = function (v) {
    return new NativeBigInt(this.value * parseValue(v).value);
  };NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;function square(a) {
    var l = a.length,
        r = createArray(l + l),
        base = BASE,
        product,
        carry,
        i,
        a_i,
        a_j;for (i = 0; i < l; i++) {
      a_i = a[i];carry = 0 - a_i * a_i;for (var j = i; j < l; j++) {
        a_j = a[j];product = 2 * (a_i * a_j) + r[i + j] + carry;carry = Math.floor(product / base);r[i + j] = product - carry * base;
      }r[i + l] = carry;
    }trim(r);return r;
  }BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false);
  };SmallInteger.prototype.square = function () {
    var value = this.value * this.value;if (isPrecise(value)) return new SmallInteger(value);return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };NativeBigInt.prototype.square = function (v) {
    return new NativeBigInt(this.value * this.value);
  };function divMod1(a, b) {
    var a_l = a.length,
        b_l = b.length,
        base = BASE,
        result = createArray(b.length),
        divisorMostSignificantDigit = b[b_l - 1],
        lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
        remainder = multiplySmall(a, lambda),
        divisor = multiplySmall(b, lambda),
        quotientDigit,
        shift,
        carry,
        borrow,
        i,
        l,
        q;if (remainder.length <= a_l) remainder.push(0);divisor.push(0);divisorMostSignificantDigit = divisor[b_l - 1];for (shift = a_l - b_l; shift >= 0; shift--) {
      quotientDigit = base - 1;if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
        quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
      }carry = 0;borrow = 0;l = divisor.length;for (i = 0; i < l; i++) {
        carry += quotientDigit * divisor[i];q = Math.floor(carry / base);borrow += remainder[shift + i] - (carry - q * base);carry = q;if (borrow < 0) {
          remainder[shift + i] = borrow + base;borrow = -1;
        } else {
          remainder[shift + i] = borrow;borrow = 0;
        }
      }while (borrow !== 0) {
        quotientDigit -= 1;carry = 0;for (i = 0; i < l; i++) {
          carry += remainder[shift + i] - base + divisor[i];if (carry < 0) {
            remainder[shift + i] = carry + base;carry = 0;
          } else {
            remainder[shift + i] = carry;carry = 1;
          }
        }borrow += carry;
      }result[shift] = quotientDigit;
    }remainder = divModSmall(remainder, lambda)[0];return [arrayToSmall(result), arrayToSmall(remainder)];
  }function divMod2(a, b) {
    var a_l = a.length,
        b_l = b.length,
        result = [],
        part = [],
        base = BASE,
        guess,
        xlen,
        highx,
        highy,
        check;while (a_l) {
      part.unshift(a[--a_l]);trim(part);if (compareAbs(part, b) < 0) {
        result.push(0);continue;
      }xlen = part.length;highx = part[xlen - 1] * base + part[xlen - 2];highy = b[b_l - 1] * base + b[b_l - 2];if (xlen > b_l) {
        highx = (highx + 1) * base;
      }guess = Math.ceil(highx / highy);do {
        check = multiplySmall(b, guess);if (compareAbs(check, part) <= 0) break;guess--;
      } while (guess);result.push(guess);part = subtract(part, check);
    }result.reverse();return [arrayToSmall(result), arrayToSmall(part)];
  }function divModSmall(value, lambda) {
    var length = value.length,
        quotient = createArray(length),
        base = BASE,
        i,
        q,
        remainder,
        divisor;remainder = 0;for (i = length - 1; i >= 0; --i) {
      divisor = remainder * base + value[i];q = truncate(divisor / lambda);remainder = divisor - q * lambda;quotient[i] = q | 0;
    }return [quotient, remainder | 0];
  }function divModAny(self, v) {
    var value,
        n = parseValue(v);if (supportsNativeBigInt) {
      return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
    }var a = self.value,
        b = n.value;var quotient;if (b === 0) throw new Error("Cannot divide by zero");if (self.isSmall) {
      if (n.isSmall) {
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
      }return [Integer[0], self];
    }if (n.isSmall) {
      if (b === 1) return [self, Integer[0]];if (b == -1) return [self.negate(), Integer[0]];var abs = Math.abs(b);if (abs < BASE) {
        value = divModSmall(a, abs);quotient = arrayToSmall(value[0]);var remainder = value[1];if (self.sign) remainder = -remainder;if (typeof quotient === "number") {
          if (self.sign !== n.sign) quotient = -quotient;return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
      }b = smallToArray(abs);
    }var comparison = compareAbs(a, b);if (comparison === -1) return [Integer[0], self];if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];if (a.length + b.length <= 200) value = divMod1(a, b);else value = divMod2(a, b);quotient = value[0];var qSign = self.sign !== n.sign,
        mod = value[1],
        mSign = self.sign;if (typeof quotient === "number") {
      if (qSign) quotient = -quotient;quotient = new SmallInteger(quotient);
    } else quotient = new BigInteger(quotient, qSign);if (typeof mod === "number") {
      if (mSign) mod = -mod;mod = new SmallInteger(mod);
    } else mod = new BigInteger(mod, mSign);return [quotient, mod];
  }BigInteger.prototype.divmod = function (v) {
    var result = divModAny(this, v);return { quotient: result[0], remainder: result[1] };
  };NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0];
  };NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
    return new NativeBigInt(this.value / parseValue(v).value);
  };SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1];
  };NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
    return new NativeBigInt(this.value % parseValue(v).value);
  };SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;BigInteger.prototype.pow = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value,
        value,
        x,
        y;if (b === 0) return Integer[1];if (a === 0) return Integer[0];if (a === 1) return Integer[1];if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];if (n.sign) {
      return Integer[0];
    }if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");if (this.isSmall) {
      if (isPrecise(value = Math.pow(a, b))) return new SmallInteger(truncate(value));
    }x = this;y = Integer[1];while (true) {
      if (b & 1 === 1) {
        y = y.times(x);--b;
      }if (b === 0) break;b /= 2;x = x.square();
    }return y;
  };SmallInteger.prototype.pow = BigInteger.prototype.pow;NativeBigInt.prototype.pow = function (v) {
    var n = parseValue(v);var a = this.value,
        b = n.value;var _0 = BigInt(0),
        _1 = BigInt(1),
        _2 = BigInt(2);if (b === _0) return Integer[1];if (a === _0) return Integer[0];if (a === _1) return Integer[1];if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];if (n.isNegative()) return new NativeBigInt(_0);var x = this;var y = Integer[1];while (true) {
      if ((b & _1) === _1) {
        y = y.times(x);--b;
      }if (b === _0) break;b /= _2;x = x.square();
    }return y;
  };BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);mod = parseValue(mod);if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");var r = Integer[1],
        base = this.mod(mod);while (exp.isPositive()) {
      if (base.isZero()) return Integer[0];if (exp.isOdd()) r = r.multiply(base).mod(mod);exp = exp.divide(2);base = base.square().mod(mod);
    }return r;
  };NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;function compareAbs(a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1;
    }for (var i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
    }return 0;
  }BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value;if (n.isSmall) return 1;return compareAbs(a, b);
  };SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
        a = Math.abs(this.value),
        b = n.value;if (n.isSmall) {
      b = Math.abs(b);return a === b ? 0 : a > b ? 1 : -1;
    }return -1;
  };NativeBigInt.prototype.compareAbs = function (v) {
    var a = this.value;var b = parseValue(v).value;a = a >= 0 ? a : -a;b = b >= 0 ? b : -b;return a === b ? 0 : a > b ? 1 : -1;
  };BigInteger.prototype.compare = function (v) {
    if (v === Infinity) {
      return -1;
    }if (v === -Infinity) {
      return 1;
    }var n = parseValue(v),
        a = this.value,
        b = n.value;if (this.sign !== n.sign) {
      return n.sign ? 1 : -1;
    }if (n.isSmall) {
      return this.sign ? -1 : 1;
    }return compareAbs(a, b) * (this.sign ? -1 : 1);
  };BigInteger.prototype.compareTo = BigInteger.prototype.compare;SmallInteger.prototype.compare = function (v) {
    if (v === Infinity) {
      return -1;
    }if (v === -Infinity) {
      return 1;
    }var n = parseValue(v),
        a = this.value,
        b = n.value;if (n.isSmall) {
      return a == b ? 0 : a > b ? 1 : -1;
    }if (a < 0 !== n.sign) {
      return a < 0 ? -1 : 1;
    }return a < 0 ? 1 : -1;
  };SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;NativeBigInt.prototype.compare = function (v) {
    if (v === Infinity) {
      return -1;
    }if (v === -Infinity) {
      return 1;
    }var a = this.value;var b = parseValue(v).value;return a === b ? 0 : a > b ? 1 : -1;
  };NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;BigInteger.prototype.equals = function (v) {
    return this.compare(v) === 0;
  };NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;BigInteger.prototype.notEquals = function (v) {
    return this.compare(v) !== 0;
  };NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;BigInteger.prototype.greater = function (v) {
    return this.compare(v) > 0;
  };NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;BigInteger.prototype.lesser = function (v) {
    return this.compare(v) < 0;
  };NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;BigInteger.prototype.greaterOrEquals = function (v) {
    return this.compare(v) >= 0;
  };NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;BigInteger.prototype.lesserOrEquals = function (v) {
    return this.compare(v) <= 0;
  };NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0;
  };SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0;
  };NativeBigInt.prototype.isEven = function () {
    return (this.value & BigInt(1)) === BigInt(0);
  };BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1;
  };SmallInteger.prototype.isOdd = function () {
    return (this.value & 1) === 1;
  };NativeBigInt.prototype.isOdd = function () {
    return (this.value & BigInt(1)) === BigInt(1);
  };BigInteger.prototype.isPositive = function () {
    return !this.sign;
  };SmallInteger.prototype.isPositive = function () {
    return this.value > 0;
  };NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;BigInteger.prototype.isNegative = function () {
    return this.sign;
  };SmallInteger.prototype.isNegative = function () {
    return this.value < 0;
  };NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;BigInteger.prototype.isUnit = function () {
    return false;
  };SmallInteger.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };NativeBigInt.prototype.isUnit = function () {
    return this.abs().value === BigInt(1);
  };BigInteger.prototype.isZero = function () {
    return false;
  };SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };NativeBigInt.prototype.isZero = function () {
    return this.value === BigInt(0);
  };BigInteger.prototype.isDivisibleBy = function (v) {
    var n = parseValue(v);if (n.isZero()) return false;if (n.isUnit()) return true;if (n.compareAbs(2) === 0) return this.isEven();return this.mod(n).isZero();
  };NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;function isBasicPrime(v) {
    var n = v.abs();if (n.isUnit()) return false;if (n.equals(2) || n.equals(3) || n.equals(5)) return true;if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;if (n.lesser(49)) return true;
  }function millerRabinTest(n, a) {
    var nPrev = n.prev(),
        b = nPrev,
        r = 0,
        d,
        t,
        i,
        x;while (b.isEven()) b = b.divide(2), r++;next: for (i = 0; i < a.length; i++) {
      if (n.lesser(a[i])) continue;x = bigInt(a[i]).modPow(b, n);if (x.isUnit() || x.equals(nPrev)) continue;for (d = r - 1; d != 0; d--) {
        x = x.square().mod(n);if (x.isUnit()) return false;if (x.equals(nPrev)) continue next;
      }return false;
    }return true;
  }BigInteger.prototype.isPrime = function (strict) {
    var isPrime = isBasicPrime(this);if (isPrime !== undefined) return isPrime;var n = this.abs();var bits = n.bitLength();if (bits <= 64) return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);var logN = Math.log(2) * bits.toJSNumber();var t = Math.ceil(strict === true ? 2 * Math.pow(logN, 2) : logN);for (var a = [], i = 0; i < t; i++) {
      a.push(bigInt(i + 2));
    }return millerRabinTest(n, a);
  };NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);if (isPrime !== undefined) return isPrime;var n = this.abs();var t = iterations === undefined ? 5 : iterations;for (var a = [], i = 0; i < t; i++) {
      a.push(bigInt.randBetween(2, n.minus(2)));
    }return millerRabinTest(n, a);
  };NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;BigInteger.prototype.modInv = function (n) {
    var t = bigInt.zero,
        newT = bigInt.one,
        r = parseValue(n),
        newR = this.abs(),
        q,
        lastT,
        lastR;while (!newR.isZero()) {
      q = r.divide(newR);lastT = t;lastR = r;t = newT;r = newR;newT = lastT.subtract(q.multiply(newT));newR = lastR.subtract(q.multiply(newR));
    }if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");if (t.compare(0) === -1) {
      t = t.add(n);
    }if (this.isNegative()) {
      return t.negate();
    }return t;
  };NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;BigInteger.prototype.next = function () {
    var value = this.value;if (this.sign) {
      return subtractSmall(value, 1, this.sign);
    }return new BigInteger(addSmall(value, 1), this.sign);
  };SmallInteger.prototype.next = function () {
    var value = this.value;if (value + 1 < MAX_INT) return new SmallInteger(value + 1);return new BigInteger(MAX_INT_ARR, false);
  };NativeBigInt.prototype.next = function () {
    return new NativeBigInt(this.value + BigInt(1));
  };BigInteger.prototype.prev = function () {
    var value = this.value;if (this.sign) {
      return new BigInteger(addSmall(value, 1), true);
    }return subtractSmall(value, 1, this.sign);
  };SmallInteger.prototype.prev = function () {
    var value = this.value;if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);return new BigInteger(MAX_INT_ARR, true);
  };NativeBigInt.prototype.prev = function () {
    return new NativeBigInt(this.value - BigInt(1));
  };var powersOfTwo = [1];while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);var powers2Length = powersOfTwo.length,
      highestPower2 = powersOfTwo[powers2Length - 1];function shift_isSmall(n) {
    return Math.abs(n) <= BASE;
  }BigInteger.prototype.shiftLeft = function (v) {
    var n = parseValue(v).toJSNumber();if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }if (n < 0) return this.shiftRight(-n);var result = this;if (result.isZero()) return result;while (n >= powers2Length) {
      result = result.multiply(highestPower2);n -= powers2Length - 1;
    }return result.multiply(powersOfTwo[n]);
  };NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;BigInteger.prototype.shiftRight = function (v) {
    var remQuo;var n = parseValue(v).toJSNumber();if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }if (n < 0) return this.shiftLeft(-n);var result = this;while (n >= powers2Length) {
      if (result.isZero() || result.isNegative() && result.isUnit()) return result;remQuo = divModAny(result, highestPower2);result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];n -= powers2Length - 1;
    }remQuo = divModAny(result, powersOfTwo[n]);return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
  };NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;function bitwise(x, y, fn) {
    y = parseValue(y);var xSign = x.isNegative(),
        ySign = y.isNegative();var xRem = xSign ? x.not() : x,
        yRem = ySign ? y.not() : y;var xDigit = 0,
        yDigit = 0;var xDivMod = null,
        yDivMod = null;var result = [];while (!xRem.isZero() || !yRem.isZero()) {
      xDivMod = divModAny(xRem, highestPower2);xDigit = xDivMod[1].toJSNumber();if (xSign) {
        xDigit = highestPower2 - 1 - xDigit;
      }yDivMod = divModAny(yRem, highestPower2);yDigit = yDivMod[1].toJSNumber();if (ySign) {
        yDigit = highestPower2 - 1 - yDigit;
      }xRem = xDivMod[0];yRem = yDivMod[0];result.push(fn(xDigit, yDigit));
    }var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);for (var i = result.length - 1; i >= 0; i -= 1) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }return sum;
  }BigInteger.prototype.not = function () {
    return this.negate().prev();
  };NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;BigInteger.prototype.and = function (n) {
    return bitwise(this, n, function (a, b) {
      return a & b;
    });
  };NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;BigInteger.prototype.or = function (n) {
    return bitwise(this, n, function (a, b) {
      return a | b;
    });
  };NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;BigInteger.prototype.xor = function (n) {
    return bitwise(this, n, function (a, b) {
      return a ^ b;
    });
  };NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;var LOBMASK_I = 1 << 30,
      LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;function roughLOB(n) {
    var v = n.value,
        x = typeof v === "number" ? v | LOBMASK_I : typeof v === "bigint" ? v | BigInt(LOBMASK_I) : v[0] + v[1] * BASE | LOBMASK_BI;return x & -x;
  }function integerLogarithm(value, base) {
    if (base.compareTo(value) <= 0) {
      var tmp = integerLogarithm(value, base.square(base));var p = tmp.p;var e = tmp.e;var t = p.multiply(base);return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
    }return { p: bigInt(1), e: 0 };
  }BigInteger.prototype.bitLength = function () {
    var n = this;if (n.compareTo(bigInt(0)) < 0) {
      n = n.negate().subtract(bigInt(1));
    }if (n.compareTo(bigInt(0)) === 0) {
      return bigInt(0);
    }return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
  };NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;function max(a, b) {
    a = parseValue(a);b = parseValue(b);return a.greater(b) ? a : b;
  }function min(a, b) {
    a = parseValue(a);b = parseValue(b);return a.lesser(b) ? a : b;
  }function gcd(a, b) {
    a = parseValue(a).abs();b = parseValue(b).abs();if (a.equals(b)) return a;if (a.isZero()) return b;if (b.isZero()) return a;var c = Integer[1],
        d,
        t;while (a.isEven() && b.isEven()) {
      d = min(roughLOB(a), roughLOB(b));a = a.divide(d);b = b.divide(d);c = c.multiply(d);
    }while (a.isEven()) {
      a = a.divide(roughLOB(a));
    }do {
      while (b.isEven()) {
        b = b.divide(roughLOB(b));
      }if (a.greater(b)) {
        t = b;b = a;a = t;
      }b = b.subtract(a);
    } while (!b.isZero());return c.isUnit() ? a : a.multiply(c);
  }function lcm(a, b) {
    a = parseValue(a).abs();b = parseValue(b).abs();return a.divide(gcd(a, b)).multiply(b);
  }function randBetween(a, b) {
    a = parseValue(a);b = parseValue(b);var low = min(a, b),
        high = max(a, b);var range = high.subtract(low).add(1);if (range.isSmall) return low.add(Math.floor(Math.random() * range));var digits = toBase(range, BASE).value;var result = [],
        restricted = true;for (var i = 0; i < digits.length; i++) {
      var top = restricted ? digits[i] : BASE;var digit = truncate(Math.random() * top);result.push(digit);if (digit < top) restricted = false;
    }return low.add(Integer.fromArray(result, BASE, false));
  }var parseBase = function parseBase(text, base, alphabet, caseSensitive) {
    alphabet = alphabet || DEFAULT_ALPHABET;text = String(text);if (!caseSensitive) {
      text = text.toLowerCase();alphabet = alphabet.toLowerCase();
    }var length = text.length;var i;var absBase = Math.abs(base);var alphabetValues = {};for (i = 0; i < alphabet.length; i++) {
      alphabetValues[alphabet[i]] = i;
    }for (i = 0; i < length; i++) {
      var c = text[i];if (c === "-") continue;if (c in alphabetValues) {
        if (alphabetValues[c] >= absBase) {
          if (c === "1" && absBase === 1) continue;throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }base = parseValue(base);var digits = [];var isNegative = text[0] === "-";for (i = isNegative ? 1 : 0; i < text.length; i++) {
      var c = text[i];if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));else if (c === "<") {
        var start = i;do {
          i++;
        } while (text[i] !== ">" && i < text.length);digits.push(parseValue(text.slice(start + 1, i)));
      } else throw new Error(c + " is not a valid character");
    }return parseBaseFromArray(digits, base, isNegative);
  };function parseBaseFromArray(digits, base, isNegative) {
    var val = Integer[0],
        pow = Integer[1],
        i;for (i = digits.length - 1; i >= 0; i--) {
      val = val.add(digits[i].times(pow));pow = pow.times(base);
    }return isNegative ? val.negate() : val;
  }function stringify(digit, alphabet) {
    alphabet = alphabet || DEFAULT_ALPHABET;if (digit < alphabet.length) {
      return alphabet[digit];
    }return "<" + digit + ">";
  }function toBase(n, base) {
    base = bigInt(base);if (base.isZero()) {
      if (n.isZero()) return { value: [0], isNegative: false };throw new Error("Cannot convert nonzero numbers to base 0.");
    }if (base.equals(-1)) {
      if (n.isZero()) return { value: [0], isNegative: false };if (n.isNegative()) return { value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber())).map(Array.prototype.valueOf, [1, 0])), isNegative: false };var arr = Array.apply(null, Array(n.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);arr.unshift([1]);return { value: [].concat.apply([], arr), isNegative: false };
    }var neg = false;if (n.isNegative() && base.isPositive()) {
      neg = true;n = n.abs();
    }if (base.isUnit()) {
      if (n.isZero()) return { value: [0], isNegative: false };return { value: Array.apply(null, Array(n.toJSNumber())).map(Number.prototype.valueOf, 1), isNegative: neg };
    }var out = [];var left = n,
        divmod;while (left.isNegative() || left.compareAbs(base) >= 0) {
      divmod = left.divmod(base);left = divmod.quotient;var digit = divmod.remainder;if (digit.isNegative()) {
        digit = base.minus(digit).abs();left = left.next();
      }out.push(digit.toJSNumber());
    }out.push(left.toJSNumber());return { value: out.reverse(), isNegative: neg };
  }function toBaseString(n, base, alphabet) {
    var arr = toBase(n, base);return (arr.isNegative ? "-" : "") + arr.value.map(function (x) {
      return stringify(x, alphabet);
    }).join("");
  }BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };NativeBigInt.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };BigInteger.prototype.toString = function (radix, alphabet) {
    if (radix === undefined) radix = 10;if (radix !== 10) return toBaseString(this, radix, alphabet);var v = this.value,
        l = v.length,
        str = String(v[--l]),
        zeros = "0000000",
        digit;while (--l >= 0) {
      digit = String(v[l]);str += zeros.slice(digit.length) + digit;
    }var sign = this.sign ? "-" : "";return sign + str;
  };SmallInteger.prototype.toString = function (radix, alphabet) {
    if (radix === undefined) radix = 10;if (radix != 10) return toBaseString(this, radix, alphabet);return String(this.value);
  };NativeBigInt.prototype.toString = SmallInteger.prototype.toString;NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };BigInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;SmallInteger.prototype.valueOf = function () {
    return this.value;
  };SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
    return parseInt(this.toString(), 10);
  };function parseStringValue(v) {
    if (isPrecise(+v)) {
      var x = +v;if (x === truncate(x)) return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);throw new Error("Invalid integer: " + v);
    }var sign = v[0] === "-";if (sign) v = v.slice(1);var split = v.split(/e/i);if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));if (split.length === 2) {
      var exp = split[1];if (exp[0] === "+") exp = exp.slice(1);exp = +exp;if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");var text = split[0];var decimalPlace = text.indexOf(".");if (decimalPlace >= 0) {
        exp -= text.length - decimalPlace - 1;text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
      }if (exp < 0) throw new Error("Cannot include negative exponent part for integers");text += new Array(exp + 1).join("0");v = text;
    }var isValid = /^([0-9][0-9]*)$/.test(v);if (!isValid) throw new Error("Invalid integer: " + v);if (supportsNativeBigInt) {
      return new NativeBigInt(BigInt(sign ? "-" + v : v));
    }var r = [],
        max = v.length,
        l = LOG_BASE,
        min = max - l;while (max > 0) {
      r.push(+v.slice(min, max));min -= l;if (min < 0) min = 0;max -= l;
    }trim(r);return new BigInteger(r, sign);
  }function parseNumberValue(v) {
    if (supportsNativeBigInt) {
      return new NativeBigInt(BigInt(v));
    }if (isPrecise(v)) {
      if (v !== truncate(v)) throw new Error(v + " is not an integer.");return new SmallInteger(v);
    }return parseStringValue(v.toString());
  }function parseValue(v) {
    if (typeof v === "number") {
      return parseNumberValue(v);
    }if (typeof v === "string") {
      return parseStringValue(v);
    }if (typeof v === "bigint") {
      return new NativeBigInt(v);
    }return v;
  }for (var i = 0; i < 1e3; i++) {
    Integer[i] = parseValue(i);if (i > 0) Integer[-i] = parseValue(-i);
  }Integer.one = Integer[1];Integer.zero = Integer[0];Integer.minusOne = Integer[-1];Integer.max = max;Integer.min = min;Integer.gcd = gcd;Integer.lcm = lcm;Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt;
  };Integer.randBetween = randBetween;Integer.fromArray = function (digits, base, isNegative) {
    return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
  };return Integer;
})();if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
  module.exports = bigInt;
}if (typeof define === "function" && define.amd) {
  define("big-integer", [], function () {
    return bigInt;
  });
}

},{}],2:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @module FactoryMaker
 * @ignore
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var FactoryMaker = (function () {

    var instance = undefined;
    var singletonContexts = [];
    var singletonFactories = {};
    var classFactories = {};

    function extend(name, childInstance, override, context) {
        if (!context[name] && childInstance) {
            context[name] = {
                instance: childInstance,
                override: override
            };
        }
    }

    /**
     * Use this method from your extended object.  this.factory is injected into your object.
     * this.factory.getSingletonInstance(this.context, 'VideoModel')
     * will return the video model for use in the extended object.
     *
     * @param {Object} context - injected into extended object as this.context
     * @param {string} className - string name found in all dash.js objects
     * with name __dashjs_factory_name Will be at the bottom. Will be the same as the object's name.
     * @returns {*} Context aware instance of specified singleton name.
     * @memberof module:FactoryMaker
     * @instance
     */
    function getSingletonInstance(context, className) {
        for (var i in singletonContexts) {
            var obj = singletonContexts[i];
            if (obj.context === context && obj.name === className) {
                return obj.instance;
            }
        }
        return null;
    }

    /**
     * Use this method to add an singleton instance to the system.  Useful for unit testing to mock objects etc.
     *
     * @param {Object} context
     * @param {string} className
     * @param {Object} instance
     * @memberof module:FactoryMaker
     * @instance
     */
    function setSingletonInstance(context, className, instance) {
        for (var i in singletonContexts) {
            var obj = singletonContexts[i];
            if (obj.context === context && obj.name === className) {
                singletonContexts[i].instance = instance;
                return;
            }
        }
        singletonContexts.push({
            name: className,
            context: context,
            instance: instance
        });
    }

    /*------------------------------------------------------------------------------------------*/

    // Factories storage Management

    /*------------------------------------------------------------------------------------------*/

    function getFactoryByName(name, factoriesArray) {
        return factoriesArray[name];
    }

    function updateFactory(name, factory, factoriesArray) {
        if (name in factoriesArray) {
            factoriesArray[name] = factory;
        }
    }

    /*------------------------------------------------------------------------------------------*/

    // Class Factories Management

    /*------------------------------------------------------------------------------------------*/

    function updateClassFactory(name, factory) {
        updateFactory(name, factory, classFactories);
    }

    function getClassFactoryByName(name) {
        return getFactoryByName(name, classFactories);
    }

    function getClassFactory(classConstructor) {
        var factory = getFactoryByName(classConstructor.__dashjs_factory_name, classFactories);

        if (!factory) {
            factory = function (context) {
                if (context === undefined) {
                    context = {};
                }
                return {
                    create: function create() {
                        return merge(classConstructor, context, arguments);
                    }
                };
            };

            classFactories[classConstructor.__dashjs_factory_name] = factory; // store factory
        }
        return factory;
    }

    /*------------------------------------------------------------------------------------------*/

    // Singleton Factory MAangement

    /*------------------------------------------------------------------------------------------*/

    function updateSingletonFactory(name, factory) {
        updateFactory(name, factory, singletonFactories);
    }

    function getSingletonFactoryByName(name) {
        return getFactoryByName(name, singletonFactories);
    }

    function getSingletonFactory(classConstructor) {
        var factory = getFactoryByName(classConstructor.__dashjs_factory_name, singletonFactories);
        if (!factory) {
            factory = function (context) {
                var instance = undefined;
                if (context === undefined) {
                    context = {};
                }
                return {
                    getInstance: function getInstance() {
                        // If we don't have an instance yet check for one on the context
                        if (!instance) {
                            instance = getSingletonInstance(context, classConstructor.__dashjs_factory_name);
                        }
                        // If there's no instance on the context then create one
                        if (!instance) {
                            instance = merge(classConstructor, context, arguments);
                            singletonContexts.push({
                                name: classConstructor.__dashjs_factory_name,
                                context: context,
                                instance: instance
                            });
                        }
                        return instance;
                    }
                };
            };
            singletonFactories[classConstructor.__dashjs_factory_name] = factory; // store factory
        }

        return factory;
    }

    function merge(classConstructor, context, args) {

        var classInstance = undefined;
        var className = classConstructor.__dashjs_factory_name;
        var extensionObject = context[className];

        if (extensionObject) {

            var extension = extensionObject.instance;

            if (extensionObject.override) {
                //Override public methods in parent but keep parent.

                classInstance = classConstructor.apply({ context: context }, args);
                extension = extension.apply({
                    context: context,
                    factory: instance,
                    parent: classInstance
                }, args);

                for (var prop in extension) {
                    if (classInstance.hasOwnProperty(prop)) {
                        classInstance[prop] = extension[prop];
                    }
                }
            } else {
                //replace parent object completely with new object. Same as dijon.

                return extension.apply({
                    context: context,
                    factory: instance
                }, args);
            }
        } else {
            // Create new instance of the class
            classInstance = classConstructor.apply({ context: context }, args);
        }

        // Add getClassName function to class instance prototype (used by Debug)
        classInstance.getClassName = function () {
            return className;
        };

        return classInstance;
    }

    instance = {
        extend: extend,
        getSingletonInstance: getSingletonInstance,
        setSingletonInstance: setSingletonInstance,
        getSingletonFactory: getSingletonFactory,
        getSingletonFactoryByName: getSingletonFactoryByName,
        updateSingletonFactory: updateSingletonFactory,
        getClassFactory: getClassFactory,
        getClassFactoryByName: getClassFactoryByName,
        updateClassFactory: updateClassFactory
    };

    return instance;
})();

exports["default"] = FactoryMaker;
module.exports = exports["default"];

},{}],3:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @class
 * @ignore
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ErrorsBase = (function () {
    function ErrorsBase() {
        _classCallCheck(this, ErrorsBase);
    }

    _createClass(ErrorsBase, [{
        key: 'extend',
        value: function extend(errors, config) {
            if (!errors) return;

            var override = config ? config.override : false;
            var publicOnly = config ? config.publicOnly : false;

            for (var err in errors) {
                if (!errors.hasOwnProperty(err) || this[err] && !override) continue;
                if (publicOnly && errors[err].indexOf('public_') === -1) continue;
                this[err] = errors[err];
            }
        }
    }]);

    return ErrorsBase;
})();

exports['default'] = ErrorsBase;
module.exports = exports['default'];

},{}],4:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @class
 * @ignore
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EventsBase = (function () {
    function EventsBase() {
        _classCallCheck(this, EventsBase);
    }

    _createClass(EventsBase, [{
        key: 'extend',
        value: function extend(events, config) {
            if (!events) return;

            var override = config ? config.override : false;
            var publicOnly = config ? config.publicOnly : false;

            for (var evt in events) {
                if (!events.hasOwnProperty(evt) || this[evt] && !override) continue;
                if (publicOnly && events[evt].indexOf('public_') === -1) continue;
                this[evt] = events[evt];
            }
        }
    }]);

    return EventsBase;
})();

exports['default'] = EventsBase;
module.exports = exports['default'];

},{}],5:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _streamingVoFragmentRequest = _dereq_('../streaming/vo/FragmentRequest');

var _streamingVoFragmentRequest2 = _interopRequireDefault(_streamingVoFragmentRequest);

function MssFragmentInfoController(config) {

    config = config || {};

    var instance = undefined,
        logger = undefined,
        fragmentModel = undefined,
        started = undefined,
        type = undefined,
        loadFragmentTimeout = undefined,
        startTime = undefined,
        startFragmentTime = undefined,
        index = undefined;

    var streamProcessor = config.streamProcessor;
    var baseURLController = config.baseURLController;
    var debug = config.debug;
    var controllerType = 'MssFragmentInfoController';

    function setup() {
        logger = debug.getLogger(instance);
    }

    function initialize() {
        type = streamProcessor.getType();
        fragmentModel = streamProcessor.getFragmentModel();

        started = false;
        startTime = null;
        startFragmentTime = null;
    }

    function start() {
        if (started) return;

        logger.debug('Start');

        started = true;
        startTime = new Date().getTime();
        index = 0;

        loadNextFragmentInfo();
    }

    function stop() {
        if (!started) return;

        logger.debug('Stop');

        clearTimeout(loadFragmentTimeout);
        started = false;
        startTime = null;
        startFragmentTime = null;
    }

    function reset() {
        stop();
    }

    function loadNextFragmentInfo() {
        if (!started) return;

        // Get last segment from SegmentTimeline
        var representation = getCurrentRepresentation();
        var manifest = representation.adaptation.period.mpd.manifest;
        var adaptation = manifest.Period_asArray[representation.adaptation.period.index].AdaptationSet_asArray[representation.adaptation.index];
        var segments = adaptation.SegmentTemplate.SegmentTimeline.S_asArray;
        var segment = segments[segments.length - 1];

        // logger.debug('Last fragment time: ' + (segment.t / adaptation.SegmentTemplate.timescale));

        // Generate segment request
        var request = getRequestForSegment(adaptation, representation, segment);

        // Send segment request
        requestFragment.call(this, request);
    }

    function getRequestForSegment(adaptation, representation, segment) {
        var timescale = adaptation.SegmentTemplate.timescale;
        var request = new _streamingVoFragmentRequest2['default']();

        request.mediaType = type;
        request.type = 'FragmentInfoSegment';
        // request.range = segment.mediaRange;
        request.startTime = segment.t / timescale;
        request.duration = segment.d / timescale;
        request.timescale = timescale;
        // request.availabilityStartTime = segment.availabilityStartTime;
        // request.availabilityEndTime = segment.availabilityEndTime;
        // request.wallStartTime = segment.wallStartTime;
        request.quality = representation.index;
        request.index = index++;
        request.mediaInfo = streamProcessor.getMediaInfo();
        request.adaptationIndex = representation.adaptation.index;
        request.representationId = representation.id;
        request.url = baseURLController.resolve(representation.path).url + adaptation.SegmentTemplate.media;
        request.url = request.url.replace('$Bandwidth$', representation.bandwidth);
        request.url = request.url.replace('$Time$', segment.tManifest ? segment.tManifest : segment.t);
        request.url = request.url.replace('/Fragments(', '/FragmentInfo(');

        return request;
    }

    function getCurrentRepresentation() {
        var representationController = streamProcessor.getRepresentationController();
        var representation = representationController.getCurrentRepresentation();
        return representation;
    }

    function requestFragment(request) {
        // logger.debug('Load FragmentInfo for time: ' + request.startTime);
        if (streamProcessor.getFragmentModel().isFragmentLoadedOrPending(request)) {
            // We may have reached end of timeline in case of start-over streams
            logger.debug('End of timeline');
            stop();
            return;
        }

        fragmentModel.executeRequest(request);
    }

    function fragmentInfoLoaded(e) {
        if (!started) return;

        var request = e.request;
        if (!e.response) {
            logger.error('Load error', request.url);
            return;
        }

        var deltaFragmentTime = undefined,
            deltaTime = undefined,
            delay = undefined;

        // logger.debug('FragmentInfo loaded: ', request.url);

        if (!startFragmentTime) {
            startFragmentTime = request.startTime;
        }

        // Determine delay before requesting next FragmentInfo
        deltaTime = (new Date().getTime() - startTime) / 1000;
        deltaFragmentTime = request.startTime + request.duration - startFragmentTime;
        delay = Math.max(0, deltaFragmentTime - deltaTime);

        // Set timeout for requesting next FragmentInfo
        clearTimeout(loadFragmentTimeout);
        loadFragmentTimeout = setTimeout(function () {
            loadFragmentTimeout = null;
            loadNextFragmentInfo();
        }, delay * 1000);
    }

    function getType() {
        return type;
    }

    instance = {
        initialize: initialize,
        controllerType: controllerType,
        start: start,
        fragmentInfoLoaded: fragmentInfoLoaded,
        getType: getType,
        reset: reset
    };

    setup();

    return instance;
}

MssFragmentInfoController.__dashjs_factory_name = 'MssFragmentInfoController';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssFragmentInfoController);
/* jshint ignore:line */
module.exports = exports['default'];

},{"../streaming/vo/FragmentRequest":17}],6:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _streamingVoDashJSError = _dereq_('../streaming/vo/DashJSError');

var _streamingVoDashJSError2 = _interopRequireDefault(_streamingVoDashJSError);

var _errorsMssErrors = _dereq_('./errors/MssErrors');

var _errorsMssErrors2 = _interopRequireDefault(_errorsMssErrors);

var _streamingMediaPlayerEvents = _dereq_('../streaming/MediaPlayerEvents');

var _streamingMediaPlayerEvents2 = _interopRequireDefault(_streamingMediaPlayerEvents);

/**
 * @module MssFragmentMoofProcessor
 * @ignore
 * @param {Object} config object
 */
function MssFragmentMoofProcessor(config) {

    config = config || {};
    var instance = undefined,
        type = undefined,
        logger = undefined;
    var dashMetrics = config.dashMetrics;
    var playbackController = config.playbackController;
    var errorHandler = config.errHandler;
    var eventBus = config.eventBus;
    var ISOBoxer = config.ISOBoxer;
    var debug = config.debug;

    function setup() {
        logger = debug.getLogger(instance);
        type = '';
    }

    function processTfrf(request, tfrf, tfdt, streamProcessor) {
        var representationController = streamProcessor.getRepresentationController();
        var representation = representationController.getCurrentRepresentation();

        var manifest = representation.adaptation.period.mpd.manifest;
        var adaptation = manifest.Period_asArray[representation.adaptation.period.index].AdaptationSet_asArray[representation.adaptation.index];
        var timescale = adaptation.SegmentTemplate.timescale;

        type = streamProcessor.getType();

        // Process tfrf only for live streams or start-over static streams (timeShiftBufferDepth > 0)
        if (manifest.type !== 'dynamic' && !manifest.timeShiftBufferDepth) {
            return;
        }

        if (!tfrf) {
            errorHandler.error(new _streamingVoDashJSError2['default'](_errorsMssErrors2['default'].MSS_NO_TFRF_CODE, _errorsMssErrors2['default'].MSS_NO_TFRF_MESSAGE));
            return;
        }

        // Get adaptation's segment timeline (always a SegmentTimeline in Smooth Streaming use case)
        var segments = adaptation.SegmentTemplate.SegmentTimeline.S;
        var entries = tfrf.entry;
        var entry = undefined,
            segmentTime = undefined,
            range = undefined;
        var segment = null;
        var t = 0;
        var availabilityStartTime = null;

        if (entries.length === 0) {
            return;
        }

        // Consider only first tfrf entry (to avoid pre-condition failure on fragment info requests)
        entry = entries[0];

        // In case of start-over streams, check if we have reached end of original manifest duration (set in timeShiftBufferDepth)
        // => then do not update anymore timeline
        if (manifest.type === 'static') {
            // Get first segment time
            segmentTime = segments[0].tManifest ? parseFloat(segments[0].tManifest) : segments[0].t;
            if (entry.fragment_absolute_time > segmentTime + manifest.timeShiftBufferDepth * timescale) {
                return;
            }
        }

        // logger.debug('entry - t = ', (entry.fragment_absolute_time / timescale));

        // Get last segment time
        segmentTime = segments[segments.length - 1].tManifest ? parseFloat(segments[segments.length - 1].tManifest) : segments[segments.length - 1].t;
        // logger.debug('Last segment - t = ', (segmentTime / timescale));

        // Check if we have to append new segment to timeline
        if (entry.fragment_absolute_time <= segmentTime) {
            // Update DVR window range => set range end to end time of current segment
            range = {
                start: segments[0].t / timescale,
                end: tfdt.baseMediaDecodeTime / timescale + request.duration
            };

            updateDVR(request.mediaType, range, streamProcessor.getStreamInfo().manifestInfo);
            return;
        }

        // logger.debug('Add new segment - t = ', (entry.fragment_absolute_time / timescale));
        segment = {};
        segment.t = entry.fragment_absolute_time;
        segment.d = entry.fragment_duration;
        // If timestamps starts at 0 relative to 1st segment (dynamic to static) then update segment time
        if (segments[0].tManifest) {
            segment.t -= parseFloat(segments[0].tManifest) - segments[0].t;
            segment.tManifest = entry.fragment_absolute_time;
        }
        segments.push(segment);

        // In case of static start-over streams, update content duration
        if (manifest.type === 'static') {
            if (type === 'video') {
                segment = segments[segments.length - 1];
                var end = (segment.t + segment.d) / timescale;
                if (end > representation.adaptation.period.duration) {
                    eventBus.trigger(_streamingMediaPlayerEvents2['default'].MANIFEST_VALIDITY_CHANGED, { sender: this, newDuration: end });
                }
            }
            return;
        }
        // In case of live streams, update segment timeline according to DVR window
        else if (manifest.timeShiftBufferDepth && manifest.timeShiftBufferDepth > 0) {
                // Get timestamp of the last segment
                segment = segments[segments.length - 1];
                t = segment.t;

                // Determine the segments' availability start time
                availabilityStartTime = Math.round((t - manifest.timeShiftBufferDepth * timescale) / timescale);

                // Remove segments prior to availability start time
                segment = segments[0];
                while (Math.round(segment.t / timescale) < availabilityStartTime) {
                    // logger.debug('Remove segment  - t = ' + (segment.t / timescale));
                    segments.splice(0, 1);
                    segment = segments[0];
                }

                // Update DVR window range => set range end to end time of current segment
                range = {
                    start: segments[0].t / timescale,
                    end: tfdt.baseMediaDecodeTime / timescale + request.duration
                };

                updateDVR(type, range, streamProcessor.getStreamInfo().manifestInfo);
            }

        representationController.updateRepresentation(representation, true);
    }

    function updateDVR(type, range, manifestInfo) {
        var dvrInfos = dashMetrics.getCurrentDVRInfo(type);
        if (!dvrInfos || range.end > dvrInfos.range.end) {
            logger.debug('Update DVR range: [' + range.start + ' - ' + range.end + ']');
            dashMetrics.addDVRInfo(type, playbackController.getTime(), manifestInfo, range);
        }
    }

    // This function returns the offset of the 1st byte of a child box within a container box
    function getBoxOffset(parent, type) {
        var offset = 8;
        var i = 0;

        for (i = 0; i < parent.boxes.length; i++) {
            if (parent.boxes[i].type === type) {
                return offset;
            }
            offset += parent.boxes[i].size;
        }
        return offset;
    }

    function convertFragment(e, streamProcessor) {
        var i = undefined;

        // e.request contains request description object
        // e.response contains fragment bytes
        var isoFile = ISOBoxer.parseBuffer(e.response);
        // Update track_Id in tfhd box
        var tfhd = isoFile.fetch('tfhd');
        tfhd.track_ID = e.request.mediaInfo.index + 1;

        // Add tfdt box
        var tfdt = isoFile.fetch('tfdt');
        var traf = isoFile.fetch('traf');
        if (tfdt === null) {
            tfdt = ISOBoxer.createFullBox('tfdt', traf, tfhd);
            tfdt.version = 1;
            tfdt.flags = 0;
            tfdt.baseMediaDecodeTime = Math.floor(e.request.startTime * e.request.timescale);
        }

        var trun = isoFile.fetch('trun');

        // Process tfxd boxes
        // This box provide absolute timestamp but we take the segment start time for tfdt
        var tfxd = isoFile.fetch('tfxd');
        if (tfxd) {
            tfxd._parent.boxes.splice(tfxd._parent.boxes.indexOf(tfxd), 1);
            tfxd = null;
        }
        var tfrf = isoFile.fetch('tfrf');
        processTfrf(e.request, tfrf, tfdt, streamProcessor);
        if (tfrf) {
            tfrf._parent.boxes.splice(tfrf._parent.boxes.indexOf(tfrf), 1);
            tfrf = null;
        }

        // If protected content in PIFF1.1 format (sepiff box = Sample Encryption PIFF)
        // => convert sepiff box it into a senc box
        // => create saio and saiz boxes (if not already present)
        var sepiff = isoFile.fetch('sepiff');
        if (sepiff !== null) {
            sepiff.type = 'senc';
            sepiff.usertype = undefined;

            var _saio = isoFile.fetch('saio');
            if (_saio === null) {
                // Create Sample Auxiliary Information Offsets Box box (saio)
                _saio = ISOBoxer.createFullBox('saio', traf);
                _saio.version = 0;
                _saio.flags = 0;
                _saio.entry_count = 1;
                _saio.offset = [0];

                var saiz = ISOBoxer.createFullBox('saiz', traf);
                saiz.version = 0;
                saiz.flags = 0;
                saiz.sample_count = sepiff.sample_count;
                saiz.default_sample_info_size = 0;
                saiz.sample_info_size = [];

                if (sepiff.flags & 0x02) {
                    // Sub-sample encryption => set sample_info_size for each sample
                    for (i = 0; i < sepiff.sample_count; i += 1) {
                        // 10 = 8 (InitializationVector field size) + 2 (subsample_count field size)
                        // 6 = 2 (BytesOfClearData field size) + 4 (BytesOfEncryptedData field size)
                        saiz.sample_info_size[i] = 10 + 6 * sepiff.entry[i].NumberOfEntries;
                    }
                } else {
                    // No sub-sample encryption => set default sample_info_size = InitializationVector field size (8)
                    saiz.default_sample_info_size = 8;
                }
            }
        }

        tfhd.flags &= 0xFFFFFE; // set tfhd.base-data-offset-present to false
        tfhd.flags |= 0x020000; // set tfhd.default-base-is-moof to true
        trun.flags |= 0x000001; // set trun.data-offset-present to true

        // Update trun.data_offset field that corresponds to first data byte (inside mdat box)
        var moof = isoFile.fetch('moof');
        var length = moof.getLength();
        trun.data_offset = length + 8;

        // Update saio box offset field according to new senc box offset
        var saio = isoFile.fetch('saio');
        if (saio !== null) {
            var trafPosInMoof = getBoxOffset(moof, 'traf');
            var sencPosInTraf = getBoxOffset(traf, 'senc');
            // Set offset from begin fragment to the first IV field in senc box
            saio.offset[0] = trafPosInMoof + sencPosInTraf + 16; // 16 = box header (12) + sample_count field size (4)
        }

        // Write transformed/processed fragment into request reponse data
        e.response = isoFile.write();
    }

    function updateSegmentList(e, streamProcessor) {
        // e.request contains request description object
        // e.response contains fragment bytes
        if (!e.response) {
            throw new Error('e.response parameter is missing');
        }

        var isoFile = ISOBoxer.parseBuffer(e.response);
        // Update track_Id in tfhd box
        var tfhd = isoFile.fetch('tfhd');
        tfhd.track_ID = e.request.mediaInfo.index + 1;

        // Add tfdt box
        var tfdt = isoFile.fetch('tfdt');
        var traf = isoFile.fetch('traf');
        if (tfdt === null) {
            tfdt = ISOBoxer.createFullBox('tfdt', traf, tfhd);
            tfdt.version = 1;
            tfdt.flags = 0;
            tfdt.baseMediaDecodeTime = Math.floor(e.request.startTime * e.request.timescale);
        }

        var tfrf = isoFile.fetch('tfrf');
        processTfrf(e.request, tfrf, tfdt, streamProcessor);
        if (tfrf) {
            tfrf._parent.boxes.splice(tfrf._parent.boxes.indexOf(tfrf), 1);
            tfrf = null;
        }
    }

    function getType() {
        return type;
    }

    instance = {
        convertFragment: convertFragment,
        updateSegmentList: updateSegmentList,
        getType: getType
    };

    setup();
    return instance;
}

MssFragmentMoofProcessor.__dashjs_factory_name = 'MssFragmentMoofProcessor';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssFragmentMoofProcessor);
/* jshint ignore:line */
module.exports = exports['default'];

},{"../streaming/MediaPlayerEvents":13,"../streaming/vo/DashJSError":15,"./errors/MssErrors":10}],7:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _errorsMssErrors = _dereq_('./errors/MssErrors');

var _errorsMssErrors2 = _interopRequireDefault(_errorsMssErrors);

/**
 * @module MssFragmentMoovProcessor
 * @ignore
 * @param {Object} config object
 */
function MssFragmentMoovProcessor(config) {
    config = config || {};
    var NALUTYPE_SPS = 7;
    var NALUTYPE_PPS = 8;
    var constants = config.constants;
    var ISOBoxer = config.ISOBoxer;

    var protectionController = config.protectionController;
    var instance = undefined,
        period = undefined,
        adaptationSet = undefined,
        representation = undefined,
        contentProtection = undefined,
        timescale = undefined,
        trackId = undefined;

    function createFtypBox(isoFile) {
        var ftyp = ISOBoxer.createBox('ftyp', isoFile);
        ftyp.major_brand = 'iso6';
        ftyp.minor_version = 1; // is an informative integer for the minor version of the major brand
        ftyp.compatible_brands = []; //is a list, to the end of the box, of brands isom, iso6 and msdh
        ftyp.compatible_brands[0] = 'isom'; // => decimal ASCII value for isom
        ftyp.compatible_brands[1] = 'iso6'; // => decimal ASCII value for iso6
        ftyp.compatible_brands[2] = 'msdh'; // => decimal ASCII value for msdh

        return ftyp;
    }

    function createMoovBox(isoFile) {

        // moov box
        var moov = ISOBoxer.createBox('moov', isoFile);

        // moov/mvhd
        createMvhdBox(moov);

        // moov/trak
        var trak = ISOBoxer.createBox('trak', moov);

        // moov/trak/tkhd
        createTkhdBox(trak);

        // moov/trak/mdia
        var mdia = ISOBoxer.createBox('mdia', trak);

        // moov/trak/mdia/mdhd
        createMdhdBox(mdia);

        // moov/trak/mdia/hdlr
        createHdlrBox(mdia);

        // moov/trak/mdia/minf
        var minf = ISOBoxer.createBox('minf', mdia);

        switch (adaptationSet.type) {
            case constants.VIDEO:
                // moov/trak/mdia/minf/vmhd
                createVmhdBox(minf);
                break;
            case constants.AUDIO:
                // moov/trak/mdia/minf/smhd
                createSmhdBox(minf);
                break;
            default:
                break;
        }

        // moov/trak/mdia/minf/dinf
        var dinf = ISOBoxer.createBox('dinf', minf);

        // moov/trak/mdia/minf/dinf/dref
        createDrefBox(dinf);

        // moov/trak/mdia/minf/stbl
        var stbl = ISOBoxer.createBox('stbl', minf);

        // Create empty stts, stsc, stco and stsz boxes
        // Use data field as for codem-isoboxer unknown boxes for setting fields value

        // moov/trak/mdia/minf/stbl/stts
        var stts = ISOBoxer.createFullBox('stts', stbl);
        stts._data = [0, 0, 0, 0, 0, 0, 0, 0]; // version = 0, flags = 0, entry_count = 0

        // moov/trak/mdia/minf/stbl/stsc
        var stsc = ISOBoxer.createFullBox('stsc', stbl);
        stsc._data = [0, 0, 0, 0, 0, 0, 0, 0]; // version = 0, flags = 0, entry_count = 0

        // moov/trak/mdia/minf/stbl/stco
        var stco = ISOBoxer.createFullBox('stco', stbl);
        stco._data = [0, 0, 0, 0, 0, 0, 0, 0]; // version = 0, flags = 0, entry_count = 0

        // moov/trak/mdia/minf/stbl/stsz
        var stsz = ISOBoxer.createFullBox('stsz', stbl);
        stsz._data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // version = 0, flags = 0, sample_size = 0, sample_count = 0

        // moov/trak/mdia/minf/stbl/stsd
        createStsdBox(stbl);

        // moov/mvex
        var mvex = ISOBoxer.createBox('mvex', moov);

        // moov/mvex/trex
        createTrexBox(mvex);

        if (contentProtection && protectionController) {
            var supportedKS = protectionController.getSupportedKeySystemsFromContentProtection(contentProtection);
            createProtectionSystemSpecificHeaderBox(moov, supportedKS);
        }
    }

    function createMvhdBox(moov) {

        var mvhd = ISOBoxer.createFullBox('mvhd', moov);

        mvhd.version = 1; // version = 1  in order to have 64bits duration value

        mvhd.creation_time = 0; // the creation time of the presentation => ignore (set to 0)
        mvhd.modification_time = 0; // the most recent time the presentation was modified => ignore (set to 0)
        mvhd.timescale = timescale; // the time-scale for the entire presentation => 10000000 for MSS
        mvhd.duration = period.duration === Infinity ? 0xFFFFFFFFFFFFFFFF : Math.round(period.duration * timescale); // the length of the presentation (in the indicated timescale) =>  take duration of period
        mvhd.rate = 1.0; // 16.16 number, '1.0' = normal playback
        mvhd.volume = 1.0; // 8.8 number, '1.0' = full volume
        mvhd.reserved1 = 0;
        mvhd.reserved2 = [0x0, 0x0];
        mvhd.matrix = [1, 0, 0, // provides a transformation matrix for the video;
        0, 1, 0, // (u,v,w) are restricted here to (0,0,1)
        0, 0, 16384];
        mvhd.pre_defined = [0, 0, 0, 0, 0, 0];
        mvhd.next_track_ID = trackId + 1; // indicates a value to use for the track ID of the next track to be added to this presentation

        return mvhd;
    }

    function createTkhdBox(trak) {

        var tkhd = ISOBoxer.createFullBox('tkhd', trak);

        tkhd.version = 1; // version = 1  in order to have 64bits duration value
        tkhd.flags = 0x1 | // Track_enabled (0x000001): Indicates that the track is enabled
        0x2 | // Track_in_movie (0x000002):  Indicates that the track is used in the presentation
        0x4; // Track_in_preview (0x000004):  Indicates that the track is used when previewing the presentation

        tkhd.creation_time = 0; // the creation time of the presentation => ignore (set to 0)
        tkhd.modification_time = 0; // the most recent time the presentation was modified => ignore (set to 0)
        tkhd.track_ID = trackId; // uniquely identifies this track over the entire life-time of this presentation
        tkhd.reserved1 = 0;
        tkhd.duration = period.duration === Infinity ? 0xFFFFFFFFFFFFFFFF : Math.round(period.duration * timescale); // the duration of this track (in the timescale indicated in the Movie Header Box) =>  take duration of period
        tkhd.reserved2 = [0x0, 0x0];
        tkhd.layer = 0; // specifies the front-to-back ordering of video tracks; tracks with lower numbers are closer to the viewer => 0 since only one video track
        tkhd.alternate_group = 0; // specifies a group or collection of tracks => ignore
        tkhd.volume = 1.0; // '1.0' = full volume
        tkhd.reserved3 = 0;
        tkhd.matrix = [1, 0, 0, // provides a transformation matrix for the video;
        0, 1, 0, // (u,v,w) are restricted here to (0,0,1)
        0, 0, 16384];
        tkhd.width = representation.width; // visual presentation width
        tkhd.height = representation.height; // visual presentation height

        return tkhd;
    }

    function createMdhdBox(mdia) {

        var mdhd = ISOBoxer.createFullBox('mdhd', mdia);

        mdhd.version = 1; // version = 1  in order to have 64bits duration value

        mdhd.creation_time = 0; // the creation time of the presentation => ignore (set to 0)
        mdhd.modification_time = 0; // the most recent time the presentation was modified => ignore (set to 0)
        mdhd.timescale = timescale; // the time-scale for the entire presentation
        mdhd.duration = period.duration === Infinity ? 0xFFFFFFFFFFFFFFFF : Math.round(period.duration * timescale); // the duration of this media (in the scale of the timescale). If the duration cannot be determined then duration is set to all 1s.
        mdhd.language = adaptationSet.lang || 'und'; // declares the language code for this media
        mdhd.pre_defined = 0;

        return mdhd;
    }

    function createHdlrBox(mdia) {

        var hdlr = ISOBoxer.createFullBox('hdlr', mdia);

        hdlr.pre_defined = 0;
        switch (adaptationSet.type) {
            case constants.VIDEO:
                hdlr.handler_type = 'vide';
                break;
            case constants.AUDIO:
                hdlr.handler_type = 'soun';
                break;
            default:
                hdlr.handler_type = 'meta';
                break;
        }
        hdlr.name = representation.id;
        hdlr.reserved = [0, 0, 0];

        return hdlr;
    }

    function createVmhdBox(minf) {

        var vmhd = ISOBoxer.createFullBox('vmhd', minf);

        vmhd.flags = 1;

        vmhd.graphicsmode = 0; // specifies a composition mode for this video track, from the following enumerated set, which may be extended by derived specifications: copy = 0 copy over the existing image
        vmhd.opcolor = [0, 0, 0]; // is a set of 3 colour values (red, green, blue) available for use by graphics modes

        return vmhd;
    }

    function createSmhdBox(minf) {

        var smhd = ISOBoxer.createFullBox('smhd', minf);

        smhd.flags = 1;

        smhd.balance = 0; // is a fixed-point 8.8 number that places mono audio tracks in a stereo space; 0 is centre (the normal value); full left is -1.0 and full right is 1.0.
        smhd.reserved = 0;

        return smhd;
    }

    function createDrefBox(dinf) {

        var dref = ISOBoxer.createFullBox('dref', dinf);

        dref.entry_count = 1;
        dref.entries = [];

        var url = ISOBoxer.createFullBox('url ', dref, false);
        url.location = '';
        url.flags = 1;

        dref.entries.push(url);

        return dref;
    }

    function createStsdBox(stbl) {

        var stsd = ISOBoxer.createFullBox('stsd', stbl);

        stsd.entries = [];
        switch (adaptationSet.type) {
            case constants.VIDEO:
            case constants.AUDIO:
                stsd.entries.push(createSampleEntry(stsd));
                break;
            default:
                break;
        }

        stsd.entry_count = stsd.entries.length; // is an integer that counts the actual entries
        return stsd;
    }

    function createSampleEntry(stsd) {
        var codec = representation.codecs.substring(0, representation.codecs.indexOf('.'));

        switch (codec) {
            case 'avc1':
                return createAVCVisualSampleEntry(stsd, codec);
            case 'mp4a':
                return createMP4AudioSampleEntry(stsd, codec);
            default:
                throw {
                    code: _errorsMssErrors2['default'].MSS_UNSUPPORTED_CODEC_CODE,
                    message: _errorsMssErrors2['default'].MSS_UNSUPPORTED_CODEC_MESSAGE,
                    data: {
                        codec: codec
                    }
                };
        }
    }

    function createAVCVisualSampleEntry(stsd, codec) {
        var avc1 = undefined;

        if (contentProtection) {
            avc1 = ISOBoxer.createBox('encv', stsd, false);
        } else {
            avc1 = ISOBoxer.createBox('avc1', stsd, false);
        }

        // SampleEntry fields
        avc1.reserved1 = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
        avc1.data_reference_index = 1;

        // VisualSampleEntry fields
        avc1.pre_defined1 = 0;
        avc1.reserved2 = 0;
        avc1.pre_defined2 = [0, 0, 0];
        avc1.height = representation.height;
        avc1.width = representation.width;
        avc1.horizresolution = 72; // 72 dpi
        avc1.vertresolution = 72; // 72 dpi
        avc1.reserved3 = 0;
        avc1.frame_count = 1; // 1 compressed video frame per sample
        avc1.compressorname = [0x0A, 0x41, 0x56, 0x43, 0x20, 0x43, 0x6F, 0x64, // = 'AVC Coding';
        0x69, 0x6E, 0x67, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        avc1.depth = 0x0018; // 0x0018 – images are in colour with no alpha.
        avc1.pre_defined3 = 65535;
        avc1.config = createAVC1ConfigurationRecord();
        if (contentProtection) {
            // Create and add Protection Scheme Info Box
            var sinf = ISOBoxer.createBox('sinf', avc1);

            // Create and add Original Format Box => indicate codec type of the encrypted content
            createOriginalFormatBox(sinf, codec);

            // Create and add Scheme Type box
            createSchemeTypeBox(sinf);

            // Create and add Scheme Information Box
            createSchemeInformationBox(sinf);
        }

        return avc1;
    }

    function createAVC1ConfigurationRecord() {

        var avcC = null;
        var avcCLength = 15; // length = 15 by default (0 SPS and 0 PPS)

        // First get all SPS and PPS from codecPrivateData
        var sps = [];
        var pps = [];
        var AVCProfileIndication = 0;
        var AVCLevelIndication = 0;
        var profile_compatibility = 0;

        var nalus = representation.codecPrivateData.split('00000001').slice(1);
        var naluBytes = undefined,
            naluType = undefined;

        for (var _i = 0; _i < nalus.length; _i++) {
            naluBytes = hexStringtoBuffer(nalus[_i]);

            naluType = naluBytes[0] & 0x1F;

            switch (naluType) {
                case NALUTYPE_SPS:
                    sps.push(naluBytes);
                    avcCLength += naluBytes.length + 2; // 2 = sequenceParameterSetLength field length
                    break;
                case NALUTYPE_PPS:
                    pps.push(naluBytes);
                    avcCLength += naluBytes.length + 2; // 2 = pictureParameterSetLength field length
                    break;
                default:
                    break;
            }
        }

        // Get profile and level from SPS
        if (sps.length > 0) {
            AVCProfileIndication = sps[0][1];
            profile_compatibility = sps[0][2];
            AVCLevelIndication = sps[0][3];
        }

        // Generate avcC buffer
        avcC = new Uint8Array(avcCLength);

        var i = 0;
        // length
        avcC[i++] = (avcCLength & 0xFF000000) >> 24;
        avcC[i++] = (avcCLength & 0x00FF0000) >> 16;
        avcC[i++] = (avcCLength & 0x0000FF00) >> 8;
        avcC[i++] = avcCLength & 0x000000FF;
        avcC.set([0x61, 0x76, 0x63, 0x43], i); // type = 'avcC'
        i += 4;
        avcC[i++] = 1; // configurationVersion = 1
        avcC[i++] = AVCProfileIndication;
        avcC[i++] = profile_compatibility;
        avcC[i++] = AVCLevelIndication;
        avcC[i++] = 0xFF; // '11111' + lengthSizeMinusOne = 3
        avcC[i++] = 0xE0 | sps.length; // '111' + numOfSequenceParameterSets
        for (var n = 0; n < sps.length; n++) {
            avcC[i++] = (sps[n].length & 0xFF00) >> 8;
            avcC[i++] = sps[n].length & 0x00FF;
            avcC.set(sps[n], i);
            i += sps[n].length;
        }
        avcC[i++] = pps.length; // numOfPictureParameterSets
        for (var n = 0; n < pps.length; n++) {
            avcC[i++] = (pps[n].length & 0xFF00) >> 8;
            avcC[i++] = pps[n].length & 0x00FF;
            avcC.set(pps[n], i);
            i += pps[n].length;
        }

        return avcC;
    }

    function createMP4AudioSampleEntry(stsd, codec) {
        var mp4a = undefined;

        if (contentProtection) {
            mp4a = ISOBoxer.createBox('enca', stsd, false);
        } else {
            mp4a = ISOBoxer.createBox('mp4a', stsd, false);
        }

        // SampleEntry fields
        mp4a.reserved1 = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
        mp4a.data_reference_index = 1;

        // AudioSampleEntry fields
        mp4a.reserved2 = [0x0, 0x0];
        mp4a.channelcount = representation.audioChannels;
        mp4a.samplesize = 16;
        mp4a.pre_defined = 0;
        mp4a.reserved_3 = 0;
        mp4a.samplerate = representation.audioSamplingRate << 16;

        mp4a.esds = createMPEG4AACESDescriptor();

        if (contentProtection) {
            // Create and add Protection Scheme Info Box
            var sinf = ISOBoxer.createBox('sinf', mp4a);

            // Create and add Original Format Box => indicate codec type of the encrypted content
            createOriginalFormatBox(sinf, codec);

            // Create and add Scheme Type box
            createSchemeTypeBox(sinf);

            // Create and add Scheme Information Box
            createSchemeInformationBox(sinf);
        }

        return mp4a;
    }

    function createMPEG4AACESDescriptor() {

        // AudioSpecificConfig (see ISO/IEC 14496-3, subpart 1) => corresponds to hex bytes contained in 'codecPrivateData' field
        var audioSpecificConfig = hexStringtoBuffer(representation.codecPrivateData);

        // ESDS length = esds box header length (= 12) +
        //               ES_Descriptor header length (= 5) +
        //               DecoderConfigDescriptor header length (= 15) +
        //               decoderSpecificInfo header length (= 2) +
        //               AudioSpecificConfig length (= codecPrivateData length)
        var esdsLength = 34 + audioSpecificConfig.length;
        var esds = new Uint8Array(esdsLength);

        var i = 0;
        // esds box
        esds[i++] = (esdsLength & 0xFF000000) >> 24; // esds box length
        esds[i++] = (esdsLength & 0x00FF0000) >> 16; // ''
        esds[i++] = (esdsLength & 0x0000FF00) >> 8; // ''
        esds[i++] = esdsLength & 0x000000FF; // ''
        esds.set([0x65, 0x73, 0x64, 0x73], i); // type = 'esds'
        i += 4;
        esds.set([0, 0, 0, 0], i); // version = 0, flags = 0
        i += 4;
        // ES_Descriptor (see ISO/IEC 14496-1 (Systems))
        esds[i++] = 0x03; // tag = 0x03 (ES_DescrTag)
        esds[i++] = 20 + audioSpecificConfig.length; // size
        esds[i++] = (trackId & 0xFF00) >> 8; // ES_ID = track_id
        esds[i++] = trackId & 0x00FF; // ''
        esds[i++] = 0; // flags and streamPriority

        // DecoderConfigDescriptor (see ISO/IEC 14496-1 (Systems))
        esds[i++] = 0x04; // tag = 0x04 (DecoderConfigDescrTag)
        esds[i++] = 15 + audioSpecificConfig.length; // size
        esds[i++] = 0x40; // objectTypeIndication = 0x40 (MPEG-4 AAC)
        esds[i] = 0x05 << 2; // streamType = 0x05 (Audiostream)
        esds[i] |= 0 << 1; // upStream = 0
        esds[i++] |= 1; // reserved = 1
        esds[i++] = 0xFF; // buffersizeDB = undefined
        esds[i++] = 0xFF; // ''
        esds[i++] = 0xFF; // ''
        esds[i++] = (representation.bandwidth & 0xFF000000) >> 24; // maxBitrate
        esds[i++] = (representation.bandwidth & 0x00FF0000) >> 16; // ''
        esds[i++] = (representation.bandwidth & 0x0000FF00) >> 8; // ''
        esds[i++] = representation.bandwidth & 0x000000FF; // ''
        esds[i++] = (representation.bandwidth & 0xFF000000) >> 24; // avgbitrate
        esds[i++] = (representation.bandwidth & 0x00FF0000) >> 16; // ''
        esds[i++] = (representation.bandwidth & 0x0000FF00) >> 8; // ''
        esds[i++] = representation.bandwidth & 0x000000FF; // ''

        // DecoderSpecificInfo (see ISO/IEC 14496-1 (Systems))
        esds[i++] = 0x05; // tag = 0x05 (DecSpecificInfoTag)
        esds[i++] = audioSpecificConfig.length; // size
        esds.set(audioSpecificConfig, i); // AudioSpecificConfig bytes

        return esds;
    }

    function createOriginalFormatBox(sinf, codec) {
        var frma = ISOBoxer.createBox('frma', sinf);
        frma.data_format = stringToCharCode(codec);
    }

    function createSchemeTypeBox(sinf) {
        var schm = ISOBoxer.createFullBox('schm', sinf);

        schm.flags = 0;
        schm.version = 0;
        schm.scheme_type = 0x63656E63; // 'cenc' => common encryption
        schm.scheme_version = 0x00010000; // version set to 0x00010000 (Major version 1, Minor version 0)
    }

    function createSchemeInformationBox(sinf) {
        var schi = ISOBoxer.createBox('schi', sinf);

        // Create and add Track Encryption Box
        createTrackEncryptionBox(schi);
    }

    function createProtectionSystemSpecificHeaderBox(moov, keySystems) {
        var pssh_bytes = undefined,
            pssh = undefined,
            i = undefined,
            parsedBuffer = undefined;

        for (i = 0; i < keySystems.length; i += 1) {
            pssh_bytes = keySystems[i].initData;
            if (pssh_bytes) {
                parsedBuffer = ISOBoxer.parseBuffer(pssh_bytes);
                pssh = parsedBuffer.fetch('pssh');
                if (pssh) {
                    ISOBoxer.Utils.appendBox(moov, pssh);
                }
            }
        }
    }

    function createTrackEncryptionBox(schi) {
        var tenc = ISOBoxer.createFullBox('tenc', schi);

        tenc.flags = 0;
        tenc.version = 0;

        tenc.default_IsEncrypted = 0x1;
        tenc.default_IV_size = 8;
        tenc.default_KID = contentProtection && contentProtection.length > 0 && contentProtection[0]['cenc:default_KID'] ? contentProtection[0]['cenc:default_KID'] : [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
    }

    function createTrexBox(moov) {
        var trex = ISOBoxer.createFullBox('trex', moov);

        trex.track_ID = trackId;
        trex.default_sample_description_index = 1;
        trex.default_sample_duration = 0;
        trex.default_sample_size = 0;
        trex.default_sample_flags = 0;

        return trex;
    }

    function hexStringtoBuffer(str) {
        var buf = new Uint8Array(str.length / 2);
        var i = undefined;

        for (i = 0; i < str.length / 2; i += 1) {
            buf[i] = parseInt('' + str[i * 2] + str[i * 2 + 1], 16);
        }
        return buf;
    }

    function stringToCharCode(str) {
        var code = 0;
        var i = undefined;

        for (i = 0; i < str.length; i += 1) {
            code |= str.charCodeAt(i) << (str.length - i - 1) * 8;
        }
        return code;
    }

    function generateMoov(rep) {
        if (!rep || !rep.adaptation) {
            return;
        }

        var isoFile = undefined,
            arrayBuffer = undefined;

        representation = rep;
        adaptationSet = representation.adaptation;

        period = adaptationSet.period;
        trackId = adaptationSet.index + 1;
        contentProtection = period.mpd.manifest.Period_asArray[period.index].AdaptationSet_asArray[adaptationSet.index].ContentProtection;

        timescale = period.mpd.manifest.Period_asArray[period.index].AdaptationSet_asArray[adaptationSet.index].SegmentTemplate.timescale;

        isoFile = ISOBoxer.createFile();
        createFtypBox(isoFile);
        createMoovBox(isoFile);

        arrayBuffer = isoFile.write();

        return arrayBuffer;
    }

    instance = {
        generateMoov: generateMoov
    };

    return instance;
}

MssFragmentMoovProcessor.__dashjs_factory_name = 'MssFragmentMoovProcessor';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssFragmentMoovProcessor);
/* jshint ignore:line */
module.exports = exports['default'];

},{"./errors/MssErrors":10}],8:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _MssFragmentMoofProcessor = _dereq_('./MssFragmentMoofProcessor');

var _MssFragmentMoofProcessor2 = _interopRequireDefault(_MssFragmentMoofProcessor);

var _MssFragmentMoovProcessor = _dereq_('./MssFragmentMoovProcessor');

var _MssFragmentMoovProcessor2 = _interopRequireDefault(_MssFragmentMoovProcessor);

// Add specific box processors not provided by codem-isoboxer library

function arrayEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every(function (element, index) {
        return element === arr2[index];
    });
}

function saioProcessor() {
    this._procFullBox();
    if (this.flags & 1) {
        this._procField('aux_info_type', 'uint', 32);
        this._procField('aux_info_type_parameter', 'uint', 32);
    }
    this._procField('entry_count', 'uint', 32);
    this._procFieldArray('offset', this.entry_count, 'uint', this.version === 1 ? 64 : 32);
}

function saizProcessor() {
    this._procFullBox();
    if (this.flags & 1) {
        this._procField('aux_info_type', 'uint', 32);
        this._procField('aux_info_type_parameter', 'uint', 32);
    }
    this._procField('default_sample_info_size', 'uint', 8);
    this._procField('sample_count', 'uint', 32);
    if (this.default_sample_info_size === 0) {
        this._procFieldArray('sample_info_size', this.sample_count, 'uint', 8);
    }
}

function sencProcessor() {
    this._procFullBox();
    this._procField('sample_count', 'uint', 32);
    if (this.flags & 1) {
        this._procField('IV_size', 'uint', 8);
    }
    this._procEntries('entry', this.sample_count, function (entry) {
        this._procEntryField(entry, 'InitializationVector', 'data', 8);
        if (this.flags & 2) {
            this._procEntryField(entry, 'NumberOfEntries', 'uint', 16);
            this._procSubEntries(entry, 'clearAndCryptedData', entry.NumberOfEntries, function (clearAndCryptedData) {
                this._procEntryField(clearAndCryptedData, 'BytesOfClearData', 'uint', 16);
                this._procEntryField(clearAndCryptedData, 'BytesOfEncryptedData', 'uint', 32);
            });
        }
    });
}

function uuidProcessor() {
    var tfxdUserType = [0x6D, 0x1D, 0x9B, 0x05, 0x42, 0xD5, 0x44, 0xE6, 0x80, 0xE2, 0x14, 0x1D, 0xAF, 0xF7, 0x57, 0xB2];
    var tfrfUserType = [0xD4, 0x80, 0x7E, 0xF2, 0xCA, 0x39, 0x46, 0x95, 0x8E, 0x54, 0x26, 0xCB, 0x9E, 0x46, 0xA7, 0x9F];
    var sepiffUserType = [0xA2, 0x39, 0x4F, 0x52, 0x5A, 0x9B, 0x4f, 0x14, 0xA2, 0x44, 0x6C, 0x42, 0x7C, 0x64, 0x8D, 0xF4];

    if (arrayEqual(this.usertype, tfxdUserType)) {
        this._procFullBox();
        if (this._parsing) {
            this.type = 'tfxd';
        }
        this._procField('fragment_absolute_time', 'uint', this.version === 1 ? 64 : 32);
        this._procField('fragment_duration', 'uint', this.version === 1 ? 64 : 32);
    }

    if (arrayEqual(this.usertype, tfrfUserType)) {
        this._procFullBox();
        if (this._parsing) {
            this.type = 'tfrf';
        }
        this._procField('fragment_count', 'uint', 8);
        this._procEntries('entry', this.fragment_count, function (entry) {
            this._procEntryField(entry, 'fragment_absolute_time', 'uint', this.version === 1 ? 64 : 32);
            this._procEntryField(entry, 'fragment_duration', 'uint', this.version === 1 ? 64 : 32);
        });
    }

    if (arrayEqual(this.usertype, sepiffUserType)) {
        if (this._parsing) {
            this.type = 'sepiff';
        }
        sencProcessor.call(this);
    }
}

function MssFragmentProcessor(config) {

    config = config || {};
    var context = this.context;
    var dashMetrics = config.dashMetrics;
    var playbackController = config.playbackController;
    var eventBus = config.eventBus;
    var protectionController = config.protectionController;
    var ISOBoxer = config.ISOBoxer;
    var debug = config.debug;
    var mssFragmentMoovProcessor = undefined,
        mssFragmentMoofProcessor = undefined,
        instance = undefined;

    function setup() {
        ISOBoxer.addBoxProcessor('uuid', uuidProcessor);
        ISOBoxer.addBoxProcessor('saio', saioProcessor);
        ISOBoxer.addBoxProcessor('saiz', saizProcessor);
        ISOBoxer.addBoxProcessor('senc', sencProcessor);

        mssFragmentMoovProcessor = (0, _MssFragmentMoovProcessor2['default'])(context).create({
            protectionController: protectionController,
            constants: config.constants,
            ISOBoxer: ISOBoxer });

        mssFragmentMoofProcessor = (0, _MssFragmentMoofProcessor2['default'])(context).create({
            dashMetrics: dashMetrics,
            playbackController: playbackController,
            ISOBoxer: ISOBoxer,
            eventBus: eventBus,
            debug: debug,
            errHandler: config.errHandler
        });
    }

    function generateMoov(rep) {
        return mssFragmentMoovProcessor.generateMoov(rep);
    }

    function processFragment(e, streamProcessor) {
        if (!e || !e.request || !e.response) {
            throw new Error('e parameter is missing or malformed');
        }

        if (e.request.type === 'MediaSegment') {
            // MediaSegment => convert to Smooth Streaming moof format
            mssFragmentMoofProcessor.convertFragment(e, streamProcessor);
        } else if (e.request.type === 'FragmentInfoSegment') {
            // FragmentInfo (live) => update segments list
            mssFragmentMoofProcessor.updateSegmentList(e, streamProcessor);

            // Stop event propagation (FragmentInfo must not be added to buffer)
            e.sender = null;
        }
    }

    instance = {
        generateMoov: generateMoov,
        processFragment: processFragment
    };

    setup();

    return instance;
}

MssFragmentProcessor.__dashjs_factory_name = 'MssFragmentProcessor';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssFragmentProcessor);
/* jshint ignore:line */
module.exports = exports['default'];

},{"./MssFragmentMoofProcessor":6,"./MssFragmentMoovProcessor":7}],9:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _streamingVoDataChunk = _dereq_('../streaming/vo/DataChunk');

var _streamingVoDataChunk2 = _interopRequireDefault(_streamingVoDataChunk);

var _streamingVoFragmentRequest = _dereq_('../streaming/vo/FragmentRequest');

var _streamingVoFragmentRequest2 = _interopRequireDefault(_streamingVoFragmentRequest);

var _MssFragmentInfoController = _dereq_('./MssFragmentInfoController');

var _MssFragmentInfoController2 = _interopRequireDefault(_MssFragmentInfoController);

var _MssFragmentProcessor = _dereq_('./MssFragmentProcessor');

var _MssFragmentProcessor2 = _interopRequireDefault(_MssFragmentProcessor);

var _parserMssParser = _dereq_('./parser/MssParser');

var _parserMssParser2 = _interopRequireDefault(_parserMssParser);

var _errorsMssErrors = _dereq_('./errors/MssErrors');

var _errorsMssErrors2 = _interopRequireDefault(_errorsMssErrors);

var _streamingVoDashJSError = _dereq_('../streaming/vo/DashJSError');

var _streamingVoDashJSError2 = _interopRequireDefault(_streamingVoDashJSError);

var _streamingUtilsInitCache = _dereq_('../streaming/utils/InitCache');

var _streamingUtilsInitCache2 = _interopRequireDefault(_streamingUtilsInitCache);

function MssHandler(config) {

    config = config || {};
    var context = this.context;
    var eventBus = config.eventBus;
    var events = config.events;
    var constants = config.constants;
    var initSegmentType = config.initSegmentType;
    var dashMetrics = config.dashMetrics;
    var playbackController = config.playbackController;
    var streamController = config.streamController;
    var protectionController = config.protectionController;
    var mssFragmentProcessor = (0, _MssFragmentProcessor2['default'])(context).create({
        dashMetrics: dashMetrics,
        playbackController: playbackController,
        protectionController: protectionController,
        streamController: streamController,
        eventBus: eventBus,
        constants: constants,
        ISOBoxer: config.ISOBoxer,
        debug: config.debug,
        errHandler: config.errHandler
    });
    var mssParser = undefined,
        fragmentInfoControllers = undefined,
        initCache = undefined,
        instance = undefined;

    function setup() {
        fragmentInfoControllers = [];
        initCache = (0, _streamingUtilsInitCache2['default'])(context).getInstance();
    }

    function getStreamProcessor(type) {
        return streamController.getActiveStreamProcessors().filter(function (processor) {
            return processor.getType() === type;
        })[0];
    }

    function getFragmentInfoController(type) {
        return fragmentInfoControllers.filter(function (controller) {
            return controller.getType() === type;
        })[0];
    }

    function createDataChunk(request, streamId, endFragment) {
        var chunk = new _streamingVoDataChunk2['default']();

        chunk.streamId = streamId;
        chunk.mediaInfo = request.mediaInfo;
        chunk.segmentType = request.type;
        chunk.start = request.startTime;
        chunk.duration = request.duration;
        chunk.end = chunk.start + chunk.duration;
        chunk.index = request.index;
        chunk.quality = request.quality;
        chunk.representationId = request.representationId;
        chunk.endFragment = endFragment;

        return chunk;
    }

    function startFragmentInfoControllers() {

        // Create MssFragmentInfoControllers for each StreamProcessor of active stream (only for audio, video or fragmentedText)
        var processors = streamController.getActiveStreamProcessors();
        processors.forEach(function (processor) {
            if (processor.getType() === constants.VIDEO || processor.getType() === constants.AUDIO || processor.getType() === constants.FRAGMENTED_TEXT) {

                var fragmentInfoController = getFragmentInfoController(processor.getType());
                if (!fragmentInfoController) {
                    fragmentInfoController = (0, _MssFragmentInfoController2['default'])(context).create({
                        streamProcessor: processor,
                        baseURLController: config.baseURLController,
                        debug: config.debug
                    });
                    fragmentInfoController.initialize();
                    fragmentInfoControllers.push(fragmentInfoController);
                }
                fragmentInfoController.start();
            }
        });
    }

    function stopFragmentInfoControllers() {
        fragmentInfoControllers.forEach(function (c) {
            c.reset();
        });
        fragmentInfoControllers = [];
    }

    function onInitFragmentNeeded(e) {
        var streamProcessor = getStreamProcessor(e.sender.getType());
        if (!streamProcessor) return;

        // Create init segment request
        var representationController = streamProcessor.getRepresentationController();
        var representation = representationController.getCurrentRepresentation();
        var mediaInfo = streamProcessor.getMediaInfo();

        var request = new _streamingVoFragmentRequest2['default']();
        request.mediaType = representation.adaptation.type;
        request.type = initSegmentType;
        request.range = representation.range;
        request.quality = representation.index;
        request.mediaInfo = mediaInfo;
        request.representationId = representation.id;

        var chunk = createDataChunk(request, mediaInfo.streamInfo.id, e.type !== events.FRAGMENT_LOADING_PROGRESS);

        try {
            // Generate init segment (moov)
            chunk.bytes = mssFragmentProcessor.generateMoov(representation);

            // Notify init segment has been loaded
            eventBus.trigger(events.INIT_FRAGMENT_LOADED, {
                chunk: chunk
            });
        } catch (e) {
            config.errHandler.error(new _streamingVoDashJSError2['default'](e.code, e.message, e.data));
        }

        // Change the sender value to stop event to be propagated
        e.sender = null;
    }

    function onSegmentMediaLoaded(e) {
        if (e.error) return;

        var streamProcessor = getStreamProcessor(e.request.mediaType);
        if (!streamProcessor) return;

        // Process moof to transcode it from MSS to DASH (or to update segment timeline for SegmentInfo fragments)
        mssFragmentProcessor.processFragment(e, streamProcessor);

        if (e.request.type === 'FragmentInfoSegment') {
            // If FragmentInfo loaded, then notify corresponding MssFragmentInfoController
            var fragmentInfoController = getFragmentInfoController(e.request.mediaType);
            if (fragmentInfoController) {
                fragmentInfoController.fragmentInfoLoaded(e);
            }
        }

        // Start MssFragmentInfoControllers in case of start-over streams
        var manifestInfo = e.request.mediaInfo.streamInfo.manifestInfo;
        if (!manifestInfo.isDynamic && manifestInfo.DVRWindowSize !== Infinity) {
            startFragmentInfoControllers();
        }
    }

    function onPlaybackPaused() {
        if (playbackController.getIsDynamic() && playbackController.getTime() !== 0) {
            startFragmentInfoControllers();
        }
    }

    function onPlaybackSeekAsked() {
        if (playbackController.getIsDynamic() && playbackController.getTime() !== 0) {
            startFragmentInfoControllers();
        }
    }

    function onTTMLPreProcess(ttmlSubtitles) {
        if (!ttmlSubtitles || !ttmlSubtitles.data) {
            return;
        }

        ttmlSubtitles.data = ttmlSubtitles.data.replace(/http:\/\/www.w3.org\/2006\/10\/ttaf1/gi, 'http://www.w3.org/ns/ttml');
    }

    function registerEvents() {
        eventBus.on(events.INIT_FRAGMENT_NEEDED, onInitFragmentNeeded, instance, dashjs.FactoryMaker.getSingletonFactoryByName(eventBus.getClassName()).EVENT_PRIORITY_HIGH); /* jshint ignore:line */
        eventBus.on(events.PLAYBACK_PAUSED, onPlaybackPaused, instance, dashjs.FactoryMaker.getSingletonFactoryByName(eventBus.getClassName()).EVENT_PRIORITY_HIGH); /* jshint ignore:line */
        eventBus.on(events.PLAYBACK_SEEK_ASKED, onPlaybackSeekAsked, instance, dashjs.FactoryMaker.getSingletonFactoryByName(eventBus.getClassName()).EVENT_PRIORITY_HIGH); /* jshint ignore:line */
        eventBus.on(events.FRAGMENT_LOADING_COMPLETED, onSegmentMediaLoaded, instance, dashjs.FactoryMaker.getSingletonFactoryByName(eventBus.getClassName()).EVENT_PRIORITY_HIGH); /* jshint ignore:line */
        eventBus.on(events.TTML_TO_PARSE, onTTMLPreProcess, instance);
    }

    function reset() {
        if (mssParser) {
            mssParser.reset();
            mssParser = undefined;
        }

        eventBus.off(events.INIT_FRAGMENT_NEEDED, onInitFragmentNeeded, this);
        eventBus.off(events.PLAYBACK_PAUSED, onPlaybackPaused, this);
        eventBus.off(events.PLAYBACK_SEEK_ASKED, onPlaybackSeekAsked, this);
        eventBus.off(events.FRAGMENT_LOADING_COMPLETED, onSegmentMediaLoaded, this);
        eventBus.off(events.TTML_TO_PARSE, onTTMLPreProcess, this);

        // Reset FragmentInfoControllers
        stopFragmentInfoControllers();
    }

    function createMssParser() {
        mssParser = (0, _parserMssParser2['default'])(context).create(config);
        return mssParser;
    }

    instance = {
        reset: reset,
        createMssParser: createMssParser,
        registerEvents: registerEvents
    };

    setup();

    return instance;
}

MssHandler.__dashjs_factory_name = 'MssHandler';
var factory = dashjs.FactoryMaker.getClassFactory(MssHandler); /* jshint ignore:line */
factory.errors = _errorsMssErrors2['default'];
dashjs.FactoryMaker.updateClassFactory(MssHandler.__dashjs_factory_name, factory); /* jshint ignore:line */
exports['default'] = factory;
/* jshint ignore:line */
module.exports = exports['default'];

},{"../streaming/utils/InitCache":14,"../streaming/vo/DashJSError":15,"../streaming/vo/DataChunk":16,"../streaming/vo/FragmentRequest":17,"./MssFragmentInfoController":5,"./MssFragmentProcessor":8,"./errors/MssErrors":10,"./parser/MssParser":12}],10:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _coreErrorsErrorsBase = _dereq_('../../core/errors/ErrorsBase');

var _coreErrorsErrorsBase2 = _interopRequireDefault(_coreErrorsErrorsBase);

/**
 * @class
 *
 */

var MssErrors = (function (_ErrorsBase) {
  _inherits(MssErrors, _ErrorsBase);

  function MssErrors() {
    _classCallCheck(this, MssErrors);

    _get(Object.getPrototypeOf(MssErrors.prototype), 'constructor', this).call(this);
    /**
     * Error code returned when no tfrf box is detected in MSS live stream
     */
    this.MSS_NO_TFRF_CODE = 200;

    /**
     * Error code returned when one of the codecs defined in the manifest is not supported
     */
    this.MSS_UNSUPPORTED_CODEC_CODE = 201;

    this.MSS_NO_TFRF_MESSAGE = 'Missing tfrf in live media segment';
    this.MSS_UNSUPPORTED_CODEC_MESSAGE = 'Unsupported codec';
  }

  return MssErrors;
})(_coreErrorsErrorsBase2['default']);

var mssErrors = new MssErrors();
exports['default'] = mssErrors;
module.exports = exports['default'];

},{"../../core/errors/ErrorsBase":3}],11:[function(_dereq_,module,exports){
(function (global){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _MssHandler = _dereq_('./MssHandler');

var _MssHandler2 = _interopRequireDefault(_MssHandler);

// Shove both of these into the global scope
var context = typeof window !== 'undefined' && window || global;

var dashjs = context.dashjs;
if (!dashjs) {
  dashjs = context.dashjs = {};
}

dashjs.MssHandler = _MssHandler2['default'];

exports['default'] = dashjs;
exports.MssHandler = _MssHandler2['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./MssHandler":9}],12:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @module MssParser
 * @ignore
 * @param {Object} config object
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _externalsBigInteger = _dereq_('../../../externals/BigInteger');

var _externalsBigInteger2 = _interopRequireDefault(_externalsBigInteger);

function MssParser(config) {
    config = config || {};
    var BASE64 = config.BASE64;
    var debug = config.debug;
    var constants = config.constants;
    var manifestModel = config.manifestModel;
    var mediaPlayerModel = config.mediaPlayerModel;
    var settings = config.settings;

    var DEFAULT_TIME_SCALE = 10000000.0;
    var SUPPORTED_CODECS = ['AAC', 'AACL', 'AVC1', 'H264', 'TTML', 'DFXP'];
    // MPEG-DASH Role and accessibility mapping for text tracks according to ETSI TS 103 285 v1.1.1 (section 7.1.2)
    var ROLE = {
        'CAPT': 'main',
        'SUBT': 'alternate',
        'DESC': 'main'
    };
    var ACCESSIBILITY = {
        'DESC': '2'
    };
    var samplingFrequencyIndex = {
        96000: 0x0,
        88200: 0x1,
        64000: 0x2,
        48000: 0x3,
        44100: 0x4,
        32000: 0x5,
        24000: 0x6,
        22050: 0x7,
        16000: 0x8,
        12000: 0x9,
        11025: 0xA,
        8000: 0xB,
        7350: 0xC
    };
    var mimeTypeMap = {
        'video': 'video/mp4',
        'audio': 'audio/mp4',
        'text': 'application/mp4'
    };

    var instance = undefined,
        logger = undefined,
        initialBufferSettings = undefined;

    function setup() {
        logger = debug.getLogger(instance);
    }

    function mapPeriod(smoothStreamingMedia, timescale) {
        var period = {};
        var streams = undefined,
            adaptation = undefined;

        // For each StreamIndex node, create an AdaptationSet element
        period.AdaptationSet_asArray = [];
        streams = smoothStreamingMedia.getElementsByTagName('StreamIndex');
        for (var i = 0; i < streams.length; i++) {
            adaptation = mapAdaptationSet(streams[i], timescale);
            if (adaptation !== null) {
                period.AdaptationSet_asArray.push(adaptation);
            }
        }

        if (period.AdaptationSet_asArray.length > 0) {
            period.AdaptationSet = period.AdaptationSet_asArray.length > 1 ? period.AdaptationSet_asArray : period.AdaptationSet_asArray[0];
        }

        return period;
    }

    function mapAdaptationSet(streamIndex, timescale) {
        var adaptationSet = {};
        var representations = [];
        var segmentTemplate = undefined;
        var qualityLevels = undefined,
            representation = undefined,
            segments = undefined,
            i = undefined;

        var name = streamIndex.getAttribute('Name');
        var type = streamIndex.getAttribute('Type');
        var lang = streamIndex.getAttribute('Language');
        var fallBackId = lang ? type + '_' + lang : type;

        adaptationSet.id = name || fallBackId;
        adaptationSet.contentType = type;
        adaptationSet.lang = lang || 'und';
        adaptationSet.mimeType = mimeTypeMap[type];
        adaptationSet.subType = streamIndex.getAttribute('Subtype');
        adaptationSet.maxWidth = streamIndex.getAttribute('MaxWidth');
        adaptationSet.maxHeight = streamIndex.getAttribute('MaxHeight');

        // Map text tracks subTypes to MPEG-DASH AdaptationSet role and accessibility (see ETSI TS 103 285 v1.1.1, section 7.1.2)
        if (adaptationSet.subType) {
            if (ROLE[adaptationSet.subType]) {
                var role = {
                    schemeIdUri: 'urn:mpeg:dash:role:2011',
                    value: ROLE[adaptationSet.subType]
                };
                adaptationSet.Role = role;
                adaptationSet.Role_asArray = [role];
            }
            if (ACCESSIBILITY[adaptationSet.subType]) {
                var accessibility = {
                    schemeIdUri: 'urn:tva:metadata:cs:AudioPurposeCS:2007',
                    value: ACCESSIBILITY[adaptationSet.subType]
                };
                adaptationSet.Accessibility = accessibility;
                adaptationSet.Accessibility_asArray = [accessibility];
            }
        }

        // Create a SegmentTemplate with a SegmentTimeline
        segmentTemplate = mapSegmentTemplate(streamIndex, timescale);

        qualityLevels = streamIndex.getElementsByTagName('QualityLevel');
        // For each QualityLevel node, create a Representation element
        for (i = 0; i < qualityLevels.length; i++) {
            // Propagate BaseURL and mimeType
            qualityLevels[i].BaseURL = adaptationSet.BaseURL;
            qualityLevels[i].mimeType = adaptationSet.mimeType;

            // Set quality level id
            qualityLevels[i].Id = adaptationSet.id + '_' + qualityLevels[i].getAttribute('Index');

            // Map Representation to QualityLevel
            representation = mapRepresentation(qualityLevels[i], streamIndex);

            if (representation !== null) {
                // Copy SegmentTemplate into Representation
                representation.SegmentTemplate = segmentTemplate;

                representations.push(representation);
            }
        }

        if (representations.length === 0) {
            return null;
        }

        adaptationSet.Representation = representations.length > 1 ? representations : representations[0];
        adaptationSet.Representation_asArray = representations;

        // Set SegmentTemplate
        adaptationSet.SegmentTemplate = segmentTemplate;

        segments = segmentTemplate.SegmentTimeline.S_asArray;

        return adaptationSet;
    }

    function mapRepresentation(qualityLevel, streamIndex) {
        var representation = {};
        var type = streamIndex.getAttribute('Type');
        var fourCCValue = null;

        representation.id = qualityLevel.Id;
        representation.bandwidth = parseInt(qualityLevel.getAttribute('Bitrate'), 10);
        representation.mimeType = qualityLevel.mimeType;
        representation.width = parseInt(qualityLevel.getAttribute('MaxWidth'), 10);
        representation.height = parseInt(qualityLevel.getAttribute('MaxHeight'), 10);

        fourCCValue = qualityLevel.getAttribute('FourCC');

        // If FourCC not defined at QualityLevel level, then get it from StreamIndex level
        if (fourCCValue === null || fourCCValue === '') {
            fourCCValue = streamIndex.getAttribute('FourCC');
        }

        // If still not defined (optionnal for audio stream, see https://msdn.microsoft.com/en-us/library/ff728116%28v=vs.95%29.aspx),
        // then we consider the stream is an audio AAC stream
        if (fourCCValue === null || fourCCValue === '') {
            if (type === constants.AUDIO) {
                fourCCValue = 'AAC';
            } else if (type === constants.VIDEO) {
                logger.debug('FourCC is not defined whereas it is required for a QualityLevel element for a StreamIndex of type "video"');
                return null;
            }
        }

        // Check if codec is supported
        if (SUPPORTED_CODECS.indexOf(fourCCValue.toUpperCase()) === -1) {
            // Do not send warning
            logger.warn('Codec not supported: ' + fourCCValue);
            return null;
        }

        // Get codecs value according to FourCC field
        if (fourCCValue === 'H264' || fourCCValue === 'AVC1') {
            representation.codecs = getH264Codec(qualityLevel);
        } else if (fourCCValue.indexOf('AAC') >= 0) {
            representation.codecs = getAACCodec(qualityLevel, fourCCValue);
            representation.audioSamplingRate = parseInt(qualityLevel.getAttribute('SamplingRate'), 10);
            representation.audioChannels = parseInt(qualityLevel.getAttribute('Channels'), 10);
        } else if (fourCCValue.indexOf('TTML') || fourCCValue.indexOf('DFXP')) {
            representation.codecs = constants.STPP;
        }

        representation.codecPrivateData = '' + qualityLevel.getAttribute('CodecPrivateData');
        representation.BaseURL = qualityLevel.BaseURL;

        return representation;
    }

    function getH264Codec(qualityLevel) {
        var codecPrivateData = qualityLevel.getAttribute('CodecPrivateData').toString();
        var nalHeader = undefined,
            avcoti = undefined;

        // Extract from the CodecPrivateData field the hexadecimal representation of the following
        // three bytes in the sequence parameter set NAL unit.
        // => Find the SPS nal header
        nalHeader = /00000001[0-9]7/.exec(codecPrivateData);
        // => Find the 6 characters after the SPS nalHeader (if it exists)
        avcoti = nalHeader && nalHeader[0] ? codecPrivateData.substr(codecPrivateData.indexOf(nalHeader[0]) + 10, 6) : undefined;

        return 'avc1.' + avcoti;
    }

    function getAACCodec(qualityLevel, fourCCValue) {
        var samplingRate = parseInt(qualityLevel.getAttribute('SamplingRate'), 10);
        var codecPrivateData = qualityLevel.getAttribute('CodecPrivateData').toString();
        var objectType = 0;
        var codecPrivateDataHex = undefined,
            arr16 = undefined,
            indexFreq = undefined,
            extensionSamplingFrequencyIndex = undefined;

        //chrome problem, in implicit AAC HE definition, so when AACH is detected in FourCC
        //set objectType to 5 => strange, it should be 2
        if (fourCCValue === 'AACH') {
            objectType = 0x05;
        }
        //if codecPrivateData is empty, build it :
        if (codecPrivateData === undefined || codecPrivateData === '') {
            objectType = 0x02; //AAC Main Low Complexity => object Type = 2
            indexFreq = samplingFrequencyIndex[samplingRate];
            if (fourCCValue === 'AACH') {
                // 4 bytes :     XXXXX         XXXX          XXXX             XXXX                  XXXXX      XXX   XXXXXXX
                //           ' ObjectType' 'Freq Index' 'Channels value'   'Extens Sampl Freq'  'ObjectType'  'GAS' 'alignment = 0'
                objectType = 0x05; // High Efficiency AAC Profile = object Type = 5 SBR
                codecPrivateData = new Uint8Array(4);
                extensionSamplingFrequencyIndex = samplingFrequencyIndex[samplingRate * 2]; // in HE AAC Extension Sampling frequence
                // equals to SamplingRate*2
                //Freq Index is present for 3 bits in the first byte, last bit is in the second
                codecPrivateData[0] = objectType << 3 | indexFreq >> 1;
                codecPrivateData[1] = indexFreq << 7 | qualityLevel.Channels << 3 | extensionSamplingFrequencyIndex >> 1;
                codecPrivateData[2] = extensionSamplingFrequencyIndex << 7 | 0x02 << 2; // origin object type equals to 2 => AAC Main Low Complexity
                codecPrivateData[3] = 0x0; //alignment bits

                arr16 = new Uint16Array(2);
                arr16[0] = (codecPrivateData[0] << 8) + codecPrivateData[1];
                arr16[1] = (codecPrivateData[2] << 8) + codecPrivateData[3];
                //convert decimal to hex value
                codecPrivateDataHex = arr16[0].toString(16);
                codecPrivateDataHex = arr16[0].toString(16) + arr16[1].toString(16);
            } else {
                // 2 bytes :     XXXXX         XXXX          XXXX              XXX
                //           ' ObjectType' 'Freq Index' 'Channels value'   'GAS = 000'
                codecPrivateData = new Uint8Array(2);
                //Freq Index is present for 3 bits in the first byte, last bit is in the second
                codecPrivateData[0] = objectType << 3 | indexFreq >> 1;
                codecPrivateData[1] = indexFreq << 7 | parseInt(qualityLevel.getAttribute('Channels'), 10) << 3;
                // put the 2 bytes in an 16 bits array
                arr16 = new Uint16Array(1);
                arr16[0] = (codecPrivateData[0] << 8) + codecPrivateData[1];
                //convert decimal to hex value
                codecPrivateDataHex = arr16[0].toString(16);
            }

            codecPrivateData = '' + codecPrivateDataHex;
            codecPrivateData = codecPrivateData.toUpperCase();
            qualityLevel.setAttribute('CodecPrivateData', codecPrivateData);
        } else if (objectType === 0) {
            objectType = (parseInt(codecPrivateData.substr(0, 2), 16) & 0xF8) >> 3;
        }

        return 'mp4a.40.' + objectType;
    }

    function mapSegmentTemplate(streamIndex, timescale) {
        var segmentTemplate = {};
        var mediaUrl = undefined,
            streamIndexTimeScale = undefined,
            url = undefined;

        url = streamIndex.getAttribute('Url');
        mediaUrl = url ? url.replace('{bitrate}', '$Bandwidth$') : null;
        mediaUrl = mediaUrl ? mediaUrl.replace('{start time}', '$Time$') : null;

        streamIndexTimeScale = streamIndex.getAttribute('TimeScale');
        streamIndexTimeScale = streamIndexTimeScale ? parseFloat(streamIndexTimeScale) : timescale;

        segmentTemplate.media = mediaUrl;
        segmentTemplate.timescale = streamIndexTimeScale;

        segmentTemplate.SegmentTimeline = mapSegmentTimeline(streamIndex, segmentTemplate.timescale);

        return segmentTemplate;
    }

    function mapSegmentTimeline(streamIndex, timescale) {
        var segmentTimeline = {};
        var chunks = streamIndex.getElementsByTagName('c');
        var segments = [];
        var segment = undefined,
            prevSegment = undefined,
            tManifest = undefined,
            i = undefined,
            j = undefined,
            r = undefined;
        var duration = 0;

        for (i = 0; i < chunks.length; i++) {
            segment = {};

            // Get time 't' attribute value
            tManifest = chunks[i].getAttribute('t');

            // => segment.tManifest = original timestamp value as a string (for constructing the fragment request url, see DashHandler)
            // => segment.t = number value of timestamp (maybe rounded value, but only for 0.1 microsecond)
            if (tManifest && (0, _externalsBigInteger2['default'])(tManifest).greater((0, _externalsBigInteger2['default'])(Number.MAX_SAFE_INTEGER))) {
                segment.tManifest = tManifest;
            }
            segment.t = parseFloat(tManifest);

            // Get duration 'd' attribute value
            segment.d = parseFloat(chunks[i].getAttribute('d'));

            // If 't' not defined for first segment then t=0
            if (i === 0 && !segment.t) {
                segment.t = 0;
            }

            if (i > 0) {
                prevSegment = segments[segments.length - 1];
                // Update previous segment duration if not defined
                if (!prevSegment.d) {
                    if (prevSegment.tManifest) {
                        prevSegment.d = (0, _externalsBigInteger2['default'])(tManifest).subtract((0, _externalsBigInteger2['default'])(prevSegment.tManifest)).toJSNumber();
                    } else {
                        prevSegment.d = segment.t - prevSegment.t;
                    }
                    duration += prevSegment.d;
                }
                // Set segment absolute timestamp if not set in manifest
                if (!segment.t) {
                    if (prevSegment.tManifest) {
                        segment.tManifest = (0, _externalsBigInteger2['default'])(prevSegment.tManifest).add((0, _externalsBigInteger2['default'])(prevSegment.d)).toString();
                        segment.t = parseFloat(segment.tManifest);
                    } else {
                        segment.t = prevSegment.t + prevSegment.d;
                    }
                }
            }

            if (segment.d) {
                duration += segment.d;
            }

            // Create new segment
            segments.push(segment);

            // Support for 'r' attribute (i.e. "repeat" as in MPEG-DASH)
            r = parseFloat(chunks[i].getAttribute('r'));
            if (r) {

                for (j = 0; j < r - 1; j++) {
                    prevSegment = segments[segments.length - 1];
                    segment = {};
                    segment.t = prevSegment.t + prevSegment.d;
                    segment.d = prevSegment.d;
                    if (prevSegment.tManifest) {
                        segment.tManifest = (0, _externalsBigInteger2['default'])(prevSegment.tManifest).add((0, _externalsBigInteger2['default'])(prevSegment.d)).toString();
                    }
                    duration += segment.d;
                    segments.push(segment);
                }
            }
        }

        segmentTimeline.S = segments;
        segmentTimeline.S_asArray = segments;
        segmentTimeline.duration = duration / timescale;

        return segmentTimeline;
    }

    function getKIDFromProtectionHeader(protectionHeader) {
        var prHeader = undefined,
            wrmHeader = undefined,
            xmlReader = undefined,
            KID = undefined;

        // Get PlayReady header as byte array (base64 decoded)
        prHeader = BASE64.decodeArray(protectionHeader.firstChild.data);

        // Get Right Management header (WRMHEADER) from PlayReady header
        wrmHeader = getWRMHeaderFromPRHeader(prHeader);

        if (wrmHeader) {
            // Convert from multi-byte to unicode
            wrmHeader = new Uint16Array(wrmHeader.buffer);

            // Convert to string
            wrmHeader = String.fromCharCode.apply(null, wrmHeader);

            // Parse <WRMHeader> to get KID field value
            xmlReader = new DOMParser().parseFromString(wrmHeader, 'application/xml');
            KID = xmlReader.querySelector('KID').textContent;

            // Get KID (base64 decoded) as byte array
            KID = BASE64.decodeArray(KID);

            // Convert UUID from little-endian to big-endian
            convertUuidEndianness(KID);
        }

        return KID;
    }

    function getWRMHeaderFromPRHeader(prHeader) {
        var length = undefined,
            recordCount = undefined,
            recordType = undefined,
            recordLength = undefined,
            recordValue = undefined;
        var i = 0;

        // Parse PlayReady header

        // Length - 32 bits (LE format)
        length = (prHeader[i + 3] << 24) + (prHeader[i + 2] << 16) + (prHeader[i + 1] << 8) + prHeader[i];
        i += 4;

        // Record count - 16 bits (LE format)
        recordCount = (prHeader[i + 1] << 8) + prHeader[i];
        i += 2;

        // Parse records
        while (i < prHeader.length) {
            // Record type - 16 bits (LE format)
            recordType = (prHeader[i + 1] << 8) + prHeader[i];
            i += 2;

            // Check if Rights Management header (record type = 0x01)
            if (recordType === 0x01) {

                // Record length - 16 bits (LE format)
                recordLength = (prHeader[i + 1] << 8) + prHeader[i];
                i += 2;

                // Record value => contains <WRMHEADER>
                recordValue = new Uint8Array(recordLength);
                recordValue.set(prHeader.subarray(i, i + recordLength));
                return recordValue;
            }
        }

        return null;
    }

    function convertUuidEndianness(uuid) {
        swapBytes(uuid, 0, 3);
        swapBytes(uuid, 1, 2);
        swapBytes(uuid, 4, 5);
        swapBytes(uuid, 6, 7);
    }

    function swapBytes(bytes, pos1, pos2) {
        var temp = bytes[pos1];
        bytes[pos1] = bytes[pos2];
        bytes[pos2] = temp;
    }

    function createPRContentProtection(protectionHeader) {
        var pro = {
            __text: protectionHeader.firstChild.data,
            __prefix: 'mspr'
        };
        return {
            schemeIdUri: 'urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95',
            value: 'com.microsoft.playready',
            pro: pro,
            pro_asArray: pro
        };
    }

    function createWidevineContentProtection(KID) {
        var widevineCP = {
            schemeIdUri: 'urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed',
            value: 'com.widevine.alpha'
        };
        if (!KID) return widevineCP;
        // Create Widevine CENC header (Protocol Buffer) with KID value
        var wvCencHeader = new Uint8Array(2 + KID.length);
        wvCencHeader[0] = 0x12;
        wvCencHeader[1] = 0x10;
        wvCencHeader.set(KID, 2);

        // Create a pssh box
        var length = 12 /* box length, type, version and flags */ + 16 /* SystemID */ + 4 /* data length */ + wvCencHeader.length;
        var pssh = new Uint8Array(length);
        var i = 0;

        // Set box length value
        pssh[i++] = (length & 0xFF000000) >> 24;
        pssh[i++] = (length & 0x00FF0000) >> 16;
        pssh[i++] = (length & 0x0000FF00) >> 8;
        pssh[i++] = length & 0x000000FF;

        // Set type ('pssh'), version (0) and flags (0)
        pssh.set([0x70, 0x73, 0x73, 0x68, 0x00, 0x00, 0x00, 0x00], i);
        i += 8;

        // Set SystemID ('edef8ba9-79d6-4ace-a3c8-27dcd51d21ed')
        pssh.set([0xed, 0xef, 0x8b, 0xa9, 0x79, 0xd6, 0x4a, 0xce, 0xa3, 0xc8, 0x27, 0xdc, 0xd5, 0x1d, 0x21, 0xed], i);
        i += 16;

        // Set data length value
        pssh[i++] = (wvCencHeader.length & 0xFF000000) >> 24;
        pssh[i++] = (wvCencHeader.length & 0x00FF0000) >> 16;
        pssh[i++] = (wvCencHeader.length & 0x0000FF00) >> 8;
        pssh[i++] = wvCencHeader.length & 0x000000FF;

        // Copy Widevine CENC header
        pssh.set(wvCencHeader, i);

        // Convert to BASE64 string
        pssh = String.fromCharCode.apply(null, pssh);
        pssh = BASE64.encodeASCII(pssh);

        widevineCP.pssh = { __text: pssh };

        return widevineCP;
    }

    function processManifest(xmlDoc, manifestLoadedTime) {
        var manifest = {};
        var contentProtections = [];
        var smoothStreamingMedia = xmlDoc.getElementsByTagName('SmoothStreamingMedia')[0];
        var protection = xmlDoc.getElementsByTagName('Protection')[0];
        var protectionHeader = null;
        var period = undefined,
            adaptations = undefined,
            contentProtection = undefined,
            KID = undefined,
            timestampOffset = undefined,
            startTime = undefined,
            segments = undefined,
            timescale = undefined,
            segmentDuration = undefined,
            i = undefined,
            j = undefined;

        // Set manifest node properties
        manifest.protocol = 'MSS';
        manifest.profiles = 'urn:mpeg:dash:profile:isoff-live:2011';
        manifest.type = smoothStreamingMedia.getAttribute('IsLive') === 'TRUE' ? 'dynamic' : 'static';
        timescale = smoothStreamingMedia.getAttribute('TimeScale');
        manifest.timescale = timescale ? parseFloat(timescale) : DEFAULT_TIME_SCALE;
        var dvrWindowLength = parseFloat(smoothStreamingMedia.getAttribute('DVRWindowLength'));
        // If the DVRWindowLength field is omitted for a live presentation or set to 0, the DVR window is effectively infinite
        if (manifest.type === 'dynamic' && (dvrWindowLength === 0 || isNaN(dvrWindowLength))) {
            dvrWindowLength = Infinity;
        }
        // Star-over
        if (dvrWindowLength === 0 && smoothStreamingMedia.getAttribute('CanSeek') === 'TRUE') {
            dvrWindowLength = Infinity;
        }

        if (dvrWindowLength > 0) {
            manifest.timeShiftBufferDepth = dvrWindowLength / manifest.timescale;
        }

        var duration = parseFloat(smoothStreamingMedia.getAttribute('Duration'));
        manifest.mediaPresentationDuration = duration === 0 ? Infinity : duration / manifest.timescale;
        // By default, set minBufferTime to 2 sec. (but set below according to video segment duration)
        manifest.minBufferTime = 2;
        manifest.ttmlTimeIsRelative = true;

        // Live manifest with Duration = start-over
        if (manifest.type === 'dynamic' && duration > 0) {
            manifest.type = 'static';
            // We set timeShiftBufferDepth to initial duration, to be used by MssFragmentController to update segment timeline
            manifest.timeShiftBufferDepth = duration / manifest.timescale;
            // Duration will be set according to current segment timeline duration (see below)
        }

        if (manifest.type === 'dynamic' && manifest.timeShiftBufferDepth < Infinity) {
            manifest.refreshManifestOnSwitchTrack = true; // Refresh manifest when switching tracks
            manifest.doNotUpdateDVRWindowOnBufferUpdated = true; // DVRWindow is update by MssFragmentMoofPocessor based on tfrf boxes
            manifest.ignorePostponeTimePeriod = true; // Never update manifest
        }

        // Map period node to manifest root node
        manifest.Period = mapPeriod(smoothStreamingMedia, manifest.timescale);
        manifest.Period_asArray = [manifest.Period];

        // Initialize period start time
        period = manifest.Period;
        period.start = 0;

        // Uncomment to test live to static manifests
        // if (manifest.type !== 'static') {
        //     manifest.type = 'static';
        //     manifest.mediaPresentationDuration = manifest.timeShiftBufferDepth;
        //     manifest.timeShiftBufferDepth = null;
        // }

        // ContentProtection node
        if (protection !== undefined) {
            protectionHeader = xmlDoc.getElementsByTagName('ProtectionHeader')[0];

            // Some packagers put newlines into the ProtectionHeader base64 string, which is not good
            // because this cannot be correctly parsed. Let's just filter out any newlines found in there.
            protectionHeader.firstChild.data = protectionHeader.firstChild.data.replace(/\n|\r/g, '');

            // Get KID (in CENC format) from protection header
            KID = getKIDFromProtectionHeader(protectionHeader);

            // Create ContentProtection for PlayReady
            contentProtection = createPRContentProtection(protectionHeader);
            contentProtection['cenc:default_KID'] = KID;
            contentProtections.push(contentProtection);

            // Create ContentProtection for Widevine (as a CENC protection)
            contentProtection = createWidevineContentProtection(KID);
            contentProtection['cenc:default_KID'] = KID;
            contentProtections.push(contentProtection);

            manifest.ContentProtection = contentProtections;
            manifest.ContentProtection_asArray = contentProtections;
        }

        adaptations = period.AdaptationSet_asArray;

        for (i = 0; i < adaptations.length; i += 1) {
            adaptations[i].SegmentTemplate.initialization = '$Bandwidth$';
            // Propagate content protection information into each adaptation
            if (manifest.ContentProtection !== undefined) {
                adaptations[i].ContentProtection = manifest.ContentProtection;
                adaptations[i].ContentProtection_asArray = manifest.ContentProtection_asArray;
            }

            if (adaptations[i].contentType === 'video') {
                // Get video segment duration
                segmentDuration = adaptations[i].SegmentTemplate.SegmentTimeline.S_asArray[0].d / adaptations[i].SegmentTemplate.timescale;
                // Set minBufferTime to one segment duration
                manifest.minBufferTime = segmentDuration;

                if (manifest.type === 'dynamic') {
                    // Set availabilityStartTime
                    segments = adaptations[i].SegmentTemplate.SegmentTimeline.S_asArray;
                    var endTime = (segments[segments.length - 1].t + segments[segments.length - 1].d) / adaptations[i].SegmentTemplate.timescale * 1000;
                    manifest.availabilityStartTime = new Date(manifestLoadedTime.getTime() - endTime);

                    // Match timeShiftBufferDepth to video segment timeline duration
                    if (manifest.timeShiftBufferDepth > 0 && manifest.timeShiftBufferDepth !== Infinity && manifest.timeShiftBufferDepth > adaptations[i].SegmentTemplate.SegmentTimeline.duration) {
                        manifest.timeShiftBufferDepth = adaptations[i].SegmentTemplate.SegmentTimeline.duration;
                    }
                }
            }
        }

        // Cap minBufferTime to timeShiftBufferDepth
        manifest.minBufferTime = Math.min(manifest.minBufferTime, manifest.timeShiftBufferDepth ? manifest.timeShiftBufferDepth : Infinity);

        // In case of live streams:
        // 1- configure player buffering properties according to target live delay
        // 2- adapt live delay and then buffers length in case timeShiftBufferDepth is too small compared to target live delay (see PlaybackController.computeLiveDelay())
        if (manifest.type === 'dynamic') {
            var targetLiveDelay = mediaPlayerModel.getLiveDelay();
            if (!targetLiveDelay) {
                var liveDelayFragmentCount = settings.get().streaming.liveDelayFragmentCount !== null && !isNaN(settings.get().streaming.liveDelayFragmentCount) ? settings.get().streaming.liveDelayFragmentCount : 4;
                targetLiveDelay = segmentDuration * liveDelayFragmentCount;
            }
            var targetDelayCapping = Math.max(manifest.timeShiftBufferDepth - 10, /*END_OF_PLAYLIST_PADDING*/manifest.timeShiftBufferDepth / 2);
            var liveDelay = Math.min(targetDelayCapping, targetLiveDelay);
            // Consider a margin of one segment in order to avoid Precondition Failed errors (412), for example if audio and video are not correctly synchronized
            var bufferTime = liveDelay - segmentDuration;

            // Store initial buffer settings
            initialBufferSettings = {
                'streaming': {
                    'liveDelay': settings.get().streaming.liveDelay,
                    'stableBufferTime': settings.get().streaming.stableBufferTime,
                    'bufferTimeAtTopQuality': settings.get().streaming.bufferTimeAtTopQuality,
                    'bufferTimeAtTopQualityLongForm': settings.get().streaming.bufferTimeAtTopQualityLongForm
                }
            };

            settings.update({
                'streaming': {
                    'liveDelay': liveDelay,
                    'stableBufferTime': bufferTime,
                    'bufferTimeAtTopQuality': bufferTime,
                    'bufferTimeAtTopQualityLongForm': bufferTime
                }
            });
        }

        // Delete Content Protection under root manifest node
        delete manifest.ContentProtection;
        delete manifest.ContentProtection_asArray;

        // In case of VOD streams, check if start time is greater than 0
        // Then determine timestamp offset according to higher audio/video start time
        // (use case = live stream delinearization)
        if (manifest.type === 'static') {
            // In case of start-over stream and manifest reloading (due to track switch)
            // we consider previous timestampOffset to keep timelines synchronized
            var prevManifest = manifestModel.getValue();
            if (prevManifest && prevManifest.timestampOffset) {
                timestampOffset = prevManifest.timestampOffset;
            } else {
                for (i = 0; i < adaptations.length; i++) {
                    if (adaptations[i].contentType === constants.AUDIO || adaptations[i].contentType === constants.VIDEO) {
                        segments = adaptations[i].SegmentTemplate.SegmentTimeline.S_asArray;
                        startTime = segments[0].t;
                        if (timestampOffset === undefined) {
                            timestampOffset = startTime;
                        }
                        timestampOffset = Math.min(timestampOffset, startTime);
                        // Correct content duration according to minimum adaptation's segment timeline duration
                        // in order to force <video> element sending 'ended' event
                        manifest.mediaPresentationDuration = Math.min(manifest.mediaPresentationDuration, adaptations[i].SegmentTemplate.SegmentTimeline.duration);
                    }
                }
            }
            if (timestampOffset > 0) {
                // Patch segment templates timestamps and determine period start time (since audio/video should not be aligned to 0)
                manifest.timestampOffset = timestampOffset;
                for (i = 0; i < adaptations.length; i++) {
                    segments = adaptations[i].SegmentTemplate.SegmentTimeline.S_asArray;
                    for (j = 0; j < segments.length; j++) {
                        if (!segments[j].tManifest) {
                            segments[j].tManifest = segments[j].t.toString();
                        }
                        segments[j].t -= timestampOffset;
                    }
                    if (adaptations[i].contentType === constants.AUDIO || adaptations[i].contentType === constants.VIDEO) {
                        period.start = Math.max(segments[0].t, period.start);
                        adaptations[i].SegmentTemplate.presentationTimeOffset = period.start;
                    }
                }
                period.start /= manifest.timescale;
            }
        }

        // Floor the duration to get around precision differences between segments timestamps and MSE buffer timestamps
        // and then avoid 'ended' event not being raised
        manifest.mediaPresentationDuration = Math.floor(manifest.mediaPresentationDuration * 1000) / 1000;
        period.duration = manifest.mediaPresentationDuration;

        return manifest;
    }

    function parseDOM(data) {
        var xmlDoc = null;

        if (window.DOMParser) {
            var parser = new window.DOMParser();

            xmlDoc = parser.parseFromString(data, 'text/xml');
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                throw new Error('parsing the manifest failed');
            }
        }

        return xmlDoc;
    }

    function getMatchers() {
        return null;
    }

    function getIron() {
        return null;
    }

    function internalParse(data) {
        var xmlDoc = null;
        var manifest = null;

        var startTime = window.performance.now();

        // Parse the MSS XML manifest
        xmlDoc = parseDOM(data);

        var xmlParseTime = window.performance.now();

        if (xmlDoc === null) {
            return null;
        }

        // Convert MSS manifest into DASH manifest
        manifest = processManifest(xmlDoc, new Date());

        var mss2dashTime = window.performance.now();

        logger.info('Parsing complete: (xmlParsing: ' + (xmlParseTime - startTime).toPrecision(3) + 'ms, mss2dash: ' + (mss2dashTime - xmlParseTime).toPrecision(3) + 'ms, total: ' + ((mss2dashTime - startTime) / 1000).toPrecision(3) + 's)');

        return manifest;
    }

    function reset() {
        // Restore initial buffer settings
        if (initialBufferSettings) {
            settings.update(initialBufferSettings);
        }
    }

    instance = {
        parse: internalParse,
        getMatchers: getMatchers,
        getIron: getIron,
        reset: reset
    };

    setup();

    return instance;
}

MssParser.__dashjs_factory_name = 'MssParser';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssParser);
/* jshint ignore:line */
module.exports = exports['default'];

},{"../../../externals/BigInteger":1}],13:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _coreEventsEventsBase = _dereq_('../core/events/EventsBase');

var _coreEventsEventsBase2 = _interopRequireDefault(_coreEventsEventsBase);

/**
 * @class
 * @implements EventsBase
 */

var MediaPlayerEvents = (function (_EventsBase) {
  _inherits(MediaPlayerEvents, _EventsBase);

  /**
   * @description Public facing external events to be used when developing a player that implements dash.js.
   */

  function MediaPlayerEvents() {
    _classCallCheck(this, MediaPlayerEvents);

    _get(Object.getPrototypeOf(MediaPlayerEvents.prototype), 'constructor', this).call(this);
    /**
     * Triggered when playback will not start yet
     * as the MPD's availabilityStartTime is in the future.
     * Check delay property in payload to determine time before playback will start.
     * @event MediaPlayerEvents#AST_IN_FUTURE
     */
    this.AST_IN_FUTURE = 'astInFuture';

    /**
     * Triggered when the video element's buffer state changes to stalled.
     * Check mediaType in payload to determine type (Video, Audio, FragmentedText).
     * @event MediaPlayerEvents#BUFFER_EMPTY
     */
    this.BUFFER_EMPTY = 'bufferStalled';

    /**
     * Triggered when the video element's buffer state changes to loaded.
     * Check mediaType in payload to determine type (Video, Audio, FragmentedText).
     * @event MediaPlayerEvents#BUFFER_LOADED
     */
    this.BUFFER_LOADED = 'bufferLoaded';

    /**
     * Triggered when the video element's buffer state changes, either stalled or loaded. Check payload for state.
     * @event MediaPlayerEvents#BUFFER_LEVEL_STATE_CHANGED
     */
    this.BUFFER_LEVEL_STATE_CHANGED = 'bufferStateChanged';

    /**
     * Triggered when there is an error from the element or MSE source buffer.
     * @event MediaPlayerEvents#ERROR
     */
    this.ERROR = 'error';
    /**
     * Triggered when a fragment download has completed.
     * @event MediaPlayerEvents#FRAGMENT_LOADING_COMPLETED
     */
    this.FRAGMENT_LOADING_COMPLETED = 'fragmentLoadingCompleted';

    /**
     * Triggered when a partial fragment download has completed.
     * @event MediaPlayerEvents#FRAGMENT_LOADING_PROGRESS
     */
    this.FRAGMENT_LOADING_PROGRESS = 'fragmentLoadingProgress';
    /**
     * Triggered when a fragment download has started.
     * @event MediaPlayerEvents#FRAGMENT_LOADING_STARTED
     */
    this.FRAGMENT_LOADING_STARTED = 'fragmentLoadingStarted';

    /**
     * Triggered when a fragment download is abandoned due to detection of slow download base on the ABR abandon rule..
     * @event MediaPlayerEvents#FRAGMENT_LOADING_ABANDONED
     */
    this.FRAGMENT_LOADING_ABANDONED = 'fragmentLoadingAbandoned';

    /**
     * Triggered when {@link module:Debug} logger methods are called.
     * @event MediaPlayerEvents#LOG
     */
    this.LOG = 'log';

    //TODO refactor with internal event
    /**
     * Triggered when the manifest load is complete
     * @event MediaPlayerEvents#MANIFEST_LOADED
     */
    this.MANIFEST_LOADED = 'manifestLoaded';

    /**
     * Triggered anytime there is a change to the overall metrics.
     * @event MediaPlayerEvents#METRICS_CHANGED
     */
    this.METRICS_CHANGED = 'metricsChanged';

    /**
     * Triggered when an individual metric is added, updated or cleared.
     * @event MediaPlayerEvents#METRIC_CHANGED
     */
    this.METRIC_CHANGED = 'metricChanged';

    /**
     * Triggered every time a new metric is added.
     * @event MediaPlayerEvents#METRIC_ADDED
     */
    this.METRIC_ADDED = 'metricAdded';

    /**
     * Triggered every time a metric is updated.
     * @event MediaPlayerEvents#METRIC_UPDATED
     */
    this.METRIC_UPDATED = 'metricUpdated';

    /**
     * Triggered at the stream end of a period.
     * @event MediaPlayerEvents#PERIOD_SWITCH_COMPLETED
     */
    this.PERIOD_SWITCH_COMPLETED = 'periodSwitchCompleted';

    /**
     * Triggered when a new period starts.
     * @event MediaPlayerEvents#PERIOD_SWITCH_STARTED
     */
    this.PERIOD_SWITCH_STARTED = 'periodSwitchStarted';

    /**
     * Triggered when an ABR up /down switch is initiated; either by user in manual mode or auto mode via ABR rules.
     * @event MediaPlayerEvents#QUALITY_CHANGE_REQUESTED
     */
    this.QUALITY_CHANGE_REQUESTED = 'qualityChangeRequested';

    /**
     * Triggered when the new ABR quality is being rendered on-screen.
     * @event MediaPlayerEvents#QUALITY_CHANGE_RENDERED
     */
    this.QUALITY_CHANGE_RENDERED = 'qualityChangeRendered';

    /**
     * Triggered when the new track is being rendered.
     * @event MediaPlayerEvents#TRACK_CHANGE_RENDERED
     */
    this.TRACK_CHANGE_RENDERED = 'trackChangeRendered';

    /**
     * Triggered when the source is setup and ready.
     * @event MediaPlayerEvents#SOURCE_INITIALIZED
     */
    this.SOURCE_INITIALIZED = 'sourceInitialized';

    /**
     * Triggered when a stream (period) is being loaded
     * @event MediaPlayerEvents#STREAM_INITIALIZING
     */
    this.STREAM_INITIALIZING = 'streamInitializing';

    /**
     * Triggered when a stream (period) is loaded
     * @event MediaPlayerEvents#STREAM_UPDATED
     */
    this.STREAM_UPDATED = 'streamUpdated';

    /**
     * Triggered when a stream (period) is updated
     * @event MediaPlayerEvents#STREAM_INITIALIZED
     */
    this.STREAM_INITIALIZED = 'streamInitialized';

    /**
     * Triggered when the player has been reset.
     * @event MediaPlayerEvents#STREAM_TEARDOWN_COMPLETE
     */
    this.STREAM_TEARDOWN_COMPLETE = 'streamTeardownComplete';

    /**
     * Triggered once all text tracks detected in the MPD are added to the video element.
     * @event MediaPlayerEvents#TEXT_TRACKS_ADDED
     */
    this.TEXT_TRACKS_ADDED = 'allTextTracksAdded';

    /**
     * Triggered when a text track is added to the video element's TextTrackList
     * @event MediaPlayerEvents#TEXT_TRACK_ADDED
     */
    this.TEXT_TRACK_ADDED = 'textTrackAdded';

    /**
     * Triggered when a ttml chunk is parsed.
     * @event MediaPlayerEvents#TTML_PARSED
     */
    this.TTML_PARSED = 'ttmlParsed';

    /**
     * Triggered when a ttml chunk has to be parsed.
     * @event MediaPlayerEvents#TTML_TO_PARSE
     */
    this.TTML_TO_PARSE = 'ttmlToParse';

    /**
     * Triggered when a caption is rendered.
     * @event MediaPlayerEvents#CAPTION_RENDERED
     */
    this.CAPTION_RENDERED = 'captionRendered';

    /**
     * Triggered when the caption container is resized.
     * @event MediaPlayerEvents#CAPTION_CONTAINER_RESIZE
     */
    this.CAPTION_CONTAINER_RESIZE = 'captionContainerResize';

    /**
     * Sent when enough data is available that the media can be played,
     * at least for a couple of frames.  This corresponds to the
     * HAVE_ENOUGH_DATA readyState.
     * @event MediaPlayerEvents#CAN_PLAY
     */
    this.CAN_PLAY = 'canPlay';

    /**
     * Sent when playback completes.
     * @event MediaPlayerEvents#PLAYBACK_ENDED
     */
    this.PLAYBACK_ENDED = 'playbackEnded';

    /**
     * Sent when an error occurs.  The element's error
     * attribute contains more information.
     * @event MediaPlayerEvents#PLAYBACK_ERROR
     */
    this.PLAYBACK_ERROR = 'playbackError';

    /**
     * Sent when playback is not allowed (for example if user gesture is needed).
     * @event MediaPlayerEvents#PLAYBACK_NOT_ALLOWED
     */
    this.PLAYBACK_NOT_ALLOWED = 'playbackNotAllowed';

    /**
     * The media's metadata has finished loading; all attributes now
     * contain as much useful information as they're going to.
     * @event MediaPlayerEvents#PLAYBACK_METADATA_LOADED
     */
    this.PLAYBACK_METADATA_LOADED = 'playbackMetaDataLoaded';

    /**
     * Sent when playback is paused.
     * @event MediaPlayerEvents#PLAYBACK_PAUSED
     */
    this.PLAYBACK_PAUSED = 'playbackPaused';

    /**
     * Sent when the media begins to play (either for the first time, after having been paused,
     * or after ending and then restarting).
     *
     * @event MediaPlayerEvents#PLAYBACK_PLAYING
     */
    this.PLAYBACK_PLAYING = 'playbackPlaying';

    /**
     * Sent periodically to inform interested parties of progress downloading
     * the media. Information about the current amount of the media that has
     * been downloaded is available in the media element's buffered attribute.
     * @event MediaPlayerEvents#PLAYBACK_PROGRESS
     */
    this.PLAYBACK_PROGRESS = 'playbackProgress';

    /**
     * Sent when the playback speed changes.
     * @event MediaPlayerEvents#PLAYBACK_RATE_CHANGED
     */
    this.PLAYBACK_RATE_CHANGED = 'playbackRateChanged';

    /**
     * Sent when a seek operation completes.
     * @event MediaPlayerEvents#PLAYBACK_SEEKED
     */
    this.PLAYBACK_SEEKED = 'playbackSeeked';

    /**
     * Sent when a seek operation begins.
     * @event MediaPlayerEvents#PLAYBACK_SEEKING
     */
    this.PLAYBACK_SEEKING = 'playbackSeeking';

    /**
     * Sent when a seek operation has been asked.
     * @event MediaPlayerEvents#PLAYBACK_SEEK_ASKED
     */
    this.PLAYBACK_SEEK_ASKED = 'playbackSeekAsked';

    /**
     * Sent when the video element reports stalled
     * @event MediaPlayerEvents#PLAYBACK_STALLED
     */
    this.PLAYBACK_STALLED = 'playbackStalled';

    /**
     * Sent when playback of the media starts after having been paused;
     * that is, when playback is resumed after a prior pause event.
     *
     * @event MediaPlayerEvents#PLAYBACK_STARTED
     */
    this.PLAYBACK_STARTED = 'playbackStarted';

    /**
     * The time indicated by the element's currentTime attribute has changed.
     * @event MediaPlayerEvents#PLAYBACK_TIME_UPDATED
     */
    this.PLAYBACK_TIME_UPDATED = 'playbackTimeUpdated';

    /**
     * Sent when the media playback has stopped because of a temporary lack of data.
     *
     * @event MediaPlayerEvents#PLAYBACK_WAITING
     */
    this.PLAYBACK_WAITING = 'playbackWaiting';

    /**
     * Manifest validity changed - As a result of an MPD validity expiration event.
     * @event MediaPlayerEvents#MANIFEST_VALIDITY_CHANGED
     */
    this.MANIFEST_VALIDITY_CHANGED = 'manifestValidityChanged';

    /**
     * A gap occured in the timeline which requires a seek to the next period
     * @event MediaPlayerEvents#GAP_CAUSED_SEEK_TO_PERIOD_END
     */
    this.GAP_CAUSED_SEEK_TO_PERIOD_END = 'gapCausedSeekToPeriodEnd';
  }

  return MediaPlayerEvents;
})(_coreEventsEventsBase2['default']);

var mediaPlayerEvents = new MediaPlayerEvents();
exports['default'] = mediaPlayerEvents;
module.exports = exports['default'];

},{"../core/events/EventsBase":4}],14:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Represents data structure to keep and drive {DataChunk}
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreFactoryMaker = _dereq_('../../core/FactoryMaker');

var _coreFactoryMaker2 = _interopRequireDefault(_coreFactoryMaker);

function InitCache() {

    var data = {};

    function save(chunk) {
        var id = chunk.streamId;
        var representationId = chunk.representationId;

        data[id] = data[id] || {};
        data[id][representationId] = chunk;
    }

    function extract(streamId, representationId) {
        if (data && data[streamId] && data[streamId][representationId]) {
            return data[streamId][representationId];
        } else {
            return null;
        }
    }

    function reset() {
        data = {};
    }

    var instance = {
        save: save,
        extract: extract,
        reset: reset
    };

    return instance;
}

InitCache.__dashjs_factory_name = 'InitCache';
exports['default'] = _coreFactoryMaker2['default'].getSingletonFactory(InitCache);
module.exports = exports['default'];

},{"../../core/FactoryMaker":2}],15:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @class
 * @ignore
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DashJSError = function DashJSError(code, message, data) {
  _classCallCheck(this, DashJSError);

  this.code = code || null;
  this.message = message || null;
  this.data = data || null;
};

exports["default"] = DashJSError;
module.exports = exports["default"];

},{}],16:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @class
 * @ignore
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataChunk =
//Represents a data structure that keep all the necessary info about a single init/media segment
function DataChunk() {
  _classCallCheck(this, DataChunk);

  this.streamId = null;
  this.mediaInfo = null;
  this.segmentType = null;
  this.quality = NaN;
  this.index = NaN;
  this.bytes = null;
  this.start = NaN;
  this.end = NaN;
  this.duration = NaN;
  this.representationId = null;
  this.endFragment = null;
};

exports["default"] = DataChunk;
module.exports = exports["default"];

},{}],17:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _voMetricsHTTPRequest = _dereq_('../vo/metrics/HTTPRequest');

/**
 * @class
 * @ignore
 */

var FragmentRequest = (function () {
    function FragmentRequest(url) {
        _classCallCheck(this, FragmentRequest);

        this.action = FragmentRequest.ACTION_DOWNLOAD;
        this.startTime = NaN;
        this.mediaType = null;
        this.mediaInfo = null;
        this.type = null;
        this.duration = NaN;
        this.timescale = NaN;
        this.range = null;
        this.url = url || null;
        this.serviceLocation = null;
        this.requestStartDate = null;
        this.firstByteDate = null;
        this.requestEndDate = null;
        this.quality = NaN;
        this.index = NaN;
        this.availabilityStartTime = null;
        this.availabilityEndTime = null;
        this.wallStartTime = null;
        this.bytesLoaded = NaN;
        this.bytesTotal = NaN;
        this.delayLoadingTime = NaN;
        this.responseType = 'arraybuffer';
        this.representationId = null;
    }

    _createClass(FragmentRequest, [{
        key: 'isInitializationRequest',
        value: function isInitializationRequest() {
            return this.type && this.type === _voMetricsHTTPRequest.HTTPRequest.INIT_SEGMENT_TYPE;
        }
    }, {
        key: 'setInfo',
        value: function setInfo(info) {
            this.type = info && info.init ? _voMetricsHTTPRequest.HTTPRequest.INIT_SEGMENT_TYPE : _voMetricsHTTPRequest.HTTPRequest.MEDIA_SEGMENT_TYPE;
            this.url = info && info.url ? info.url : null;
            this.range = info && info.range ? info.range.start + '-' + info.range.end : null;
            this.mediaType = info && info.mediaType ? info.mediaType : null;
        }
    }]);

    return FragmentRequest;
})();

FragmentRequest.ACTION_DOWNLOAD = 'download';
FragmentRequest.ACTION_COMPLETE = 'complete';

exports['default'] = FragmentRequest;
module.exports = exports['default'];

},{"../vo/metrics/HTTPRequest":18}],18:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @classdesc This Object holds reference to the HTTPRequest for manifest, fragment and xlink loading.
 * Members which are not defined in ISO23009-1 Annex D should be prefixed by a _ so that they are ignored
 * by Metrics Reporting code.
 * @ignore
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var HTTPRequest =
/**
 * @class
 */
function HTTPRequest() {
  _classCallCheck(this, HTTPRequest);

  /**
   * Identifier of the TCP connection on which the HTTP request was sent.
   * @public
   */
  this.tcpid = null;
  /**
   * This is an optional parameter and should not be included in HTTP request/response transactions for progressive download.
   * The type of the request:
   * - MPD
   * - XLink expansion
   * - Initialization Fragment
   * - Index Fragment
   * - Media Fragment
   * - Bitstream Switching Fragment
   * - other
   * @public
   */
  this.type = null;
  /**
   * The original URL (before any redirects or failures)
   * @public
   */
  this.url = null;
  /**
   * The actual URL requested, if different from above
   * @public
   */
  this.actualurl = null;
  /**
   * The contents of the byte-range-spec part of the HTTP Range header.
   * @public
   */
  this.range = null;
  /**
   * Real-Time | The real time at which the request was sent.
   * @public
   */
  this.trequest = null;
  /**
   * Real-Time | The real time at which the first byte of the response was received.
   * @public
   */
  this.tresponse = null;
  /**
   * The HTTP response code.
   * @public
   */
  this.responsecode = null;
  /**
   * The duration of the throughput trace intervals (ms), for successful requests only.
   * @public
   */
  this.interval = null;
  /**
   * Throughput traces, for successful requests only.
   * @public
   */
  this.trace = [];

  /**
   * Type of stream ("audio" | "video" etc..)
   * @public
   */
  this._stream = null;
  /**
   * Real-Time | The real time at which the request finished.
   * @public
   */
  this._tfinish = null;
  /**
   * The duration of the media requests, if available, in milliseconds.
   * @public
   */
  this._mediaduration = null;
  /**
   * The media segment quality
   * @public
   */
  this._quality = null;
  /**
   * all the response headers from request.
   * @public
   */
  this._responseHeaders = null;
  /**
   * The selected service location for the request. string.
   * @public
   */
  this._serviceLocation = null;
}

/**
 * @classdesc This Object holds reference to the progress of the HTTPRequest.
 * @ignore
 */
;

var HTTPRequestTrace =
/**
* @class
*/
function HTTPRequestTrace() {
  _classCallCheck(this, HTTPRequestTrace);

  /**
   * Real-Time | Measurement stream start.
   * @public
   */
  this.s = null;
  /**
   * Measurement stream duration (ms).
   * @public
   */
  this.d = null;
  /**
   * List of integers counting the bytes received in each trace interval within the measurement stream.
   * @public
   */
  this.b = [];
};

HTTPRequest.GET = 'GET';
HTTPRequest.HEAD = 'HEAD';
HTTPRequest.MPD_TYPE = 'MPD';
HTTPRequest.XLINK_EXPANSION_TYPE = 'XLinkExpansion';
HTTPRequest.INIT_SEGMENT_TYPE = 'InitializationSegment';
HTTPRequest.INDEX_SEGMENT_TYPE = 'IndexSegment';
HTTPRequest.MEDIA_SEGMENT_TYPE = 'MediaSegment';
HTTPRequest.BITSTREAM_SWITCHING_SEGMENT_TYPE = 'BitstreamSwitchingSegment';
HTTPRequest.OTHER_TYPE = 'other';

exports.HTTPRequest = HTTPRequest;
exports.HTTPRequestTrace = HTTPRequestTrace;

},{}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9taW5oci9EZXNrdG9wL2NzNTI1L01EYXNoL01EYXNoL2Rhc2hsZXQuanMvZXh0ZXJuYWxzL0JpZ0ludGVnZXIuanMiLCJDOi9Vc2Vycy9taW5oci9EZXNrdG9wL2NzNTI1L01EYXNoL01EYXNoL2Rhc2hsZXQuanMvc3JjL2NvcmUvRmFjdG9yeU1ha2VyLmpzIiwiQzovVXNlcnMvbWluaHIvRGVza3RvcC9jczUyNS9NRGFzaC9NRGFzaC9kYXNobGV0LmpzL3NyYy9jb3JlL2Vycm9ycy9FcnJvcnNCYXNlLmpzIiwiQzovVXNlcnMvbWluaHIvRGVza3RvcC9jczUyNS9NRGFzaC9NRGFzaC9kYXNobGV0LmpzL3NyYy9jb3JlL2V2ZW50cy9FdmVudHNCYXNlLmpzIiwiQzovVXNlcnMvbWluaHIvRGVza3RvcC9jczUyNS9NRGFzaC9NRGFzaC9kYXNobGV0LmpzL3NyYy9tc3MvTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlci5qcyIsIkM6L1VzZXJzL21pbmhyL0Rlc2t0b3AvY3M1MjUvTURhc2gvTURhc2gvZGFzaGxldC5qcy9zcmMvbXNzL01zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvci5qcyIsIkM6L1VzZXJzL21pbmhyL0Rlc2t0b3AvY3M1MjUvTURhc2gvTURhc2gvZGFzaGxldC5qcy9zcmMvbXNzL01zc0ZyYWdtZW50TW9vdlByb2Nlc3Nvci5qcyIsIkM6L1VzZXJzL21pbmhyL0Rlc2t0b3AvY3M1MjUvTURhc2gvTURhc2gvZGFzaGxldC5qcy9zcmMvbXNzL01zc0ZyYWdtZW50UHJvY2Vzc29yLmpzIiwiQzovVXNlcnMvbWluaHIvRGVza3RvcC9jczUyNS9NRGFzaC9NRGFzaC9kYXNobGV0LmpzL3NyYy9tc3MvTXNzSGFuZGxlci5qcyIsIkM6L1VzZXJzL21pbmhyL0Rlc2t0b3AvY3M1MjUvTURhc2gvTURhc2gvZGFzaGxldC5qcy9zcmMvbXNzL2Vycm9ycy9Nc3NFcnJvcnMuanMiLCJDOi9Vc2Vycy9taW5oci9EZXNrdG9wL2NzNTI1L01EYXNoL01EYXNoL2Rhc2hsZXQuanMvc3JjL21zcy9pbmRleC5qcyIsIkM6L1VzZXJzL21pbmhyL0Rlc2t0b3AvY3M1MjUvTURhc2gvTURhc2gvZGFzaGxldC5qcy9zcmMvbXNzL3BhcnNlci9Nc3NQYXJzZXIuanMiLCJDOi9Vc2Vycy9taW5oci9EZXNrdG9wL2NzNTI1L01EYXNoL01EYXNoL2Rhc2hsZXQuanMvc3JjL3N0cmVhbWluZy9NZWRpYVBsYXllckV2ZW50cy5qcyIsIkM6L1VzZXJzL21pbmhyL0Rlc2t0b3AvY3M1MjUvTURhc2gvTURhc2gvZGFzaGxldC5qcy9zcmMvc3RyZWFtaW5nL3V0aWxzL0luaXRDYWNoZS5qcyIsIkM6L1VzZXJzL21pbmhyL0Rlc2t0b3AvY3M1MjUvTURhc2gvTURhc2gvZGFzaGxldC5qcy9zcmMvc3RyZWFtaW5nL3ZvL0Rhc2hKU0Vycm9yLmpzIiwiQzovVXNlcnMvbWluaHIvRGVza3RvcC9jczUyNS9NRGFzaC9NRGFzaC9kYXNobGV0LmpzL3NyYy9zdHJlYW1pbmcvdm8vRGF0YUNodW5rLmpzIiwiQzovVXNlcnMvbWluaHIvRGVza3RvcC9jczUyNS9NRGFzaC9NRGFzaC9kYXNobGV0LmpzL3NyYy9zdHJlYW1pbmcvdm8vRnJhZ21lbnRSZXF1ZXN0LmpzIiwiQzovVXNlcnMvbWluaHIvRGVza3RvcC9jczUyNS9NRGFzaC9NRGFzaC9kYXNobGV0LmpzL3NyYy9zdHJlYW1pbmcvdm8vbWV0cmljcy9IVFRQUmVxdWVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxNQUFNLEdBQUMsQ0FBQSxVQUFTLFNBQVMsRUFBQztBQUFDLGNBQVksQ0FBQyxJQUFJLElBQUksR0FBQyxHQUFHO01BQUMsUUFBUSxHQUFDLENBQUM7TUFBQyxPQUFPLEdBQUMsZ0JBQWdCO01BQUMsV0FBVyxHQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7TUFBQyxnQkFBZ0IsR0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLG9CQUFvQixHQUFDLE9BQU8sTUFBTSxLQUFHLFVBQVUsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLFFBQVEsRUFBQyxhQUFhLEVBQUM7QUFBQyxRQUFHLE9BQU8sQ0FBQyxLQUFHLFdBQVcsRUFBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLE9BQU8sS0FBSyxLQUFHLFdBQVcsRUFBQyxPQUFNLENBQUMsS0FBSyxLQUFHLEVBQUUsSUFBRSxDQUFDLFFBQVEsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxVQUFVLENBQUMsS0FBSyxFQUFDLElBQUksRUFBQztBQUFDLFFBQUksQ0FBQyxLQUFLLEdBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsS0FBSyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsR0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLFlBQVksQ0FBQyxLQUFLLEVBQUM7QUFBQyxRQUFJLENBQUMsS0FBSyxHQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxJQUFJLENBQUE7R0FBQyxZQUFZLENBQUMsU0FBUyxHQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsWUFBWSxDQUFDLEtBQUssRUFBQztBQUFDLFFBQUksQ0FBQyxLQUFLLEdBQUMsS0FBSyxDQUFBO0dBQUMsWUFBWSxDQUFDLFNBQVMsR0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFNLENBQUMsT0FBTyxHQUFDLENBQUMsSUFBRSxDQUFDLEdBQUMsT0FBTyxDQUFBO0dBQUMsU0FBUyxZQUFZLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEdBQUMsR0FBRyxFQUFDLE9BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsR0FBQyxJQUFJLEVBQUMsT0FBTSxDQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUcsTUFBTSxHQUFDLENBQUMsSUFBRSxVQUFVLENBQUMsR0FBRyxFQUFDLFdBQVcsQ0FBQyxHQUFDLENBQUMsRUFBQztBQUFDLGNBQU8sTUFBTSxHQUFFLEtBQUssQ0FBQztBQUFDLGlCQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFBQyxpQkFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQUMsaUJBQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUM7QUFBUSxpQkFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxHQUFFLElBQUksQ0FBQSxDQUFDO0tBQUMsT0FBTyxHQUFHLENBQUE7R0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sRUFBRSxDQUFDLEdBQUMsTUFBTSxFQUFDO0FBQUMsT0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEdBQUMsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxDQUFDLEdBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQUMsS0FBSyxHQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLEdBQUc7UUFBQyxDQUFDLENBQUMsS0FBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxTQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLEdBQUcsSUFBRSxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEtBQUssR0FBQyxJQUFJLENBQUE7S0FBQyxPQUFNLENBQUMsR0FBQyxHQUFHLEVBQUM7QUFBQyxTQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsR0FBRyxLQUFHLElBQUksR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsR0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFBO0tBQUMsSUFBRyxLQUFLLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLENBQUMsR0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLEdBQUc7UUFBQyxDQUFDLENBQUMsS0FBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxTQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksR0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLElBQUUsQ0FBQyxDQUFBO0tBQUMsT0FBTSxLQUFLLEdBQUMsQ0FBQyxFQUFDO0FBQUMsT0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsSUFBSSxDQUFDLElBQUksS0FBRyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQUMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0tBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFBQyxhQUFPLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLFVBQUcsU0FBUyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLElBQUksWUFBWSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLEdBQUcsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLENBQUMsR0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFBQyxNQUFNLEdBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJO1FBQUMsQ0FBQztRQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGdCQUFVLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxVQUFVLEdBQUMsQ0FBQyxFQUFDO0FBQUMsa0JBQVUsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFBO0tBQUMsS0FBSSxDQUFDLEdBQUMsR0FBRyxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxnQkFBVSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBRyxVQUFVLEdBQUMsQ0FBQyxFQUFDLFVBQVUsSUFBRSxJQUFJLENBQUMsS0FBSTtBQUFDLFNBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxNQUFLO09BQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQTtLQUFDLE9BQUssQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLE9BQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLElBQUksRUFBQztBQUFDLFFBQUksS0FBSyxDQUFDLElBQUcsVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUM7QUFBQyxXQUFLLEdBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE1BQUk7QUFBQyxXQUFLLEdBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxJQUFJLENBQUE7S0FBQyxLQUFLLEdBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUcsT0FBTyxLQUFLLEtBQUcsUUFBUSxFQUFDO0FBQUMsVUFBRyxJQUFJLEVBQUMsS0FBSyxHQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUE7S0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsQ0FBQTtHQUFDLFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxDQUFDLEdBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJO1FBQUMsQ0FBQztRQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGdCQUFVLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxJQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxHQUFDLENBQUMsR0FBQyxVQUFVLEdBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQTtLQUFDLENBQUMsR0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxPQUFPLENBQUMsS0FBRyxRQUFRLEVBQUM7QUFBQyxVQUFHLElBQUksRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQyxPQUFPLGFBQWEsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxXQUFXLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLGFBQU8sSUFBSSxZQUFZLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxhQUFhLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxRQUFJLElBQUksR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFDLElBQUksWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEdBQUc7UUFBQyxDQUFDLEdBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJO1FBQUMsT0FBTztRQUFDLEtBQUs7UUFBQyxDQUFDO1FBQUMsR0FBRztRQUFDLEdBQUcsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsRUFBQztBQUFDLFNBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsRUFBQztBQUFDLFdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsSUFBRSxLQUFLLENBQUE7T0FBQztLQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLENBQUMsR0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLEtBQUssR0FBQyxDQUFDO1FBQUMsT0FBTztRQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGFBQU8sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sR0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFBO0tBQUMsT0FBTSxLQUFLLEdBQUMsQ0FBQyxFQUFDO0FBQUMsT0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLFNBQVMsU0FBUyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxFQUFFLENBQUMsT0FBTSxDQUFDLEVBQUUsR0FBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLGlCQUFpQixDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUcsQ0FBQyxJQUFFLEVBQUUsRUFBQyxPQUFPLFlBQVksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQUMsRUFBRSxHQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEdBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxDQUFDLEVBQUUsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxPQUFPLENBQUE7R0FBQyxTQUFTLFlBQVksQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDO0FBQUMsV0FBTSxDQUFDLElBQUksR0FBQyxFQUFFLEdBQUMsSUFBSSxHQUFDLEVBQUUsR0FBQyxLQUFLLEdBQUMsRUFBRSxHQUFDLEVBQUUsR0FBQyxDQUFDLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUs7UUFBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLElBQUksS0FBRyxDQUFDLENBQUMsSUFBSTtRQUFDLEdBQUcsQ0FBQyxJQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFBQyxVQUFHLENBQUMsS0FBRyxDQUFDLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsR0FBRyxHQUFDLElBQUksRUFBQztBQUFDLGVBQU8sSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQTtPQUFDLENBQUMsR0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUE7S0FBQyxJQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBQyxPQUFPLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMscUJBQXFCLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxJQUFJLEVBQUM7QUFBQyxRQUFHLENBQUMsR0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUM7QUFBQyxhQUFPLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQUMsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUcsQ0FBQyxDQUFDLEtBQUssS0FBRyxDQUFDLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsS0FBSyxLQUFHLENBQUMsRUFBQyxPQUFPLElBQUksQ0FBQyxJQUFHLENBQUMsQ0FBQyxLQUFLLEtBQUcsQ0FBQyxDQUFDLEVBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxJQUFJLEtBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsTUFBTSxDQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQUMsSUFBSSxHQUFDLElBQUk7UUFBQyxPQUFPO1FBQUMsS0FBSztRQUFDLENBQUM7UUFBQyxHQUFHO1FBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsU0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFDLENBQUMsSUFBRSxHQUFHLEdBQUMsR0FBRyxDQUFBLEFBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQTtPQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxDQUFBO0tBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFFBQUksS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBQyxPQUFPLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUMsU0FBUyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksR0FBRyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsSUFBSSxHQUFDLElBQUk7UUFBQyxNQUFNLEdBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFBQywyQkFBMkIsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBRSxDQUFDLEdBQUMsMkJBQTJCLENBQUEsQUFBQyxDQUFDO1FBQUMsU0FBUyxHQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsTUFBTSxDQUFDO1FBQUMsT0FBTyxHQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsTUFBTSxDQUFDO1FBQUMsYUFBYTtRQUFDLEtBQUs7UUFBQyxLQUFLO1FBQUMsTUFBTTtRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLElBQUcsU0FBUyxDQUFDLE1BQU0sSUFBRSxHQUFHLEVBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixHQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxLQUFLLEdBQUMsR0FBRyxHQUFDLEdBQUcsRUFBQyxLQUFLLElBQUUsQ0FBQyxFQUFDLEtBQUssRUFBRSxFQUFDO0FBQUMsbUJBQWEsR0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLElBQUcsU0FBUyxDQUFDLEtBQUssR0FBQyxHQUFHLENBQUMsS0FBRywyQkFBMkIsRUFBQztBQUFDLHFCQUFhLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsR0FBRyxDQUFDLEdBQUMsSUFBSSxHQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFBLEdBQUUsMkJBQTJCLENBQUMsQ0FBQTtPQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGFBQUssSUFBRSxhQUFhLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUUsU0FBUyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsSUFBRSxLQUFLLEdBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxBQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxJQUFHLE1BQU0sR0FBQyxDQUFDLEVBQUM7QUFBQyxtQkFBUyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQTtTQUFDLE1BQUk7QUFBQyxtQkFBUyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtTQUFDO09BQUMsT0FBTSxNQUFNLEtBQUcsQ0FBQyxFQUFDO0FBQUMscUJBQWEsSUFBRSxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGVBQUssSUFBRSxTQUFTLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxLQUFLLEdBQUMsQ0FBQyxFQUFDO0FBQUMscUJBQVMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFBO1dBQUMsTUFBSTtBQUFDLHFCQUFTLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFBO1dBQUM7U0FBQyxNQUFNLElBQUUsS0FBSyxDQUFBO09BQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFDLGFBQWEsQ0FBQTtLQUFDLFNBQVMsR0FBQyxXQUFXLENBQUMsU0FBUyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxNQUFNLEdBQUMsRUFBRTtRQUFDLElBQUksR0FBQyxFQUFFO1FBQUMsSUFBSSxHQUFDLElBQUk7UUFBQyxLQUFLO1FBQUMsSUFBSTtRQUFDLEtBQUs7UUFBQyxLQUFLO1FBQUMsS0FBSyxDQUFDLE9BQU0sR0FBRyxFQUFDO0FBQUMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDO0FBQUMsY0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFRO09BQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxJQUFJLEdBQUMsR0FBRyxFQUFDO0FBQUMsYUFBSyxHQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQSxHQUFFLElBQUksQ0FBQTtPQUFDLEtBQUssR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFFO0FBQUMsYUFBSyxHQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLENBQUMsSUFBRyxVQUFVLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxJQUFFLENBQUMsRUFBQyxNQUFNLEtBQUssRUFBRSxDQUFBO09BQUMsUUFBTSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUMsUUFBUSxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQTtLQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQztBQUFDLFFBQUksTUFBTSxHQUFDLEtBQUssQ0FBQyxNQUFNO1FBQUMsUUFBUSxHQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsU0FBUztRQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxHQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQztBQUFDLGFBQU8sR0FBQyxTQUFTLEdBQUMsSUFBSSxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEdBQUMsT0FBTyxHQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxPQUFNLENBQUMsUUFBUSxFQUFDLFNBQVMsR0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLEtBQUs7UUFBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsb0JBQW9CLEVBQUM7QUFBQyxhQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFBQyxlQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksWUFBWSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQUMsT0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLFVBQUcsQ0FBQyxLQUFHLENBQUMsRUFBQyxPQUFNLENBQUMsSUFBSSxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxJQUFFLENBQUMsQ0FBQyxFQUFDLE9BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLEdBQUcsR0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFLLEdBQUMsV0FBVyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEdBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxJQUFJLEVBQUMsU0FBUyxHQUFDLENBQUMsU0FBUyxDQUFDLElBQUcsT0FBTyxRQUFRLEtBQUcsUUFBUSxFQUFDO0FBQUMsY0FBRyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUMsUUFBUSxHQUFDLENBQUMsUUFBUSxDQUFDLE9BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBQyxJQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1NBQUMsT0FBTSxDQUFDLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO09BQUMsQ0FBQyxHQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUFDLElBQUksVUFBVSxHQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxVQUFVLEtBQUcsQ0FBQyxDQUFDLEVBQUMsT0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLFVBQVUsS0FBRyxDQUFDLEVBQUMsT0FBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxNQUFNLElBQUUsR0FBRyxFQUFDLEtBQUssR0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxHQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJO1FBQUMsR0FBRyxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFHLE9BQU8sUUFBUSxLQUFHLFFBQVEsRUFBQztBQUFDLFVBQUcsS0FBSyxFQUFDLFFBQVEsR0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7S0FBQyxNQUFLLFFBQVEsR0FBQyxJQUFJLFVBQVUsQ0FBQyxRQUFRLEVBQUMsS0FBSyxDQUFDLENBQUMsSUFBRyxPQUFPLEdBQUcsS0FBRyxRQUFRLEVBQUM7QUFBQyxVQUFHLEtBQUssRUFBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQUMsTUFBSyxHQUFHLEdBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxFQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU0sQ0FBQyxRQUFRLEVBQUMsR0FBRyxDQUFDLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksTUFBTSxHQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxFQUFDLFFBQVEsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUs7UUFBQyxLQUFLO1FBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxDQUFDLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsRUFBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxDQUFDLENBQUMsRUFBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQUMsYUFBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBQyxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsR0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUM7QUFBQyxVQUFHLFNBQVMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sSUFBSSxFQUFDO0FBQUMsVUFBRyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsRUFBQztBQUFDLFNBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxJQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0tBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUFDLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQUMsRUFBRSxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxFQUFFLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsRUFBRSxFQUFDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sSUFBSSxFQUFDO0FBQUMsVUFBRyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUEsS0FBSSxFQUFFLEVBQUM7QUFBQyxTQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQyxNQUFNLENBQUMsSUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFTLEdBQUcsRUFBQyxHQUFHLEVBQUM7QUFBQyxPQUFHLEdBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBRyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBQztBQUFDLFVBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLENBQUMsTUFBTSxLQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUM7QUFBQyxhQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsT0FBTyxFQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLE9BQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFNLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxJQUFFLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsSUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsUUFBUSxFQUFDO0FBQUMsYUFBTyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBRyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxDQUFDLENBQUMsT0FBTyxFQUFDO0FBQUMsYUFBTyxJQUFJLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBRSxJQUFJLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsUUFBUSxFQUFDO0FBQUMsYUFBTyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsT0FBTyxFQUFDO0FBQUMsYUFBTyxDQUFDLElBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxHQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQUMsYUFBTyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsUUFBUSxFQUFDO0FBQUMsYUFBTyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBRSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQSxLQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQSxLQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLEtBQUssQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxLQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sS0FBSyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsS0FBSyxLQUFHLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEtBQUssS0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sSUFBSSxDQUFDLElBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEVBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLElBQUksQ0FBQyxJQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFBO0dBQUMsU0FBUyxlQUFlLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksS0FBSyxHQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFBQyxDQUFDLEdBQUMsS0FBSztRQUFDLENBQUMsR0FBQyxDQUFDO1FBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLElBQUksRUFBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBQyxTQUFTLEtBQUksQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFNBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBQyxTQUFTLElBQUksQ0FBQTtPQUFDLE9BQU8sS0FBSyxDQUFBO0tBQUMsT0FBTyxJQUFJLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBQyxVQUFTLE1BQU0sRUFBQztBQUFDLFFBQUksT0FBTyxHQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLE9BQU8sS0FBRyxTQUFTLEVBQUMsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxHQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFHLElBQUksSUFBRSxFQUFFLEVBQUMsT0FBTyxlQUFlLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFHLElBQUksR0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxFQUFFLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsT0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFVBQVMsVUFBVSxFQUFDO0FBQUMsUUFBSSxPQUFPLEdBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUcsT0FBTyxLQUFHLFNBQVMsRUFBQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUMsVUFBVSxLQUFHLFNBQVMsR0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsRUFBRSxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLE9BQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUk7UUFBQyxJQUFJLEdBQUMsTUFBTSxDQUFDLEdBQUc7UUFBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQUMsQ0FBQztRQUFDLEtBQUs7UUFBQyxLQUFLLENBQUMsT0FBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLE9BQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUMsT0FBTyxHQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBQyxtQkFBbUIsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsRUFBQztBQUFDLE9BQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUM7QUFBQyxhQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFVO0FBQUMsUUFBSSxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFHLElBQUksQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLGFBQWEsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxRQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUcsS0FBSyxHQUFDLENBQUMsR0FBQyxPQUFPLEVBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxRQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUcsSUFBSSxDQUFDLElBQUksRUFBQztBQUFDLGFBQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLE9BQU8sYUFBYSxDQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFVO0FBQUMsUUFBSSxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFHLEtBQUssR0FBQyxDQUFDLEdBQUMsQ0FBQyxPQUFPLEVBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLElBQUksV0FBVyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLEdBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLElBQUUsSUFBSSxFQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLEdBQUMsV0FBVyxDQUFDLE1BQU07TUFBQyxhQUFhLEdBQUMsV0FBVyxDQUFDLGFBQWEsR0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUUsSUFBSSxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFlBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFDLDZCQUE2QixDQUFDLENBQUE7S0FBQyxJQUFHLENBQUMsR0FBQyxDQUFDLEVBQUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUMsSUFBSSxDQUFDLElBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sTUFBTSxDQUFDLE9BQU0sQ0FBQyxJQUFFLGFBQWEsRUFBQztBQUFDLFlBQU0sR0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBRSxhQUFhLEdBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsWUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsNkJBQTZCLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxHQUFDLENBQUMsRUFBQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBQyxJQUFJLENBQUMsT0FBTSxDQUFDLElBQUUsYUFBYSxFQUFDO0FBQUMsVUFBRyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUMsU0FBUyxDQUFDLE1BQU0sRUFBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFFLGFBQWEsR0FBQyxDQUFDLENBQUE7S0FBQyxNQUFNLEdBQUMsU0FBUyxDQUFDLE1BQU0sRUFBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQztBQUFDLEtBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRTtRQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxJQUFJLEdBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBQyxDQUFDO1FBQUMsSUFBSSxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFDLENBQUM7UUFBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxHQUFDLElBQUk7UUFBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxHQUFDLEVBQUUsQ0FBQyxPQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDO0FBQUMsYUFBTyxHQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFHLEtBQUssRUFBQztBQUFDLGNBQU0sR0FBQyxhQUFhLEdBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQTtPQUFDLE9BQU8sR0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBRyxLQUFLLEVBQUM7QUFBQyxjQUFNLEdBQUMsYUFBYSxHQUFDLENBQUMsR0FBQyxNQUFNLENBQUE7T0FBQyxJQUFJLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFJLEdBQUcsR0FBQyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsTUFBTSxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDO0FBQUMsU0FBRyxHQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxHQUFHLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxhQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxhQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxhQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxHQUFDLENBQUMsSUFBRSxFQUFFO01BQUMsVUFBVSxHQUFDLENBQUMsSUFBSSxHQUFDLENBQUMsSUFBSSxDQUFBLElBQUcsSUFBSSxHQUFDLENBQUMsSUFBSSxDQUFBLEFBQUMsR0FBQyxTQUFTLENBQUMsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLEtBQUcsUUFBUSxHQUFDLENBQUMsR0FBQyxTQUFTLEdBQUMsT0FBTyxDQUFDLEtBQUcsUUFBUSxHQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLEdBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFFLENBQUMsRUFBQztBQUFDLFVBQUksR0FBRyxHQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFFLENBQUMsR0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLEdBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUE7S0FBQyxPQUFNLEVBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxZQUFVO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUM7QUFBQyxPQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEVBQUM7QUFBQyxhQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDO0FBQUMsT0FBQyxHQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLE9BQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsR0FBRTtBQUFDLGFBQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDO0FBQUMsU0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FBQyxJQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxTQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsUUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQUMsSUFBSSxHQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxLQUFLLENBQUMsT0FBTyxFQUFDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxHQUFDLEVBQUU7UUFBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsVUFBSSxHQUFHLEdBQUMsVUFBVSxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUcsS0FBSyxHQUFDLEdBQUcsRUFBQyxVQUFVLEdBQUMsS0FBSyxDQUFBO0tBQUMsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQUMsSUFBSSxTQUFTLEdBQUMsU0FBVixTQUFTLENBQVUsSUFBSSxFQUFDLElBQUksRUFBQyxRQUFRLEVBQUMsYUFBYSxFQUFDO0FBQUMsWUFBUSxHQUFDLFFBQVEsSUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUcsQ0FBQyxhQUFhLEVBQUM7QUFBQyxVQUFJLEdBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsR0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7S0FBQyxJQUFJLE1BQU0sR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksT0FBTyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxjQUFjLEdBQUMsRUFBRSxDQUFDLEtBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLG9CQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0tBQUMsS0FBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsR0FBRyxFQUFDLFNBQVMsSUFBRyxDQUFDLElBQUksY0FBYyxFQUFDO0FBQUMsWUFBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUUsT0FBTyxFQUFDO0FBQUMsY0FBRyxDQUFDLEtBQUcsR0FBRyxJQUFFLE9BQU8sS0FBRyxDQUFDLEVBQUMsU0FBUyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsR0FBQyxnQ0FBZ0MsR0FBQyxJQUFJLEdBQUMsR0FBRyxDQUFDLENBQUE7U0FBQztPQUFDO0tBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBQyxFQUFFLENBQUMsSUFBSSxVQUFVLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFHLEdBQUcsQ0FBQyxLQUFJLENBQUMsR0FBQyxVQUFVLEdBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsSUFBSSxjQUFjLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUcsQ0FBQyxLQUFHLEdBQUcsRUFBQztBQUFDLFlBQUksS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFFO0FBQUMsV0FBQyxFQUFFLENBQUE7U0FBQyxRQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBRyxHQUFHLElBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUMsMkJBQTJCLENBQUMsQ0FBQTtLQUFDLE9BQU8sa0JBQWtCLENBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsQ0FBQTtHQUFDLENBQUMsU0FBUyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUMsSUFBSSxFQUFDLFVBQVUsRUFBQztBQUFDLFFBQUksR0FBRyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFBQyxHQUFHLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsR0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsU0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQUMsT0FBTyxVQUFVLEdBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFDLEdBQUcsQ0FBQTtHQUFDLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBQyxRQUFRLEVBQUM7QUFBQyxZQUFRLEdBQUMsUUFBUSxJQUFFLGdCQUFnQixDQUFDLElBQUcsS0FBSyxHQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUM7QUFBQyxhQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUFDLE9BQU0sR0FBRyxHQUFDLEtBQUssR0FBQyxHQUFHLENBQUE7R0FBQyxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBSSxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLFVBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxPQUFNLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLEtBQUssRUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsSUFBSSxHQUFHLEdBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFDLEdBQUcsQ0FBQyxFQUFDLFVBQVUsRUFBQyxLQUFLLEVBQUMsQ0FBQTtLQUFDLElBQUksR0FBRyxHQUFDLEtBQUssQ0FBQyxJQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUM7QUFBQyxTQUFHLEdBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7S0FBQyxJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLFVBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsT0FBTSxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLEdBQUcsRUFBQyxDQUFBO0tBQUMsSUFBSSxHQUFHLEdBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxHQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsT0FBTSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBRSxDQUFDLEVBQUM7QUFBQyxZQUFNLEdBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssR0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFDO0FBQUMsYUFBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtPQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUE7S0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFDLFVBQVUsRUFBQyxHQUFHLEVBQUMsQ0FBQTtHQUFDLFNBQVMsWUFBWSxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxPQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBQyxHQUFHLEdBQUMsRUFBRSxDQUFBLEdBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxhQUFPLFNBQVMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsVUFBUyxLQUFLLEVBQUM7QUFBQyxXQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsS0FBSyxFQUFDO0FBQUMsV0FBTyxNQUFNLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBQyxVQUFTLEtBQUssRUFBQztBQUFDLFdBQU8sTUFBTSxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUMsVUFBUyxLQUFLLEVBQUMsUUFBUSxFQUFDO0FBQUMsUUFBRyxLQUFLLEtBQUcsU0FBUyxFQUFDLEtBQUssR0FBQyxFQUFFLENBQUMsSUFBRyxLQUFLLEtBQUcsRUFBRSxFQUFDLE9BQU8sWUFBWSxDQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQUMsS0FBSyxHQUFDLFNBQVM7UUFBQyxLQUFLLENBQUMsT0FBTSxFQUFFLENBQUMsSUFBRSxDQUFDLEVBQUM7QUFBQyxXQUFLLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBQyxLQUFLLENBQUE7S0FBQyxJQUFJLElBQUksR0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEdBQUcsR0FBQyxFQUFFLENBQUMsT0FBTyxJQUFJLEdBQUMsR0FBRyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLEtBQUssRUFBQyxRQUFRLEVBQUM7QUFBQyxRQUFHLEtBQUssS0FBRyxTQUFTLEVBQUMsS0FBSyxHQUFDLEVBQUUsQ0FBQyxJQUFHLEtBQUssSUFBRSxFQUFFLEVBQUMsT0FBTyxZQUFZLENBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBVTtBQUFDLFdBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQTtHQUFDLENBQUMsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsVUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sb0JBQW9CLEdBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsR0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUksSUFBSSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxHQUFHLENBQUMsSUFBRyxJQUFJLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLEdBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUcsS0FBSyxDQUFDLE1BQU0sS0FBRyxDQUFDLEVBQUM7QUFBQyxVQUFJLEdBQUcsR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUcsR0FBRyxFQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFHLEdBQUcsS0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsR0FBQyxHQUFHLEdBQUMsMkJBQTJCLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxZQUFZLEdBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFHLFlBQVksSUFBRSxDQUFDLEVBQUM7QUFBQyxXQUFHLElBQUUsSUFBSSxDQUFDLE1BQU0sR0FBQyxZQUFZLEdBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxZQUFZLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLElBQUcsR0FBRyxHQUFDLENBQUMsRUFBQyxNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUMsSUFBSSxJQUFFLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQTtLQUFDLElBQUksT0FBTyxHQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsT0FBTyxFQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxvQkFBb0IsRUFBQztBQUFDLGFBQU8sSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxFQUFFO1FBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsQ0FBQyxHQUFDLFFBQVE7UUFBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxPQUFNLEdBQUcsR0FBQyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUUsQ0FBQyxDQUFDLElBQUcsR0FBRyxHQUFDLENBQUMsRUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxTQUFTLGdCQUFnQixDQUFDLENBQUMsRUFBQztBQUFDLFFBQUcsb0JBQW9CLEVBQUM7QUFBQyxhQUFPLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxVQUFHLENBQUMsS0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUMscUJBQXFCLENBQUMsQ0FBQyxPQUFPLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtHQUFDLFNBQVMsVUFBVSxDQUFDLENBQUMsRUFBQztBQUFDLFFBQUcsT0FBTyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsT0FBTyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsT0FBTyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFdBQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEdBQUMsQ0FBQyxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsT0FBTyxDQUFDLEdBQUcsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxP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Q0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixxQkFBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLEdBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUQscUJBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxHQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU1RCxtQ0FBbUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLG1DQUFtQixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUV2RSxNQUFNOzs7QUFHSCxnQ0FBZ0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFckMsZ0NBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxVQUFVLElBQUksQ0FBQyxHQUFLLFNBQVMsSUFBSSxDQUFDLEFBQUMsQ0FBQztBQUMzRCxnQ0FBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLFNBQVMsSUFBSSxDQUFDLEdBQUssUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxBQUFDLENBQUM7O0FBRXBHLHFCQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IscUJBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxHQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU1RCxtQ0FBbUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxD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QUFLN0IsTUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztDQUNoQzs7Ozs7Ozs7SUFPQyxnQkFBZ0I7Ozs7QUFJUCxTQUpULGdCQUFnQixHQUlKO3dCQUpaLGdCQUFnQjs7Ozs7O0FBU2QsTUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7Ozs7O0FBS2QsTUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7Ozs7O0FBS2QsTUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDZjs7QUFHTCxXQUFXLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztBQUN4QixXQUFXLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUMxQixXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztBQUM3QixXQUFXLENBQUMsb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUM7QUFDcEQsV0FBVyxDQUFDLGlCQUFpQixHQUFHLHVCQUF1QixDQUFDO0FBQ3hELFdBQVcsQ0FBQyxrQkFBa0IsR0FBRyxjQUFjLENBQUM7QUFDaEQsV0FBVyxDQUFDLGtCQUFrQixHQUFHLGNBQWMsQ0FBQztBQUNoRCxXQUFXLENBQUMsZ0NBQWdDLEdBQUcsMkJBQTJCLENBQUM7QUFDM0UsV0FBVyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7O1FBRXhCLFdBQVcsR0FBWCxXQUFXO1FBQUUsZ0JBQWdCLEdBQWhCLGdCQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBiaWdJbnQ9ZnVuY3Rpb24odW5kZWZpbmVkKXtcInVzZSBzdHJpY3RcIjt2YXIgQkFTRT0xZTcsTE9HX0JBU0U9NyxNQVhfSU5UPTkwMDcxOTkyNTQ3NDA5OTIsTUFYX0lOVF9BUlI9c21hbGxUb0FycmF5KE1BWF9JTlQpLERFRkFVTFRfQUxQSEFCRVQ9XCIwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIjt2YXIgc3VwcG9ydHNOYXRpdmVCaWdJbnQ9dHlwZW9mIEJpZ0ludD09PVwiZnVuY3Rpb25cIjtmdW5jdGlvbiBJbnRlZ2VyKHYscmFkaXgsYWxwaGFiZXQsY2FzZVNlbnNpdGl2ZSl7aWYodHlwZW9mIHY9PT1cInVuZGVmaW5lZFwiKXJldHVybiBJbnRlZ2VyWzBdO2lmKHR5cGVvZiByYWRpeCE9PVwidW5kZWZpbmVkXCIpcmV0dXJuK3JhZGl4PT09MTAmJiFhbHBoYWJldD9wYXJzZVZhbHVlKHYpOnBhcnNlQmFzZSh2LHJhZGl4LGFscGhhYmV0LGNhc2VTZW5zaXRpdmUpO3JldHVybiBwYXJzZVZhbHVlKHYpfWZ1bmN0aW9uIEJpZ0ludGVnZXIodmFsdWUsc2lnbil7dGhpcy52YWx1ZT12YWx1ZTt0aGlzLnNpZ249c2lnbjt0aGlzLmlzU21hbGw9ZmFsc2V9QmlnSW50ZWdlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gU21hbGxJbnRlZ2VyKHZhbHVlKXt0aGlzLnZhbHVlPXZhbHVlO3RoaXMuc2lnbj12YWx1ZTwwO3RoaXMuaXNTbWFsbD10cnVlfVNtYWxsSW50ZWdlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gTmF0aXZlQmlnSW50KHZhbHVlKXt0aGlzLnZhbHVlPXZhbHVlfU5hdGl2ZUJpZ0ludC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gaXNQcmVjaXNlKG4pe3JldHVybi1NQVhfSU5UPG4mJm48TUFYX0lOVH1mdW5jdGlvbiBzbWFsbFRvQXJyYXkobil7aWYobjwxZTcpcmV0dXJuW25dO2lmKG48MWUxNClyZXR1cm5bbiUxZTcsTWF0aC5mbG9vcihuLzFlNyldO3JldHVybltuJTFlNyxNYXRoLmZsb29yKG4vMWU3KSUxZTcsTWF0aC5mbG9vcihuLzFlMTQpXX1mdW5jdGlvbiBhcnJheVRvU21hbGwoYXJyKXt0cmltKGFycik7dmFyIGxlbmd0aD1hcnIubGVuZ3RoO2lmKGxlbmd0aDw0JiZjb21wYXJlQWJzKGFycixNQVhfSU5UX0FSUik8MCl7c3dpdGNoKGxlbmd0aCl7Y2FzZSAwOnJldHVybiAwO2Nhc2UgMTpyZXR1cm4gYXJyWzBdO2Nhc2UgMjpyZXR1cm4gYXJyWzBdK2FyclsxXSpCQVNFO2RlZmF1bHQ6cmV0dXJuIGFyclswXSsoYXJyWzFdK2FyclsyXSpCQVNFKSpCQVNFfX1yZXR1cm4gYXJyfWZ1bmN0aW9uIHRyaW0odil7dmFyIGk9di5sZW5ndGg7d2hpbGUodlstLWldPT09MCk7di5sZW5ndGg9aSsxfWZ1bmN0aW9uIGNyZWF0ZUFycmF5KGxlbmd0aCl7dmFyIHg9bmV3IEFycmF5KGxlbmd0aCk7dmFyIGk9LTE7d2hpbGUoKytpPGxlbmd0aCl7eFtpXT0wfXJldHVybiB4fWZ1bmN0aW9uIHRydW5jYXRlKG4pe2lmKG4+MClyZXR1cm4gTWF0aC5mbG9vcihuKTtyZXR1cm4gTWF0aC5jZWlsKG4pfWZ1bmN0aW9uIGFkZChhLGIpe3ZhciBsX2E9YS5sZW5ndGgsbF9iPWIubGVuZ3RoLHI9bmV3IEFycmF5KGxfYSksY2Fycnk9MCxiYXNlPUJBU0Usc3VtLGk7Zm9yKGk9MDtpPGxfYjtpKyspe3N1bT1hW2ldK2JbaV0rY2Fycnk7Y2Fycnk9c3VtPj1iYXNlPzE6MDtyW2ldPXN1bS1jYXJyeSpiYXNlfXdoaWxlKGk8bF9hKXtzdW09YVtpXStjYXJyeTtjYXJyeT1zdW09PT1iYXNlPzE6MDtyW2krK109c3VtLWNhcnJ5KmJhc2V9aWYoY2Fycnk+MClyLnB1c2goY2FycnkpO3JldHVybiByfWZ1bmN0aW9uIGFkZEFueShhLGIpe2lmKGEubGVuZ3RoPj1iLmxlbmd0aClyZXR1cm4gYWRkKGEsYik7cmV0dXJuIGFkZChiLGEpfWZ1bmN0aW9uIGFkZFNtYWxsKGEsY2Fycnkpe3ZhciBsPWEubGVuZ3RoLHI9bmV3IEFycmF5KGwpLGJhc2U9QkFTRSxzdW0saTtmb3IoaT0wO2k8bDtpKyspe3N1bT1hW2ldLWJhc2UrY2Fycnk7Y2Fycnk9TWF0aC5mbG9vcihzdW0vYmFzZSk7cltpXT1zdW0tY2FycnkqYmFzZTtjYXJyeSs9MX13aGlsZShjYXJyeT4wKXtyW2krK109Y2FycnklYmFzZTtjYXJyeT1NYXRoLmZsb29yKGNhcnJ5L2Jhc2UpfXJldHVybiByfUJpZ0ludGVnZXIucHJvdG90eXBlLmFkZD1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpO2lmKHRoaXMuc2lnbiE9PW4uc2lnbil7cmV0dXJuIHRoaXMuc3VidHJhY3Qobi5uZWdhdGUoKSl9dmFyIGE9dGhpcy52YWx1ZSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkU21hbGwoYSxNYXRoLmFicyhiKSksdGhpcy5zaWduKX1yZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkQW55KGEsYiksdGhpcy5zaWduKX07QmlnSW50ZWdlci5wcm90b3R5cGUucGx1cz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlO2lmKGE8MCE9PW4uc2lnbil7cmV0dXJuIHRoaXMuc3VidHJhY3Qobi5uZWdhdGUoKSl9dmFyIGI9bi52YWx1ZTtpZihuLmlzU21hbGwpe2lmKGlzUHJlY2lzZShhK2IpKXJldHVybiBuZXcgU21hbGxJbnRlZ2VyKGErYik7Yj1zbWFsbFRvQXJyYXkoTWF0aC5hYnMoYikpfXJldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbChiLE1hdGguYWJzKGEpKSxhPDApfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnBsdXM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZStwYXJzZVZhbHVlKHYpLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5wbHVzPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuYWRkO2Z1bmN0aW9uIHN1YnRyYWN0KGEsYil7dmFyIGFfbD1hLmxlbmd0aCxiX2w9Yi5sZW5ndGgscj1uZXcgQXJyYXkoYV9sKSxib3Jyb3c9MCxiYXNlPUJBU0UsaSxkaWZmZXJlbmNlO2ZvcihpPTA7aTxiX2w7aSsrKXtkaWZmZXJlbmNlPWFbaV0tYm9ycm93LWJbaV07aWYoZGlmZmVyZW5jZTwwKXtkaWZmZXJlbmNlKz1iYXNlO2JvcnJvdz0xfWVsc2UgYm9ycm93PTA7cltpXT1kaWZmZXJlbmNlfWZvcihpPWJfbDtpPGFfbDtpKyspe2RpZmZlcmVuY2U9YVtpXS1ib3Jyb3c7aWYoZGlmZmVyZW5jZTwwKWRpZmZlcmVuY2UrPWJhc2U7ZWxzZXtyW2krK109ZGlmZmVyZW5jZTticmVha31yW2ldPWRpZmZlcmVuY2V9Zm9yKDtpPGFfbDtpKyspe3JbaV09YVtpXX10cmltKHIpO3JldHVybiByfWZ1bmN0aW9uIHN1YnRyYWN0QW55KGEsYixzaWduKXt2YXIgdmFsdWU7aWYoY29tcGFyZUFicyhhLGIpPj0wKXt2YWx1ZT1zdWJ0cmFjdChhLGIpfWVsc2V7dmFsdWU9c3VidHJhY3QoYixhKTtzaWduPSFzaWdufXZhbHVlPWFycmF5VG9TbWFsbCh2YWx1ZSk7aWYodHlwZW9mIHZhbHVlPT09XCJudW1iZXJcIil7aWYoc2lnbil2YWx1ZT0tdmFsdWU7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUpfXJldHVybiBuZXcgQmlnSW50ZWdlcih2YWx1ZSxzaWduKX1mdW5jdGlvbiBzdWJ0cmFjdFNtYWxsKGEsYixzaWduKXt2YXIgbD1hLmxlbmd0aCxyPW5ldyBBcnJheShsKSxjYXJyeT0tYixiYXNlPUJBU0UsaSxkaWZmZXJlbmNlO2ZvcihpPTA7aTxsO2krKyl7ZGlmZmVyZW5jZT1hW2ldK2NhcnJ5O2NhcnJ5PU1hdGguZmxvb3IoZGlmZmVyZW5jZS9iYXNlKTtkaWZmZXJlbmNlJT1iYXNlO3JbaV09ZGlmZmVyZW5jZTwwP2RpZmZlcmVuY2UrYmFzZTpkaWZmZXJlbmNlfXI9YXJyYXlUb1NtYWxsKHIpO2lmKHR5cGVvZiByPT09XCJudW1iZXJcIil7aWYoc2lnbilyPS1yO3JldHVybiBuZXcgU21hbGxJbnRlZ2VyKHIpfXJldHVybiBuZXcgQmlnSW50ZWdlcihyLHNpZ24pfUJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0PWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodik7aWYodGhpcy5zaWduIT09bi5zaWduKXtyZXR1cm4gdGhpcy5hZGQobi5uZWdhdGUoKSl9dmFyIGE9dGhpcy52YWx1ZSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXJldHVybiBzdWJ0cmFjdFNtYWxsKGEsTWF0aC5hYnMoYiksdGhpcy5zaWduKTtyZXR1cm4gc3VidHJhY3RBbnkoYSxiLHRoaXMuc2lnbil9O0JpZ0ludGVnZXIucHJvdG90eXBlLm1pbnVzPUJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuc3VidHJhY3Q9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlO2lmKGE8MCE9PW4uc2lnbil7cmV0dXJuIHRoaXMuYWRkKG4ubmVnYXRlKCkpfXZhciBiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcihhLWIpfXJldHVybiBzdWJ0cmFjdFNtYWxsKGIsTWF0aC5hYnMoYSksYT49MCl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUubWludXM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zdWJ0cmFjdDtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnN1YnRyYWN0PWZ1bmN0aW9uKHYpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUtcGFyc2VWYWx1ZSh2KS52YWx1ZSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubWludXM9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5zdWJ0cmFjdDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIodGhpcy52YWx1ZSwhdGhpcy5zaWduKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGU9ZnVuY3Rpb24oKXt2YXIgc2lnbj10aGlzLnNpZ247dmFyIHNtYWxsPW5ldyBTbWFsbEludGVnZXIoLXRoaXMudmFsdWUpO3NtYWxsLnNpZ249IXNpZ247cmV0dXJuIHNtYWxsfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5lZ2F0ZT1mdW5jdGlvbigpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KC10aGlzLnZhbHVlKX07QmlnSW50ZWdlci5wcm90b3R5cGUuYWJzPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHRoaXMudmFsdWUsZmFsc2UpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmFicz1mdW5jdGlvbigpe3JldHVybiBuZXcgU21hbGxJbnRlZ2VyKE1hdGguYWJzKHRoaXMudmFsdWUpKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hYnM9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlPj0wP3RoaXMudmFsdWU6LXRoaXMudmFsdWUpfTtmdW5jdGlvbiBtdWx0aXBseUxvbmcoYSxiKXt2YXIgYV9sPWEubGVuZ3RoLGJfbD1iLmxlbmd0aCxsPWFfbCtiX2wscj1jcmVhdGVBcnJheShsKSxiYXNlPUJBU0UscHJvZHVjdCxjYXJyeSxpLGFfaSxiX2o7Zm9yKGk9MDtpPGFfbDsrK2kpe2FfaT1hW2ldO2Zvcih2YXIgaj0wO2o8Yl9sOysrail7Yl9qPWJbal07cHJvZHVjdD1hX2kqYl9qK3JbaStqXTtjYXJyeT1NYXRoLmZsb29yKHByb2R1Y3QvYmFzZSk7cltpK2pdPXByb2R1Y3QtY2FycnkqYmFzZTtyW2kraisxXSs9Y2Fycnl9fXRyaW0ocik7cmV0dXJuIHJ9ZnVuY3Rpb24gbXVsdGlwbHlTbWFsbChhLGIpe3ZhciBsPWEubGVuZ3RoLHI9bmV3IEFycmF5KGwpLGJhc2U9QkFTRSxjYXJyeT0wLHByb2R1Y3QsaTtmb3IoaT0wO2k8bDtpKyspe3Byb2R1Y3Q9YVtpXSpiK2NhcnJ5O2NhcnJ5PU1hdGguZmxvb3IocHJvZHVjdC9iYXNlKTtyW2ldPXByb2R1Y3QtY2FycnkqYmFzZX13aGlsZShjYXJyeT4wKXtyW2krK109Y2FycnklYmFzZTtjYXJyeT1NYXRoLmZsb29yKGNhcnJ5L2Jhc2UpfXJldHVybiByfWZ1bmN0aW9uIHNoaWZ0TGVmdCh4LG4pe3ZhciByPVtdO3doaWxlKG4tLSA+MClyLnB1c2goMCk7cmV0dXJuIHIuY29uY2F0KHgpfWZ1bmN0aW9uIG11bHRpcGx5S2FyYXRzdWJhKHgseSl7dmFyIG49TWF0aC5tYXgoeC5sZW5ndGgseS5sZW5ndGgpO2lmKG48PTMwKXJldHVybiBtdWx0aXBseUxvbmcoeCx5KTtuPU1hdGguY2VpbChuLzIpO3ZhciBiPXguc2xpY2UobiksYT14LnNsaWNlKDAsbiksZD15LnNsaWNlKG4pLGM9eS5zbGljZSgwLG4pO3ZhciBhYz1tdWx0aXBseUthcmF0c3ViYShhLGMpLGJkPW11bHRpcGx5S2FyYXRzdWJhKGIsZCksYWJjZD1tdWx0aXBseUthcmF0c3ViYShhZGRBbnkoYSxiKSxhZGRBbnkoYyxkKSk7dmFyIHByb2R1Y3Q9YWRkQW55KGFkZEFueShhYyxzaGlmdExlZnQoc3VidHJhY3Qoc3VidHJhY3QoYWJjZCxhYyksYmQpLG4pKSxzaGlmdExlZnQoYmQsMipuKSk7dHJpbShwcm9kdWN0KTtyZXR1cm4gcHJvZHVjdH1mdW5jdGlvbiB1c2VLYXJhdHN1YmEobDEsbDIpe3JldHVybi0uMDEyKmwxLS4wMTIqbDIrMTVlLTYqbDEqbDI+MH1CaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseT1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpLGE9dGhpcy52YWx1ZSxiPW4udmFsdWUsc2lnbj10aGlzLnNpZ24hPT1uLnNpZ24sYWJzO2lmKG4uaXNTbWFsbCl7aWYoYj09PTApcmV0dXJuIEludGVnZXJbMF07aWYoYj09PTEpcmV0dXJuIHRoaXM7aWYoYj09PS0xKXJldHVybiB0aGlzLm5lZ2F0ZSgpO2Ficz1NYXRoLmFicyhiKTtpZihhYnM8QkFTRSl7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKG11bHRpcGx5U21hbGwoYSxhYnMpLHNpZ24pfWI9c21hbGxUb0FycmF5KGFicyl9aWYodXNlS2FyYXRzdWJhKGEubGVuZ3RoLGIubGVuZ3RoKSlyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlLYXJhdHN1YmEoYSxiKSxzaWduKTtyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlMb25nKGEsYiksc2lnbil9O0JpZ0ludGVnZXIucHJvdG90eXBlLnRpbWVzPUJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5O2Z1bmN0aW9uIG11bHRpcGx5U21hbGxBbmRBcnJheShhLGIsc2lnbil7aWYoYTxCQVNFKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlTbWFsbChiLGEpLHNpZ24pfXJldHVybiBuZXcgQmlnSW50ZWdlcihtdWx0aXBseUxvbmcoYixzbWFsbFRvQXJyYXkoYSkpLHNpZ24pfVNtYWxsSW50ZWdlci5wcm90b3R5cGUuX211bHRpcGx5QnlTbWFsbD1mdW5jdGlvbihhKXtpZihpc1ByZWNpc2UoYS52YWx1ZSp0aGlzLnZhbHVlKSl7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIoYS52YWx1ZSp0aGlzLnZhbHVlKX1yZXR1cm4gbXVsdGlwbHlTbWFsbEFuZEFycmF5KE1hdGguYWJzKGEudmFsdWUpLHNtYWxsVG9BcnJheShNYXRoLmFicyh0aGlzLnZhbHVlKSksdGhpcy5zaWduIT09YS5zaWduKX07QmlnSW50ZWdlci5wcm90b3R5cGUuX211bHRpcGx5QnlTbWFsbD1mdW5jdGlvbihhKXtpZihhLnZhbHVlPT09MClyZXR1cm4gSW50ZWdlclswXTtpZihhLnZhbHVlPT09MSlyZXR1cm4gdGhpcztpZihhLnZhbHVlPT09LTEpcmV0dXJuIHRoaXMubmVnYXRlKCk7cmV0dXJuIG11bHRpcGx5U21hbGxBbmRBcnJheShNYXRoLmFicyhhLnZhbHVlKSx0aGlzLnZhbHVlLHRoaXMuc2lnbiE9PWEuc2lnbil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHk9ZnVuY3Rpb24odil7cmV0dXJuIHBhcnNlVmFsdWUodikuX211bHRpcGx5QnlTbWFsbCh0aGlzKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS50aW1lcz1TbWFsbEludGVnZXIucHJvdG90eXBlLm11bHRpcGx5O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubXVsdGlwbHk9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZSpwYXJzZVZhbHVlKHYpLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50aW1lcz1OYXRpdmVCaWdJbnQucHJvdG90eXBlLm11bHRpcGx5O2Z1bmN0aW9uIHNxdWFyZShhKXt2YXIgbD1hLmxlbmd0aCxyPWNyZWF0ZUFycmF5KGwrbCksYmFzZT1CQVNFLHByb2R1Y3QsY2FycnksaSxhX2ksYV9qO2ZvcihpPTA7aTxsO2krKyl7YV9pPWFbaV07Y2Fycnk9MC1hX2kqYV9pO2Zvcih2YXIgaj1pO2o8bDtqKyspe2Ffaj1hW2pdO3Byb2R1Y3Q9MiooYV9pKmFfaikrcltpK2pdK2NhcnJ5O2NhcnJ5PU1hdGguZmxvb3IocHJvZHVjdC9iYXNlKTtyW2kral09cHJvZHVjdC1jYXJyeSpiYXNlfXJbaStsXT1jYXJyeX10cmltKHIpO3JldHVybiByfUJpZ0ludGVnZXIucHJvdG90eXBlLnNxdWFyZT1mdW5jdGlvbigpe3JldHVybiBuZXcgQmlnSW50ZWdlcihzcXVhcmUodGhpcy52YWx1ZSksZmFsc2UpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnNxdWFyZT1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlKnRoaXMudmFsdWU7aWYoaXNQcmVjaXNlKHZhbHVlKSlyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih2YWx1ZSk7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHNxdWFyZShzbWFsbFRvQXJyYXkoTWF0aC5hYnModGhpcy52YWx1ZSkpKSxmYWxzZSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuc3F1YXJlPWZ1bmN0aW9uKHYpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUqdGhpcy52YWx1ZSl9O2Z1bmN0aW9uIGRpdk1vZDEoYSxiKXt2YXIgYV9sPWEubGVuZ3RoLGJfbD1iLmxlbmd0aCxiYXNlPUJBU0UscmVzdWx0PWNyZWF0ZUFycmF5KGIubGVuZ3RoKSxkaXZpc29yTW9zdFNpZ25pZmljYW50RGlnaXQ9YltiX2wtMV0sbGFtYmRhPU1hdGguY2VpbChiYXNlLygyKmRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCkpLHJlbWFpbmRlcj1tdWx0aXBseVNtYWxsKGEsbGFtYmRhKSxkaXZpc29yPW11bHRpcGx5U21hbGwoYixsYW1iZGEpLHF1b3RpZW50RGlnaXQsc2hpZnQsY2FycnksYm9ycm93LGksbCxxO2lmKHJlbWFpbmRlci5sZW5ndGg8PWFfbClyZW1haW5kZXIucHVzaCgwKTtkaXZpc29yLnB1c2goMCk7ZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0PWRpdmlzb3JbYl9sLTFdO2ZvcihzaGlmdD1hX2wtYl9sO3NoaWZ0Pj0wO3NoaWZ0LS0pe3F1b3RpZW50RGlnaXQ9YmFzZS0xO2lmKHJlbWFpbmRlcltzaGlmdCtiX2xdIT09ZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0KXtxdW90aWVudERpZ2l0PU1hdGguZmxvb3IoKHJlbWFpbmRlcltzaGlmdCtiX2xdKmJhc2UrcmVtYWluZGVyW3NoaWZ0K2JfbC0xXSkvZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0KX1jYXJyeT0wO2JvcnJvdz0wO2w9ZGl2aXNvci5sZW5ndGg7Zm9yKGk9MDtpPGw7aSsrKXtjYXJyeSs9cXVvdGllbnREaWdpdCpkaXZpc29yW2ldO3E9TWF0aC5mbG9vcihjYXJyeS9iYXNlKTtib3Jyb3crPXJlbWFpbmRlcltzaGlmdCtpXS0oY2FycnktcSpiYXNlKTtjYXJyeT1xO2lmKGJvcnJvdzwwKXtyZW1haW5kZXJbc2hpZnQraV09Ym9ycm93K2Jhc2U7Ym9ycm93PS0xfWVsc2V7cmVtYWluZGVyW3NoaWZ0K2ldPWJvcnJvdztib3Jyb3c9MH19d2hpbGUoYm9ycm93IT09MCl7cXVvdGllbnREaWdpdC09MTtjYXJyeT0wO2ZvcihpPTA7aTxsO2krKyl7Y2FycnkrPXJlbWFpbmRlcltzaGlmdCtpXS1iYXNlK2Rpdmlzb3JbaV07aWYoY2Fycnk8MCl7cmVtYWluZGVyW3NoaWZ0K2ldPWNhcnJ5K2Jhc2U7Y2Fycnk9MH1lbHNle3JlbWFpbmRlcltzaGlmdCtpXT1jYXJyeTtjYXJyeT0xfX1ib3Jyb3crPWNhcnJ5fXJlc3VsdFtzaGlmdF09cXVvdGllbnREaWdpdH1yZW1haW5kZXI9ZGl2TW9kU21hbGwocmVtYWluZGVyLGxhbWJkYSlbMF07cmV0dXJuW2FycmF5VG9TbWFsbChyZXN1bHQpLGFycmF5VG9TbWFsbChyZW1haW5kZXIpXX1mdW5jdGlvbiBkaXZNb2QyKGEsYil7dmFyIGFfbD1hLmxlbmd0aCxiX2w9Yi5sZW5ndGgscmVzdWx0PVtdLHBhcnQ9W10sYmFzZT1CQVNFLGd1ZXNzLHhsZW4saGlnaHgsaGlnaHksY2hlY2s7d2hpbGUoYV9sKXtwYXJ0LnVuc2hpZnQoYVstLWFfbF0pO3RyaW0ocGFydCk7aWYoY29tcGFyZUFicyhwYXJ0LGIpPDApe3Jlc3VsdC5wdXNoKDApO2NvbnRpbnVlfXhsZW49cGFydC5sZW5ndGg7aGlnaHg9cGFydFt4bGVuLTFdKmJhc2UrcGFydFt4bGVuLTJdO2hpZ2h5PWJbYl9sLTFdKmJhc2UrYltiX2wtMl07aWYoeGxlbj5iX2wpe2hpZ2h4PShoaWdoeCsxKSpiYXNlfWd1ZXNzPU1hdGguY2VpbChoaWdoeC9oaWdoeSk7ZG97Y2hlY2s9bXVsdGlwbHlTbWFsbChiLGd1ZXNzKTtpZihjb21wYXJlQWJzKGNoZWNrLHBhcnQpPD0wKWJyZWFrO2d1ZXNzLS19d2hpbGUoZ3Vlc3MpO3Jlc3VsdC5wdXNoKGd1ZXNzKTtwYXJ0PXN1YnRyYWN0KHBhcnQsY2hlY2spfXJlc3VsdC5yZXZlcnNlKCk7cmV0dXJuW2FycmF5VG9TbWFsbChyZXN1bHQpLGFycmF5VG9TbWFsbChwYXJ0KV19ZnVuY3Rpb24gZGl2TW9kU21hbGwodmFsdWUsbGFtYmRhKXt2YXIgbGVuZ3RoPXZhbHVlLmxlbmd0aCxxdW90aWVudD1jcmVhdGVBcnJheShsZW5ndGgpLGJhc2U9QkFTRSxpLHEscmVtYWluZGVyLGRpdmlzb3I7cmVtYWluZGVyPTA7Zm9yKGk9bGVuZ3RoLTE7aT49MDstLWkpe2Rpdmlzb3I9cmVtYWluZGVyKmJhc2UrdmFsdWVbaV07cT10cnVuY2F0ZShkaXZpc29yL2xhbWJkYSk7cmVtYWluZGVyPWRpdmlzb3ItcSpsYW1iZGE7cXVvdGllbnRbaV09cXwwfXJldHVybltxdW90aWVudCxyZW1haW5kZXJ8MF19ZnVuY3Rpb24gZGl2TW9kQW55KHNlbGYsdil7dmFyIHZhbHVlLG49cGFyc2VWYWx1ZSh2KTtpZihzdXBwb3J0c05hdGl2ZUJpZ0ludCl7cmV0dXJuW25ldyBOYXRpdmVCaWdJbnQoc2VsZi52YWx1ZS9uLnZhbHVlKSxuZXcgTmF0aXZlQmlnSW50KHNlbGYudmFsdWUlbi52YWx1ZSldfXZhciBhPXNlbGYudmFsdWUsYj1uLnZhbHVlO3ZhciBxdW90aWVudDtpZihiPT09MCl0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZGl2aWRlIGJ5IHplcm9cIik7aWYoc2VsZi5pc1NtYWxsKXtpZihuLmlzU21hbGwpe3JldHVybltuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKGEvYikpLG5ldyBTbWFsbEludGVnZXIoYSViKV19cmV0dXJuW0ludGVnZXJbMF0sc2VsZl19aWYobi5pc1NtYWxsKXtpZihiPT09MSlyZXR1cm5bc2VsZixJbnRlZ2VyWzBdXTtpZihiPT0tMSlyZXR1cm5bc2VsZi5uZWdhdGUoKSxJbnRlZ2VyWzBdXTt2YXIgYWJzPU1hdGguYWJzKGIpO2lmKGFiczxCQVNFKXt2YWx1ZT1kaXZNb2RTbWFsbChhLGFicyk7cXVvdGllbnQ9YXJyYXlUb1NtYWxsKHZhbHVlWzBdKTt2YXIgcmVtYWluZGVyPXZhbHVlWzFdO2lmKHNlbGYuc2lnbilyZW1haW5kZXI9LXJlbWFpbmRlcjtpZih0eXBlb2YgcXVvdGllbnQ9PT1cIm51bWJlclwiKXtpZihzZWxmLnNpZ24hPT1uLnNpZ24pcXVvdGllbnQ9LXF1b3RpZW50O3JldHVybltuZXcgU21hbGxJbnRlZ2VyKHF1b3RpZW50KSxuZXcgU21hbGxJbnRlZ2VyKHJlbWFpbmRlcildfXJldHVybltuZXcgQmlnSW50ZWdlcihxdW90aWVudCxzZWxmLnNpZ24hPT1uLnNpZ24pLG5ldyBTbWFsbEludGVnZXIocmVtYWluZGVyKV19Yj1zbWFsbFRvQXJyYXkoYWJzKX12YXIgY29tcGFyaXNvbj1jb21wYXJlQWJzKGEsYik7aWYoY29tcGFyaXNvbj09PS0xKXJldHVybltJbnRlZ2VyWzBdLHNlbGZdO2lmKGNvbXBhcmlzb249PT0wKXJldHVybltJbnRlZ2VyW3NlbGYuc2lnbj09PW4uc2lnbj8xOi0xXSxJbnRlZ2VyWzBdXTtpZihhLmxlbmd0aCtiLmxlbmd0aDw9MjAwKXZhbHVlPWRpdk1vZDEoYSxiKTtlbHNlIHZhbHVlPWRpdk1vZDIoYSxiKTtxdW90aWVudD12YWx1ZVswXTt2YXIgcVNpZ249c2VsZi5zaWduIT09bi5zaWduLG1vZD12YWx1ZVsxXSxtU2lnbj1zZWxmLnNpZ247aWYodHlwZW9mIHF1b3RpZW50PT09XCJudW1iZXJcIil7aWYocVNpZ24pcXVvdGllbnQ9LXF1b3RpZW50O3F1b3RpZW50PW5ldyBTbWFsbEludGVnZXIocXVvdGllbnQpfWVsc2UgcXVvdGllbnQ9bmV3IEJpZ0ludGVnZXIocXVvdGllbnQscVNpZ24pO2lmKHR5cGVvZiBtb2Q9PT1cIm51bWJlclwiKXtpZihtU2lnbiltb2Q9LW1vZDttb2Q9bmV3IFNtYWxsSW50ZWdlcihtb2QpfWVsc2UgbW9kPW5ldyBCaWdJbnRlZ2VyKG1vZCxtU2lnbik7cmV0dXJuW3F1b3RpZW50LG1vZF19QmlnSW50ZWdlci5wcm90b3R5cGUuZGl2bW9kPWZ1bmN0aW9uKHYpe3ZhciByZXN1bHQ9ZGl2TW9kQW55KHRoaXMsdik7cmV0dXJue3F1b3RpZW50OnJlc3VsdFswXSxyZW1haW5kZXI6cmVzdWx0WzFdfX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5kaXZtb2Q9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZtb2Q9QmlnSW50ZWdlci5wcm90b3R5cGUuZGl2bW9kO0JpZ0ludGVnZXIucHJvdG90eXBlLmRpdmlkZT1mdW5jdGlvbih2KXtyZXR1cm4gZGl2TW9kQW55KHRoaXMsdilbMF19O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUub3Zlcj1OYXRpdmVCaWdJbnQucHJvdG90eXBlLmRpdmlkZT1mdW5jdGlvbih2KXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlL3BhcnNlVmFsdWUodikudmFsdWUpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLm92ZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGU9QmlnSW50ZWdlci5wcm90b3R5cGUub3Zlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGU7QmlnSW50ZWdlci5wcm90b3R5cGUubW9kPWZ1bmN0aW9uKHYpe3JldHVybiBkaXZNb2RBbnkodGhpcyx2KVsxXX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5tb2Q9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5yZW1haW5kZXI9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZSVwYXJzZVZhbHVlKHYpLnZhbHVlKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5yZW1haW5kZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tb2Q9QmlnSW50ZWdlci5wcm90b3R5cGUucmVtYWluZGVyPUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3c9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlLHZhbHVlLHgseTtpZihiPT09MClyZXR1cm4gSW50ZWdlclsxXTtpZihhPT09MClyZXR1cm4gSW50ZWdlclswXTtpZihhPT09MSlyZXR1cm4gSW50ZWdlclsxXTtpZihhPT09LTEpcmV0dXJuIG4uaXNFdmVuKCk/SW50ZWdlclsxXTpJbnRlZ2VyWy0xXTtpZihuLnNpZ24pe3JldHVybiBJbnRlZ2VyWzBdfWlmKCFuLmlzU21hbGwpdGhyb3cgbmV3IEVycm9yKFwiVGhlIGV4cG9uZW50IFwiK24udG9TdHJpbmcoKStcIiBpcyB0b28gbGFyZ2UuXCIpO2lmKHRoaXMuaXNTbWFsbCl7aWYoaXNQcmVjaXNlKHZhbHVlPU1hdGgucG93KGEsYikpKXJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKHZhbHVlKSl9eD10aGlzO3k9SW50ZWdlclsxXTt3aGlsZSh0cnVlKXtpZihiJjE9PT0xKXt5PXkudGltZXMoeCk7LS1ifWlmKGI9PT0wKWJyZWFrO2IvPTI7eD14LnNxdWFyZSgpfXJldHVybiB5fTtTbWFsbEludGVnZXIucHJvdG90eXBlLnBvdz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3c7TmF0aXZlQmlnSW50LnByb3RvdHlwZS5wb3c9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlLGI9bi52YWx1ZTt2YXIgXzA9QmlnSW50KDApLF8xPUJpZ0ludCgxKSxfMj1CaWdJbnQoMik7aWYoYj09PV8wKXJldHVybiBJbnRlZ2VyWzFdO2lmKGE9PT1fMClyZXR1cm4gSW50ZWdlclswXTtpZihhPT09XzEpcmV0dXJuIEludGVnZXJbMV07aWYoYT09PUJpZ0ludCgtMSkpcmV0dXJuIG4uaXNFdmVuKCk/SW50ZWdlclsxXTpJbnRlZ2VyWy0xXTtpZihuLmlzTmVnYXRpdmUoKSlyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludChfMCk7dmFyIHg9dGhpczt2YXIgeT1JbnRlZ2VyWzFdO3doaWxlKHRydWUpe2lmKChiJl8xKT09PV8xKXt5PXkudGltZXMoeCk7LS1ifWlmKGI9PT1fMClicmVhaztiLz1fMjt4PXguc3F1YXJlKCl9cmV0dXJuIHl9O0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdz1mdW5jdGlvbihleHAsbW9kKXtleHA9cGFyc2VWYWx1ZShleHApO21vZD1wYXJzZVZhbHVlKG1vZCk7aWYobW9kLmlzWmVybygpKXRocm93IG5ldyBFcnJvcihcIkNhbm5vdCB0YWtlIG1vZFBvdyB3aXRoIG1vZHVsdXMgMFwiKTt2YXIgcj1JbnRlZ2VyWzFdLGJhc2U9dGhpcy5tb2QobW9kKTt3aGlsZShleHAuaXNQb3NpdGl2ZSgpKXtpZihiYXNlLmlzWmVybygpKXJldHVybiBJbnRlZ2VyWzBdO2lmKGV4cC5pc09kZCgpKXI9ci5tdWx0aXBseShiYXNlKS5tb2QobW9kKTtleHA9ZXhwLmRpdmlkZSgyKTtiYXNlPWJhc2Uuc3F1YXJlKCkubW9kKG1vZCl9cmV0dXJuIHJ9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubW9kUG93PVNtYWxsSW50ZWdlci5wcm90b3R5cGUubW9kUG93PUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdztmdW5jdGlvbiBjb21wYXJlQWJzKGEsYil7aWYoYS5sZW5ndGghPT1iLmxlbmd0aCl7cmV0dXJuIGEubGVuZ3RoPmIubGVuZ3RoPzE6LTF9Zm9yKHZhciBpPWEubGVuZ3RoLTE7aT49MDtpLS0pe2lmKGFbaV0hPT1iW2ldKXJldHVybiBhW2ldPmJbaV0/MTotMX1yZXR1cm4gMH1CaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlQWJzPWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodiksYT10aGlzLnZhbHVlLGI9bi52YWx1ZTtpZihuLmlzU21hbGwpcmV0dXJuIDE7cmV0dXJuIGNvbXBhcmVBYnMoYSxiKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlQWJzPWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodiksYT1NYXRoLmFicyh0aGlzLnZhbHVlKSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtiPU1hdGguYWJzKGIpO3JldHVybiBhPT09Yj8wOmE+Yj8xOi0xfXJldHVybi0xfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmNvbXBhcmVBYnM9ZnVuY3Rpb24odil7dmFyIGE9dGhpcy52YWx1ZTt2YXIgYj1wYXJzZVZhbHVlKHYpLnZhbHVlO2E9YT49MD9hOi1hO2I9Yj49MD9iOi1iO3JldHVybiBhPT09Yj8wOmE+Yj8xOi0xfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlPWZ1bmN0aW9uKHYpe2lmKHY9PT1JbmZpbml0eSl7cmV0dXJuLTF9aWYodj09PS1JbmZpbml0eSl7cmV0dXJuIDF9dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlO2lmKHRoaXMuc2lnbiE9PW4uc2lnbil7cmV0dXJuIG4uc2lnbj8xOi0xfWlmKG4uaXNTbWFsbCl7cmV0dXJuIHRoaXMuc2lnbj8tMToxfXJldHVybiBjb21wYXJlQWJzKGEsYikqKHRoaXMuc2lnbj8tMToxKX07QmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZVRvPUJpZ0ludGVnZXIucHJvdG90eXBlLmNvbXBhcmU7U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlPWZ1bmN0aW9uKHYpe2lmKHY9PT1JbmZpbml0eSl7cmV0dXJuLTF9aWYodj09PS1JbmZpbml0eSl7cmV0dXJuIDF9dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlO2lmKG4uaXNTbWFsbCl7cmV0dXJuIGE9PWI/MDphPmI/MTotMX1pZihhPDAhPT1uLnNpZ24pe3JldHVybiBhPDA/LTE6MX1yZXR1cm4gYTwwPzE6LTF9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZVRvPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmNvbXBhcmU9ZnVuY3Rpb24odil7aWYodj09PUluZmluaXR5KXtyZXR1cm4tMX1pZih2PT09LUluZmluaXR5KXtyZXR1cm4gMX12YXIgYT10aGlzLnZhbHVlO3ZhciBiPXBhcnNlVmFsdWUodikudmFsdWU7cmV0dXJuIGE9PT1iPzA6YT5iPzE6LTF9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuY29tcGFyZVRvPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuY29tcGFyZTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5lcXVhbHM9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KT09PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZXE9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5lcXVhbHM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5lcT1TbWFsbEludGVnZXIucHJvdG90eXBlLmVxdWFscz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5lcT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5lcXVhbHM7QmlnSW50ZWdlci5wcm90b3R5cGUubm90RXF1YWxzPWZ1bmN0aW9uKHYpe3JldHVybiB0aGlzLmNvbXBhcmUodikhPT0wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5lcT1OYXRpdmVCaWdJbnQucHJvdG90eXBlLm5vdEVxdWFscz1TbWFsbEludGVnZXIucHJvdG90eXBlLm5lcT1TbWFsbEludGVnZXIucHJvdG90eXBlLm5vdEVxdWFscz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5uZXE9QmlnSW50ZWdlci5wcm90b3R5cGUubm90RXF1YWxzO0JpZ0ludGVnZXIucHJvdG90eXBlLmdyZWF0ZXI9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KT4wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmd0PU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ3JlYXRlcj1TbWFsbEludGVnZXIucHJvdG90eXBlLmd0PVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ndD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyO0JpZ0ludGVnZXIucHJvdG90eXBlLmxlc3Nlcj1mdW5jdGlvbih2KXtyZXR1cm4gdGhpcy5jb21wYXJlKHYpPDB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubHQ9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXNzZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5sdD1TbWFsbEludGVnZXIucHJvdG90eXBlLmxlc3Nlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sdD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXI7QmlnSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzPWZ1bmN0aW9uKHYpe3JldHVybiB0aGlzLmNvbXBhcmUodik+PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ2VxPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ2VxPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzPUJpZ0ludGVnZXIucHJvdG90eXBlLmdlcT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyT3JFcXVhbHM7QmlnSW50ZWdlci5wcm90b3R5cGUubGVzc2VyT3JFcXVhbHM9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KTw9MH07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXE9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXNzZXJPckVxdWFscz1TbWFsbEludGVnZXIucHJvdG90eXBlLmxlcT1TbWFsbEludGVnZXIucHJvdG90eXBlLmxlc3Nlck9yRXF1YWxzPUJpZ0ludGVnZXIucHJvdG90eXBlLmxlcT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXJPckVxdWFscztCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0V2ZW49ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy52YWx1ZVswXSYxKT09PTB9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNFdmVuPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWUmMSk9PT0wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzRXZlbj1mdW5jdGlvbigpe3JldHVybih0aGlzLnZhbHVlJkJpZ0ludCgxKSk9PT1CaWdJbnQoMCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzT2RkPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWVbMF0mMSk9PT0xfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmlzT2RkPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWUmMSk9PT0xfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzT2RkPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWUmQmlnSW50KDEpKT09PUJpZ0ludCgxKX07QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQb3NpdGl2ZT1mdW5jdGlvbigpe3JldHVybiF0aGlzLnNpZ259O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNQb3NpdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlPjB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNQb3NpdGl2ZT1TbWFsbEludGVnZXIucHJvdG90eXBlLmlzUG9zaXRpdmU7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNOZWdhdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnNpZ259O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNOZWdhdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlPDB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNOZWdhdGl2ZT1TbWFsbEludGVnZXIucHJvdG90eXBlLmlzTmVnYXRpdmU7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNVbml0PWZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmlzVW5pdD1mdW5jdGlvbigpe3JldHVybiBNYXRoLmFicyh0aGlzLnZhbHVlKT09PTF9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNVbml0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYWJzKCkudmFsdWU9PT1CaWdJbnQoMSl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzWmVybz1mdW5jdGlvbigpe3JldHVybiBmYWxzZX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1plcm89ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52YWx1ZT09PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNaZXJvPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudmFsdWU9PT1CaWdJbnQoMCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzRGl2aXNpYmxlQnk9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTtpZihuLmlzWmVybygpKXJldHVybiBmYWxzZTtpZihuLmlzVW5pdCgpKXJldHVybiB0cnVlO2lmKG4uY29tcGFyZUFicygyKT09PTApcmV0dXJuIHRoaXMuaXNFdmVuKCk7cmV0dXJuIHRoaXMubW9kKG4pLmlzWmVybygpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzRGl2aXNpYmxlQnk9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc0RpdmlzaWJsZUJ5PUJpZ0ludGVnZXIucHJvdG90eXBlLmlzRGl2aXNpYmxlQnk7ZnVuY3Rpb24gaXNCYXNpY1ByaW1lKHYpe3ZhciBuPXYuYWJzKCk7aWYobi5pc1VuaXQoKSlyZXR1cm4gZmFsc2U7aWYobi5lcXVhbHMoMil8fG4uZXF1YWxzKDMpfHxuLmVxdWFscyg1KSlyZXR1cm4gdHJ1ZTtpZihuLmlzRXZlbigpfHxuLmlzRGl2aXNpYmxlQnkoMyl8fG4uaXNEaXZpc2libGVCeSg1KSlyZXR1cm4gZmFsc2U7aWYobi5sZXNzZXIoNDkpKXJldHVybiB0cnVlfWZ1bmN0aW9uIG1pbGxlclJhYmluVGVzdChuLGEpe3ZhciBuUHJldj1uLnByZXYoKSxiPW5QcmV2LHI9MCxkLHQsaSx4O3doaWxlKGIuaXNFdmVuKCkpYj1iLmRpdmlkZSgyKSxyKys7bmV4dDpmb3IoaT0wO2k8YS5sZW5ndGg7aSsrKXtpZihuLmxlc3NlcihhW2ldKSljb250aW51ZTt4PWJpZ0ludChhW2ldKS5tb2RQb3coYixuKTtpZih4LmlzVW5pdCgpfHx4LmVxdWFscyhuUHJldikpY29udGludWU7Zm9yKGQ9ci0xO2QhPTA7ZC0tKXt4PXguc3F1YXJlKCkubW9kKG4pO2lmKHguaXNVbml0KCkpcmV0dXJuIGZhbHNlO2lmKHguZXF1YWxzKG5QcmV2KSljb250aW51ZSBuZXh0fXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1CaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1ByaW1lPWZ1bmN0aW9uKHN0cmljdCl7dmFyIGlzUHJpbWU9aXNCYXNpY1ByaW1lKHRoaXMpO2lmKGlzUHJpbWUhPT11bmRlZmluZWQpcmV0dXJuIGlzUHJpbWU7dmFyIG49dGhpcy5hYnMoKTt2YXIgYml0cz1uLmJpdExlbmd0aCgpO2lmKGJpdHM8PTY0KXJldHVybiBtaWxsZXJSYWJpblRlc3QobixbMiwzLDUsNywxMSwxMywxNywxOSwyMywyOSwzMSwzN10pO3ZhciBsb2dOPU1hdGgubG9nKDIpKmJpdHMudG9KU051bWJlcigpO3ZhciB0PU1hdGguY2VpbChzdHJpY3Q9PT10cnVlPzIqTWF0aC5wb3cobG9nTiwyKTpsb2dOKTtmb3IodmFyIGE9W10saT0wO2k8dDtpKyspe2EucHVzaChiaWdJbnQoaSsyKSl9cmV0dXJuIG1pbGxlclJhYmluVGVzdChuLGEpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzUHJpbWU9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1ByaW1lPUJpZ0ludGVnZXIucHJvdG90eXBlLmlzUHJpbWU7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lPWZ1bmN0aW9uKGl0ZXJhdGlvbnMpe3ZhciBpc1ByaW1lPWlzQmFzaWNQcmltZSh0aGlzKTtpZihpc1ByaW1lIT09dW5kZWZpbmVkKXJldHVybiBpc1ByaW1lO3ZhciBuPXRoaXMuYWJzKCk7dmFyIHQ9aXRlcmF0aW9ucz09PXVuZGVmaW5lZD81Oml0ZXJhdGlvbnM7Zm9yKHZhciBhPVtdLGk9MDtpPHQ7aSsrKXthLnB1c2goYmlnSW50LnJhbmRCZXR3ZWVuKDIsbi5taW51cygyKSkpfXJldHVybiBtaWxsZXJSYWJpblRlc3QobixhKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWU9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWU9QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lO0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludj1mdW5jdGlvbihuKXt2YXIgdD1iaWdJbnQuemVybyxuZXdUPWJpZ0ludC5vbmUscj1wYXJzZVZhbHVlKG4pLG5ld1I9dGhpcy5hYnMoKSxxLGxhc3RULGxhc3RSO3doaWxlKCFuZXdSLmlzWmVybygpKXtxPXIuZGl2aWRlKG5ld1IpO2xhc3RUPXQ7bGFzdFI9cjt0PW5ld1Q7cj1uZXdSO25ld1Q9bGFzdFQuc3VidHJhY3QocS5tdWx0aXBseShuZXdUKSk7bmV3Uj1sYXN0Ui5zdWJ0cmFjdChxLm11bHRpcGx5KG5ld1IpKX1pZighci5pc1VuaXQoKSl0aHJvdyBuZXcgRXJyb3IodGhpcy50b1N0cmluZygpK1wiIGFuZCBcIituLnRvU3RyaW5nKCkrXCIgYXJlIG5vdCBjby1wcmltZVwiKTtpZih0LmNvbXBhcmUoMCk9PT0tMSl7dD10LmFkZChuKX1pZih0aGlzLmlzTmVnYXRpdmUoKSl7cmV0dXJuIHQubmVnYXRlKCl9cmV0dXJuIHR9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubW9kSW52PVNtYWxsSW50ZWdlci5wcm90b3R5cGUubW9kSW52PUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludjtCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZXh0PWZ1bmN0aW9uKCl7dmFyIHZhbHVlPXRoaXMudmFsdWU7aWYodGhpcy5zaWduKXtyZXR1cm4gc3VidHJhY3RTbWFsbCh2YWx1ZSwxLHRoaXMuc2lnbil9cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGFkZFNtYWxsKHZhbHVlLDEpLHRoaXMuc2lnbil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUubmV4dD1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlO2lmKHZhbHVlKzE8TUFYX0lOVClyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih2YWx1ZSsxKTtyZXR1cm4gbmV3IEJpZ0ludGVnZXIoTUFYX0lOVF9BUlIsZmFsc2UpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5leHQ9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlK0JpZ0ludCgxKSl9O0JpZ0ludGVnZXIucHJvdG90eXBlLnByZXY9ZnVuY3Rpb24oKXt2YXIgdmFsdWU9dGhpcy52YWx1ZTtpZih0aGlzLnNpZ24pe3JldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbCh2YWx1ZSwxKSx0cnVlKX1yZXR1cm4gc3VidHJhY3RTbWFsbCh2YWx1ZSwxLHRoaXMuc2lnbil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUucHJldj1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlO2lmKHZhbHVlLTE+LU1BWF9JTlQpcmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUtMSk7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKE1BWF9JTlRfQVJSLHRydWUpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnByZXY9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlLUJpZ0ludCgxKSl9O3ZhciBwb3dlcnNPZlR3bz1bMV07d2hpbGUoMipwb3dlcnNPZlR3b1twb3dlcnNPZlR3by5sZW5ndGgtMV08PUJBU0UpcG93ZXJzT2ZUd28ucHVzaCgyKnBvd2Vyc09mVHdvW3Bvd2Vyc09mVHdvLmxlbmd0aC0xXSk7dmFyIHBvd2VyczJMZW5ndGg9cG93ZXJzT2ZUd28ubGVuZ3RoLGhpZ2hlc3RQb3dlcjI9cG93ZXJzT2ZUd29bcG93ZXJzMkxlbmd0aC0xXTtmdW5jdGlvbiBzaGlmdF9pc1NtYWxsKG4pe3JldHVybiBNYXRoLmFicyhuKTw9QkFTRX1CaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQ9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KS50b0pTTnVtYmVyKCk7aWYoIXNoaWZ0X2lzU21hbGwobikpe3Rocm93IG5ldyBFcnJvcihTdHJpbmcobikrXCIgaXMgdG9vIGxhcmdlIGZvciBzaGlmdGluZy5cIil9aWYobjwwKXJldHVybiB0aGlzLnNoaWZ0UmlnaHQoLW4pO3ZhciByZXN1bHQ9dGhpcztpZihyZXN1bHQuaXNaZXJvKCkpcmV0dXJuIHJlc3VsdDt3aGlsZShuPj1wb3dlcnMyTGVuZ3RoKXtyZXN1bHQ9cmVzdWx0Lm11bHRpcGx5KGhpZ2hlc3RQb3dlcjIpO24tPXBvd2VyczJMZW5ndGgtMX1yZXR1cm4gcmVzdWx0Lm11bHRpcGx5KHBvd2Vyc09mVHdvW25dKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5zaGlmdExlZnQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQ9QmlnSW50ZWdlci5wcm90b3R5cGUuc2hpZnRMZWZ0O0JpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQ9ZnVuY3Rpb24odil7dmFyIHJlbVF1bzt2YXIgbj1wYXJzZVZhbHVlKHYpLnRvSlNOdW1iZXIoKTtpZighc2hpZnRfaXNTbWFsbChuKSl7dGhyb3cgbmV3IEVycm9yKFN0cmluZyhuKStcIiBpcyB0b28gbGFyZ2UgZm9yIHNoaWZ0aW5nLlwiKX1pZihuPDApcmV0dXJuIHRoaXMuc2hpZnRMZWZ0KC1uKTt2YXIgcmVzdWx0PXRoaXM7d2hpbGUobj49cG93ZXJzMkxlbmd0aCl7aWYocmVzdWx0LmlzWmVybygpfHxyZXN1bHQuaXNOZWdhdGl2ZSgpJiZyZXN1bHQuaXNVbml0KCkpcmV0dXJuIHJlc3VsdDtyZW1RdW89ZGl2TW9kQW55KHJlc3VsdCxoaWdoZXN0UG93ZXIyKTtyZXN1bHQ9cmVtUXVvWzFdLmlzTmVnYXRpdmUoKT9yZW1RdW9bMF0ucHJldigpOnJlbVF1b1swXTtuLT1wb3dlcnMyTGVuZ3RoLTF9cmVtUXVvPWRpdk1vZEFueShyZXN1bHQscG93ZXJzT2ZUd29bbl0pO3JldHVybiByZW1RdW9bMV0uaXNOZWdhdGl2ZSgpP3JlbVF1b1swXS5wcmV2KCk6cmVtUXVvWzBdfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnNoaWZ0UmlnaHQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdFJpZ2h0PUJpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQ7ZnVuY3Rpb24gYml0d2lzZSh4LHksZm4pe3k9cGFyc2VWYWx1ZSh5KTt2YXIgeFNpZ249eC5pc05lZ2F0aXZlKCkseVNpZ249eS5pc05lZ2F0aXZlKCk7dmFyIHhSZW09eFNpZ24/eC5ub3QoKTp4LHlSZW09eVNpZ24/eS5ub3QoKTp5O3ZhciB4RGlnaXQ9MCx5RGlnaXQ9MDt2YXIgeERpdk1vZD1udWxsLHlEaXZNb2Q9bnVsbDt2YXIgcmVzdWx0PVtdO3doaWxlKCF4UmVtLmlzWmVybygpfHwheVJlbS5pc1plcm8oKSl7eERpdk1vZD1kaXZNb2RBbnkoeFJlbSxoaWdoZXN0UG93ZXIyKTt4RGlnaXQ9eERpdk1vZFsxXS50b0pTTnVtYmVyKCk7aWYoeFNpZ24pe3hEaWdpdD1oaWdoZXN0UG93ZXIyLTEteERpZ2l0fXlEaXZNb2Q9ZGl2TW9kQW55KHlSZW0saGlnaGVzdFBvd2VyMik7eURpZ2l0PXlEaXZNb2RbMV0udG9KU051bWJlcigpO2lmKHlTaWduKXt5RGlnaXQ9aGlnaGVzdFBvd2VyMi0xLXlEaWdpdH14UmVtPXhEaXZNb2RbMF07eVJlbT15RGl2TW9kWzBdO3Jlc3VsdC5wdXNoKGZuKHhEaWdpdCx5RGlnaXQpKX12YXIgc3VtPWZuKHhTaWduPzE6MCx5U2lnbj8xOjApIT09MD9iaWdJbnQoLTEpOmJpZ0ludCgwKTtmb3IodmFyIGk9cmVzdWx0Lmxlbmd0aC0xO2k+PTA7aS09MSl7c3VtPXN1bS5tdWx0aXBseShoaWdoZXN0UG93ZXIyKS5hZGQoYmlnSW50KHJlc3VsdFtpXSkpfXJldHVybiBzdW19QmlnSW50ZWdlci5wcm90b3R5cGUubm90PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubmVnYXRlKCkucHJldigpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5vdD1TbWFsbEludGVnZXIucHJvdG90eXBlLm5vdD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ub3Q7QmlnSW50ZWdlci5wcm90b3R5cGUuYW5kPWZ1bmN0aW9uKG4pe3JldHVybiBiaXR3aXNlKHRoaXMsbixmdW5jdGlvbihhLGIpe3JldHVybiBhJmJ9KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hbmQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hbmQ9QmlnSW50ZWdlci5wcm90b3R5cGUuYW5kO0JpZ0ludGVnZXIucHJvdG90eXBlLm9yPWZ1bmN0aW9uKG4pe3JldHVybiBiaXR3aXNlKHRoaXMsbixmdW5jdGlvbihhLGIpe3JldHVybiBhfGJ9KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5vcj1TbWFsbEludGVnZXIucHJvdG90eXBlLm9yPUJpZ0ludGVnZXIucHJvdG90eXBlLm9yO0JpZ0ludGVnZXIucHJvdG90eXBlLnhvcj1mdW5jdGlvbihuKXtyZXR1cm4gYml0d2lzZSh0aGlzLG4sZnVuY3Rpb24oYSxiKXtyZXR1cm4gYV5ifSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUueG9yPVNtYWxsSW50ZWdlci5wcm90b3R5cGUueG9yPUJpZ0ludGVnZXIucHJvdG90eXBlLnhvcjt2YXIgTE9CTUFTS19JPTE8PDMwLExPQk1BU0tfQkk9KEJBU0UmLUJBU0UpKihCQVNFJi1CQVNFKXxMT0JNQVNLX0k7ZnVuY3Rpb24gcm91Z2hMT0Iobil7dmFyIHY9bi52YWx1ZSx4PXR5cGVvZiB2PT09XCJudW1iZXJcIj92fExPQk1BU0tfSTp0eXBlb2Ygdj09PVwiYmlnaW50XCI/dnxCaWdJbnQoTE9CTUFTS19JKTp2WzBdK3ZbMV0qQkFTRXxMT0JNQVNLX0JJO3JldHVybiB4Ji14fWZ1bmN0aW9uIGludGVnZXJMb2dhcml0aG0odmFsdWUsYmFzZSl7aWYoYmFzZS5jb21wYXJlVG8odmFsdWUpPD0wKXt2YXIgdG1wPWludGVnZXJMb2dhcml0aG0odmFsdWUsYmFzZS5zcXVhcmUoYmFzZSkpO3ZhciBwPXRtcC5wO3ZhciBlPXRtcC5lO3ZhciB0PXAubXVsdGlwbHkoYmFzZSk7cmV0dXJuIHQuY29tcGFyZVRvKHZhbHVlKTw9MD97cDp0LGU6ZSoyKzF9OntwOnAsZTplKjJ9fXJldHVybntwOmJpZ0ludCgxKSxlOjB9fUJpZ0ludGVnZXIucHJvdG90eXBlLmJpdExlbmd0aD1mdW5jdGlvbigpe3ZhciBuPXRoaXM7aWYobi5jb21wYXJlVG8oYmlnSW50KDApKTwwKXtuPW4ubmVnYXRlKCkuc3VidHJhY3QoYmlnSW50KDEpKX1pZihuLmNvbXBhcmVUbyhiaWdJbnQoMCkpPT09MCl7cmV0dXJuIGJpZ0ludCgwKX1yZXR1cm4gYmlnSW50KGludGVnZXJMb2dhcml0aG0obixiaWdJbnQoMikpLmUpLmFkZChiaWdJbnQoMSkpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmJpdExlbmd0aD1TbWFsbEludGVnZXIucHJvdG90eXBlLmJpdExlbmd0aD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXRMZW5ndGg7ZnVuY3Rpb24gbWF4KGEsYil7YT1wYXJzZVZhbHVlKGEpO2I9cGFyc2VWYWx1ZShiKTtyZXR1cm4gYS5ncmVhdGVyKGIpP2E6Yn1mdW5jdGlvbiBtaW4oYSxiKXthPXBhcnNlVmFsdWUoYSk7Yj1wYXJzZVZhbHVlKGIpO3JldHVybiBhLmxlc3NlcihiKT9hOmJ9ZnVuY3Rpb24gZ2NkKGEsYil7YT1wYXJzZVZhbHVlKGEpLmFicygpO2I9cGFyc2VWYWx1ZShiKS5hYnMoKTtpZihhLmVxdWFscyhiKSlyZXR1cm4gYTtpZihhLmlzWmVybygpKXJldHVybiBiO2lmKGIuaXNaZXJvKCkpcmV0dXJuIGE7dmFyIGM9SW50ZWdlclsxXSxkLHQ7d2hpbGUoYS5pc0V2ZW4oKSYmYi5pc0V2ZW4oKSl7ZD1taW4ocm91Z2hMT0IoYSkscm91Z2hMT0IoYikpO2E9YS5kaXZpZGUoZCk7Yj1iLmRpdmlkZShkKTtjPWMubXVsdGlwbHkoZCl9d2hpbGUoYS5pc0V2ZW4oKSl7YT1hLmRpdmlkZShyb3VnaExPQihhKSl9ZG97d2hpbGUoYi5pc0V2ZW4oKSl7Yj1iLmRpdmlkZShyb3VnaExPQihiKSl9aWYoYS5ncmVhdGVyKGIpKXt0PWI7Yj1hO2E9dH1iPWIuc3VidHJhY3QoYSl9d2hpbGUoIWIuaXNaZXJvKCkpO3JldHVybiBjLmlzVW5pdCgpP2E6YS5tdWx0aXBseShjKX1mdW5jdGlvbiBsY20oYSxiKXthPXBhcnNlVmFsdWUoYSkuYWJzKCk7Yj1wYXJzZVZhbHVlKGIpLmFicygpO3JldHVybiBhLmRpdmlkZShnY2QoYSxiKSkubXVsdGlwbHkoYil9ZnVuY3Rpb24gcmFuZEJldHdlZW4oYSxiKXthPXBhcnNlVmFsdWUoYSk7Yj1wYXJzZVZhbHVlKGIpO3ZhciBsb3c9bWluKGEsYiksaGlnaD1tYXgoYSxiKTt2YXIgcmFuZ2U9aGlnaC5zdWJ0cmFjdChsb3cpLmFkZCgxKTtpZihyYW5nZS5pc1NtYWxsKXJldHVybiBsb3cuYWRkKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpyYW5nZSkpO3ZhciBkaWdpdHM9dG9CYXNlKHJhbmdlLEJBU0UpLnZhbHVlO3ZhciByZXN1bHQ9W10scmVzdHJpY3RlZD10cnVlO2Zvcih2YXIgaT0wO2k8ZGlnaXRzLmxlbmd0aDtpKyspe3ZhciB0b3A9cmVzdHJpY3RlZD9kaWdpdHNbaV06QkFTRTt2YXIgZGlnaXQ9dHJ1bmNhdGUoTWF0aC5yYW5kb20oKSp0b3ApO3Jlc3VsdC5wdXNoKGRpZ2l0KTtpZihkaWdpdDx0b3ApcmVzdHJpY3RlZD1mYWxzZX1yZXR1cm4gbG93LmFkZChJbnRlZ2VyLmZyb21BcnJheShyZXN1bHQsQkFTRSxmYWxzZSkpfXZhciBwYXJzZUJhc2U9ZnVuY3Rpb24odGV4dCxiYXNlLGFscGhhYmV0LGNhc2VTZW5zaXRpdmUpe2FscGhhYmV0PWFscGhhYmV0fHxERUZBVUxUX0FMUEhBQkVUO3RleHQ9U3RyaW5nKHRleHQpO2lmKCFjYXNlU2Vuc2l0aXZlKXt0ZXh0PXRleHQudG9Mb3dlckNhc2UoKTthbHBoYWJldD1hbHBoYWJldC50b0xvd2VyQ2FzZSgpfXZhciBsZW5ndGg9dGV4dC5sZW5ndGg7dmFyIGk7dmFyIGFic0Jhc2U9TWF0aC5hYnMoYmFzZSk7dmFyIGFscGhhYmV0VmFsdWVzPXt9O2ZvcihpPTA7aTxhbHBoYWJldC5sZW5ndGg7aSsrKXthbHBoYWJldFZhbHVlc1thbHBoYWJldFtpXV09aX1mb3IoaT0wO2k8bGVuZ3RoO2krKyl7dmFyIGM9dGV4dFtpXTtpZihjPT09XCItXCIpY29udGludWU7aWYoYyBpbiBhbHBoYWJldFZhbHVlcyl7aWYoYWxwaGFiZXRWYWx1ZXNbY10+PWFic0Jhc2Upe2lmKGM9PT1cIjFcIiYmYWJzQmFzZT09PTEpY29udGludWU7dGhyb3cgbmV3IEVycm9yKGMrXCIgaXMgbm90IGEgdmFsaWQgZGlnaXQgaW4gYmFzZSBcIitiYXNlK1wiLlwiKX19fWJhc2U9cGFyc2VWYWx1ZShiYXNlKTt2YXIgZGlnaXRzPVtdO3ZhciBpc05lZ2F0aXZlPXRleHRbMF09PT1cIi1cIjtmb3IoaT1pc05lZ2F0aXZlPzE6MDtpPHRleHQubGVuZ3RoO2krKyl7dmFyIGM9dGV4dFtpXTtpZihjIGluIGFscGhhYmV0VmFsdWVzKWRpZ2l0cy5wdXNoKHBhcnNlVmFsdWUoYWxwaGFiZXRWYWx1ZXNbY10pKTtlbHNlIGlmKGM9PT1cIjxcIil7dmFyIHN0YXJ0PWk7ZG97aSsrfXdoaWxlKHRleHRbaV0hPT1cIj5cIiYmaTx0ZXh0Lmxlbmd0aCk7ZGlnaXRzLnB1c2gocGFyc2VWYWx1ZSh0ZXh0LnNsaWNlKHN0YXJ0KzEsaSkpKX1lbHNlIHRocm93IG5ldyBFcnJvcihjK1wiIGlzIG5vdCBhIHZhbGlkIGNoYXJhY3RlclwiKX1yZXR1cm4gcGFyc2VCYXNlRnJvbUFycmF5KGRpZ2l0cyxiYXNlLGlzTmVnYXRpdmUpfTtmdW5jdGlvbiBwYXJzZUJhc2VGcm9tQXJyYXkoZGlnaXRzLGJhc2UsaXNOZWdhdGl2ZSl7dmFyIHZhbD1JbnRlZ2VyWzBdLHBvdz1JbnRlZ2VyWzFdLGk7Zm9yKGk9ZGlnaXRzLmxlbmd0aC0xO2k+PTA7aS0tKXt2YWw9dmFsLmFkZChkaWdpdHNbaV0udGltZXMocG93KSk7cG93PXBvdy50aW1lcyhiYXNlKX1yZXR1cm4gaXNOZWdhdGl2ZT92YWwubmVnYXRlKCk6dmFsfWZ1bmN0aW9uIHN0cmluZ2lmeShkaWdpdCxhbHBoYWJldCl7YWxwaGFiZXQ9YWxwaGFiZXR8fERFRkFVTFRfQUxQSEFCRVQ7aWYoZGlnaXQ8YWxwaGFiZXQubGVuZ3RoKXtyZXR1cm4gYWxwaGFiZXRbZGlnaXRdfXJldHVyblwiPFwiK2RpZ2l0K1wiPlwifWZ1bmN0aW9uIHRvQmFzZShuLGJhc2Upe2Jhc2U9YmlnSW50KGJhc2UpO2lmKGJhc2UuaXNaZXJvKCkpe2lmKG4uaXNaZXJvKCkpcmV0dXJue3ZhbHVlOlswXSxpc05lZ2F0aXZlOmZhbHNlfTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY29udmVydCBub256ZXJvIG51bWJlcnMgdG8gYmFzZSAwLlwiKX1pZihiYXNlLmVxdWFscygtMSkpe2lmKG4uaXNaZXJvKCkpcmV0dXJue3ZhbHVlOlswXSxpc05lZ2F0aXZlOmZhbHNlfTtpZihuLmlzTmVnYXRpdmUoKSlyZXR1cm57dmFsdWU6W10uY29uY2F0LmFwcGx5KFtdLEFycmF5LmFwcGx5KG51bGwsQXJyYXkoLW4udG9KU051bWJlcigpKSkubWFwKEFycmF5LnByb3RvdHlwZS52YWx1ZU9mLFsxLDBdKSksaXNOZWdhdGl2ZTpmYWxzZX07dmFyIGFycj1BcnJheS5hcHBseShudWxsLEFycmF5KG4udG9KU051bWJlcigpLTEpKS5tYXAoQXJyYXkucHJvdG90eXBlLnZhbHVlT2YsWzAsMV0pO2Fyci51bnNoaWZ0KFsxXSk7cmV0dXJue3ZhbHVlOltdLmNvbmNhdC5hcHBseShbXSxhcnIpLGlzTmVnYXRpdmU6ZmFsc2V9fXZhciBuZWc9ZmFsc2U7aWYobi5pc05lZ2F0aXZlKCkmJmJhc2UuaXNQb3NpdGl2ZSgpKXtuZWc9dHJ1ZTtuPW4uYWJzKCl9aWYoYmFzZS5pc1VuaXQoKSl7aWYobi5pc1plcm8oKSlyZXR1cm57dmFsdWU6WzBdLGlzTmVnYXRpdmU6ZmFsc2V9O3JldHVybnt2YWx1ZTpBcnJheS5hcHBseShudWxsLEFycmF5KG4udG9KU051bWJlcigpKSkubWFwKE51bWJlci5wcm90b3R5cGUudmFsdWVPZiwxKSxpc05lZ2F0aXZlOm5lZ319dmFyIG91dD1bXTt2YXIgbGVmdD1uLGRpdm1vZDt3aGlsZShsZWZ0LmlzTmVnYXRpdmUoKXx8bGVmdC5jb21wYXJlQWJzKGJhc2UpPj0wKXtkaXZtb2Q9bGVmdC5kaXZtb2QoYmFzZSk7bGVmdD1kaXZtb2QucXVvdGllbnQ7dmFyIGRpZ2l0PWRpdm1vZC5yZW1haW5kZXI7aWYoZGlnaXQuaXNOZWdhdGl2ZSgpKXtkaWdpdD1iYXNlLm1pbnVzKGRpZ2l0KS5hYnMoKTtsZWZ0PWxlZnQubmV4dCgpfW91dC5wdXNoKGRpZ2l0LnRvSlNOdW1iZXIoKSl9b3V0LnB1c2gobGVmdC50b0pTTnVtYmVyKCkpO3JldHVybnt2YWx1ZTpvdXQucmV2ZXJzZSgpLGlzTmVnYXRpdmU6bmVnfX1mdW5jdGlvbiB0b0Jhc2VTdHJpbmcobixiYXNlLGFscGhhYmV0KXt2YXIgYXJyPXRvQmFzZShuLGJhc2UpO3JldHVybihhcnIuaXNOZWdhdGl2ZT9cIi1cIjpcIlwiKSthcnIudmFsdWUubWFwKGZ1bmN0aW9uKHgpe3JldHVybiBzdHJpbmdpZnkoeCxhbHBoYWJldCl9KS5qb2luKFwiXCIpfUJpZ0ludGVnZXIucHJvdG90eXBlLnRvQXJyYXk9ZnVuY3Rpb24ocmFkaXgpe3JldHVybiB0b0Jhc2UodGhpcyxyYWRpeCl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUudG9BcnJheT1mdW5jdGlvbihyYWRpeCl7cmV0dXJuIHRvQmFzZSh0aGlzLHJhZGl4KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50b0FycmF5PWZ1bmN0aW9uKHJhZGl4KXtyZXR1cm4gdG9CYXNlKHRoaXMscmFkaXgpfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbihyYWRpeCxhbHBoYWJldCl7aWYocmFkaXg9PT11bmRlZmluZWQpcmFkaXg9MTA7aWYocmFkaXghPT0xMClyZXR1cm4gdG9CYXNlU3RyaW5nKHRoaXMscmFkaXgsYWxwaGFiZXQpO3ZhciB2PXRoaXMudmFsdWUsbD12Lmxlbmd0aCxzdHI9U3RyaW5nKHZbLS1sXSksemVyb3M9XCIwMDAwMDAwXCIsZGlnaXQ7d2hpbGUoLS1sPj0wKXtkaWdpdD1TdHJpbmcodltsXSk7c3RyKz16ZXJvcy5zbGljZShkaWdpdC5sZW5ndGgpK2RpZ2l0fXZhciBzaWduPXRoaXMuc2lnbj9cIi1cIjpcIlwiO3JldHVybiBzaWduK3N0cn07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbihyYWRpeCxhbHBoYWJldCl7aWYocmFkaXg9PT11bmRlZmluZWQpcmFkaXg9MTA7aWYocmFkaXghPTEwKXJldHVybiB0b0Jhc2VTdHJpbmcodGhpcyxyYWRpeCxhbHBoYWJldCk7cmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50b1N0cmluZz1TbWFsbEludGVnZXIucHJvdG90eXBlLnRvU3RyaW5nO05hdGl2ZUJpZ0ludC5wcm90b3R5cGUudG9KU09OPUJpZ0ludGVnZXIucHJvdG90eXBlLnRvSlNPTj1TbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnRvU3RyaW5nKCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLnZhbHVlT2Y9ZnVuY3Rpb24oKXtyZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLDEwKX07QmlnSW50ZWdlci5wcm90b3R5cGUudG9KU051bWJlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS52YWx1ZU9mO1NtYWxsSW50ZWdlci5wcm90b3R5cGUudmFsdWVPZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNOdW1iZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS52YWx1ZU9mO05hdGl2ZUJpZ0ludC5wcm90b3R5cGUudmFsdWVPZj1OYXRpdmVCaWdJbnQucHJvdG90eXBlLnRvSlNOdW1iZXI9ZnVuY3Rpb24oKXtyZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLDEwKX07ZnVuY3Rpb24gcGFyc2VTdHJpbmdWYWx1ZSh2KXtpZihpc1ByZWNpc2UoK3YpKXt2YXIgeD0rdjtpZih4PT09dHJ1bmNhdGUoeCkpcmV0dXJuIHN1cHBvcnRzTmF0aXZlQmlnSW50P25ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHgpKTpuZXcgU21hbGxJbnRlZ2VyKHgpO3Rocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIrdil9dmFyIHNpZ249dlswXT09PVwiLVwiO2lmKHNpZ24pdj12LnNsaWNlKDEpO3ZhciBzcGxpdD12LnNwbGl0KC9lL2kpO2lmKHNwbGl0Lmxlbmd0aD4yKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIrc3BsaXQuam9pbihcImVcIikpO2lmKHNwbGl0Lmxlbmd0aD09PTIpe3ZhciBleHA9c3BsaXRbMV07aWYoZXhwWzBdPT09XCIrXCIpZXhwPWV4cC5zbGljZSgxKTtleHA9K2V4cDtpZihleHAhPT10cnVuY2F0ZShleHApfHwhaXNQcmVjaXNlKGV4cCkpdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnRlZ2VyOiBcIitleHArXCIgaXMgbm90IGEgdmFsaWQgZXhwb25lbnQuXCIpO3ZhciB0ZXh0PXNwbGl0WzBdO3ZhciBkZWNpbWFsUGxhY2U9dGV4dC5pbmRleE9mKFwiLlwiKTtpZihkZWNpbWFsUGxhY2U+PTApe2V4cC09dGV4dC5sZW5ndGgtZGVjaW1hbFBsYWNlLTE7dGV4dD10ZXh0LnNsaWNlKDAsZGVjaW1hbFBsYWNlKSt0ZXh0LnNsaWNlKGRlY2ltYWxQbGFjZSsxKX1pZihleHA8MCl0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgaW5jbHVkZSBuZWdhdGl2ZSBleHBvbmVudCBwYXJ0IGZvciBpbnRlZ2Vyc1wiKTt0ZXh0Kz1uZXcgQXJyYXkoZXhwKzEpLmpvaW4oXCIwXCIpO3Y9dGV4dH12YXIgaXNWYWxpZD0vXihbMC05XVswLTldKikkLy50ZXN0KHYpO2lmKCFpc1ZhbGlkKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIrdik7aWYoc3VwcG9ydHNOYXRpdmVCaWdJbnQpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KEJpZ0ludChzaWduP1wiLVwiK3Y6dikpfXZhciByPVtdLG1heD12Lmxlbmd0aCxsPUxPR19CQVNFLG1pbj1tYXgtbDt3aGlsZShtYXg+MCl7ci5wdXNoKCt2LnNsaWNlKG1pbixtYXgpKTttaW4tPWw7aWYobWluPDApbWluPTA7bWF4LT1sfXRyaW0ocik7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHIsc2lnbil9ZnVuY3Rpb24gcGFyc2VOdW1iZXJWYWx1ZSh2KXtpZihzdXBwb3J0c05hdGl2ZUJpZ0ludCl7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHYpKX1pZihpc1ByZWNpc2Uodikpe2lmKHYhPT10cnVuY2F0ZSh2KSl0aHJvdyBuZXcgRXJyb3IoditcIiBpcyBub3QgYW4gaW50ZWdlci5cIik7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIodil9cmV0dXJuIHBhcnNlU3RyaW5nVmFsdWUodi50b1N0cmluZygpKX1mdW5jdGlvbiBwYXJzZVZhbHVlKHYpe2lmKHR5cGVvZiB2PT09XCJudW1iZXJcIil7cmV0dXJuIHBhcnNlTnVtYmVyVmFsdWUodil9aWYodHlwZW9mIHY9PT1cInN0cmluZ1wiKXtyZXR1cm4gcGFyc2VTdHJpbmdWYWx1ZSh2KX1pZih0eXBlb2Ygdj09PVwiYmlnaW50XCIpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHYpfXJldHVybiB2fWZvcih2YXIgaT0wO2k8MWUzO2krKyl7SW50ZWdlcltpXT1wYXJzZVZhbHVlKGkpO2lmKGk+MClJbnRlZ2VyWy1pXT1wYXJzZVZhbHVlKC1pKX1JbnRlZ2VyLm9uZT1JbnRlZ2VyWzFdO0ludGVnZXIuemVybz1JbnRlZ2VyWzBdO0ludGVnZXIubWludXNPbmU9SW50ZWdlclstMV07SW50ZWdlci5tYXg9bWF4O0ludGVnZXIubWluPW1pbjtJbnRlZ2VyLmdjZD1nY2Q7SW50ZWdlci5sY209bGNtO0ludGVnZXIuaXNJbnN0YW5jZT1mdW5jdGlvbih4KXtyZXR1cm4geCBpbnN0YW5jZW9mIEJpZ0ludGVnZXJ8fHggaW5zdGFuY2VvZiBTbWFsbEludGVnZXJ8fHggaW5zdGFuY2VvZiBOYXRpdmVCaWdJbnR9O0ludGVnZXIucmFuZEJldHdlZW49cmFuZEJldHdlZW47SW50ZWdlci5mcm9tQXJyYXk9ZnVuY3Rpb24oZGlnaXRzLGJhc2UsaXNOZWdhdGl2ZSl7cmV0dXJuIHBhcnNlQmFzZUZyb21BcnJheShkaWdpdHMubWFwKHBhcnNlVmFsdWUpLHBhcnNlVmFsdWUoYmFzZXx8MTApLGlzTmVnYXRpdmUpfTtyZXR1cm4gSW50ZWdlcn0oKTtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmhhc093blByb3BlcnR5KFwiZXhwb3J0c1wiKSl7bW9kdWxlLmV4cG9ydHM9YmlnSW50fWlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShcImJpZy1pbnRlZ2VyXCIsW10sZnVuY3Rpb24oKXtyZXR1cm4gYmlnSW50fSl9IiwiLyoqXHJcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXHJcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxyXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXHJcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcclxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXHJcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxyXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXHJcbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xyXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxyXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXHJcbiAqXHJcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcclxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcclxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cclxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXHJcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXHJcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXHJcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcclxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcclxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXHJcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuICovXHJcbi8qKlxyXG4gKiBAbW9kdWxlIEZhY3RvcnlNYWtlclxyXG4gKiBAaWdub3JlXHJcbiAqL1xyXG5jb25zdCBGYWN0b3J5TWFrZXIgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGxldCBpbnN0YW5jZTtcclxuICAgIGNvbnN0IHNpbmdsZXRvbkNvbnRleHRzID0gW107XHJcbiAgICBjb25zdCBzaW5nbGV0b25GYWN0b3JpZXMgPSB7fTtcclxuICAgIGNvbnN0IGNsYXNzRmFjdG9yaWVzID0ge307XHJcblxyXG4gICAgZnVuY3Rpb24gZXh0ZW5kKG5hbWUsIGNoaWxkSW5zdGFuY2UsIG92ZXJyaWRlLCBjb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKCFjb250ZXh0W25hbWVdICYmIGNoaWxkSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgY29udGV4dFtuYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlOiBjaGlsZEluc3RhbmNlLFxyXG4gICAgICAgICAgICAgICAgb3ZlcnJpZGU6IG92ZXJyaWRlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoaXMgbWV0aG9kIGZyb20geW91ciBleHRlbmRlZCBvYmplY3QuICB0aGlzLmZhY3RvcnkgaXMgaW5qZWN0ZWQgaW50byB5b3VyIG9iamVjdC5cclxuICAgICAqIHRoaXMuZmFjdG9yeS5nZXRTaW5nbGV0b25JbnN0YW5jZSh0aGlzLmNvbnRleHQsICdWaWRlb01vZGVsJylcclxuICAgICAqIHdpbGwgcmV0dXJuIHRoZSB2aWRlbyBtb2RlbCBmb3IgdXNlIGluIHRoZSBleHRlbmRlZCBvYmplY3QuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBpbmplY3RlZCBpbnRvIGV4dGVuZGVkIG9iamVjdCBhcyB0aGlzLmNvbnRleHRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgLSBzdHJpbmcgbmFtZSBmb3VuZCBpbiBhbGwgZGFzaC5qcyBvYmplY3RzXHJcbiAgICAgKiB3aXRoIG5hbWUgX19kYXNoanNfZmFjdG9yeV9uYW1lIFdpbGwgYmUgYXQgdGhlIGJvdHRvbS4gV2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgb2JqZWN0J3MgbmFtZS5cclxuICAgICAqIEByZXR1cm5zIHsqfSBDb250ZXh0IGF3YXJlIGluc3RhbmNlIG9mIHNwZWNpZmllZCBzaW5nbGV0b24gbmFtZS5cclxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6RmFjdG9yeU1ha2VyXHJcbiAgICAgKiBAaW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0U2luZ2xldG9uSW5zdGFuY2UoY29udGV4dCwgY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHNpbmdsZXRvbkNvbnRleHRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IHNpbmdsZXRvbkNvbnRleHRzW2ldO1xyXG4gICAgICAgICAgICBpZiAob2JqLmNvbnRleHQgPT09IGNvbnRleHQgJiYgb2JqLm5hbWUgPT09IGNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iai5pbnN0YW5jZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGlzIG1ldGhvZCB0byBhZGQgYW4gc2luZ2xldG9uIGluc3RhbmNlIHRvIHRoZSBzeXN0ZW0uICBVc2VmdWwgZm9yIHVuaXQgdGVzdGluZyB0byBtb2NrIG9iamVjdHMgZXRjLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VcclxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6RmFjdG9yeU1ha2VyXHJcbiAgICAgKiBAaW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc2V0U2luZ2xldG9uSW5zdGFuY2UoY29udGV4dCwgY2xhc3NOYW1lLCBpbnN0YW5jZSkge1xyXG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBzaW5nbGV0b25Db250ZXh0cykge1xyXG4gICAgICAgICAgICBjb25zdCBvYmogPSBzaW5nbGV0b25Db250ZXh0c1tpXTtcclxuICAgICAgICAgICAgaWYgKG9iai5jb250ZXh0ID09PSBjb250ZXh0ICYmIG9iai5uYW1lID09PSBjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgICAgIHNpbmdsZXRvbkNvbnRleHRzW2ldLmluc3RhbmNlID0gaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgc2luZ2xldG9uQ29udGV4dHMucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWU6IGNsYXNzTmFtZSxcclxuICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcclxuICAgICAgICAgICAgaW5zdGFuY2U6IGluc3RhbmNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgIC8vIEZhY3RvcmllcyBzdG9yYWdlIE1hbmFnZW1lbnRcclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RmFjdG9yeUJ5TmFtZShuYW1lLCBmYWN0b3JpZXNBcnJheSkge1xyXG4gICAgICAgIHJldHVybiBmYWN0b3JpZXNBcnJheVtuYW1lXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVGYWN0b3J5KG5hbWUsIGZhY3RvcnksIGZhY3Rvcmllc0FycmF5KSB7XHJcbiAgICAgICAgaWYgKG5hbWUgaW4gZmFjdG9yaWVzQXJyYXkpIHtcclxuICAgICAgICAgICAgZmFjdG9yaWVzQXJyYXlbbmFtZV0gPSBmYWN0b3J5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgLy8gQ2xhc3MgRmFjdG9yaWVzIE1hbmFnZW1lbnRcclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2xhc3NGYWN0b3J5KG5hbWUsIGZhY3RvcnkpIHtcclxuICAgICAgICB1cGRhdGVGYWN0b3J5KG5hbWUsIGZhY3RvcnksIGNsYXNzRmFjdG9yaWVzKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDbGFzc0ZhY3RvcnlCeU5hbWUobmFtZSkge1xyXG4gICAgICAgIHJldHVybiBnZXRGYWN0b3J5QnlOYW1lKG5hbWUsIGNsYXNzRmFjdG9yaWVzKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDbGFzc0ZhY3RvcnkoY2xhc3NDb25zdHJ1Y3Rvcikge1xyXG4gICAgICAgIGxldCBmYWN0b3J5ID0gZ2V0RmFjdG9yeUJ5TmFtZShjbGFzc0NvbnN0cnVjdG9yLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSwgY2xhc3NGYWN0b3JpZXMpO1xyXG5cclxuICAgICAgICBpZiAoIWZhY3RvcnkpIHtcclxuICAgICAgICAgICAgZmFjdG9yeSA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlKGNsYXNzQ29uc3RydWN0b3IsIGNvbnRleHQsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNsYXNzRmFjdG9yaWVzW2NsYXNzQ29uc3RydWN0b3IuX19kYXNoanNfZmFjdG9yeV9uYW1lXSA9IGZhY3Rvcnk7IC8vIHN0b3JlIGZhY3RvcnlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XHJcbiAgICB9XHJcblxyXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgIC8vIFNpbmdsZXRvbiBGYWN0b3J5IE1BYW5nZW1lbnRcclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlU2luZ2xldG9uRmFjdG9yeShuYW1lLCBmYWN0b3J5KSB7XHJcbiAgICAgICAgdXBkYXRlRmFjdG9yeShuYW1lLCBmYWN0b3J5LCBzaW5nbGV0b25GYWN0b3JpZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNpbmdsZXRvbkZhY3RvcnlCeU5hbWUobmFtZSkge1xyXG4gICAgICAgIHJldHVybiBnZXRGYWN0b3J5QnlOYW1lKG5hbWUsIHNpbmdsZXRvbkZhY3Rvcmllcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U2luZ2xldG9uRmFjdG9yeShjbGFzc0NvbnN0cnVjdG9yKSB7XHJcbiAgICAgICAgbGV0IGZhY3RvcnkgPSBnZXRGYWN0b3J5QnlOYW1lKGNsYXNzQ29uc3RydWN0b3IuX19kYXNoanNfZmFjdG9yeV9uYW1lLCBzaW5nbGV0b25GYWN0b3JpZXMpO1xyXG4gICAgICAgIGlmICghZmFjdG9yeSkge1xyXG4gICAgICAgICAgICBmYWN0b3J5ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0ID0ge307XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGdldEluc3RhbmNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYW4gaW5zdGFuY2UgeWV0IGNoZWNrIGZvciBvbmUgb24gdGhlIGNvbnRleHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBnZXRTaW5nbGV0b25JbnN0YW5jZShjb250ZXh0LCBjbGFzc0NvbnN0cnVjdG9yLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyBpbnN0YW5jZSBvbiB0aGUgY29udGV4dCB0aGVuIGNyZWF0ZSBvbmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBtZXJnZShjbGFzc0NvbnN0cnVjdG9yLCBjb250ZXh0LCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2luZ2xldG9uQ29udGV4dHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2xhc3NDb25zdHJ1Y3Rvci5fX2Rhc2hqc19mYWN0b3J5X25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBzaW5nbGV0b25GYWN0b3JpZXNbY2xhc3NDb25zdHJ1Y3Rvci5fX2Rhc2hqc19mYWN0b3J5X25hbWVdID0gZmFjdG9yeTsgLy8gc3RvcmUgZmFjdG9yeVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWVyZ2UoY2xhc3NDb25zdHJ1Y3RvciwgY29udGV4dCwgYXJncykge1xyXG5cclxuICAgICAgICBsZXQgY2xhc3NJbnN0YW5jZTtcclxuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc0NvbnN0cnVjdG9yLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZTtcclxuICAgICAgICBjb25zdCBleHRlbnNpb25PYmplY3QgPSBjb250ZXh0W2NsYXNzTmFtZV07XHJcblxyXG4gICAgICAgIGlmIChleHRlbnNpb25PYmplY3QpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBleHRlbnNpb24gPSBleHRlbnNpb25PYmplY3QuaW5zdGFuY2U7XHJcblxyXG4gICAgICAgICAgICBpZiAoZXh0ZW5zaW9uT2JqZWN0Lm92ZXJyaWRlKSB7IC8vT3ZlcnJpZGUgcHVibGljIG1ldGhvZHMgaW4gcGFyZW50IGJ1dCBrZWVwIHBhcmVudC5cclxuXHJcbiAgICAgICAgICAgICAgICBjbGFzc0luc3RhbmNlID0gY2xhc3NDb25zdHJ1Y3Rvci5hcHBseSh7Y29udGV4dH0sIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLmFwcGx5KHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhY3Rvcnk6IGluc3RhbmNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY2xhc3NJbnN0YW5jZVxyXG4gICAgICAgICAgICAgICAgfSwgYXJncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwcm9wIGluIGV4dGVuc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjbGFzc0luc3RhbmNlLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzSW5zdGFuY2VbcHJvcF0gPSBleHRlbnNpb25bcHJvcF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHsgLy9yZXBsYWNlIHBhcmVudCBvYmplY3QgY29tcGxldGVseSB3aXRoIG5ldyBvYmplY3QuIFNhbWUgYXMgZGlqb24uXHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVuc2lvbi5hcHBseSh7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBmYWN0b3J5OiBpbnN0YW5jZVxyXG4gICAgICAgICAgICAgICAgfSwgYXJncyk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gQ3JlYXRlIG5ldyBpbnN0YW5jZSBvZiB0aGUgY2xhc3NcclxuICAgICAgICAgICAgY2xhc3NJbnN0YW5jZSA9IGNsYXNzQ29uc3RydWN0b3IuYXBwbHkoe2NvbnRleHR9LCBhcmdzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFkZCBnZXRDbGFzc05hbWUgZnVuY3Rpb24gdG8gY2xhc3MgaW5zdGFuY2UgcHJvdG90eXBlICh1c2VkIGJ5IERlYnVnKVxyXG4gICAgICAgIGNsYXNzSW5zdGFuY2UuZ2V0Q2xhc3NOYW1lID0gZnVuY3Rpb24gKCkge3JldHVybiBjbGFzc05hbWU7fTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNsYXNzSW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgaW5zdGFuY2UgPSB7XHJcbiAgICAgICAgZXh0ZW5kOiBleHRlbmQsXHJcbiAgICAgICAgZ2V0U2luZ2xldG9uSW5zdGFuY2U6IGdldFNpbmdsZXRvbkluc3RhbmNlLFxyXG4gICAgICAgIHNldFNpbmdsZXRvbkluc3RhbmNlOiBzZXRTaW5nbGV0b25JbnN0YW5jZSxcclxuICAgICAgICBnZXRTaW5nbGV0b25GYWN0b3J5OiBnZXRTaW5nbGV0b25GYWN0b3J5LFxyXG4gICAgICAgIGdldFNpbmdsZXRvbkZhY3RvcnlCeU5hbWU6IGdldFNpbmdsZXRvbkZhY3RvcnlCeU5hbWUsXHJcbiAgICAgICAgdXBkYXRlU2luZ2xldG9uRmFjdG9yeTogdXBkYXRlU2luZ2xldG9uRmFjdG9yeSxcclxuICAgICAgICBnZXRDbGFzc0ZhY3Rvcnk6IGdldENsYXNzRmFjdG9yeSxcclxuICAgICAgICBnZXRDbGFzc0ZhY3RvcnlCeU5hbWU6IGdldENsYXNzRmFjdG9yeUJ5TmFtZSxcclxuICAgICAgICB1cGRhdGVDbGFzc0ZhY3Rvcnk6IHVwZGF0ZUNsYXNzRmFjdG9yeVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gaW5zdGFuY2U7XHJcblxyXG59KCkpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRmFjdG9yeU1ha2VyO1xyXG4iLCIvKipcclxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcclxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXHJcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcclxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcclxuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxyXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXHJcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXHJcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxyXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxyXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxyXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcclxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcclxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcclxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxyXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxyXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcclxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuLyoqXHJcbiAqIEBjbGFzc1xyXG4gKiBAaWdub3JlXHJcbiAqL1xyXG5jbGFzcyBFcnJvcnNCYXNlIHtcclxuICAgIGV4dGVuZCAoZXJyb3JzLCBjb25maWcpIHtcclxuICAgICAgICBpZiAoIWVycm9ycykgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgb3ZlcnJpZGUgPSBjb25maWcgPyBjb25maWcub3ZlcnJpZGUgOiBmYWxzZTtcclxuICAgICAgICBsZXQgcHVibGljT25seSA9IGNvbmZpZyA/IGNvbmZpZy5wdWJsaWNPbmx5IDogZmFsc2U7XHJcblxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGVyciBpbiBlcnJvcnMpIHtcclxuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaGFzT3duUHJvcGVydHkoZXJyKSB8fCAodGhpc1tlcnJdICYmICFvdmVycmlkZSkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBpZiAocHVibGljT25seSAmJiBlcnJvcnNbZXJyXS5pbmRleE9mKCdwdWJsaWNfJykgPT09IC0xKSBjb250aW51ZTtcclxuICAgICAgICAgICAgdGhpc1tlcnJdID0gZXJyb3JzW2Vycl07XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXJyb3JzQmFzZTsiLCIvKipcclxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcclxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXHJcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcclxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcclxuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxyXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXHJcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXHJcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxyXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxyXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxyXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcclxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcclxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcclxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxyXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxyXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcclxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuLyoqXHJcbiAqIEBjbGFzc1xyXG4gKiBAaWdub3JlXHJcbiAqL1xyXG5jbGFzcyBFdmVudHNCYXNlIHtcclxuICAgIGV4dGVuZCAoZXZlbnRzLCBjb25maWcpIHtcclxuICAgICAgICBpZiAoIWV2ZW50cykgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgb3ZlcnJpZGUgPSBjb25maWcgPyBjb25maWcub3ZlcnJpZGUgOiBmYWxzZTtcclxuICAgICAgICBsZXQgcHVibGljT25seSA9IGNvbmZpZyA/IGNvbmZpZy5wdWJsaWNPbmx5IDogZmFsc2U7XHJcblxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGV2dCBpbiBldmVudHMpIHtcclxuICAgICAgICAgICAgaWYgKCFldmVudHMuaGFzT3duUHJvcGVydHkoZXZ0KSB8fCAodGhpc1tldnRdICYmICFvdmVycmlkZSkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBpZiAocHVibGljT25seSAmJiBldmVudHNbZXZ0XS5pbmRleE9mKCdwdWJsaWNfJykgPT09IC0xKSBjb250aW51ZTtcclxuICAgICAgICAgICAgdGhpc1tldnRdID0gZXZlbnRzW2V2dF07XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXZlbnRzQmFzZTsiLCIvKipcclxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcclxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXHJcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcclxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcclxuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxyXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXHJcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXHJcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxyXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxyXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxyXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcclxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcclxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcclxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxyXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxyXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcclxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuXHJcbmltcG9ydCBGcmFnbWVudFJlcXVlc3QgZnJvbSAnLi4vc3RyZWFtaW5nL3ZvL0ZyYWdtZW50UmVxdWVzdCc7XHJcblxyXG5mdW5jdGlvbiBNc3NGcmFnbWVudEluZm9Db250cm9sbGVyKGNvbmZpZykge1xyXG5cclxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcclxuXHJcbiAgICBsZXQgaW5zdGFuY2UsXHJcbiAgICAgICAgbG9nZ2VyLFxyXG4gICAgICAgIGZyYWdtZW50TW9kZWwsXHJcbiAgICAgICAgc3RhcnRlZCxcclxuICAgICAgICB0eXBlLFxyXG4gICAgICAgIGxvYWRGcmFnbWVudFRpbWVvdXQsXHJcbiAgICAgICAgc3RhcnRUaW1lLFxyXG4gICAgICAgIHN0YXJ0RnJhZ21lbnRUaW1lLFxyXG4gICAgICAgIGluZGV4O1xyXG5cclxuICAgIGNvbnN0IHN0cmVhbVByb2Nlc3NvciA9IGNvbmZpZy5zdHJlYW1Qcm9jZXNzb3I7XHJcbiAgICBjb25zdCBiYXNlVVJMQ29udHJvbGxlciA9IGNvbmZpZy5iYXNlVVJMQ29udHJvbGxlcjtcclxuICAgIGNvbnN0IGRlYnVnID0gY29uZmlnLmRlYnVnO1xyXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSAnTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlcic7XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAgICAgICAgbG9nZ2VyID0gZGVidWcuZ2V0TG9nZ2VyKGluc3RhbmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIHR5cGUgPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0VHlwZSgpO1xyXG4gICAgICAgIGZyYWdtZW50TW9kZWwgPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0RnJhZ21lbnRNb2RlbCgpO1xyXG5cclxuICAgICAgICBzdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgc3RhcnRUaW1lID0gbnVsbDtcclxuICAgICAgICBzdGFydEZyYWdtZW50VGltZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdTdGFydCcpO1xyXG5cclxuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIGxvYWROZXh0RnJhZ21lbnRJbmZvKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcclxuICAgICAgICBpZiAoIXN0YXJ0ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdTdG9wJyk7XHJcblxyXG4gICAgICAgIGNsZWFyVGltZW91dChsb2FkRnJhZ21lbnRUaW1lb3V0KTtcclxuICAgICAgICBzdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgc3RhcnRUaW1lID0gbnVsbDtcclxuICAgICAgICBzdGFydEZyYWdtZW50VGltZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgICAgICAgc3RvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvYWROZXh0RnJhZ21lbnRJbmZvKCkge1xyXG4gICAgICAgIGlmICghc3RhcnRlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBHZXQgbGFzdCBzZWdtZW50IGZyb20gU2VnbWVudFRpbWVsaW5lXHJcbiAgICAgICAgY29uc3QgcmVwcmVzZW50YXRpb24gPSBnZXRDdXJyZW50UmVwcmVzZW50YXRpb24oKTtcclxuICAgICAgICBjb25zdCBtYW5pZmVzdCA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLm1wZC5tYW5pZmVzdDtcclxuICAgICAgICBjb25zdCBhZGFwdGF0aW9uID0gbWFuaWZlc3QuUGVyaW9kX2FzQXJyYXlbcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QuaW5kZXhdLkFkYXB0YXRpb25TZXRfYXNBcnJheVtyZXByZXNlbnRhdGlvbi5hZGFwdGF0aW9uLmluZGV4XTtcclxuICAgICAgICBjb25zdCBzZWdtZW50cyA9IGFkYXB0YXRpb24uU2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5TX2FzQXJyYXk7XHJcbiAgICAgICAgY29uc3Qgc2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICAvLyBsb2dnZXIuZGVidWcoJ0xhc3QgZnJhZ21lbnQgdGltZTogJyArIChzZWdtZW50LnQgLyBhZGFwdGF0aW9uLlNlZ21lbnRUZW1wbGF0ZS50aW1lc2NhbGUpKTtcclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgc2VnbWVudCByZXF1ZXN0XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IGdldFJlcXVlc3RGb3JTZWdtZW50KGFkYXB0YXRpb24sIHJlcHJlc2VudGF0aW9uLCBzZWdtZW50KTtcclxuXHJcbiAgICAgICAgLy8gU2VuZCBzZWdtZW50IHJlcXVlc3RcclxuICAgICAgICByZXF1ZXN0RnJhZ21lbnQuY2FsbCh0aGlzLCByZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRSZXF1ZXN0Rm9yU2VnbWVudChhZGFwdGF0aW9uLCByZXByZXNlbnRhdGlvbiwgc2VnbWVudCkge1xyXG4gICAgICAgIGxldCB0aW1lc2NhbGUgPSBhZGFwdGF0aW9uLlNlZ21lbnRUZW1wbGF0ZS50aW1lc2NhbGU7XHJcbiAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgRnJhZ21lbnRSZXF1ZXN0KCk7XHJcblxyXG4gICAgICAgIHJlcXVlc3QubWVkaWFUeXBlID0gdHlwZTtcclxuICAgICAgICByZXF1ZXN0LnR5cGUgPSAnRnJhZ21lbnRJbmZvU2VnbWVudCc7XHJcbiAgICAgICAgLy8gcmVxdWVzdC5yYW5nZSA9IHNlZ21lbnQubWVkaWFSYW5nZTtcclxuICAgICAgICByZXF1ZXN0LnN0YXJ0VGltZSA9IHNlZ21lbnQudCAvIHRpbWVzY2FsZTtcclxuICAgICAgICByZXF1ZXN0LmR1cmF0aW9uID0gc2VnbWVudC5kIC8gdGltZXNjYWxlO1xyXG4gICAgICAgIHJlcXVlc3QudGltZXNjYWxlID0gdGltZXNjYWxlO1xyXG4gICAgICAgIC8vIHJlcXVlc3QuYXZhaWxhYmlsaXR5U3RhcnRUaW1lID0gc2VnbWVudC5hdmFpbGFiaWxpdHlTdGFydFRpbWU7XHJcbiAgICAgICAgLy8gcmVxdWVzdC5hdmFpbGFiaWxpdHlFbmRUaW1lID0gc2VnbWVudC5hdmFpbGFiaWxpdHlFbmRUaW1lO1xyXG4gICAgICAgIC8vIHJlcXVlc3Qud2FsbFN0YXJ0VGltZSA9IHNlZ21lbnQud2FsbFN0YXJ0VGltZTtcclxuICAgICAgICByZXF1ZXN0LnF1YWxpdHkgPSByZXByZXNlbnRhdGlvbi5pbmRleDtcclxuICAgICAgICByZXF1ZXN0LmluZGV4ID0gaW5kZXgrKztcclxuICAgICAgICByZXF1ZXN0Lm1lZGlhSW5mbyA9IHN0cmVhbVByb2Nlc3Nvci5nZXRNZWRpYUluZm8oKTtcclxuICAgICAgICByZXF1ZXN0LmFkYXB0YXRpb25JbmRleCA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24uaW5kZXg7XHJcbiAgICAgICAgcmVxdWVzdC5yZXByZXNlbnRhdGlvbklkID0gcmVwcmVzZW50YXRpb24uaWQ7XHJcbiAgICAgICAgcmVxdWVzdC51cmwgPSBiYXNlVVJMQ29udHJvbGxlci5yZXNvbHZlKHJlcHJlc2VudGF0aW9uLnBhdGgpLnVybCArIGFkYXB0YXRpb24uU2VnbWVudFRlbXBsYXRlLm1lZGlhO1xyXG4gICAgICAgIHJlcXVlc3QudXJsID0gcmVxdWVzdC51cmwucmVwbGFjZSgnJEJhbmR3aWR0aCQnLCByZXByZXNlbnRhdGlvbi5iYW5kd2lkdGgpO1xyXG4gICAgICAgIHJlcXVlc3QudXJsID0gcmVxdWVzdC51cmwucmVwbGFjZSgnJFRpbWUkJywgc2VnbWVudC50TWFuaWZlc3QgPyBzZWdtZW50LnRNYW5pZmVzdCA6IHNlZ21lbnQudCk7XHJcbiAgICAgICAgcmVxdWVzdC51cmwgPSByZXF1ZXN0LnVybC5yZXBsYWNlKCcvRnJhZ21lbnRzKCcsICcvRnJhZ21lbnRJbmZvKCcpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50UmVwcmVzZW50YXRpb24oKSB7XHJcbiAgICAgICAgY29uc3QgcmVwcmVzZW50YXRpb25Db250cm9sbGVyID0gc3RyZWFtUHJvY2Vzc29yLmdldFJlcHJlc2VudGF0aW9uQ29udHJvbGxlcigpO1xyXG4gICAgICAgIGNvbnN0IHJlcHJlc2VudGF0aW9uID0gcmVwcmVzZW50YXRpb25Db250cm9sbGVyLmdldEN1cnJlbnRSZXByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIHJldHVybiByZXByZXNlbnRhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXF1ZXN0RnJhZ21lbnQocmVxdWVzdCkge1xyXG4gICAgICAgIC8vIGxvZ2dlci5kZWJ1ZygnTG9hZCBGcmFnbWVudEluZm8gZm9yIHRpbWU6ICcgKyByZXF1ZXN0LnN0YXJ0VGltZSk7XHJcbiAgICAgICAgaWYgKHN0cmVhbVByb2Nlc3Nvci5nZXRGcmFnbWVudE1vZGVsKCkuaXNGcmFnbWVudExvYWRlZE9yUGVuZGluZyhyZXF1ZXN0KSkge1xyXG4gICAgICAgICAgICAvLyBXZSBtYXkgaGF2ZSByZWFjaGVkIGVuZCBvZiB0aW1lbGluZSBpbiBjYXNlIG9mIHN0YXJ0LW92ZXIgc3RyZWFtc1xyXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0VuZCBvZiB0aW1lbGluZScpO1xyXG4gICAgICAgICAgICBzdG9wKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWdtZW50TW9kZWwuZXhlY3V0ZVJlcXVlc3QocmVxdWVzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZnJhZ21lbnRJbmZvTG9hZGVkIChlKSB7XHJcbiAgICAgICAgaWYgKCFzdGFydGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBlLnJlcXVlc3Q7XHJcbiAgICAgICAgaWYgKCFlLnJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignTG9hZCBlcnJvcicsIHJlcXVlc3QudXJsKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRlbHRhRnJhZ21lbnRUaW1lLFxyXG4gICAgICAgICAgICBkZWx0YVRpbWUsXHJcbiAgICAgICAgICAgIGRlbGF5O1xyXG5cclxuICAgICAgICAvLyBsb2dnZXIuZGVidWcoJ0ZyYWdtZW50SW5mbyBsb2FkZWQ6ICcsIHJlcXVlc3QudXJsKTtcclxuXHJcbiAgICAgICAgaWYgKCFzdGFydEZyYWdtZW50VGltZSkge1xyXG4gICAgICAgICAgICBzdGFydEZyYWdtZW50VGltZSA9IHJlcXVlc3Quc3RhcnRUaW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGRlbGF5IGJlZm9yZSByZXF1ZXN0aW5nIG5leHQgRnJhZ21lbnRJbmZvXHJcbiAgICAgICAgZGVsdGFUaW1lID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XHJcbiAgICAgICAgZGVsdGFGcmFnbWVudFRpbWUgPSAocmVxdWVzdC5zdGFydFRpbWUgKyByZXF1ZXN0LmR1cmF0aW9uKSAtIHN0YXJ0RnJhZ21lbnRUaW1lO1xyXG4gICAgICAgIGRlbGF5ID0gTWF0aC5tYXgoMCwgKGRlbHRhRnJhZ21lbnRUaW1lIC0gZGVsdGFUaW1lKSk7XHJcblxyXG4gICAgICAgIC8vIFNldCB0aW1lb3V0IGZvciByZXF1ZXN0aW5nIG5leHQgRnJhZ21lbnRJbmZvXHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KGxvYWRGcmFnbWVudFRpbWVvdXQpO1xyXG4gICAgICAgIGxvYWRGcmFnbWVudFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbG9hZEZyYWdtZW50VGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgIGxvYWROZXh0RnJhZ21lbnRJbmZvKCk7XHJcbiAgICAgICAgfSwgZGVsYXkgKiAxMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiB0eXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGluc3RhbmNlID0ge1xyXG4gICAgICAgIGluaXRpYWxpemU6IGluaXRpYWxpemUsXHJcbiAgICAgICAgY29udHJvbGxlclR5cGU6IGNvbnRyb2xsZXJUeXBlLFxyXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICBmcmFnbWVudEluZm9Mb2FkZWQ6IGZyYWdtZW50SW5mb0xvYWRlZCxcclxuICAgICAgICBnZXRUeXBlOiBnZXRUeXBlLFxyXG4gICAgICAgIHJlc2V0OiByZXNldFxyXG4gICAgfTtcclxuXHJcbiAgICBzZXR1cCgpO1xyXG5cclxuICAgIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG5cclxuTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlci5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlcic7XHJcbmV4cG9ydCBkZWZhdWx0IGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0Q2xhc3NGYWN0b3J5KE1zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXIpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cclxuIiwiLyoqXHJcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXHJcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxyXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXHJcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcclxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXHJcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxyXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXHJcbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xyXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxyXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXHJcbiAqXHJcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcclxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcclxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cclxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXHJcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXHJcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXHJcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcclxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcclxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXHJcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuICovXHJcbmltcG9ydCBEYXNoSlNFcnJvciBmcm9tICcuLi9zdHJlYW1pbmcvdm8vRGFzaEpTRXJyb3InO1xyXG5pbXBvcnQgTXNzRXJyb3JzIGZyb20gJy4vZXJyb3JzL01zc0Vycm9ycyc7XHJcblxyXG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uL3N0cmVhbWluZy9NZWRpYVBsYXllckV2ZW50cyc7XHJcblxyXG4vKipcclxuICogQG1vZHVsZSBNc3NGcmFnbWVudE1vb2ZQcm9jZXNzb3JcclxuICogQGlnbm9yZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIG9iamVjdFxyXG4gKi9cclxuZnVuY3Rpb24gTXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yKGNvbmZpZykge1xyXG5cclxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcclxuICAgIGxldCBpbnN0YW5jZSxcclxuICAgICAgICB0eXBlLFxyXG4gICAgICAgIGxvZ2dlcjtcclxuICAgIGNvbnN0IGRhc2hNZXRyaWNzID0gY29uZmlnLmRhc2hNZXRyaWNzO1xyXG4gICAgY29uc3QgcGxheWJhY2tDb250cm9sbGVyID0gY29uZmlnLnBsYXliYWNrQ29udHJvbGxlcjtcclxuICAgIGNvbnN0IGVycm9ySGFuZGxlciA9IGNvbmZpZy5lcnJIYW5kbGVyO1xyXG4gICAgY29uc3QgZXZlbnRCdXMgPSBjb25maWcuZXZlbnRCdXM7XHJcbiAgICBjb25zdCBJU09Cb3hlciA9IGNvbmZpZy5JU09Cb3hlcjtcclxuICAgIGNvbnN0IGRlYnVnID0gY29uZmlnLmRlYnVnO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNldHVwKCkge1xyXG4gICAgICAgIGxvZ2dlciA9IGRlYnVnLmdldExvZ2dlcihpbnN0YW5jZSk7XHJcbiAgICAgICAgdHlwZSA9ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHByb2Nlc3NUZnJmKHJlcXVlc3QsIHRmcmYsIHRmZHQsIHN0cmVhbVByb2Nlc3Nvcikge1xyXG4gICAgICAgIGNvbnN0IHJlcHJlc2VudGF0aW9uQ29udHJvbGxlciA9IHN0cmVhbVByb2Nlc3Nvci5nZXRSZXByZXNlbnRhdGlvbkNvbnRyb2xsZXIoKTtcclxuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbiA9IHJlcHJlc2VudGF0aW9uQ29udHJvbGxlci5nZXRDdXJyZW50UmVwcmVzZW50YXRpb24oKTtcclxuXHJcbiAgICAgICAgY29uc3QgbWFuaWZlc3QgPSByZXByZXNlbnRhdGlvbi5hZGFwdGF0aW9uLnBlcmlvZC5tcGQubWFuaWZlc3Q7XHJcbiAgICAgICAgY29uc3QgYWRhcHRhdGlvbiA9IG1hbmlmZXN0LlBlcmlvZF9hc0FycmF5W3JlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmluZGV4XS5BZGFwdGF0aW9uU2V0X2FzQXJyYXlbcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5pbmRleF07XHJcbiAgICAgICAgY29uc3QgdGltZXNjYWxlID0gYWRhcHRhdGlvbi5TZWdtZW50VGVtcGxhdGUudGltZXNjYWxlO1xyXG5cclxuICAgICAgICB0eXBlID0gc3RyZWFtUHJvY2Vzc29yLmdldFR5cGUoKTtcclxuXHJcbiAgICAgICAgLy8gUHJvY2VzcyB0ZnJmIG9ubHkgZm9yIGxpdmUgc3RyZWFtcyBvciBzdGFydC1vdmVyIHN0YXRpYyBzdHJlYW1zICh0aW1lU2hpZnRCdWZmZXJEZXB0aCA+IDApXHJcbiAgICAgICAgaWYgKG1hbmlmZXN0LnR5cGUgIT09ICdkeW5hbWljJyAmJiAhbWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0ZnJmKSB7XHJcbiAgICAgICAgICAgIGVycm9ySGFuZGxlci5lcnJvcihuZXcgRGFzaEpTRXJyb3IoTXNzRXJyb3JzLk1TU19OT19URlJGX0NPREUsIE1zc0Vycm9ycy5NU1NfTk9fVEZSRl9NRVNTQUdFKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdldCBhZGFwdGF0aW9uJ3Mgc2VnbWVudCB0aW1lbGluZSAoYWx3YXlzIGEgU2VnbWVudFRpbWVsaW5lIGluIFNtb290aCBTdHJlYW1pbmcgdXNlIGNhc2UpXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBhZGFwdGF0aW9uLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuUztcclxuICAgICAgICBjb25zdCBlbnRyaWVzID0gdGZyZi5lbnRyeTtcclxuICAgICAgICBsZXQgZW50cnksXHJcbiAgICAgICAgICAgIHNlZ21lbnRUaW1lLFxyXG4gICAgICAgICAgICByYW5nZTtcclxuICAgICAgICBsZXQgc2VnbWVudCA9IG51bGw7XHJcbiAgICAgICAgbGV0IHQgPSAwO1xyXG4gICAgICAgIGxldCBhdmFpbGFiaWxpdHlTdGFydFRpbWUgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29uc2lkZXIgb25seSBmaXJzdCB0ZnJmIGVudHJ5ICh0byBhdm9pZCBwcmUtY29uZGl0aW9uIGZhaWx1cmUgb24gZnJhZ21lbnQgaW5mbyByZXF1ZXN0cylcclxuICAgICAgICBlbnRyeSA9IGVudHJpZXNbMF07XHJcblxyXG4gICAgICAgIC8vIEluIGNhc2Ugb2Ygc3RhcnQtb3ZlciBzdHJlYW1zLCBjaGVjayBpZiB3ZSBoYXZlIHJlYWNoZWQgZW5kIG9mIG9yaWdpbmFsIG1hbmlmZXN0IGR1cmF0aW9uIChzZXQgaW4gdGltZVNoaWZ0QnVmZmVyRGVwdGgpXHJcbiAgICAgICAgLy8gPT4gdGhlbiBkbyBub3QgdXBkYXRlIGFueW1vcmUgdGltZWxpbmVcclxuICAgICAgICBpZiAobWFuaWZlc3QudHlwZSA9PT0gJ3N0YXRpYycpIHtcclxuICAgICAgICAgICAgLy8gR2V0IGZpcnN0IHNlZ21lbnQgdGltZVxyXG4gICAgICAgICAgICBzZWdtZW50VGltZSA9IHNlZ21lbnRzWzBdLnRNYW5pZmVzdCA/IHBhcnNlRmxvYXQoc2VnbWVudHNbMF0udE1hbmlmZXN0KSA6IHNlZ21lbnRzWzBdLnQ7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeS5mcmFnbWVudF9hYnNvbHV0ZV90aW1lID4gKHNlZ21lbnRUaW1lICsgKG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoICogdGltZXNjYWxlKSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbG9nZ2VyLmRlYnVnKCdlbnRyeSAtIHQgPSAnLCAoZW50cnkuZnJhZ21lbnRfYWJzb2x1dGVfdGltZSAvIHRpbWVzY2FsZSkpO1xyXG5cclxuICAgICAgICAvLyBHZXQgbGFzdCBzZWdtZW50IHRpbWVcclxuICAgICAgICBzZWdtZW50VGltZSA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdLnRNYW5pZmVzdCA/IHBhcnNlRmxvYXQoc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0udE1hbmlmZXN0KSA6IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdLnQ7XHJcbiAgICAgICAgLy8gbG9nZ2VyLmRlYnVnKCdMYXN0IHNlZ21lbnQgLSB0ID0gJywgKHNlZ21lbnRUaW1lIC8gdGltZXNjYWxlKSk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGlmIHdlIGhhdmUgdG8gYXBwZW5kIG5ldyBzZWdtZW50IHRvIHRpbWVsaW5lXHJcbiAgICAgICAgaWYgKGVudHJ5LmZyYWdtZW50X2Fic29sdXRlX3RpbWUgPD0gc2VnbWVudFRpbWUpIHtcclxuICAgICAgICAgICAgLy8gVXBkYXRlIERWUiB3aW5kb3cgcmFuZ2UgPT4gc2V0IHJhbmdlIGVuZCB0byBlbmQgdGltZSBvZiBjdXJyZW50IHNlZ21lbnRcclxuICAgICAgICAgICAgcmFuZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydDogc2VnbWVudHNbMF0udCAvIHRpbWVzY2FsZSxcclxuICAgICAgICAgICAgICAgIGVuZDogKHRmZHQuYmFzZU1lZGlhRGVjb2RlVGltZSAvIHRpbWVzY2FsZSkgKyByZXF1ZXN0LmR1cmF0aW9uXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB1cGRhdGVEVlIocmVxdWVzdC5tZWRpYVR5cGUsIHJhbmdlLCBzdHJlYW1Qcm9jZXNzb3IuZ2V0U3RyZWFtSW5mbygpLm1hbmlmZXN0SW5mbyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGxvZ2dlci5kZWJ1ZygnQWRkIG5ldyBzZWdtZW50IC0gdCA9ICcsIChlbnRyeS5mcmFnbWVudF9hYnNvbHV0ZV90aW1lIC8gdGltZXNjYWxlKSk7XHJcbiAgICAgICAgc2VnbWVudCA9IHt9O1xyXG4gICAgICAgIHNlZ21lbnQudCA9IGVudHJ5LmZyYWdtZW50X2Fic29sdXRlX3RpbWU7XHJcbiAgICAgICAgc2VnbWVudC5kID0gZW50cnkuZnJhZ21lbnRfZHVyYXRpb247XHJcbiAgICAgICAgLy8gSWYgdGltZXN0YW1wcyBzdGFydHMgYXQgMCByZWxhdGl2ZSB0byAxc3Qgc2VnbWVudCAoZHluYW1pYyB0byBzdGF0aWMpIHRoZW4gdXBkYXRlIHNlZ21lbnQgdGltZVxyXG4gICAgICAgIGlmIChzZWdtZW50c1swXS50TWFuaWZlc3QpIHtcclxuICAgICAgICAgICAgc2VnbWVudC50IC09IHBhcnNlRmxvYXQoc2VnbWVudHNbMF0udE1hbmlmZXN0KSAtIHNlZ21lbnRzWzBdLnQ7XHJcbiAgICAgICAgICAgIHNlZ21lbnQudE1hbmlmZXN0ID0gZW50cnkuZnJhZ21lbnRfYWJzb2x1dGVfdGltZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcclxuXHJcbiAgICAgICAgLy8gSW4gY2FzZSBvZiBzdGF0aWMgc3RhcnQtb3ZlciBzdHJlYW1zLCB1cGRhdGUgY29udGVudCBkdXJhdGlvblxyXG4gICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnc3RhdGljJykge1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3ZpZGVvJykge1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVuZCA9IChzZWdtZW50LnQgKyBzZWdtZW50LmQpIC8gdGltZXNjYWxlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVuZCA+IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRCdXMudHJpZ2dlcihFdmVudHMuTUFOSUZFU1RfVkFMSURJVFlfQ0hBTkdFRCwgeyBzZW5kZXI6IHRoaXMsIG5ld0R1cmF0aW9uOiBlbmQgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJbiBjYXNlIG9mIGxpdmUgc3RyZWFtcywgdXBkYXRlIHNlZ21lbnQgdGltZWxpbmUgYWNjb3JkaW5nIHRvIERWUiB3aW5kb3dcclxuICAgICAgICBlbHNlIGlmIChtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCAmJiBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA+IDApIHtcclxuICAgICAgICAgICAgLy8gR2V0IHRpbWVzdGFtcCBvZiB0aGUgbGFzdCBzZWdtZW50XHJcbiAgICAgICAgICAgIHNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgdCA9IHNlZ21lbnQudDtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0aGUgc2VnbWVudHMnIGF2YWlsYWJpbGl0eSBzdGFydCB0aW1lXHJcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eVN0YXJ0VGltZSA9IE1hdGgucm91bmQoKHQgLSAobWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggKiB0aW1lc2NhbGUpKSAvIHRpbWVzY2FsZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgc2VnbWVudHMgcHJpb3IgdG8gYXZhaWxhYmlsaXR5IHN0YXJ0IHRpbWVcclxuICAgICAgICAgICAgc2VnbWVudCA9IHNlZ21lbnRzWzBdO1xyXG4gICAgICAgICAgICB3aGlsZSAoTWF0aC5yb3VuZChzZWdtZW50LnQgLyB0aW1lc2NhbGUpIDwgYXZhaWxhYmlsaXR5U3RhcnRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBsb2dnZXIuZGVidWcoJ1JlbW92ZSBzZWdtZW50ICAtIHQgPSAnICsgKHNlZ21lbnQudCAvIHRpbWVzY2FsZSkpO1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudHMuc3BsaWNlKDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudCA9IHNlZ21lbnRzWzBdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgRFZSIHdpbmRvdyByYW5nZSA9PiBzZXQgcmFuZ2UgZW5kIHRvIGVuZCB0aW1lIG9mIGN1cnJlbnQgc2VnbWVudFxyXG4gICAgICAgICAgICByYW5nZSA9IHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBzZWdtZW50c1swXS50IC8gdGltZXNjYWxlLFxyXG4gICAgICAgICAgICAgICAgZW5kOiAodGZkdC5iYXNlTWVkaWFEZWNvZGVUaW1lIC8gdGltZXNjYWxlKSArIHJlcXVlc3QuZHVyYXRpb25cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZURWUih0eXBlLCByYW5nZSwgc3RyZWFtUHJvY2Vzc29yLmdldFN0cmVhbUluZm8oKS5tYW5pZmVzdEluZm8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVwcmVzZW50YXRpb25Db250cm9sbGVyLnVwZGF0ZVJlcHJlc2VudGF0aW9uKHJlcHJlc2VudGF0aW9uLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVEVlIodHlwZSwgcmFuZ2UsIG1hbmlmZXN0SW5mbykge1xyXG4gICAgICAgIGNvbnN0IGR2ckluZm9zID0gZGFzaE1ldHJpY3MuZ2V0Q3VycmVudERWUkluZm8odHlwZSk7XHJcbiAgICAgICAgaWYgKCFkdnJJbmZvcyB8fCAocmFuZ2UuZW5kID4gZHZySW5mb3MucmFuZ2UuZW5kKSkge1xyXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ1VwZGF0ZSBEVlIgcmFuZ2U6IFsnICsgcmFuZ2Uuc3RhcnQgKyAnIC0gJyArIHJhbmdlLmVuZCArICddJyk7XHJcbiAgICAgICAgICAgIGRhc2hNZXRyaWNzLmFkZERWUkluZm8odHlwZSwgcGxheWJhY2tDb250cm9sbGVyLmdldFRpbWUoKSwgbWFuaWZlc3RJbmZvLCByYW5nZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgb2Zmc2V0IG9mIHRoZSAxc3QgYnl0ZSBvZiBhIGNoaWxkIGJveCB3aXRoaW4gYSBjb250YWluZXIgYm94XHJcbiAgICBmdW5jdGlvbiBnZXRCb3hPZmZzZXQocGFyZW50LCB0eXBlKSB7XHJcbiAgICAgICAgbGV0IG9mZnNldCA9IDg7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFyZW50LmJveGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQuYm94ZXNbaV0udHlwZSA9PT0gdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvZmZzZXQgKz0gcGFyZW50LmJveGVzW2ldLnNpemU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29udmVydEZyYWdtZW50KGUsIHN0cmVhbVByb2Nlc3Nvcikge1xyXG4gICAgICAgIGxldCBpO1xyXG5cclxuICAgICAgICAvLyBlLnJlcXVlc3QgY29udGFpbnMgcmVxdWVzdCBkZXNjcmlwdGlvbiBvYmplY3RcclxuICAgICAgICAvLyBlLnJlc3BvbnNlIGNvbnRhaW5zIGZyYWdtZW50IGJ5dGVzXHJcbiAgICAgICAgY29uc3QgaXNvRmlsZSA9IElTT0JveGVyLnBhcnNlQnVmZmVyKGUucmVzcG9uc2UpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSB0cmFja19JZCBpbiB0ZmhkIGJveFxyXG4gICAgICAgIGNvbnN0IHRmaGQgPSBpc29GaWxlLmZldGNoKCd0ZmhkJyk7XHJcbiAgICAgICAgdGZoZC50cmFja19JRCA9IGUucmVxdWVzdC5tZWRpYUluZm8uaW5kZXggKyAxO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGZkdCBib3hcclxuICAgICAgICBsZXQgdGZkdCA9IGlzb0ZpbGUuZmV0Y2goJ3RmZHQnKTtcclxuICAgICAgICBjb25zdCB0cmFmID0gaXNvRmlsZS5mZXRjaCgndHJhZicpO1xyXG4gICAgICAgIGlmICh0ZmR0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRmZHQgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCd0ZmR0JywgdHJhZiwgdGZoZCk7XHJcbiAgICAgICAgICAgIHRmZHQudmVyc2lvbiA9IDE7XHJcbiAgICAgICAgICAgIHRmZHQuZmxhZ3MgPSAwO1xyXG4gICAgICAgICAgICB0ZmR0LmJhc2VNZWRpYURlY29kZVRpbWUgPSBNYXRoLmZsb29yKGUucmVxdWVzdC5zdGFydFRpbWUgKiBlLnJlcXVlc3QudGltZXNjYWxlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRydW4gPSBpc29GaWxlLmZldGNoKCd0cnVuJyk7XHJcblxyXG4gICAgICAgIC8vIFByb2Nlc3MgdGZ4ZCBib3hlc1xyXG4gICAgICAgIC8vIFRoaXMgYm94IHByb3ZpZGUgYWJzb2x1dGUgdGltZXN0YW1wIGJ1dCB3ZSB0YWtlIHRoZSBzZWdtZW50IHN0YXJ0IHRpbWUgZm9yIHRmZHRcclxuICAgICAgICBsZXQgdGZ4ZCA9IGlzb0ZpbGUuZmV0Y2goJ3RmeGQnKTtcclxuICAgICAgICBpZiAodGZ4ZCkge1xyXG4gICAgICAgICAgICB0ZnhkLl9wYXJlbnQuYm94ZXMuc3BsaWNlKHRmeGQuX3BhcmVudC5ib3hlcy5pbmRleE9mKHRmeGQpLCAxKTtcclxuICAgICAgICAgICAgdGZ4ZCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0ZnJmID0gaXNvRmlsZS5mZXRjaCgndGZyZicpO1xyXG4gICAgICAgIHByb2Nlc3NUZnJmKGUucmVxdWVzdCwgdGZyZiwgdGZkdCwgc3RyZWFtUHJvY2Vzc29yKTtcclxuICAgICAgICBpZiAodGZyZikge1xyXG4gICAgICAgICAgICB0ZnJmLl9wYXJlbnQuYm94ZXMuc3BsaWNlKHRmcmYuX3BhcmVudC5ib3hlcy5pbmRleE9mKHRmcmYpLCAxKTtcclxuICAgICAgICAgICAgdGZyZiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBwcm90ZWN0ZWQgY29udGVudCBpbiBQSUZGMS4xIGZvcm1hdCAoc2VwaWZmIGJveCA9IFNhbXBsZSBFbmNyeXB0aW9uIFBJRkYpXHJcbiAgICAgICAgLy8gPT4gY29udmVydCBzZXBpZmYgYm94IGl0IGludG8gYSBzZW5jIGJveFxyXG4gICAgICAgIC8vID0+IGNyZWF0ZSBzYWlvIGFuZCBzYWl6IGJveGVzIChpZiBub3QgYWxyZWFkeSBwcmVzZW50KVxyXG4gICAgICAgIGNvbnN0IHNlcGlmZiA9IGlzb0ZpbGUuZmV0Y2goJ3NlcGlmZicpO1xyXG4gICAgICAgIGlmIChzZXBpZmYgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgc2VwaWZmLnR5cGUgPSAnc2VuYyc7XHJcbiAgICAgICAgICAgIHNlcGlmZi51c2VydHlwZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBzYWlvID0gaXNvRmlsZS5mZXRjaCgnc2FpbycpO1xyXG4gICAgICAgICAgICBpZiAoc2FpbyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIFNhbXBsZSBBdXhpbGlhcnkgSW5mb3JtYXRpb24gT2Zmc2V0cyBCb3ggYm94IChzYWlvKVxyXG4gICAgICAgICAgICAgICAgc2FpbyA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3NhaW8nLCB0cmFmKTtcclxuICAgICAgICAgICAgICAgIHNhaW8udmVyc2lvbiA9IDA7XHJcbiAgICAgICAgICAgICAgICBzYWlvLmZsYWdzID0gMDtcclxuICAgICAgICAgICAgICAgIHNhaW8uZW50cnlfY291bnQgPSAxO1xyXG4gICAgICAgICAgICAgICAgc2Fpby5vZmZzZXQgPSBbMF07XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2FpeiA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3NhaXonLCB0cmFmKTtcclxuICAgICAgICAgICAgICAgIHNhaXoudmVyc2lvbiA9IDA7XHJcbiAgICAgICAgICAgICAgICBzYWl6LmZsYWdzID0gMDtcclxuICAgICAgICAgICAgICAgIHNhaXouc2FtcGxlX2NvdW50ID0gc2VwaWZmLnNhbXBsZV9jb3VudDtcclxuICAgICAgICAgICAgICAgIHNhaXouZGVmYXVsdF9zYW1wbGVfaW5mb19zaXplID0gMDtcclxuICAgICAgICAgICAgICAgIHNhaXouc2FtcGxlX2luZm9fc2l6ZSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZXBpZmYuZmxhZ3MgJiAweDAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU3ViLXNhbXBsZSBlbmNyeXB0aW9uID0+IHNldCBzYW1wbGVfaW5mb19zaXplIGZvciBlYWNoIHNhbXBsZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzZXBpZmYuc2FtcGxlX2NvdW50OyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMTAgPSA4IChJbml0aWFsaXphdGlvblZlY3RvciBmaWVsZCBzaXplKSArIDIgKHN1YnNhbXBsZV9jb3VudCBmaWVsZCBzaXplKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA2ID0gMiAoQnl0ZXNPZkNsZWFyRGF0YSBmaWVsZCBzaXplKSArIDQgKEJ5dGVzT2ZFbmNyeXB0ZWREYXRhIGZpZWxkIHNpemUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhaXouc2FtcGxlX2luZm9fc2l6ZVtpXSA9IDEwICsgKDYgKiBzZXBpZmYuZW50cnlbaV0uTnVtYmVyT2ZFbnRyaWVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIHN1Yi1zYW1wbGUgZW5jcnlwdGlvbiA9PiBzZXQgZGVmYXVsdCBzYW1wbGVfaW5mb19zaXplID0gSW5pdGlhbGl6YXRpb25WZWN0b3IgZmllbGQgc2l6ZSAoOClcclxuICAgICAgICAgICAgICAgICAgICBzYWl6LmRlZmF1bHRfc2FtcGxlX2luZm9fc2l6ZSA9IDg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRmaGQuZmxhZ3MgJj0gMHhGRkZGRkU7IC8vIHNldCB0ZmhkLmJhc2UtZGF0YS1vZmZzZXQtcHJlc2VudCB0byBmYWxzZVxyXG4gICAgICAgIHRmaGQuZmxhZ3MgfD0gMHgwMjAwMDA7IC8vIHNldCB0ZmhkLmRlZmF1bHQtYmFzZS1pcy1tb29mIHRvIHRydWVcclxuICAgICAgICB0cnVuLmZsYWdzIHw9IDB4MDAwMDAxOyAvLyBzZXQgdHJ1bi5kYXRhLW9mZnNldC1wcmVzZW50IHRvIHRydWVcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRydW4uZGF0YV9vZmZzZXQgZmllbGQgdGhhdCBjb3JyZXNwb25kcyB0byBmaXJzdCBkYXRhIGJ5dGUgKGluc2lkZSBtZGF0IGJveClcclxuICAgICAgICBjb25zdCBtb29mID0gaXNvRmlsZS5mZXRjaCgnbW9vZicpO1xyXG4gICAgICAgIGxldCBsZW5ndGggPSBtb29mLmdldExlbmd0aCgpO1xyXG4gICAgICAgIHRydW4uZGF0YV9vZmZzZXQgPSBsZW5ndGggKyA4O1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc2FpbyBib3ggb2Zmc2V0IGZpZWxkIGFjY29yZGluZyB0byBuZXcgc2VuYyBib3ggb2Zmc2V0XHJcbiAgICAgICAgbGV0IHNhaW8gPSBpc29GaWxlLmZldGNoKCdzYWlvJyk7XHJcbiAgICAgICAgaWYgKHNhaW8gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHRyYWZQb3NJbk1vb2YgPSBnZXRCb3hPZmZzZXQobW9vZiwgJ3RyYWYnKTtcclxuICAgICAgICAgICAgbGV0IHNlbmNQb3NJblRyYWYgPSBnZXRCb3hPZmZzZXQodHJhZiwgJ3NlbmMnKTtcclxuICAgICAgICAgICAgLy8gU2V0IG9mZnNldCBmcm9tIGJlZ2luIGZyYWdtZW50IHRvIHRoZSBmaXJzdCBJViBmaWVsZCBpbiBzZW5jIGJveFxyXG4gICAgICAgICAgICBzYWlvLm9mZnNldFswXSA9IHRyYWZQb3NJbk1vb2YgKyBzZW5jUG9zSW5UcmFmICsgMTY7IC8vIDE2ID0gYm94IGhlYWRlciAoMTIpICsgc2FtcGxlX2NvdW50IGZpZWxkIHNpemUgKDQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBXcml0ZSB0cmFuc2Zvcm1lZC9wcm9jZXNzZWQgZnJhZ21lbnQgaW50byByZXF1ZXN0IHJlcG9uc2UgZGF0YVxyXG4gICAgICAgIGUucmVzcG9uc2UgPSBpc29GaWxlLndyaXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlU2VnbWVudExpc3QoZSwgc3RyZWFtUHJvY2Vzc29yKSB7XHJcbiAgICAgICAgLy8gZS5yZXF1ZXN0IGNvbnRhaW5zIHJlcXVlc3QgZGVzY3JpcHRpb24gb2JqZWN0XHJcbiAgICAgICAgLy8gZS5yZXNwb25zZSBjb250YWlucyBmcmFnbWVudCBieXRlc1xyXG4gICAgICAgIGlmICghZS5yZXNwb25zZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2UucmVzcG9uc2UgcGFyYW1ldGVyIGlzIG1pc3NpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlzb0ZpbGUgPSBJU09Cb3hlci5wYXJzZUJ1ZmZlcihlLnJlc3BvbnNlKTtcclxuICAgICAgICAvLyBVcGRhdGUgdHJhY2tfSWQgaW4gdGZoZCBib3hcclxuICAgICAgICBjb25zdCB0ZmhkID0gaXNvRmlsZS5mZXRjaCgndGZoZCcpO1xyXG4gICAgICAgIHRmaGQudHJhY2tfSUQgPSBlLnJlcXVlc3QubWVkaWFJbmZvLmluZGV4ICsgMTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRmZHQgYm94XHJcbiAgICAgICAgbGV0IHRmZHQgPSBpc29GaWxlLmZldGNoKCd0ZmR0Jyk7XHJcbiAgICAgICAgbGV0IHRyYWYgPSBpc29GaWxlLmZldGNoKCd0cmFmJyk7XHJcbiAgICAgICAgaWYgKHRmZHQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGZkdCA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3RmZHQnLCB0cmFmLCB0ZmhkKTtcclxuICAgICAgICAgICAgdGZkdC52ZXJzaW9uID0gMTtcclxuICAgICAgICAgICAgdGZkdC5mbGFncyA9IDA7XHJcbiAgICAgICAgICAgIHRmZHQuYmFzZU1lZGlhRGVjb2RlVGltZSA9IE1hdGguZmxvb3IoZS5yZXF1ZXN0LnN0YXJ0VGltZSAqIGUucmVxdWVzdC50aW1lc2NhbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRmcmYgPSBpc29GaWxlLmZldGNoKCd0ZnJmJyk7XHJcbiAgICAgICAgcHJvY2Vzc1RmcmYoZS5yZXF1ZXN0LCB0ZnJmLCB0ZmR0LCBzdHJlYW1Qcm9jZXNzb3IpO1xyXG4gICAgICAgIGlmICh0ZnJmKSB7XHJcbiAgICAgICAgICAgIHRmcmYuX3BhcmVudC5ib3hlcy5zcGxpY2UodGZyZi5fcGFyZW50LmJveGVzLmluZGV4T2YodGZyZiksIDEpO1xyXG4gICAgICAgICAgICB0ZnJmID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBpbnN0YW5jZSA9IHtcclxuICAgICAgICBjb252ZXJ0RnJhZ21lbnQ6IGNvbnZlcnRGcmFnbWVudCxcclxuICAgICAgICB1cGRhdGVTZWdtZW50TGlzdDogdXBkYXRlU2VnbWVudExpc3QsXHJcbiAgICAgICAgZ2V0VHlwZTogZ2V0VHlwZVxyXG4gICAgfTtcclxuXHJcbiAgICBzZXR1cCgpO1xyXG4gICAgcmV0dXJuIGluc3RhbmNlO1xyXG59XHJcblxyXG5Nc3NGcmFnbWVudE1vb2ZQcm9jZXNzb3IuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ01zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvcic7XHJcbmV4cG9ydCBkZWZhdWx0IGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0Q2xhc3NGYWN0b3J5KE1zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvcik7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xyXG4iLCIvKipcclxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcclxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXHJcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcclxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcclxuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxyXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXHJcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXHJcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxyXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxyXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxyXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcclxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcclxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcclxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxyXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxyXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcclxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuIGltcG9ydCBNc3NFcnJvcnMgZnJvbSAnLi9lcnJvcnMvTXNzRXJyb3JzJztcclxuXHJcbi8qKlxyXG4gKiBAbW9kdWxlIE1zc0ZyYWdtZW50TW9vdlByb2Nlc3NvclxyXG4gKiBAaWdub3JlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgb2JqZWN0XHJcbiAqL1xyXG5mdW5jdGlvbiBNc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3IoY29uZmlnKSB7XHJcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XHJcbiAgICBjb25zdCBOQUxVVFlQRV9TUFMgPSA3O1xyXG4gICAgY29uc3QgTkFMVVRZUEVfUFBTID0gODtcclxuICAgIGNvbnN0IGNvbnN0YW50cyA9IGNvbmZpZy5jb25zdGFudHM7XHJcbiAgICBjb25zdCBJU09Cb3hlciA9IGNvbmZpZy5JU09Cb3hlcjtcclxuXHJcbiAgICBsZXQgcHJvdGVjdGlvbkNvbnRyb2xsZXIgPSBjb25maWcucHJvdGVjdGlvbkNvbnRyb2xsZXI7XHJcbiAgICBsZXQgaW5zdGFuY2UsXHJcbiAgICAgICAgcGVyaW9kLFxyXG4gICAgICAgIGFkYXB0YXRpb25TZXQsXHJcbiAgICAgICAgcmVwcmVzZW50YXRpb24sXHJcbiAgICAgICAgY29udGVudFByb3RlY3Rpb24sXHJcbiAgICAgICAgdGltZXNjYWxlLFxyXG4gICAgICAgIHRyYWNrSWQ7XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlRnR5cEJveChpc29GaWxlKSB7XHJcbiAgICAgICAgbGV0IGZ0eXAgPSBJU09Cb3hlci5jcmVhdGVCb3goJ2Z0eXAnLCBpc29GaWxlKTtcclxuICAgICAgICBmdHlwLm1ham9yX2JyYW5kID0gJ2lzbzYnO1xyXG4gICAgICAgIGZ0eXAubWlub3JfdmVyc2lvbiA9IDE7IC8vIGlzIGFuIGluZm9ybWF0aXZlIGludGVnZXIgZm9yIHRoZSBtaW5vciB2ZXJzaW9uIG9mIHRoZSBtYWpvciBicmFuZFxyXG4gICAgICAgIGZ0eXAuY29tcGF0aWJsZV9icmFuZHMgPSBbXTsgLy9pcyBhIGxpc3QsIHRvIHRoZSBlbmQgb2YgdGhlIGJveCwgb2YgYnJhbmRzIGlzb20sIGlzbzYgYW5kIG1zZGhcclxuICAgICAgICBmdHlwLmNvbXBhdGlibGVfYnJhbmRzWzBdID0gJ2lzb20nOyAvLyA9PiBkZWNpbWFsIEFTQ0lJIHZhbHVlIGZvciBpc29tXHJcbiAgICAgICAgZnR5cC5jb21wYXRpYmxlX2JyYW5kc1sxXSA9ICdpc282JzsgLy8gPT4gZGVjaW1hbCBBU0NJSSB2YWx1ZSBmb3IgaXNvNlxyXG4gICAgICAgIGZ0eXAuY29tcGF0aWJsZV9icmFuZHNbMl0gPSAnbXNkaCc7IC8vID0+IGRlY2ltYWwgQVNDSUkgdmFsdWUgZm9yIG1zZGhcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ0eXA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlTW9vdkJveChpc29GaWxlKSB7XHJcblxyXG4gICAgICAgIC8vIG1vb3YgYm94XHJcbiAgICAgICAgbGV0IG1vb3YgPSBJU09Cb3hlci5jcmVhdGVCb3goJ21vb3YnLCBpc29GaWxlKTtcclxuXHJcbiAgICAgICAgLy8gbW9vdi9tdmhkXHJcbiAgICAgICAgY3JlYXRlTXZoZEJveChtb292KTtcclxuXHJcbiAgICAgICAgLy8gbW9vdi90cmFrXHJcbiAgICAgICAgbGV0IHRyYWsgPSBJU09Cb3hlci5jcmVhdGVCb3goJ3RyYWsnLCBtb292KTtcclxuXHJcbiAgICAgICAgLy8gbW9vdi90cmFrL3RraGRcclxuICAgICAgICBjcmVhdGVUa2hkQm94KHRyYWspO1xyXG5cclxuICAgICAgICAvLyBtb292L3RyYWsvbWRpYVxyXG4gICAgICAgIGxldCBtZGlhID0gSVNPQm94ZXIuY3JlYXRlQm94KCdtZGlhJywgdHJhayk7XHJcblxyXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21kaGRcclxuICAgICAgICBjcmVhdGVNZGhkQm94KG1kaWEpO1xyXG5cclxuICAgICAgICAvLyBtb292L3RyYWsvbWRpYS9oZGxyXHJcbiAgICAgICAgY3JlYXRlSGRsckJveChtZGlhKTtcclxuXHJcbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZlxyXG4gICAgICAgIGxldCBtaW5mID0gSVNPQm94ZXIuY3JlYXRlQm94KCdtaW5mJywgbWRpYSk7XHJcblxyXG4gICAgICAgIHN3aXRjaCAoYWRhcHRhdGlvblNldC50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLlZJREVPOlxyXG4gICAgICAgICAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi92bWhkXHJcbiAgICAgICAgICAgICAgICBjcmVhdGVWbWhkQm94KG1pbmYpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLkFVRElPOlxyXG4gICAgICAgICAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zbWhkXHJcbiAgICAgICAgICAgICAgICBjcmVhdGVTbWhkQm94KG1pbmYpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmYvZGluZlxyXG4gICAgICAgIGxldCBkaW5mID0gSVNPQm94ZXIuY3JlYXRlQm94KCdkaW5mJywgbWluZik7XHJcblxyXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmYvZGluZi9kcmVmXHJcbiAgICAgICAgY3JlYXRlRHJlZkJveChkaW5mKTtcclxuXHJcbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsXHJcbiAgICAgICAgbGV0IHN0YmwgPSBJU09Cb3hlci5jcmVhdGVCb3goJ3N0YmwnLCBtaW5mKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGVtcHR5IHN0dHMsIHN0c2MsIHN0Y28gYW5kIHN0c3ogYm94ZXNcclxuICAgICAgICAvLyBVc2UgZGF0YSBmaWVsZCBhcyBmb3IgY29kZW0taXNvYm94ZXIgdW5rbm93biBib3hlcyBmb3Igc2V0dGluZyBmaWVsZHMgdmFsdWVcclxuXHJcbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsL3N0dHNcclxuICAgICAgICBsZXQgc3R0cyA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3N0dHMnLCBzdGJsKTtcclxuICAgICAgICBzdHRzLl9kYXRhID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdOyAvLyB2ZXJzaW9uID0gMCwgZmxhZ3MgPSAwLCBlbnRyeV9jb3VudCA9IDBcclxuXHJcbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsL3N0c2NcclxuICAgICAgICBsZXQgc3RzYyA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3N0c2MnLCBzdGJsKTtcclxuICAgICAgICBzdHNjLl9kYXRhID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdOyAvLyB2ZXJzaW9uID0gMCwgZmxhZ3MgPSAwLCBlbnRyeV9jb3VudCA9IDBcclxuXHJcbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsL3N0Y29cclxuICAgICAgICBsZXQgc3RjbyA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3N0Y28nLCBzdGJsKTtcclxuICAgICAgICBzdGNvLl9kYXRhID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdOyAvLyB2ZXJzaW9uID0gMCwgZmxhZ3MgPSAwLCBlbnRyeV9jb3VudCA9IDBcclxuXHJcbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsL3N0c3pcclxuICAgICAgICBsZXQgc3RzeiA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3N0c3onLCBzdGJsKTtcclxuICAgICAgICBzdHN6Ll9kYXRhID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdOyAvLyB2ZXJzaW9uID0gMCwgZmxhZ3MgPSAwLCBzYW1wbGVfc2l6ZSA9IDAsIHNhbXBsZV9jb3VudCA9IDBcclxuXHJcbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsL3N0c2RcclxuICAgICAgICBjcmVhdGVTdHNkQm94KHN0YmwpO1xyXG5cclxuICAgICAgICAvLyBtb292L212ZXhcclxuICAgICAgICBsZXQgbXZleCA9IElTT0JveGVyLmNyZWF0ZUJveCgnbXZleCcsIG1vb3YpO1xyXG5cclxuICAgICAgICAvLyBtb292L212ZXgvdHJleFxyXG4gICAgICAgIGNyZWF0ZVRyZXhCb3gobXZleCk7XHJcblxyXG4gICAgICAgIGlmIChjb250ZW50UHJvdGVjdGlvbiAmJiBwcm90ZWN0aW9uQ29udHJvbGxlcikge1xyXG4gICAgICAgICAgICBsZXQgc3VwcG9ydGVkS1MgPSBwcm90ZWN0aW9uQ29udHJvbGxlci5nZXRTdXBwb3J0ZWRLZXlTeXN0ZW1zRnJvbUNvbnRlbnRQcm90ZWN0aW9uKGNvbnRlbnRQcm90ZWN0aW9uKTtcclxuICAgICAgICAgICAgY3JlYXRlUHJvdGVjdGlvblN5c3RlbVNwZWNpZmljSGVhZGVyQm94KG1vb3YsIHN1cHBvcnRlZEtTKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlTXZoZEJveChtb292KSB7XHJcblxyXG4gICAgICAgIGxldCBtdmhkID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgnbXZoZCcsIG1vb3YpO1xyXG5cclxuICAgICAgICBtdmhkLnZlcnNpb24gPSAxOyAvLyB2ZXJzaW9uID0gMSAgaW4gb3JkZXIgdG8gaGF2ZSA2NGJpdHMgZHVyYXRpb24gdmFsdWVcclxuXHJcbiAgICAgICAgbXZoZC5jcmVhdGlvbl90aW1lID0gMDsgLy8gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHByZXNlbnRhdGlvbiA9PiBpZ25vcmUgKHNldCB0byAwKVxyXG4gICAgICAgIG12aGQubW9kaWZpY2F0aW9uX3RpbWUgPSAwOyAvLyB0aGUgbW9zdCByZWNlbnQgdGltZSB0aGUgcHJlc2VudGF0aW9uIHdhcyBtb2RpZmllZCA9PiBpZ25vcmUgKHNldCB0byAwKVxyXG4gICAgICAgIG12aGQudGltZXNjYWxlID0gdGltZXNjYWxlOyAvLyB0aGUgdGltZS1zY2FsZSBmb3IgdGhlIGVudGlyZSBwcmVzZW50YXRpb24gPT4gMTAwMDAwMDAgZm9yIE1TU1xyXG4gICAgICAgIG12aGQuZHVyYXRpb24gPSBwZXJpb2QuZHVyYXRpb24gPT09IEluZmluaXR5ID8gMHhGRkZGRkZGRkZGRkZGRkZGIDogTWF0aC5yb3VuZChwZXJpb2QuZHVyYXRpb24gKiB0aW1lc2NhbGUpOyAvLyB0aGUgbGVuZ3RoIG9mIHRoZSBwcmVzZW50YXRpb24gKGluIHRoZSBpbmRpY2F0ZWQgdGltZXNjYWxlKSA9PiAgdGFrZSBkdXJhdGlvbiBvZiBwZXJpb2RcclxuICAgICAgICBtdmhkLnJhdGUgPSAxLjA7IC8vIDE2LjE2IG51bWJlciwgJzEuMCcgPSBub3JtYWwgcGxheWJhY2tcclxuICAgICAgICBtdmhkLnZvbHVtZSA9IDEuMDsgLy8gOC44IG51bWJlciwgJzEuMCcgPSBmdWxsIHZvbHVtZVxyXG4gICAgICAgIG12aGQucmVzZXJ2ZWQxID0gMDtcclxuICAgICAgICBtdmhkLnJlc2VydmVkMiA9IFsweDAsIDB4MF07XHJcbiAgICAgICAgbXZoZC5tYXRyaXggPSBbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsIC8vIHByb3ZpZGVzIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4IGZvciB0aGUgdmlkZW87XHJcbiAgICAgICAgICAgIDAsIDEsIDAsIC8vICh1LHYsdykgYXJlIHJlc3RyaWN0ZWQgaGVyZSB0byAoMCwwLDEpXHJcbiAgICAgICAgICAgIDAsIDAsIDE2Mzg0XHJcbiAgICAgICAgXTtcclxuICAgICAgICBtdmhkLnByZV9kZWZpbmVkID0gWzAsIDAsIDAsIDAsIDAsIDBdO1xyXG4gICAgICAgIG12aGQubmV4dF90cmFja19JRCA9IHRyYWNrSWQgKyAxOyAvLyBpbmRpY2F0ZXMgYSB2YWx1ZSB0byB1c2UgZm9yIHRoZSB0cmFjayBJRCBvZiB0aGUgbmV4dCB0cmFjayB0byBiZSBhZGRlZCB0byB0aGlzIHByZXNlbnRhdGlvblxyXG5cclxuICAgICAgICByZXR1cm4gbXZoZDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVUa2hkQm94KHRyYWspIHtcclxuXHJcbiAgICAgICAgbGV0IHRraGQgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCd0a2hkJywgdHJhayk7XHJcblxyXG4gICAgICAgIHRraGQudmVyc2lvbiA9IDE7IC8vIHZlcnNpb24gPSAxICBpbiBvcmRlciB0byBoYXZlIDY0Yml0cyBkdXJhdGlvbiB2YWx1ZVxyXG4gICAgICAgIHRraGQuZmxhZ3MgPSAweDEgfCAvLyBUcmFja19lbmFibGVkICgweDAwMDAwMSk6IEluZGljYXRlcyB0aGF0IHRoZSB0cmFjayBpcyBlbmFibGVkXHJcbiAgICAgICAgICAgIDB4MiB8IC8vIFRyYWNrX2luX21vdmllICgweDAwMDAwMik6ICBJbmRpY2F0ZXMgdGhhdCB0aGUgdHJhY2sgaXMgdXNlZCBpbiB0aGUgcHJlc2VudGF0aW9uXHJcbiAgICAgICAgICAgIDB4NDsgLy8gVHJhY2tfaW5fcHJldmlldyAoMHgwMDAwMDQpOiAgSW5kaWNhdGVzIHRoYXQgdGhlIHRyYWNrIGlzIHVzZWQgd2hlbiBwcmV2aWV3aW5nIHRoZSBwcmVzZW50YXRpb25cclxuXHJcbiAgICAgICAgdGtoZC5jcmVhdGlvbl90aW1lID0gMDsgLy8gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHByZXNlbnRhdGlvbiA9PiBpZ25vcmUgKHNldCB0byAwKVxyXG4gICAgICAgIHRraGQubW9kaWZpY2F0aW9uX3RpbWUgPSAwOyAvLyB0aGUgbW9zdCByZWNlbnQgdGltZSB0aGUgcHJlc2VudGF0aW9uIHdhcyBtb2RpZmllZCA9PiBpZ25vcmUgKHNldCB0byAwKVxyXG4gICAgICAgIHRraGQudHJhY2tfSUQgPSB0cmFja0lkOyAvLyB1bmlxdWVseSBpZGVudGlmaWVzIHRoaXMgdHJhY2sgb3ZlciB0aGUgZW50aXJlIGxpZmUtdGltZSBvZiB0aGlzIHByZXNlbnRhdGlvblxyXG4gICAgICAgIHRraGQucmVzZXJ2ZWQxID0gMDtcclxuICAgICAgICB0a2hkLmR1cmF0aW9uID0gcGVyaW9kLmR1cmF0aW9uID09PSBJbmZpbml0eSA/IDB4RkZGRkZGRkZGRkZGRkZGRiA6IE1hdGgucm91bmQocGVyaW9kLmR1cmF0aW9uICogdGltZXNjYWxlKTsgLy8gdGhlIGR1cmF0aW9uIG9mIHRoaXMgdHJhY2sgKGluIHRoZSB0aW1lc2NhbGUgaW5kaWNhdGVkIGluIHRoZSBNb3ZpZSBIZWFkZXIgQm94KSA9PiAgdGFrZSBkdXJhdGlvbiBvZiBwZXJpb2RcclxuICAgICAgICB0a2hkLnJlc2VydmVkMiA9IFsweDAsIDB4MF07XHJcbiAgICAgICAgdGtoZC5sYXllciA9IDA7IC8vIHNwZWNpZmllcyB0aGUgZnJvbnQtdG8tYmFjayBvcmRlcmluZyBvZiB2aWRlbyB0cmFja3M7IHRyYWNrcyB3aXRoIGxvd2VyIG51bWJlcnMgYXJlIGNsb3NlciB0byB0aGUgdmlld2VyID0+IDAgc2luY2Ugb25seSBvbmUgdmlkZW8gdHJhY2tcclxuICAgICAgICB0a2hkLmFsdGVybmF0ZV9ncm91cCA9IDA7IC8vIHNwZWNpZmllcyBhIGdyb3VwIG9yIGNvbGxlY3Rpb24gb2YgdHJhY2tzID0+IGlnbm9yZVxyXG4gICAgICAgIHRraGQudm9sdW1lID0gMS4wOyAvLyAnMS4wJyA9IGZ1bGwgdm9sdW1lXHJcbiAgICAgICAgdGtoZC5yZXNlcnZlZDMgPSAwO1xyXG4gICAgICAgIHRraGQubWF0cml4ID0gW1xyXG4gICAgICAgICAgICAxLCAwLCAwLCAvLyBwcm92aWRlcyBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBmb3IgdGhlIHZpZGVvO1xyXG4gICAgICAgICAgICAwLCAxLCAwLCAvLyAodSx2LHcpIGFyZSByZXN0cmljdGVkIGhlcmUgdG8gKDAsMCwxKVxyXG4gICAgICAgICAgICAwLCAwLCAxNjM4NFxyXG4gICAgICAgIF07XHJcbiAgICAgICAgdGtoZC53aWR0aCA9IHJlcHJlc2VudGF0aW9uLndpZHRoOyAvLyB2aXN1YWwgcHJlc2VudGF0aW9uIHdpZHRoXHJcbiAgICAgICAgdGtoZC5oZWlnaHQgPSByZXByZXNlbnRhdGlvbi5oZWlnaHQ7IC8vIHZpc3VhbCBwcmVzZW50YXRpb24gaGVpZ2h0XHJcblxyXG4gICAgICAgIHJldHVybiB0a2hkO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZU1kaGRCb3gobWRpYSkge1xyXG5cclxuICAgICAgICBsZXQgbWRoZCA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ21kaGQnLCBtZGlhKTtcclxuXHJcbiAgICAgICAgbWRoZC52ZXJzaW9uID0gMTsgLy8gdmVyc2lvbiA9IDEgIGluIG9yZGVyIHRvIGhhdmUgNjRiaXRzIGR1cmF0aW9uIHZhbHVlXHJcblxyXG4gICAgICAgIG1kaGQuY3JlYXRpb25fdGltZSA9IDA7IC8vIHRoZSBjcmVhdGlvbiB0aW1lIG9mIHRoZSBwcmVzZW50YXRpb24gPT4gaWdub3JlIChzZXQgdG8gMClcclxuICAgICAgICBtZGhkLm1vZGlmaWNhdGlvbl90aW1lID0gMDsgLy8gdGhlIG1vc3QgcmVjZW50IHRpbWUgdGhlIHByZXNlbnRhdGlvbiB3YXMgbW9kaWZpZWQgPT4gaWdub3JlIChzZXQgdG8gMClcclxuICAgICAgICBtZGhkLnRpbWVzY2FsZSA9IHRpbWVzY2FsZTsgLy8gdGhlIHRpbWUtc2NhbGUgZm9yIHRoZSBlbnRpcmUgcHJlc2VudGF0aW9uXHJcbiAgICAgICAgbWRoZC5kdXJhdGlvbiA9IHBlcmlvZC5kdXJhdGlvbiA9PT0gSW5maW5pdHkgPyAweEZGRkZGRkZGRkZGRkZGRkYgOiBNYXRoLnJvdW5kKHBlcmlvZC5kdXJhdGlvbiAqIHRpbWVzY2FsZSk7IC8vIHRoZSBkdXJhdGlvbiBvZiB0aGlzIG1lZGlhIChpbiB0aGUgc2NhbGUgb2YgdGhlIHRpbWVzY2FsZSkuIElmIHRoZSBkdXJhdGlvbiBjYW5ub3QgYmUgZGV0ZXJtaW5lZCB0aGVuIGR1cmF0aW9uIGlzIHNldCB0byBhbGwgMXMuXHJcbiAgICAgICAgbWRoZC5sYW5ndWFnZSA9IGFkYXB0YXRpb25TZXQubGFuZyB8fCAndW5kJzsgLy8gZGVjbGFyZXMgdGhlIGxhbmd1YWdlIGNvZGUgZm9yIHRoaXMgbWVkaWFcclxuICAgICAgICBtZGhkLnByZV9kZWZpbmVkID0gMDtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1kaGQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlSGRsckJveChtZGlhKSB7XHJcblxyXG4gICAgICAgIGxldCBoZGxyID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgnaGRscicsIG1kaWEpO1xyXG5cclxuICAgICAgICBoZGxyLnByZV9kZWZpbmVkID0gMDtcclxuICAgICAgICBzd2l0Y2ggKGFkYXB0YXRpb25TZXQudHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5WSURFTzpcclxuICAgICAgICAgICAgICAgIGhkbHIuaGFuZGxlcl90eXBlID0gJ3ZpZGUnO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLkFVRElPOlxyXG4gICAgICAgICAgICAgICAgaGRsci5oYW5kbGVyX3R5cGUgPSAnc291bic7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGhkbHIuaGFuZGxlcl90eXBlID0gJ21ldGEnO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhkbHIubmFtZSA9IHJlcHJlc2VudGF0aW9uLmlkO1xyXG4gICAgICAgIGhkbHIucmVzZXJ2ZWQgPSBbMCwgMCwgMF07XHJcblxyXG4gICAgICAgIHJldHVybiBoZGxyO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVZtaGRCb3gobWluZikge1xyXG5cclxuICAgICAgICBsZXQgdm1oZCA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3ZtaGQnLCBtaW5mKTtcclxuXHJcbiAgICAgICAgdm1oZC5mbGFncyA9IDE7XHJcblxyXG4gICAgICAgIHZtaGQuZ3JhcGhpY3Ntb2RlID0gMDsgLy8gc3BlY2lmaWVzIGEgY29tcG9zaXRpb24gbW9kZSBmb3IgdGhpcyB2aWRlbyB0cmFjaywgZnJvbSB0aGUgZm9sbG93aW5nIGVudW1lcmF0ZWQgc2V0LCB3aGljaCBtYXkgYmUgZXh0ZW5kZWQgYnkgZGVyaXZlZCBzcGVjaWZpY2F0aW9uczogY29weSA9IDAgY29weSBvdmVyIHRoZSBleGlzdGluZyBpbWFnZVxyXG4gICAgICAgIHZtaGQub3Bjb2xvciA9IFswLCAwLCAwXTsgLy8gaXMgYSBzZXQgb2YgMyBjb2xvdXIgdmFsdWVzIChyZWQsIGdyZWVuLCBibHVlKSBhdmFpbGFibGUgZm9yIHVzZSBieSBncmFwaGljcyBtb2Rlc1xyXG5cclxuICAgICAgICByZXR1cm4gdm1oZDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVTbWhkQm94KG1pbmYpIHtcclxuXHJcbiAgICAgICAgbGV0IHNtaGQgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzbWhkJywgbWluZik7XHJcblxyXG4gICAgICAgIHNtaGQuZmxhZ3MgPSAxO1xyXG5cclxuICAgICAgICBzbWhkLmJhbGFuY2UgPSAwOyAvLyBpcyBhIGZpeGVkLXBvaW50IDguOCBudW1iZXIgdGhhdCBwbGFjZXMgbW9ubyBhdWRpbyB0cmFja3MgaW4gYSBzdGVyZW8gc3BhY2U7IDAgaXMgY2VudHJlICh0aGUgbm9ybWFsIHZhbHVlKTsgZnVsbCBsZWZ0IGlzIC0xLjAgYW5kIGZ1bGwgcmlnaHQgaXMgMS4wLlxyXG4gICAgICAgIHNtaGQucmVzZXJ2ZWQgPSAwO1xyXG5cclxuICAgICAgICByZXR1cm4gc21oZDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVEcmVmQm94KGRpbmYpIHtcclxuXHJcbiAgICAgICAgbGV0IGRyZWYgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdkcmVmJywgZGluZik7XHJcblxyXG4gICAgICAgIGRyZWYuZW50cnlfY291bnQgPSAxO1xyXG4gICAgICAgIGRyZWYuZW50cmllcyA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgdXJsID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgndXJsICcsIGRyZWYsIGZhbHNlKTtcclxuICAgICAgICB1cmwubG9jYXRpb24gPSAnJztcclxuICAgICAgICB1cmwuZmxhZ3MgPSAxO1xyXG5cclxuICAgICAgICBkcmVmLmVudHJpZXMucHVzaCh1cmwpO1xyXG5cclxuICAgICAgICByZXR1cm4gZHJlZjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVTdHNkQm94KHN0YmwpIHtcclxuXHJcbiAgICAgICAgbGV0IHN0c2QgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzdHNkJywgc3RibCk7XHJcblxyXG4gICAgICAgIHN0c2QuZW50cmllcyA9IFtdO1xyXG4gICAgICAgIHN3aXRjaCAoYWRhcHRhdGlvblNldC50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLlZJREVPOlxyXG4gICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5BVURJTzpcclxuICAgICAgICAgICAgICAgIHN0c2QuZW50cmllcy5wdXNoKGNyZWF0ZVNhbXBsZUVudHJ5KHN0c2QpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdHNkLmVudHJ5X2NvdW50ID0gc3RzZC5lbnRyaWVzLmxlbmd0aDsgLy8gaXMgYW4gaW50ZWdlciB0aGF0IGNvdW50cyB0aGUgYWN0dWFsIGVudHJpZXNcclxuICAgICAgICByZXR1cm4gc3RzZDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVTYW1wbGVFbnRyeShzdHNkKSB7XHJcbiAgICAgICAgbGV0IGNvZGVjID0gcmVwcmVzZW50YXRpb24uY29kZWNzLnN1YnN0cmluZygwLCByZXByZXNlbnRhdGlvbi5jb2RlY3MuaW5kZXhPZignLicpKTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChjb2RlYykge1xyXG4gICAgICAgICAgICBjYXNlICdhdmMxJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVBVkNWaXN1YWxTYW1wbGVFbnRyeShzdHNkLCBjb2RlYyk7XHJcbiAgICAgICAgICAgIGNhc2UgJ21wNGEnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZU1QNEF1ZGlvU2FtcGxlRW50cnkoc3RzZCwgY29kZWMpO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IE1zc0Vycm9ycy5NU1NfVU5TVVBQT1JURURfQ09ERUNfQ09ERSxcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBNc3NFcnJvcnMuTVNTX1VOU1VQUE9SVEVEX0NPREVDX01FU1NBR0UsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlYzogY29kZWNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVBVkNWaXN1YWxTYW1wbGVFbnRyeShzdHNkLCBjb2RlYykge1xyXG4gICAgICAgIGxldCBhdmMxO1xyXG5cclxuICAgICAgICBpZiAoY29udGVudFByb3RlY3Rpb24pIHtcclxuICAgICAgICAgICAgYXZjMSA9IElTT0JveGVyLmNyZWF0ZUJveCgnZW5jdicsIHN0c2QsIGZhbHNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhdmMxID0gSVNPQm94ZXIuY3JlYXRlQm94KCdhdmMxJywgc3RzZCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2FtcGxlRW50cnkgZmllbGRzXHJcbiAgICAgICAgYXZjMS5yZXNlcnZlZDEgPSBbMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MF07XHJcbiAgICAgICAgYXZjMS5kYXRhX3JlZmVyZW5jZV9pbmRleCA9IDE7XHJcblxyXG4gICAgICAgIC8vIFZpc3VhbFNhbXBsZUVudHJ5IGZpZWxkc1xyXG4gICAgICAgIGF2YzEucHJlX2RlZmluZWQxID0gMDtcclxuICAgICAgICBhdmMxLnJlc2VydmVkMiA9IDA7XHJcbiAgICAgICAgYXZjMS5wcmVfZGVmaW5lZDIgPSBbMCwgMCwgMF07XHJcbiAgICAgICAgYXZjMS5oZWlnaHQgPSByZXByZXNlbnRhdGlvbi5oZWlnaHQ7XHJcbiAgICAgICAgYXZjMS53aWR0aCA9IHJlcHJlc2VudGF0aW9uLndpZHRoO1xyXG4gICAgICAgIGF2YzEuaG9yaXpyZXNvbHV0aW9uID0gNzI7IC8vIDcyIGRwaVxyXG4gICAgICAgIGF2YzEudmVydHJlc29sdXRpb24gPSA3MjsgLy8gNzIgZHBpXHJcbiAgICAgICAgYXZjMS5yZXNlcnZlZDMgPSAwO1xyXG4gICAgICAgIGF2YzEuZnJhbWVfY291bnQgPSAxOyAvLyAxIGNvbXByZXNzZWQgdmlkZW8gZnJhbWUgcGVyIHNhbXBsZVxyXG4gICAgICAgIGF2YzEuY29tcHJlc3Nvcm5hbWUgPSBbXHJcbiAgICAgICAgICAgIDB4MEEsIDB4NDEsIDB4NTYsIDB4NDMsIDB4MjAsIDB4NDMsIDB4NkYsIDB4NjQsIC8vID0gJ0FWQyBDb2RpbmcnO1xyXG4gICAgICAgICAgICAweDY5LCAweDZFLCAweDY3LCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLFxyXG4gICAgICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLFxyXG4gICAgICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwXHJcbiAgICAgICAgXTtcclxuICAgICAgICBhdmMxLmRlcHRoID0gMHgwMDE4OyAvLyAweDAwMTgg4oCTIGltYWdlcyBhcmUgaW4gY29sb3VyIHdpdGggbm8gYWxwaGEuXHJcbiAgICAgICAgYXZjMS5wcmVfZGVmaW5lZDMgPSA2NTUzNTtcclxuICAgICAgICBhdmMxLmNvbmZpZyA9IGNyZWF0ZUFWQzFDb25maWd1cmF0aW9uUmVjb3JkKCk7XHJcbiAgICAgICAgaWYgKGNvbnRlbnRQcm90ZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIFByb3RlY3Rpb24gU2NoZW1lIEluZm8gQm94XHJcbiAgICAgICAgICAgIGxldCBzaW5mID0gSVNPQm94ZXIuY3JlYXRlQm94KCdzaW5mJywgYXZjMSk7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBPcmlnaW5hbCBGb3JtYXQgQm94ID0+IGluZGljYXRlIGNvZGVjIHR5cGUgb2YgdGhlIGVuY3J5cHRlZCBjb250ZW50XHJcbiAgICAgICAgICAgIGNyZWF0ZU9yaWdpbmFsRm9ybWF0Qm94KHNpbmYsIGNvZGVjKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIFNjaGVtZSBUeXBlIGJveFxyXG4gICAgICAgICAgICBjcmVhdGVTY2hlbWVUeXBlQm94KHNpbmYpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgU2NoZW1lIEluZm9ybWF0aW9uIEJveFxyXG4gICAgICAgICAgICBjcmVhdGVTY2hlbWVJbmZvcm1hdGlvbkJveChzaW5mKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhdmMxO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUFWQzFDb25maWd1cmF0aW9uUmVjb3JkKCkge1xyXG5cclxuICAgICAgICBsZXQgYXZjQyA9IG51bGw7XHJcbiAgICAgICAgbGV0IGF2Y0NMZW5ndGggPSAxNTsgLy8gbGVuZ3RoID0gMTUgYnkgZGVmYXVsdCAoMCBTUFMgYW5kIDAgUFBTKVxyXG5cclxuICAgICAgICAvLyBGaXJzdCBnZXQgYWxsIFNQUyBhbmQgUFBTIGZyb20gY29kZWNQcml2YXRlRGF0YVxyXG4gICAgICAgIGxldCBzcHMgPSBbXTtcclxuICAgICAgICBsZXQgcHBzID0gW107XHJcbiAgICAgICAgbGV0IEFWQ1Byb2ZpbGVJbmRpY2F0aW9uID0gMDtcclxuICAgICAgICBsZXQgQVZDTGV2ZWxJbmRpY2F0aW9uID0gMDtcclxuICAgICAgICBsZXQgcHJvZmlsZV9jb21wYXRpYmlsaXR5ID0gMDtcclxuXHJcbiAgICAgICAgbGV0IG5hbHVzID0gcmVwcmVzZW50YXRpb24uY29kZWNQcml2YXRlRGF0YS5zcGxpdCgnMDAwMDAwMDEnKS5zbGljZSgxKTtcclxuICAgICAgICBsZXQgbmFsdUJ5dGVzLCBuYWx1VHlwZTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYWx1cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBuYWx1Qnl0ZXMgPSBoZXhTdHJpbmd0b0J1ZmZlcihuYWx1c1tpXSk7XHJcblxyXG4gICAgICAgICAgICBuYWx1VHlwZSA9IG5hbHVCeXRlc1swXSAmIDB4MUY7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKG5hbHVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE5BTFVUWVBFX1NQUzpcclxuICAgICAgICAgICAgICAgICAgICBzcHMucHVzaChuYWx1Qnl0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF2Y0NMZW5ndGggKz0gbmFsdUJ5dGVzLmxlbmd0aCArIDI7IC8vIDIgPSBzZXF1ZW5jZVBhcmFtZXRlclNldExlbmd0aCBmaWVsZCBsZW5ndGhcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTkFMVVRZUEVfUFBTOlxyXG4gICAgICAgICAgICAgICAgICAgIHBwcy5wdXNoKG5hbHVCeXRlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXZjQ0xlbmd0aCArPSBuYWx1Qnl0ZXMubGVuZ3RoICsgMjsgLy8gMiA9IHBpY3R1cmVQYXJhbWV0ZXJTZXRMZW5ndGggZmllbGQgbGVuZ3RoXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZXQgcHJvZmlsZSBhbmQgbGV2ZWwgZnJvbSBTUFNcclxuICAgICAgICBpZiAoc3BzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgQVZDUHJvZmlsZUluZGljYXRpb24gPSBzcHNbMF1bMV07XHJcbiAgICAgICAgICAgIHByb2ZpbGVfY29tcGF0aWJpbGl0eSA9IHNwc1swXVsyXTtcclxuICAgICAgICAgICAgQVZDTGV2ZWxJbmRpY2F0aW9uID0gc3BzWzBdWzNdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgYXZjQyBidWZmZXJcclxuICAgICAgICBhdmNDID0gbmV3IFVpbnQ4QXJyYXkoYXZjQ0xlbmd0aCk7XHJcblxyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAvLyBsZW5ndGhcclxuICAgICAgICBhdmNDW2krK10gPSAoYXZjQ0xlbmd0aCAmIDB4RkYwMDAwMDApID4+IDI0O1xyXG4gICAgICAgIGF2Y0NbaSsrXSA9IChhdmNDTGVuZ3RoICYgMHgwMEZGMDAwMCkgPj4gMTY7XHJcbiAgICAgICAgYXZjQ1tpKytdID0gKGF2Y0NMZW5ndGggJiAweDAwMDBGRjAwKSA+PiA4O1xyXG4gICAgICAgIGF2Y0NbaSsrXSA9IChhdmNDTGVuZ3RoICYgMHgwMDAwMDBGRik7XHJcbiAgICAgICAgYXZjQy5zZXQoWzB4NjEsIDB4NzYsIDB4NjMsIDB4NDNdLCBpKTsgLy8gdHlwZSA9ICdhdmNDJ1xyXG4gICAgICAgIGkgKz0gNDtcclxuICAgICAgICBhdmNDW2krK10gPSAxOyAvLyBjb25maWd1cmF0aW9uVmVyc2lvbiA9IDFcclxuICAgICAgICBhdmNDW2krK10gPSBBVkNQcm9maWxlSW5kaWNhdGlvbjtcclxuICAgICAgICBhdmNDW2krK10gPSBwcm9maWxlX2NvbXBhdGliaWxpdHk7XHJcbiAgICAgICAgYXZjQ1tpKytdID0gQVZDTGV2ZWxJbmRpY2F0aW9uO1xyXG4gICAgICAgIGF2Y0NbaSsrXSA9IDB4RkY7IC8vICcxMTExMScgKyBsZW5ndGhTaXplTWludXNPbmUgPSAzXHJcbiAgICAgICAgYXZjQ1tpKytdID0gMHhFMCB8IHNwcy5sZW5ndGg7IC8vICcxMTEnICsgbnVtT2ZTZXF1ZW5jZVBhcmFtZXRlclNldHNcclxuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IHNwcy5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICBhdmNDW2krK10gPSAoc3BzW25dLmxlbmd0aCAmIDB4RkYwMCkgPj4gODtcclxuICAgICAgICAgICAgYXZjQ1tpKytdID0gKHNwc1tuXS5sZW5ndGggJiAweDAwRkYpO1xyXG4gICAgICAgICAgICBhdmNDLnNldChzcHNbbl0sIGkpO1xyXG4gICAgICAgICAgICBpICs9IHNwc1tuXS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF2Y0NbaSsrXSA9IHBwcy5sZW5ndGg7IC8vIG51bU9mUGljdHVyZVBhcmFtZXRlclNldHNcclxuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IHBwcy5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICBhdmNDW2krK10gPSAocHBzW25dLmxlbmd0aCAmIDB4RkYwMCkgPj4gODtcclxuICAgICAgICAgICAgYXZjQ1tpKytdID0gKHBwc1tuXS5sZW5ndGggJiAweDAwRkYpO1xyXG4gICAgICAgICAgICBhdmNDLnNldChwcHNbbl0sIGkpO1xyXG4gICAgICAgICAgICBpICs9IHBwc1tuXS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYXZjQztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVNUDRBdWRpb1NhbXBsZUVudHJ5KHN0c2QsIGNvZGVjKSB7XHJcbiAgICAgICAgbGV0IG1wNGE7XHJcblxyXG4gICAgICAgIGlmIChjb250ZW50UHJvdGVjdGlvbikge1xyXG4gICAgICAgICAgICBtcDRhID0gSVNPQm94ZXIuY3JlYXRlQm94KCdlbmNhJywgc3RzZCwgZmFsc2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1wNGEgPSBJU09Cb3hlci5jcmVhdGVCb3goJ21wNGEnLCBzdHNkLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTYW1wbGVFbnRyeSBmaWVsZHNcclxuICAgICAgICBtcDRhLnJlc2VydmVkMSA9IFsweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwXTtcclxuICAgICAgICBtcDRhLmRhdGFfcmVmZXJlbmNlX2luZGV4ID0gMTtcclxuXHJcbiAgICAgICAgLy8gQXVkaW9TYW1wbGVFbnRyeSBmaWVsZHNcclxuICAgICAgICBtcDRhLnJlc2VydmVkMiA9IFsweDAsIDB4MF07XHJcbiAgICAgICAgbXA0YS5jaGFubmVsY291bnQgPSByZXByZXNlbnRhdGlvbi5hdWRpb0NoYW5uZWxzO1xyXG4gICAgICAgIG1wNGEuc2FtcGxlc2l6ZSA9IDE2O1xyXG4gICAgICAgIG1wNGEucHJlX2RlZmluZWQgPSAwO1xyXG4gICAgICAgIG1wNGEucmVzZXJ2ZWRfMyA9IDA7XHJcbiAgICAgICAgbXA0YS5zYW1wbGVyYXRlID0gcmVwcmVzZW50YXRpb24uYXVkaW9TYW1wbGluZ1JhdGUgPDwgMTY7XHJcblxyXG4gICAgICAgIG1wNGEuZXNkcyA9IGNyZWF0ZU1QRUc0QUFDRVNEZXNjcmlwdG9yKCk7XHJcblxyXG4gICAgICAgIGlmIChjb250ZW50UHJvdGVjdGlvbikge1xyXG4gICAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBQcm90ZWN0aW9uIFNjaGVtZSBJbmZvIEJveFxyXG4gICAgICAgICAgICBsZXQgc2luZiA9IElTT0JveGVyLmNyZWF0ZUJveCgnc2luZicsIG1wNGEpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgT3JpZ2luYWwgRm9ybWF0IEJveCA9PiBpbmRpY2F0ZSBjb2RlYyB0eXBlIG9mIHRoZSBlbmNyeXB0ZWQgY29udGVudFxyXG4gICAgICAgICAgICBjcmVhdGVPcmlnaW5hbEZvcm1hdEJveChzaW5mLCBjb2RlYyk7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBTY2hlbWUgVHlwZSBib3hcclxuICAgICAgICAgICAgY3JlYXRlU2NoZW1lVHlwZUJveChzaW5mKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIFNjaGVtZSBJbmZvcm1hdGlvbiBCb3hcclxuICAgICAgICAgICAgY3JlYXRlU2NoZW1lSW5mb3JtYXRpb25Cb3goc2luZik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbXA0YTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVNUEVHNEFBQ0VTRGVzY3JpcHRvcigpIHtcclxuXHJcbiAgICAgICAgLy8gQXVkaW9TcGVjaWZpY0NvbmZpZyAoc2VlIElTTy9JRUMgMTQ0OTYtMywgc3VicGFydCAxKSA9PiBjb3JyZXNwb25kcyB0byBoZXggYnl0ZXMgY29udGFpbmVkIGluICdjb2RlY1ByaXZhdGVEYXRhJyBmaWVsZFxyXG4gICAgICAgIGxldCBhdWRpb1NwZWNpZmljQ29uZmlnID0gaGV4U3RyaW5ndG9CdWZmZXIocmVwcmVzZW50YXRpb24uY29kZWNQcml2YXRlRGF0YSk7XHJcblxyXG4gICAgICAgIC8vIEVTRFMgbGVuZ3RoID0gZXNkcyBib3ggaGVhZGVyIGxlbmd0aCAoPSAxMikgK1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgRVNfRGVzY3JpcHRvciBoZWFkZXIgbGVuZ3RoICg9IDUpICtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgIERlY29kZXJDb25maWdEZXNjcmlwdG9yIGhlYWRlciBsZW5ndGggKD0gMTUpICtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgIGRlY29kZXJTcGVjaWZpY0luZm8gaGVhZGVyIGxlbmd0aCAoPSAyKSArXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICBBdWRpb1NwZWNpZmljQ29uZmlnIGxlbmd0aCAoPSBjb2RlY1ByaXZhdGVEYXRhIGxlbmd0aClcclxuICAgICAgICBsZXQgZXNkc0xlbmd0aCA9IDM0ICsgYXVkaW9TcGVjaWZpY0NvbmZpZy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IGVzZHMgPSBuZXcgVWludDhBcnJheShlc2RzTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIC8vIGVzZHMgYm94XHJcbiAgICAgICAgZXNkc1tpKytdID0gKGVzZHNMZW5ndGggJiAweEZGMDAwMDAwKSA+PiAyNDsgLy8gZXNkcyBib3ggbGVuZ3RoXHJcbiAgICAgICAgZXNkc1tpKytdID0gKGVzZHNMZW5ndGggJiAweDAwRkYwMDAwKSA+PiAxNjsgLy8gJydcclxuICAgICAgICBlc2RzW2krK10gPSAoZXNkc0xlbmd0aCAmIDB4MDAwMEZGMDApID4+IDg7IC8vICcnXHJcbiAgICAgICAgZXNkc1tpKytdID0gKGVzZHNMZW5ndGggJiAweDAwMDAwMEZGKTsgLy8gJydcclxuICAgICAgICBlc2RzLnNldChbMHg2NSwgMHg3MywgMHg2NCwgMHg3M10sIGkpOyAvLyB0eXBlID0gJ2VzZHMnXHJcbiAgICAgICAgaSArPSA0O1xyXG4gICAgICAgIGVzZHMuc2V0KFswLCAwLCAwLCAwXSwgaSk7IC8vIHZlcnNpb24gPSAwLCBmbGFncyA9IDBcclxuICAgICAgICBpICs9IDQ7XHJcbiAgICAgICAgLy8gRVNfRGVzY3JpcHRvciAoc2VlIElTTy9JRUMgMTQ0OTYtMSAoU3lzdGVtcykpXHJcbiAgICAgICAgZXNkc1tpKytdID0gMHgwMzsgLy8gdGFnID0gMHgwMyAoRVNfRGVzY3JUYWcpXHJcbiAgICAgICAgZXNkc1tpKytdID0gMjAgKyBhdWRpb1NwZWNpZmljQ29uZmlnLmxlbmd0aDsgLy8gc2l6ZVxyXG4gICAgICAgIGVzZHNbaSsrXSA9ICh0cmFja0lkICYgMHhGRjAwKSA+PiA4OyAvLyBFU19JRCA9IHRyYWNrX2lkXHJcbiAgICAgICAgZXNkc1tpKytdID0gKHRyYWNrSWQgJiAweDAwRkYpOyAvLyAnJ1xyXG4gICAgICAgIGVzZHNbaSsrXSA9IDA7IC8vIGZsYWdzIGFuZCBzdHJlYW1Qcmlvcml0eVxyXG5cclxuICAgICAgICAvLyBEZWNvZGVyQ29uZmlnRGVzY3JpcHRvciAoc2VlIElTTy9JRUMgMTQ0OTYtMSAoU3lzdGVtcykpXHJcbiAgICAgICAgZXNkc1tpKytdID0gMHgwNDsgLy8gdGFnID0gMHgwNCAoRGVjb2RlckNvbmZpZ0Rlc2NyVGFnKVxyXG4gICAgICAgIGVzZHNbaSsrXSA9IDE1ICsgYXVkaW9TcGVjaWZpY0NvbmZpZy5sZW5ndGg7IC8vIHNpemVcclxuICAgICAgICBlc2RzW2krK10gPSAweDQwOyAvLyBvYmplY3RUeXBlSW5kaWNhdGlvbiA9IDB4NDAgKE1QRUctNCBBQUMpXHJcbiAgICAgICAgZXNkc1tpXSA9IDB4MDUgPDwgMjsgLy8gc3RyZWFtVHlwZSA9IDB4MDUgKEF1ZGlvc3RyZWFtKVxyXG4gICAgICAgIGVzZHNbaV0gfD0gMCA8PCAxOyAvLyB1cFN0cmVhbSA9IDBcclxuICAgICAgICBlc2RzW2krK10gfD0gMTsgLy8gcmVzZXJ2ZWQgPSAxXHJcbiAgICAgICAgZXNkc1tpKytdID0gMHhGRjsgLy8gYnVmZmVyc2l6ZURCID0gdW5kZWZpbmVkXHJcbiAgICAgICAgZXNkc1tpKytdID0gMHhGRjsgLy8gJydcclxuICAgICAgICBlc2RzW2krK10gPSAweEZGOyAvLyAnJ1xyXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweEZGMDAwMDAwKSA+PiAyNDsgLy8gbWF4Qml0cmF0ZVxyXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweDAwRkYwMDAwKSA+PiAxNjsgLy8gJydcclxuICAgICAgICBlc2RzW2krK10gPSAocmVwcmVzZW50YXRpb24uYmFuZHdpZHRoICYgMHgwMDAwRkYwMCkgPj4gODsgLy8gJydcclxuICAgICAgICBlc2RzW2krK10gPSAocmVwcmVzZW50YXRpb24uYmFuZHdpZHRoICYgMHgwMDAwMDBGRik7IC8vICcnXHJcbiAgICAgICAgZXNkc1tpKytdID0gKHJlcHJlc2VudGF0aW9uLmJhbmR3aWR0aCAmIDB4RkYwMDAwMDApID4+IDI0OyAvLyBhdmdiaXRyYXRlXHJcbiAgICAgICAgZXNkc1tpKytdID0gKHJlcHJlc2VudGF0aW9uLmJhbmR3aWR0aCAmIDB4MDBGRjAwMDApID4+IDE2OyAvLyAnJ1xyXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweDAwMDBGRjAwKSA+PiA4OyAvLyAnJ1xyXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweDAwMDAwMEZGKTsgLy8gJydcclxuXHJcbiAgICAgICAgLy8gRGVjb2RlclNwZWNpZmljSW5mbyAoc2VlIElTTy9JRUMgMTQ0OTYtMSAoU3lzdGVtcykpXHJcbiAgICAgICAgZXNkc1tpKytdID0gMHgwNTsgLy8gdGFnID0gMHgwNSAoRGVjU3BlY2lmaWNJbmZvVGFnKVxyXG4gICAgICAgIGVzZHNbaSsrXSA9IGF1ZGlvU3BlY2lmaWNDb25maWcubGVuZ3RoOyAvLyBzaXplXHJcbiAgICAgICAgZXNkcy5zZXQoYXVkaW9TcGVjaWZpY0NvbmZpZywgaSk7IC8vIEF1ZGlvU3BlY2lmaWNDb25maWcgYnl0ZXNcclxuXHJcbiAgICAgICAgcmV0dXJuIGVzZHM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlT3JpZ2luYWxGb3JtYXRCb3goc2luZiwgY29kZWMpIHtcclxuICAgICAgICBsZXQgZnJtYSA9IElTT0JveGVyLmNyZWF0ZUJveCgnZnJtYScsIHNpbmYpO1xyXG4gICAgICAgIGZybWEuZGF0YV9mb3JtYXQgPSBzdHJpbmdUb0NoYXJDb2RlKGNvZGVjKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVTY2hlbWVUeXBlQm94KHNpbmYpIHtcclxuICAgICAgICBsZXQgc2NobSA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3NjaG0nLCBzaW5mKTtcclxuXHJcbiAgICAgICAgc2NobS5mbGFncyA9IDA7XHJcbiAgICAgICAgc2NobS52ZXJzaW9uID0gMDtcclxuICAgICAgICBzY2htLnNjaGVtZV90eXBlID0gMHg2MzY1NkU2MzsgLy8gJ2NlbmMnID0+IGNvbW1vbiBlbmNyeXB0aW9uXHJcbiAgICAgICAgc2NobS5zY2hlbWVfdmVyc2lvbiA9IDB4MDAwMTAwMDA7IC8vIHZlcnNpb24gc2V0IHRvIDB4MDAwMTAwMDAgKE1ham9yIHZlcnNpb24gMSwgTWlub3IgdmVyc2lvbiAwKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNjaGVtZUluZm9ybWF0aW9uQm94KHNpbmYpIHtcclxuICAgICAgICBsZXQgc2NoaSA9IElTT0JveGVyLmNyZWF0ZUJveCgnc2NoaScsIHNpbmYpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBUcmFjayBFbmNyeXB0aW9uIEJveFxyXG4gICAgICAgIGNyZWF0ZVRyYWNrRW5jcnlwdGlvbkJveChzY2hpKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVQcm90ZWN0aW9uU3lzdGVtU3BlY2lmaWNIZWFkZXJCb3gobW9vdiwga2V5U3lzdGVtcykge1xyXG4gICAgICAgIGxldCBwc3NoX2J5dGVzLFxyXG4gICAgICAgICAgICBwc3NoLFxyXG4gICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICBwYXJzZWRCdWZmZXI7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlTeXN0ZW1zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHBzc2hfYnl0ZXMgPSBrZXlTeXN0ZW1zW2ldLmluaXREYXRhO1xyXG4gICAgICAgICAgICBpZiAocHNzaF9ieXRlcykge1xyXG4gICAgICAgICAgICAgICAgcGFyc2VkQnVmZmVyID0gSVNPQm94ZXIucGFyc2VCdWZmZXIocHNzaF9ieXRlcyk7XHJcbiAgICAgICAgICAgICAgICBwc3NoID0gcGFyc2VkQnVmZmVyLmZldGNoKCdwc3NoJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAocHNzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIElTT0JveGVyLlV0aWxzLmFwcGVuZEJveChtb292LCBwc3NoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVUcmFja0VuY3J5cHRpb25Cb3goc2NoaSkge1xyXG4gICAgICAgIGxldCB0ZW5jID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgndGVuYycsIHNjaGkpO1xyXG5cclxuICAgICAgICB0ZW5jLmZsYWdzID0gMDtcclxuICAgICAgICB0ZW5jLnZlcnNpb24gPSAwO1xyXG5cclxuICAgICAgICB0ZW5jLmRlZmF1bHRfSXNFbmNyeXB0ZWQgPSAweDE7XHJcbiAgICAgICAgdGVuYy5kZWZhdWx0X0lWX3NpemUgPSA4O1xyXG4gICAgICAgIHRlbmMuZGVmYXVsdF9LSUQgPSAoY29udGVudFByb3RlY3Rpb24gJiYgKGNvbnRlbnRQcm90ZWN0aW9uLmxlbmd0aCkgPiAwICYmIGNvbnRlbnRQcm90ZWN0aW9uWzBdWydjZW5jOmRlZmF1bHRfS0lEJ10pID9cclxuICAgICAgICAgICAgY29udGVudFByb3RlY3Rpb25bMF1bJ2NlbmM6ZGVmYXVsdF9LSUQnXSA6IFsweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDBdO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVRyZXhCb3gobW9vdikge1xyXG4gICAgICAgIGxldCB0cmV4ID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgndHJleCcsIG1vb3YpO1xyXG5cclxuICAgICAgICB0cmV4LnRyYWNrX0lEID0gdHJhY2tJZDtcclxuICAgICAgICB0cmV4LmRlZmF1bHRfc2FtcGxlX2Rlc2NyaXB0aW9uX2luZGV4ID0gMTtcclxuICAgICAgICB0cmV4LmRlZmF1bHRfc2FtcGxlX2R1cmF0aW9uID0gMDtcclxuICAgICAgICB0cmV4LmRlZmF1bHRfc2FtcGxlX3NpemUgPSAwO1xyXG4gICAgICAgIHRyZXguZGVmYXVsdF9zYW1wbGVfZmxhZ3MgPSAwO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJleDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoZXhTdHJpbmd0b0J1ZmZlcihzdHIpIHtcclxuICAgICAgICBsZXQgYnVmID0gbmV3IFVpbnQ4QXJyYXkoc3RyLmxlbmd0aCAvIDIpO1xyXG4gICAgICAgIGxldCBpO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3RyLmxlbmd0aCAvIDI7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBidWZbaV0gPSBwYXJzZUludCgnJyArIHN0cltpICogMl0gKyBzdHJbaSAqIDIgKyAxXSwgMTYpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYnVmO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0cmluZ1RvQ2hhckNvZGUoc3RyKSB7XHJcbiAgICAgICAgbGV0IGNvZGUgPSAwO1xyXG4gICAgICAgIGxldCBpO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGNvZGUgfD0gc3RyLmNoYXJDb2RlQXQoaSkgPDwgKChzdHIubGVuZ3RoIC0gaSAtIDEpICogOCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlTW9vdihyZXApIHtcclxuICAgICAgICBpZiAoIXJlcCB8fCAhcmVwLmFkYXB0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGlzb0ZpbGUsXHJcbiAgICAgICAgICAgIGFycmF5QnVmZmVyO1xyXG5cclxuICAgICAgICByZXByZXNlbnRhdGlvbiA9IHJlcDtcclxuICAgICAgICBhZGFwdGF0aW9uU2V0ID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbjtcclxuXHJcbiAgICAgICAgcGVyaW9kID0gYWRhcHRhdGlvblNldC5wZXJpb2Q7XHJcbiAgICAgICAgdHJhY2tJZCA9IGFkYXB0YXRpb25TZXQuaW5kZXggKyAxO1xyXG4gICAgICAgIGNvbnRlbnRQcm90ZWN0aW9uID0gcGVyaW9kLm1wZC5tYW5pZmVzdC5QZXJpb2RfYXNBcnJheVtwZXJpb2QuaW5kZXhdLkFkYXB0YXRpb25TZXRfYXNBcnJheVthZGFwdGF0aW9uU2V0LmluZGV4XS5Db250ZW50UHJvdGVjdGlvbjtcclxuXHJcbiAgICAgICAgdGltZXNjYWxlID0gcGVyaW9kLm1wZC5tYW5pZmVzdC5QZXJpb2RfYXNBcnJheVtwZXJpb2QuaW5kZXhdLkFkYXB0YXRpb25TZXRfYXNBcnJheVthZGFwdGF0aW9uU2V0LmluZGV4XS5TZWdtZW50VGVtcGxhdGUudGltZXNjYWxlO1xyXG5cclxuICAgICAgICBpc29GaWxlID0gSVNPQm94ZXIuY3JlYXRlRmlsZSgpO1xyXG4gICAgICAgIGNyZWF0ZUZ0eXBCb3goaXNvRmlsZSk7XHJcbiAgICAgICAgY3JlYXRlTW9vdkJveChpc29GaWxlKTtcclxuXHJcbiAgICAgICAgYXJyYXlCdWZmZXIgPSBpc29GaWxlLndyaXRlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBhcnJheUJ1ZmZlcjtcclxuICAgIH1cclxuXHJcbiAgICBpbnN0YW5jZSA9IHtcclxuICAgICAgICBnZW5lcmF0ZU1vb3Y6IGdlbmVyYXRlTW9vdlxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gaW5zdGFuY2U7XHJcbn1cclxuXHJcbk1zc0ZyYWdtZW50TW9vdlByb2Nlc3Nvci5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnTXNzRnJhZ21lbnRNb292UHJvY2Vzc29yJztcclxuZXhwb3J0IGRlZmF1bHQgZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRDbGFzc0ZhY3RvcnkoTXNzRnJhZ21lbnRNb292UHJvY2Vzc29yKTsgLyoganNoaW50IGlnbm9yZTpsaW5lICovXHJcbiIsIi8qKlxyXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxyXG4gKiBpbmNsdWRlZCBiZWxvdy4gVGhpcyBzb2Z0d2FyZSBtYXkgYmUgc3ViamVjdCB0byBvdGhlciB0aGlyZCBwYXJ0eSBhbmQgY29udHJpYnV0b3JcclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDEzLCBEYXNoIEluZHVzdHJ5IEZvcnVtLlxyXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKlxyXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxyXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XHJcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xyXG4gKiAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXHJcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcclxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXHJcbiAqICBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxyXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcclxuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcclxuICogIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxyXG4gKlxyXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXHJcbiAqICBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXHJcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXHJcbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxyXG4gKiAgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVFxyXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxyXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXHJcbiAqICBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXHJcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxyXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcbiAqL1xyXG5cclxuaW1wb3J0IE1zc0ZyYWdtZW50TW9vZlByb2Nlc3NvciBmcm9tICcuL01zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvcic7XHJcbmltcG9ydCBNc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3IgZnJvbSAnLi9Nc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3InO1xyXG5cclxuLy8gQWRkIHNwZWNpZmljIGJveCBwcm9jZXNzb3JzIG5vdCBwcm92aWRlZCBieSBjb2RlbS1pc29ib3hlciBsaWJyYXJ5XHJcblxyXG5mdW5jdGlvbiBhcnJheUVxdWFsKGFycjEsIGFycjIpIHtcclxuICAgIHJldHVybiAoYXJyMS5sZW5ndGggPT09IGFycjIubGVuZ3RoKSAmJiBhcnIxLmV2ZXJ5KGZ1bmN0aW9uIChlbGVtZW50LCBpbmRleCkge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50ID09PSBhcnIyW2luZGV4XTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYWlvUHJvY2Vzc29yKCkge1xyXG4gICAgdGhpcy5fcHJvY0Z1bGxCb3goKTtcclxuICAgIGlmICh0aGlzLmZsYWdzICYgMSkge1xyXG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnYXV4X2luZm9fdHlwZScsICd1aW50JywgMzIpO1xyXG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnYXV4X2luZm9fdHlwZV9wYXJhbWV0ZXInLCAndWludCcsIDMyKTtcclxuICAgIH1cclxuICAgIHRoaXMuX3Byb2NGaWVsZCgnZW50cnlfY291bnQnLCAndWludCcsIDMyKTtcclxuICAgIHRoaXMuX3Byb2NGaWVsZEFycmF5KCdvZmZzZXQnLCB0aGlzLmVudHJ5X2NvdW50LCAndWludCcsICh0aGlzLnZlcnNpb24gPT09IDEpID8gNjQgOiAzMik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhaXpQcm9jZXNzb3IoKSB7XHJcbiAgICB0aGlzLl9wcm9jRnVsbEJveCgpO1xyXG4gICAgaWYgKHRoaXMuZmxhZ3MgJiAxKSB7XHJcbiAgICAgICAgdGhpcy5fcHJvY0ZpZWxkKCdhdXhfaW5mb190eXBlJywgJ3VpbnQnLCAzMik7XHJcbiAgICAgICAgdGhpcy5fcHJvY0ZpZWxkKCdhdXhfaW5mb190eXBlX3BhcmFtZXRlcicsICd1aW50JywgMzIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcHJvY0ZpZWxkKCdkZWZhdWx0X3NhbXBsZV9pbmZvX3NpemUnLCAndWludCcsIDgpO1xyXG4gICAgdGhpcy5fcHJvY0ZpZWxkKCdzYW1wbGVfY291bnQnLCAndWludCcsIDMyKTtcclxuICAgIGlmICh0aGlzLmRlZmF1bHRfc2FtcGxlX2luZm9fc2l6ZSA9PT0gMCkge1xyXG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZEFycmF5KCdzYW1wbGVfaW5mb19zaXplJywgdGhpcy5zYW1wbGVfY291bnQsICd1aW50JywgOCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmNQcm9jZXNzb3IoKSB7XHJcbiAgICB0aGlzLl9wcm9jRnVsbEJveCgpO1xyXG4gICAgdGhpcy5fcHJvY0ZpZWxkKCdzYW1wbGVfY291bnQnLCAndWludCcsIDMyKTtcclxuICAgIGlmICh0aGlzLmZsYWdzICYgMSkge1xyXG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnSVZfc2l6ZScsICd1aW50JywgOCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9wcm9jRW50cmllcygnZW50cnknLCB0aGlzLnNhbXBsZV9jb3VudCwgZnVuY3Rpb24gKGVudHJ5KSB7XHJcbiAgICAgICAgdGhpcy5fcHJvY0VudHJ5RmllbGQoZW50cnksICdJbml0aWFsaXphdGlvblZlY3RvcicsICdkYXRhJywgOCk7XHJcbiAgICAgICAgaWYgKHRoaXMuZmxhZ3MgJiAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2NFbnRyeUZpZWxkKGVudHJ5LCAnTnVtYmVyT2ZFbnRyaWVzJywgJ3VpbnQnLCAxNik7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2NTdWJFbnRyaWVzKGVudHJ5LCAnY2xlYXJBbmRDcnlwdGVkRGF0YScsIGVudHJ5Lk51bWJlck9mRW50cmllcywgZnVuY3Rpb24gKGNsZWFyQW5kQ3J5cHRlZERhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb2NFbnRyeUZpZWxkKGNsZWFyQW5kQ3J5cHRlZERhdGEsICdCeXRlc09mQ2xlYXJEYXRhJywgJ3VpbnQnLCAxNik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9jRW50cnlGaWVsZChjbGVhckFuZENyeXB0ZWREYXRhLCAnQnl0ZXNPZkVuY3J5cHRlZERhdGEnLCAndWludCcsIDMyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHV1aWRQcm9jZXNzb3IoKSB7XHJcbiAgICBsZXQgdGZ4ZFVzZXJUeXBlID0gWzB4NkQsIDB4MUQsIDB4OUIsIDB4MDUsIDB4NDIsIDB4RDUsIDB4NDQsIDB4RTYsIDB4ODAsIDB4RTIsIDB4MTQsIDB4MUQsIDB4QUYsIDB4RjcsIDB4NTcsIDB4QjJdO1xyXG4gICAgbGV0IHRmcmZVc2VyVHlwZSA9IFsweEQ0LCAweDgwLCAweDdFLCAweEYyLCAweENBLCAweDM5LCAweDQ2LCAweDk1LCAweDhFLCAweDU0LCAweDI2LCAweENCLCAweDlFLCAweDQ2LCAweEE3LCAweDlGXTtcclxuICAgIGxldCBzZXBpZmZVc2VyVHlwZSA9IFsweEEyLCAweDM5LCAweDRGLCAweDUyLCAweDVBLCAweDlCLCAweDRmLCAweDE0LCAweEEyLCAweDQ0LCAweDZDLCAweDQyLCAweDdDLCAweDY0LCAweDhELCAweEY0XTtcclxuXHJcbiAgICBpZiAoYXJyYXlFcXVhbCh0aGlzLnVzZXJ0eXBlLCB0ZnhkVXNlclR5cGUpKSB7XHJcbiAgICAgICAgdGhpcy5fcHJvY0Z1bGxCb3goKTtcclxuICAgICAgICBpZiAodGhpcy5fcGFyc2luZykge1xyXG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAndGZ4ZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnZnJhZ21lbnRfYWJzb2x1dGVfdGltZScsICd1aW50JywgKHRoaXMudmVyc2lvbiA9PT0gMSkgPyA2NCA6IDMyKTtcclxuICAgICAgICB0aGlzLl9wcm9jRmllbGQoJ2ZyYWdtZW50X2R1cmF0aW9uJywgJ3VpbnQnLCAodGhpcy52ZXJzaW9uID09PSAxKSA/IDY0IDogMzIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhcnJheUVxdWFsKHRoaXMudXNlcnR5cGUsIHRmcmZVc2VyVHlwZSkpIHtcclxuICAgICAgICB0aGlzLl9wcm9jRnVsbEJveCgpO1xyXG4gICAgICAgIGlmICh0aGlzLl9wYXJzaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICd0ZnJmJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcHJvY0ZpZWxkKCdmcmFnbWVudF9jb3VudCcsICd1aW50JywgOCk7XHJcbiAgICAgICAgdGhpcy5fcHJvY0VudHJpZXMoJ2VudHJ5JywgdGhpcy5mcmFnbWVudF9jb3VudCwgZnVuY3Rpb24gKGVudHJ5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2NFbnRyeUZpZWxkKGVudHJ5LCAnZnJhZ21lbnRfYWJzb2x1dGVfdGltZScsICd1aW50JywgKHRoaXMudmVyc2lvbiA9PT0gMSkgPyA2NCA6IDMyKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJvY0VudHJ5RmllbGQoZW50cnksICdmcmFnbWVudF9kdXJhdGlvbicsICd1aW50JywgKHRoaXMudmVyc2lvbiA9PT0gMSkgPyA2NCA6IDMyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYXJyYXlFcXVhbCh0aGlzLnVzZXJ0eXBlLCBzZXBpZmZVc2VyVHlwZSkpIHtcclxuICAgICAgICBpZiAodGhpcy5fcGFyc2luZykge1xyXG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAnc2VwaWZmJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VuY1Byb2Nlc3Nvci5jYWxsKHRoaXMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBNc3NGcmFnbWVudFByb2Nlc3Nvcihjb25maWcpIHtcclxuXHJcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XHJcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5jb250ZXh0O1xyXG4gICAgY29uc3QgZGFzaE1ldHJpY3MgPSBjb25maWcuZGFzaE1ldHJpY3M7XHJcbiAgICBjb25zdCBwbGF5YmFja0NvbnRyb2xsZXIgPSBjb25maWcucGxheWJhY2tDb250cm9sbGVyO1xyXG4gICAgY29uc3QgZXZlbnRCdXMgPSBjb25maWcuZXZlbnRCdXM7XHJcbiAgICBjb25zdCBwcm90ZWN0aW9uQ29udHJvbGxlciA9IGNvbmZpZy5wcm90ZWN0aW9uQ29udHJvbGxlcjtcclxuICAgIGNvbnN0IElTT0JveGVyID0gY29uZmlnLklTT0JveGVyO1xyXG4gICAgY29uc3QgZGVidWcgPSBjb25maWcuZGVidWc7XHJcbiAgICBsZXQgbXNzRnJhZ21lbnRNb292UHJvY2Vzc29yLFxyXG4gICAgICAgIG1zc0ZyYWdtZW50TW9vZlByb2Nlc3NvcixcclxuICAgICAgICBpbnN0YW5jZTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgICAgICBJU09Cb3hlci5hZGRCb3hQcm9jZXNzb3IoJ3V1aWQnLCB1dWlkUHJvY2Vzc29yKTtcclxuICAgICAgICBJU09Cb3hlci5hZGRCb3hQcm9jZXNzb3IoJ3NhaW8nLCBzYWlvUHJvY2Vzc29yKTtcclxuICAgICAgICBJU09Cb3hlci5hZGRCb3hQcm9jZXNzb3IoJ3NhaXonLCBzYWl6UHJvY2Vzc29yKTtcclxuICAgICAgICBJU09Cb3hlci5hZGRCb3hQcm9jZXNzb3IoJ3NlbmMnLCBzZW5jUHJvY2Vzc29yKTtcclxuXHJcbiAgICAgICAgbXNzRnJhZ21lbnRNb292UHJvY2Vzc29yID0gTXNzRnJhZ21lbnRNb292UHJvY2Vzc29yKGNvbnRleHQpLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIHByb3RlY3Rpb25Db250cm9sbGVyOiBwcm90ZWN0aW9uQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29uc3RhbnRzOiBjb25maWcuY29uc3RhbnRzLFxyXG4gICAgICAgICAgICBJU09Cb3hlcjogSVNPQm94ZXJ9KTtcclxuXHJcbiAgICAgICAgbXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yID0gTXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yKGNvbnRleHQpLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIGRhc2hNZXRyaWNzOiBkYXNoTWV0cmljcyxcclxuICAgICAgICAgICAgcGxheWJhY2tDb250cm9sbGVyOiBwbGF5YmFja0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIElTT0JveGVyOiBJU09Cb3hlcixcclxuICAgICAgICAgICAgZXZlbnRCdXM6IGV2ZW50QnVzLFxyXG4gICAgICAgICAgICBkZWJ1ZzogZGVidWcsXHJcbiAgICAgICAgICAgIGVyckhhbmRsZXI6IGNvbmZpZy5lcnJIYW5kbGVyXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVNb292KHJlcCkge1xyXG4gICAgICAgIHJldHVybiBtc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3IuZ2VuZXJhdGVNb292KHJlcCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0ZyYWdtZW50KGUsIHN0cmVhbVByb2Nlc3Nvcikge1xyXG4gICAgICAgIGlmICghZSB8fCAhZS5yZXF1ZXN0IHx8ICFlLnJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZSBwYXJhbWV0ZXIgaXMgbWlzc2luZyBvciBtYWxmb3JtZWQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLnJlcXVlc3QudHlwZSA9PT0gJ01lZGlhU2VnbWVudCcpIHtcclxuICAgICAgICAgICAgLy8gTWVkaWFTZWdtZW50ID0+IGNvbnZlcnQgdG8gU21vb3RoIFN0cmVhbWluZyBtb29mIGZvcm1hdFxyXG4gICAgICAgICAgICBtc3NGcmFnbWVudE1vb2ZQcm9jZXNzb3IuY29udmVydEZyYWdtZW50KGUsIHN0cmVhbVByb2Nlc3Nvcik7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoZS5yZXF1ZXN0LnR5cGUgPT09ICdGcmFnbWVudEluZm9TZWdtZW50Jykge1xyXG4gICAgICAgICAgICAvLyBGcmFnbWVudEluZm8gKGxpdmUpID0+IHVwZGF0ZSBzZWdtZW50cyBsaXN0XHJcbiAgICAgICAgICAgIG1zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvci51cGRhdGVTZWdtZW50TGlzdChlLCBzdHJlYW1Qcm9jZXNzb3IpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3RvcCBldmVudCBwcm9wYWdhdGlvbiAoRnJhZ21lbnRJbmZvIG11c3Qgbm90IGJlIGFkZGVkIHRvIGJ1ZmZlcilcclxuICAgICAgICAgICAgZS5zZW5kZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpbnN0YW5jZSA9IHtcclxuICAgICAgICBnZW5lcmF0ZU1vb3Y6IGdlbmVyYXRlTW9vdixcclxuICAgICAgICBwcm9jZXNzRnJhZ21lbnQ6IHByb2Nlc3NGcmFnbWVudFxyXG4gICAgfTtcclxuXHJcbiAgICBzZXR1cCgpO1xyXG5cclxuICAgIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG5cclxuTXNzRnJhZ21lbnRQcm9jZXNzb3IuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ01zc0ZyYWdtZW50UHJvY2Vzc29yJztcclxuZXhwb3J0IGRlZmF1bHQgZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRDbGFzc0ZhY3RvcnkoTXNzRnJhZ21lbnRQcm9jZXNzb3IpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cclxuIiwiLyoqXHJcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXHJcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxyXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXHJcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcclxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXHJcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxyXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXHJcbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xyXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxyXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXHJcbiAqXHJcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcclxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcclxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cclxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXHJcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXHJcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXHJcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcclxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcclxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXHJcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuICovXHJcblxyXG5pbXBvcnQgRGF0YUNodW5rIGZyb20gJy4uL3N0cmVhbWluZy92by9EYXRhQ2h1bmsnO1xyXG5pbXBvcnQgRnJhZ21lbnRSZXF1ZXN0IGZyb20gJy4uL3N0cmVhbWluZy92by9GcmFnbWVudFJlcXVlc3QnO1xyXG5pbXBvcnQgTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlciBmcm9tICcuL01zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgTXNzRnJhZ21lbnRQcm9jZXNzb3IgZnJvbSAnLi9Nc3NGcmFnbWVudFByb2Nlc3Nvcic7XHJcbmltcG9ydCBNc3NQYXJzZXIgZnJvbSAnLi9wYXJzZXIvTXNzUGFyc2VyJztcclxuaW1wb3J0IE1zc0Vycm9ycyBmcm9tICcuL2Vycm9ycy9Nc3NFcnJvcnMnO1xyXG5pbXBvcnQgRGFzaEpTRXJyb3IgZnJvbSAnLi4vc3RyZWFtaW5nL3ZvL0Rhc2hKU0Vycm9yJztcclxuaW1wb3J0IEluaXRDYWNoZSBmcm9tICcuLi9zdHJlYW1pbmcvdXRpbHMvSW5pdENhY2hlJztcclxuXHJcbmZ1bmN0aW9uIE1zc0hhbmRsZXIoY29uZmlnKSB7XHJcblxyXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xyXG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuY29udGV4dDtcclxuICAgIGNvbnN0IGV2ZW50QnVzID0gY29uZmlnLmV2ZW50QnVzO1xyXG4gICAgY29uc3QgZXZlbnRzID0gY29uZmlnLmV2ZW50cztcclxuICAgIGNvbnN0IGNvbnN0YW50cyA9IGNvbmZpZy5jb25zdGFudHM7XHJcbiAgICBjb25zdCBpbml0U2VnbWVudFR5cGUgPSBjb25maWcuaW5pdFNlZ21lbnRUeXBlO1xyXG4gICAgY29uc3QgZGFzaE1ldHJpY3MgPSBjb25maWcuZGFzaE1ldHJpY3M7XHJcbiAgICBjb25zdCBwbGF5YmFja0NvbnRyb2xsZXIgPSBjb25maWcucGxheWJhY2tDb250cm9sbGVyO1xyXG4gICAgY29uc3Qgc3RyZWFtQ29udHJvbGxlciA9IGNvbmZpZy5zdHJlYW1Db250cm9sbGVyO1xyXG4gICAgY29uc3QgcHJvdGVjdGlvbkNvbnRyb2xsZXIgPSBjb25maWcucHJvdGVjdGlvbkNvbnRyb2xsZXI7XHJcbiAgICBjb25zdCBtc3NGcmFnbWVudFByb2Nlc3NvciA9IE1zc0ZyYWdtZW50UHJvY2Vzc29yKGNvbnRleHQpLmNyZWF0ZSh7XHJcbiAgICAgICAgZGFzaE1ldHJpY3M6IGRhc2hNZXRyaWNzLFxyXG4gICAgICAgIHBsYXliYWNrQ29udHJvbGxlcjogcGxheWJhY2tDb250cm9sbGVyLFxyXG4gICAgICAgIHByb3RlY3Rpb25Db250cm9sbGVyOiBwcm90ZWN0aW9uQ29udHJvbGxlcixcclxuICAgICAgICBzdHJlYW1Db250cm9sbGVyOiBzdHJlYW1Db250cm9sbGVyLFxyXG4gICAgICAgIGV2ZW50QnVzOiBldmVudEJ1cyxcclxuICAgICAgICBjb25zdGFudHM6IGNvbnN0YW50cyxcclxuICAgICAgICBJU09Cb3hlcjogY29uZmlnLklTT0JveGVyLFxyXG4gICAgICAgIGRlYnVnOiBjb25maWcuZGVidWcsXHJcbiAgICAgICAgZXJySGFuZGxlcjogY29uZmlnLmVyckhhbmRsZXJcclxuICAgIH0pO1xyXG4gICAgbGV0IG1zc1BhcnNlcixcclxuICAgICAgICBmcmFnbWVudEluZm9Db250cm9sbGVycyxcclxuICAgICAgICBpbml0Q2FjaGUsXHJcbiAgICAgICAgaW5zdGFuY2U7XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAgICAgICAgZnJhZ21lbnRJbmZvQ29udHJvbGxlcnMgPSBbXTtcclxuICAgICAgICBpbml0Q2FjaGUgPSBJbml0Q2FjaGUoY29udGV4dCkuZ2V0SW5zdGFuY2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTdHJlYW1Qcm9jZXNzb3IodHlwZSkge1xyXG4gICAgICAgIHJldHVybiBzdHJlYW1Db250cm9sbGVyLmdldEFjdGl2ZVN0cmVhbVByb2Nlc3NvcnMoKS5maWx0ZXIocHJvY2Vzc29yID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3Nvci5nZXRUeXBlKCkgPT09IHR5cGU7XHJcbiAgICAgICAgfSlbMF07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RnJhZ21lbnRJbmZvQ29udHJvbGxlcih0eXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZyYWdtZW50SW5mb0NvbnRyb2xsZXJzLmZpbHRlcihjb250cm9sbGVyID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChjb250cm9sbGVyLmdldFR5cGUoKSA9PT0gdHlwZSk7XHJcbiAgICAgICAgfSlbMF07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlRGF0YUNodW5rKHJlcXVlc3QsIHN0cmVhbUlkLCBlbmRGcmFnbWVudCkge1xyXG4gICAgICAgIGNvbnN0IGNodW5rID0gbmV3IERhdGFDaHVuaygpO1xyXG5cclxuICAgICAgICBjaHVuay5zdHJlYW1JZCA9IHN0cmVhbUlkO1xyXG4gICAgICAgIGNodW5rLm1lZGlhSW5mbyA9IHJlcXVlc3QubWVkaWFJbmZvO1xyXG4gICAgICAgIGNodW5rLnNlZ21lbnRUeXBlID0gcmVxdWVzdC50eXBlO1xyXG4gICAgICAgIGNodW5rLnN0YXJ0ID0gcmVxdWVzdC5zdGFydFRpbWU7XHJcbiAgICAgICAgY2h1bmsuZHVyYXRpb24gPSByZXF1ZXN0LmR1cmF0aW9uO1xyXG4gICAgICAgIGNodW5rLmVuZCA9IGNodW5rLnN0YXJ0ICsgY2h1bmsuZHVyYXRpb247XHJcbiAgICAgICAgY2h1bmsuaW5kZXggPSByZXF1ZXN0LmluZGV4O1xyXG4gICAgICAgIGNodW5rLnF1YWxpdHkgPSByZXF1ZXN0LnF1YWxpdHk7XHJcbiAgICAgICAgY2h1bmsucmVwcmVzZW50YXRpb25JZCA9IHJlcXVlc3QucmVwcmVzZW50YXRpb25JZDtcclxuICAgICAgICBjaHVuay5lbmRGcmFnbWVudCA9IGVuZEZyYWdtZW50O1xyXG5cclxuICAgICAgICByZXR1cm4gY2h1bms7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc3RhcnRGcmFnbWVudEluZm9Db250cm9sbGVycygpIHtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIE1zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXJzIGZvciBlYWNoIFN0cmVhbVByb2Nlc3NvciBvZiBhY3RpdmUgc3RyZWFtIChvbmx5IGZvciBhdWRpbywgdmlkZW8gb3IgZnJhZ21lbnRlZFRleHQpXHJcbiAgICAgICAgbGV0IHByb2Nlc3NvcnMgPSBzdHJlYW1Db250cm9sbGVyLmdldEFjdGl2ZVN0cmVhbVByb2Nlc3NvcnMoKTtcclxuICAgICAgICBwcm9jZXNzb3JzLmZvckVhY2goZnVuY3Rpb24gKHByb2Nlc3Nvcikge1xyXG4gICAgICAgICAgICBpZiAocHJvY2Vzc29yLmdldFR5cGUoKSA9PT0gY29uc3RhbnRzLlZJREVPIHx8XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzb3IuZ2V0VHlwZSgpID09PSBjb25zdGFudHMuQVVESU8gfHxcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Nvci5nZXRUeXBlKCkgPT09IGNvbnN0YW50cy5GUkFHTUVOVEVEX1RFWFQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZnJhZ21lbnRJbmZvQ29udHJvbGxlciA9IGdldEZyYWdtZW50SW5mb0NvbnRyb2xsZXIocHJvY2Vzc29yLmdldFR5cGUoKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZyYWdtZW50SW5mb0NvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEluZm9Db250cm9sbGVyID0gTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlcihjb250ZXh0KS5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1Qcm9jZXNzb3I6IHByb2Nlc3NvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVVSTENvbnRyb2xsZXI6IGNvbmZpZy5iYXNlVVJMQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWc6IGNvbmZpZy5kZWJ1Z1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXIuaW5pdGlhbGl6ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXJzLnB1c2goZnJhZ21lbnRJbmZvQ29udHJvbGxlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEluZm9Db250cm9sbGVyLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdG9wRnJhZ21lbnRJbmZvQ29udHJvbGxlcnMoKSB7XHJcbiAgICAgICAgZnJhZ21lbnRJbmZvQ29udHJvbGxlcnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgICAgICAgYy5yZXNldCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXJzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25Jbml0RnJhZ21lbnROZWVkZWQoZSkge1xyXG4gICAgICAgIGxldCBzdHJlYW1Qcm9jZXNzb3IgPSBnZXRTdHJlYW1Qcm9jZXNzb3IoZS5zZW5kZXIuZ2V0VHlwZSgpKTtcclxuICAgICAgICBpZiAoIXN0cmVhbVByb2Nlc3NvcikgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgaW5pdCBzZWdtZW50IHJlcXVlc3RcclxuICAgICAgICBsZXQgcmVwcmVzZW50YXRpb25Db250cm9sbGVyID0gc3RyZWFtUHJvY2Vzc29yLmdldFJlcHJlc2VudGF0aW9uQ29udHJvbGxlcigpO1xyXG4gICAgICAgIGxldCByZXByZXNlbnRhdGlvbiA9IHJlcHJlc2VudGF0aW9uQ29udHJvbGxlci5nZXRDdXJyZW50UmVwcmVzZW50YXRpb24oKTtcclxuICAgICAgICBsZXQgbWVkaWFJbmZvID0gc3RyZWFtUHJvY2Vzc29yLmdldE1lZGlhSW5mbygpO1xyXG5cclxuICAgICAgICBsZXQgcmVxdWVzdCA9IG5ldyBGcmFnbWVudFJlcXVlc3QoKTtcclxuICAgICAgICByZXF1ZXN0Lm1lZGlhVHlwZSA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24udHlwZTtcclxuICAgICAgICByZXF1ZXN0LnR5cGUgPSBpbml0U2VnbWVudFR5cGU7XHJcbiAgICAgICAgcmVxdWVzdC5yYW5nZSA9IHJlcHJlc2VudGF0aW9uLnJhbmdlO1xyXG4gICAgICAgIHJlcXVlc3QucXVhbGl0eSA9IHJlcHJlc2VudGF0aW9uLmluZGV4O1xyXG4gICAgICAgIHJlcXVlc3QubWVkaWFJbmZvID0gbWVkaWFJbmZvO1xyXG4gICAgICAgIHJlcXVlc3QucmVwcmVzZW50YXRpb25JZCA9IHJlcHJlc2VudGF0aW9uLmlkO1xyXG5cclxuICAgICAgICBjb25zdCBjaHVuayA9IGNyZWF0ZURhdGFDaHVuayhyZXF1ZXN0LCBtZWRpYUluZm8uc3RyZWFtSW5mby5pZCwgZS50eXBlICE9PSBldmVudHMuRlJBR01FTlRfTE9BRElOR19QUk9HUkVTUyk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGluaXQgc2VnbWVudCAobW9vdilcclxuICAgICAgICAgICAgY2h1bmsuYnl0ZXMgPSBtc3NGcmFnbWVudFByb2Nlc3Nvci5nZW5lcmF0ZU1vb3YocmVwcmVzZW50YXRpb24pO1xyXG5cclxuICAgICAgICAgICAgLy8gTm90aWZ5IGluaXQgc2VnbWVudCBoYXMgYmVlbiBsb2FkZWRcclxuICAgICAgICAgICAgZXZlbnRCdXMudHJpZ2dlcihldmVudHMuSU5JVF9GUkFHTUVOVF9MT0FERUQsIHtcclxuICAgICAgICAgICAgICAgIGNodW5rOiBjaHVua1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5lcnJIYW5kbGVyLmVycm9yKG5ldyBEYXNoSlNFcnJvcihlLmNvZGUsIGUubWVzc2FnZSwgZS5kYXRhKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDaGFuZ2UgdGhlIHNlbmRlciB2YWx1ZSB0byBzdG9wIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWRcclxuICAgICAgICBlLnNlbmRlciA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25TZWdtZW50TWVkaWFMb2FkZWQoZSkge1xyXG4gICAgICAgIGlmIChlLmVycm9yKSAgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgc3RyZWFtUHJvY2Vzc29yID0gZ2V0U3RyZWFtUHJvY2Vzc29yKGUucmVxdWVzdC5tZWRpYVR5cGUpO1xyXG4gICAgICAgIGlmICghc3RyZWFtUHJvY2Vzc29yKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFByb2Nlc3MgbW9vZiB0byB0cmFuc2NvZGUgaXQgZnJvbSBNU1MgdG8gREFTSCAob3IgdG8gdXBkYXRlIHNlZ21lbnQgdGltZWxpbmUgZm9yIFNlZ21lbnRJbmZvIGZyYWdtZW50cylcclxuICAgICAgICBtc3NGcmFnbWVudFByb2Nlc3Nvci5wcm9jZXNzRnJhZ21lbnQoZSwgc3RyZWFtUHJvY2Vzc29yKTtcclxuXHJcbiAgICAgICAgaWYgKGUucmVxdWVzdC50eXBlID09PSAnRnJhZ21lbnRJbmZvU2VnbWVudCcpIHtcclxuICAgICAgICAgICAgLy8gSWYgRnJhZ21lbnRJbmZvIGxvYWRlZCwgdGhlbiBub3RpZnkgY29ycmVzcG9uZGluZyBNc3NGcmFnbWVudEluZm9Db250cm9sbGVyXHJcbiAgICAgICAgICAgIGxldCBmcmFnbWVudEluZm9Db250cm9sbGVyID0gZ2V0RnJhZ21lbnRJbmZvQ29udHJvbGxlcihlLnJlcXVlc3QubWVkaWFUeXBlKTtcclxuICAgICAgICAgICAgaWYgKGZyYWdtZW50SW5mb0NvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXIuZnJhZ21lbnRJbmZvTG9hZGVkKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdGFydCBNc3NGcmFnbWVudEluZm9Db250cm9sbGVycyBpbiBjYXNlIG9mIHN0YXJ0LW92ZXIgc3RyZWFtc1xyXG4gICAgICAgIGxldCBtYW5pZmVzdEluZm8gPSBlLnJlcXVlc3QubWVkaWFJbmZvLnN0cmVhbUluZm8ubWFuaWZlc3RJbmZvO1xyXG4gICAgICAgIGlmICghbWFuaWZlc3RJbmZvLmlzRHluYW1pYyAmJiBtYW5pZmVzdEluZm8uRFZSV2luZG93U2l6ZSAhPT0gSW5maW5pdHkpIHtcclxuICAgICAgICAgICAgc3RhcnRGcmFnbWVudEluZm9Db250cm9sbGVycygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvblBsYXliYWNrUGF1c2VkKCkge1xyXG4gICAgICAgIGlmIChwbGF5YmFja0NvbnRyb2xsZXIuZ2V0SXNEeW5hbWljKCkgJiYgcGxheWJhY2tDb250cm9sbGVyLmdldFRpbWUoKSAhPT0gMCkge1xyXG4gICAgICAgICAgICBzdGFydEZyYWdtZW50SW5mb0NvbnRyb2xsZXJzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG9uUGxheWJhY2tTZWVrQXNrZWQoKSB7XHJcbiAgICAgICAgaWYgKHBsYXliYWNrQ29udHJvbGxlci5nZXRJc0R5bmFtaWMoKSAmJiBwbGF5YmFja0NvbnRyb2xsZXIuZ2V0VGltZSgpICE9PSAwKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0RnJhZ21lbnRJbmZvQ29udHJvbGxlcnMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25UVE1MUHJlUHJvY2Vzcyh0dG1sU3VidGl0bGVzKSB7XHJcbiAgICAgICAgaWYgKCF0dG1sU3VidGl0bGVzIHx8ICF0dG1sU3VidGl0bGVzLmRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHRtbFN1YnRpdGxlcy5kYXRhID0gdHRtbFN1YnRpdGxlcy5kYXRhLnJlcGxhY2UoL2h0dHA6XFwvXFwvd3d3LnczLm9yZ1xcLzIwMDZcXC8xMFxcL3R0YWYxL2dpLCAnaHR0cDovL3d3dy53My5vcmcvbnMvdHRtbCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlZ2lzdGVyRXZlbnRzKCkge1xyXG4gICAgICAgIGV2ZW50QnVzLm9uKGV2ZW50cy5JTklUX0ZSQUdNRU5UX05FRURFRCwgb25Jbml0RnJhZ21lbnROZWVkZWQsIGluc3RhbmNlLCBkYXNoanMuRmFjdG9yeU1ha2VyLmdldFNpbmdsZXRvbkZhY3RvcnlCeU5hbWUoZXZlbnRCdXMuZ2V0Q2xhc3NOYW1lKCkpLkVWRU5UX1BSSU9SSVRZX0hJR0gpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cclxuICAgICAgICBldmVudEJ1cy5vbihldmVudHMuUExBWUJBQ0tfUEFVU0VELCBvblBsYXliYWNrUGF1c2VkLCBpbnN0YW5jZSwgZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRTaW5nbGV0b25GYWN0b3J5QnlOYW1lKGV2ZW50QnVzLmdldENsYXNzTmFtZSgpKS5FVkVOVF9QUklPUklUWV9ISUdIKTsgLyoganNoaW50IGlnbm9yZTpsaW5lICovXHJcbiAgICAgICAgZXZlbnRCdXMub24oZXZlbnRzLlBMQVlCQUNLX1NFRUtfQVNLRUQsIG9uUGxheWJhY2tTZWVrQXNrZWQsIGluc3RhbmNlLCBkYXNoanMuRmFjdG9yeU1ha2VyLmdldFNpbmdsZXRvbkZhY3RvcnlCeU5hbWUoZXZlbnRCdXMuZ2V0Q2xhc3NOYW1lKCkpLkVWRU5UX1BSSU9SSVRZX0hJR0gpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cclxuICAgICAgICBldmVudEJ1cy5vbihldmVudHMuRlJBR01FTlRfTE9BRElOR19DT01QTEVURUQsIG9uU2VnbWVudE1lZGlhTG9hZGVkLCBpbnN0YW5jZSwgZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRTaW5nbGV0b25GYWN0b3J5QnlOYW1lKGV2ZW50QnVzLmdldENsYXNzTmFtZSgpKS5FVkVOVF9QUklPUklUWV9ISUdIKTsgLyoganNoaW50IGlnbm9yZTpsaW5lICovXHJcbiAgICAgICAgZXZlbnRCdXMub24oZXZlbnRzLlRUTUxfVE9fUEFSU0UsIG9uVFRNTFByZVByb2Nlc3MsIGluc3RhbmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXNldCgpIHtcclxuICAgICAgICBpZiAobXNzUGFyc2VyKSB7XHJcbiAgICAgICAgICAgIG1zc1BhcnNlci5yZXNldCgpO1xyXG4gICAgICAgICAgICBtc3NQYXJzZXIgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBldmVudEJ1cy5vZmYoZXZlbnRzLklOSVRfRlJBR01FTlRfTkVFREVELCBvbkluaXRGcmFnbWVudE5lZWRlZCwgdGhpcyk7XHJcbiAgICAgICAgZXZlbnRCdXMub2ZmKGV2ZW50cy5QTEFZQkFDS19QQVVTRUQsIG9uUGxheWJhY2tQYXVzZWQsIHRoaXMpO1xyXG4gICAgICAgIGV2ZW50QnVzLm9mZihldmVudHMuUExBWUJBQ0tfU0VFS19BU0tFRCwgb25QbGF5YmFja1NlZWtBc2tlZCwgdGhpcyk7XHJcbiAgICAgICAgZXZlbnRCdXMub2ZmKGV2ZW50cy5GUkFHTUVOVF9MT0FESU5HX0NPTVBMRVRFRCwgb25TZWdtZW50TWVkaWFMb2FkZWQsIHRoaXMpO1xyXG4gICAgICAgIGV2ZW50QnVzLm9mZihldmVudHMuVFRNTF9UT19QQVJTRSwgb25UVE1MUHJlUHJvY2VzcywgdGhpcyk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IEZyYWdtZW50SW5mb0NvbnRyb2xsZXJzXHJcbiAgICAgICAgc3RvcEZyYWdtZW50SW5mb0NvbnRyb2xsZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlTXNzUGFyc2VyKCkge1xyXG4gICAgICAgIG1zc1BhcnNlciA9IE1zc1BhcnNlcihjb250ZXh0KS5jcmVhdGUoY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gbXNzUGFyc2VyO1xyXG4gICAgfVxyXG5cclxuICAgIGluc3RhbmNlID0ge1xyXG4gICAgICAgIHJlc2V0OiByZXNldCxcclxuICAgICAgICBjcmVhdGVNc3NQYXJzZXI6IGNyZWF0ZU1zc1BhcnNlcixcclxuICAgICAgICByZWdpc3RlckV2ZW50czogcmVnaXN0ZXJFdmVudHNcclxuICAgIH07XHJcblxyXG4gICAgc2V0dXAoKTtcclxuXHJcbiAgICByZXR1cm4gaW5zdGFuY2U7XHJcbn1cclxuXHJcbk1zc0hhbmRsZXIuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ01zc0hhbmRsZXInO1xyXG5jb25zdCBmYWN0b3J5ID0gZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRDbGFzc0ZhY3RvcnkoTXNzSGFuZGxlcik7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xyXG5mYWN0b3J5LmVycm9ycyA9IE1zc0Vycm9ycztcclxuZGFzaGpzLkZhY3RvcnlNYWtlci51cGRhdGVDbGFzc0ZhY3RvcnkoTXNzSGFuZGxlci5fX2Rhc2hqc19mYWN0b3J5X25hbWUsIGZhY3RvcnkpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cclxuZXhwb3J0IGRlZmF1bHQgZmFjdG9yeTsgLyoganNoaW50IGlnbm9yZTpsaW5lICovXHJcbiIsIi8qKlxyXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxyXG4gKiBpbmNsdWRlZCBiZWxvdy4gVGhpcyBzb2Z0d2FyZSBtYXkgYmUgc3ViamVjdCB0byBvdGhlciB0aGlyZCBwYXJ0eSBhbmQgY29udHJpYnV0b3JcclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDEzLCBEYXNoIEluZHVzdHJ5IEZvcnVtLlxyXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKlxyXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxyXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XHJcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xyXG4gKiAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXHJcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcclxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXHJcbiAqICBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxyXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcclxuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcclxuICogIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxyXG4gKlxyXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXHJcbiAqICBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXHJcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXHJcbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxyXG4gKiAgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVFxyXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxyXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXHJcbiAqICBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXHJcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxyXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcbiAqL1xyXG5pbXBvcnQgRXJyb3JzQmFzZSBmcm9tICcuLi8uLi9jb3JlL2Vycm9ycy9FcnJvcnNCYXNlJztcclxuLyoqXHJcbiAqIEBjbGFzc1xyXG4gKlxyXG4gKi9cclxuY2xhc3MgTXNzRXJyb3JzIGV4dGVuZHMgRXJyb3JzQmFzZSB7XHJcblx0Y29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXJyb3IgY29kZSByZXR1cm5lZCB3aGVuIG5vIHRmcmYgYm94IGlzIGRldGVjdGVkIGluIE1TUyBsaXZlIHN0cmVhbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuTVNTX05PX1RGUkZfQ09ERSA9IDIwMDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXJyb3IgY29kZSByZXR1cm5lZCB3aGVuIG9uZSBvZiB0aGUgY29kZWNzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0IGlzIG5vdCBzdXBwb3J0ZWRcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLk1TU19VTlNVUFBPUlRFRF9DT0RFQ19DT0RFID0gMjAxO1xyXG5cclxuICAgICAgICB0aGlzLk1TU19OT19URlJGX01FU1NBR0UgPSAnTWlzc2luZyB0ZnJmIGluIGxpdmUgbWVkaWEgc2VnbWVudCc7XHJcbiAgICAgICAgdGhpcy5NU1NfVU5TVVBQT1JURURfQ09ERUNfTUVTU0FHRSA9ICdVbnN1cHBvcnRlZCBjb2RlYyc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBtc3NFcnJvcnMgPSBuZXcgTXNzRXJyb3JzKCk7XHJcbmV4cG9ydCBkZWZhdWx0IG1zc0Vycm9yczsiLCIvKipcclxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcclxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXHJcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcclxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcclxuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxyXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXHJcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXHJcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxyXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxyXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxyXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcclxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcclxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcclxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxyXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxyXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcclxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuXHJcbmltcG9ydCBNc3NIYW5kbGVyIGZyb20gJy4vTXNzSGFuZGxlcic7XHJcblxyXG4vLyBTaG92ZSBib3RoIG9mIHRoZXNlIGludG8gdGhlIGdsb2JhbCBzY29wZVxyXG52YXIgY29udGV4dCA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cpIHx8IGdsb2JhbDtcclxuXHJcbnZhciBkYXNoanMgPSBjb250ZXh0LmRhc2hqcztcclxuaWYgKCFkYXNoanMpIHtcclxuICAgIGRhc2hqcyA9IGNvbnRleHQuZGFzaGpzID0ge307XHJcbn1cclxuXHJcbmRhc2hqcy5Nc3NIYW5kbGVyID0gTXNzSGFuZGxlcjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRhc2hqcztcclxuZXhwb3J0IHsgTXNzSGFuZGxlciB9O1xyXG4iLCIvKipcclxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcclxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXHJcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcclxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcclxuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxyXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXHJcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXHJcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxyXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxyXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxyXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcclxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcclxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcclxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxyXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxyXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcclxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAbW9kdWxlIE1zc1BhcnNlclxyXG4gKiBAaWdub3JlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgb2JqZWN0XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJpZ0ludCBmcm9tICcuLi8uLi8uLi9leHRlcm5hbHMvQmlnSW50ZWdlcic7XHJcblxyXG5mdW5jdGlvbiBNc3NQYXJzZXIoY29uZmlnKSB7XHJcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XHJcbiAgICBjb25zdCBCQVNFNjQgPSBjb25maWcuQkFTRTY0O1xyXG4gICAgY29uc3QgZGVidWcgPSBjb25maWcuZGVidWc7XHJcbiAgICBjb25zdCBjb25zdGFudHMgPSBjb25maWcuY29uc3RhbnRzO1xyXG4gICAgY29uc3QgbWFuaWZlc3RNb2RlbCA9IGNvbmZpZy5tYW5pZmVzdE1vZGVsO1xyXG4gICAgY29uc3QgbWVkaWFQbGF5ZXJNb2RlbCA9IGNvbmZpZy5tZWRpYVBsYXllck1vZGVsO1xyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBjb25maWcuc2V0dGluZ3M7XHJcblxyXG4gICAgY29uc3QgREVGQVVMVF9USU1FX1NDQUxFID0gMTAwMDAwMDAuMDtcclxuICAgIGNvbnN0IFNVUFBPUlRFRF9DT0RFQ1MgPSBbJ0FBQycsICdBQUNMJywgJ0FWQzEnLCAnSDI2NCcsICdUVE1MJywgJ0RGWFAnXTtcclxuICAgIC8vIE1QRUctREFTSCBSb2xlIGFuZCBhY2Nlc3NpYmlsaXR5IG1hcHBpbmcgZm9yIHRleHQgdHJhY2tzIGFjY29yZGluZyB0byBFVFNJIFRTIDEwMyAyODUgdjEuMS4xIChzZWN0aW9uIDcuMS4yKVxyXG4gICAgY29uc3QgUk9MRSA9IHtcclxuICAgICAgICAnQ0FQVCc6ICdtYWluJyxcclxuICAgICAgICAnU1VCVCc6ICdhbHRlcm5hdGUnLFxyXG4gICAgICAgICdERVNDJzogJ21haW4nXHJcbiAgICB9O1xyXG4gICAgY29uc3QgQUNDRVNTSUJJTElUWSA9IHtcclxuICAgICAgICAnREVTQyc6ICcyJ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHNhbXBsaW5nRnJlcXVlbmN5SW5kZXggPSB7XHJcbiAgICAgICAgOTYwMDA6IDB4MCxcclxuICAgICAgICA4ODIwMDogMHgxLFxyXG4gICAgICAgIDY0MDAwOiAweDIsXHJcbiAgICAgICAgNDgwMDA6IDB4MyxcclxuICAgICAgICA0NDEwMDogMHg0LFxyXG4gICAgICAgIDMyMDAwOiAweDUsXHJcbiAgICAgICAgMjQwMDA6IDB4NixcclxuICAgICAgICAyMjA1MDogMHg3LFxyXG4gICAgICAgIDE2MDAwOiAweDgsXHJcbiAgICAgICAgMTIwMDA6IDB4OSxcclxuICAgICAgICAxMTAyNTogMHhBLFxyXG4gICAgICAgIDgwMDA6IDB4QixcclxuICAgICAgICA3MzUwOiAweENcclxuICAgIH07XHJcbiAgICBjb25zdCBtaW1lVHlwZU1hcCA9IHtcclxuICAgICAgICAndmlkZW8nOiAndmlkZW8vbXA0JyxcclxuICAgICAgICAnYXVkaW8nOiAnYXVkaW8vbXA0JyxcclxuICAgICAgICAndGV4dCc6ICdhcHBsaWNhdGlvbi9tcDQnXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBpbnN0YW5jZSxcclxuICAgICAgICBsb2dnZXIsXHJcbiAgICAgICAgaW5pdGlhbEJ1ZmZlclNldHRpbmdzO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgICAgICBsb2dnZXIgPSBkZWJ1Zy5nZXRMb2dnZXIoaW5zdGFuY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1hcFBlcmlvZChzbW9vdGhTdHJlYW1pbmdNZWRpYSwgdGltZXNjYWxlKSB7XHJcbiAgICAgICAgY29uc3QgcGVyaW9kID0ge307XHJcbiAgICAgICAgbGV0IHN0cmVhbXMsXHJcbiAgICAgICAgICAgIGFkYXB0YXRpb247XHJcblxyXG4gICAgICAgIC8vIEZvciBlYWNoIFN0cmVhbUluZGV4IG5vZGUsIGNyZWF0ZSBhbiBBZGFwdGF0aW9uU2V0IGVsZW1lbnRcclxuICAgICAgICBwZXJpb2QuQWRhcHRhdGlvblNldF9hc0FycmF5ID0gW107XHJcbiAgICAgICAgc3RyZWFtcyA9IHNtb290aFN0cmVhbWluZ01lZGlhLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdTdHJlYW1JbmRleCcpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyZWFtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBhZGFwdGF0aW9uID0gbWFwQWRhcHRhdGlvblNldChzdHJlYW1zW2ldLCB0aW1lc2NhbGUpO1xyXG4gICAgICAgICAgICBpZiAoYWRhcHRhdGlvbiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheS5wdXNoKGFkYXB0YXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHBlcmlvZC5BZGFwdGF0aW9uU2V0ID0gKHBlcmlvZC5BZGFwdGF0aW9uU2V0X2FzQXJyYXkubGVuZ3RoID4gMSkgPyBwZXJpb2QuQWRhcHRhdGlvblNldF9hc0FycmF5IDogcGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheVswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwZXJpb2Q7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWFwQWRhcHRhdGlvblNldChzdHJlYW1JbmRleCwgdGltZXNjYWxlKSB7XHJcbiAgICAgICAgY29uc3QgYWRhcHRhdGlvblNldCA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHJlcHJlc2VudGF0aW9ucyA9IFtdO1xyXG4gICAgICAgIGxldCBzZWdtZW50VGVtcGxhdGU7XHJcbiAgICAgICAgbGV0IHF1YWxpdHlMZXZlbHMsXHJcbiAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLFxyXG4gICAgICAgICAgICBzZWdtZW50cyxcclxuICAgICAgICAgICAgaTtcclxuXHJcbiAgICAgICAgY29uc3QgbmFtZSA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnTmFtZScpO1xyXG4gICAgICAgIGNvbnN0IHR5cGUgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ1R5cGUnKTtcclxuICAgICAgICBjb25zdCBsYW5nID0gc3RyZWFtSW5kZXguZ2V0QXR0cmlidXRlKCdMYW5ndWFnZScpO1xyXG4gICAgICAgIGNvbnN0IGZhbGxCYWNrSWQgPSBsYW5nID8gdHlwZSArICdfJyArIGxhbmcgOiB0eXBlO1xyXG5cclxuICAgICAgICBhZGFwdGF0aW9uU2V0LmlkID0gbmFtZSB8fCBmYWxsQmFja0lkO1xyXG4gICAgICAgIGFkYXB0YXRpb25TZXQuY29udGVudFR5cGUgPSB0eXBlO1xyXG4gICAgICAgIGFkYXB0YXRpb25TZXQubGFuZyA9IGxhbmcgfHwgJ3VuZCc7XHJcbiAgICAgICAgYWRhcHRhdGlvblNldC5taW1lVHlwZSA9IG1pbWVUeXBlTWFwW3R5cGVdO1xyXG4gICAgICAgIGFkYXB0YXRpb25TZXQuc3ViVHlwZSA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnU3VidHlwZScpO1xyXG4gICAgICAgIGFkYXB0YXRpb25TZXQubWF4V2lkdGggPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ01heFdpZHRoJyk7XHJcbiAgICAgICAgYWRhcHRhdGlvblNldC5tYXhIZWlnaHQgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ01heEhlaWdodCcpO1xyXG5cclxuICAgICAgICAvLyBNYXAgdGV4dCB0cmFja3Mgc3ViVHlwZXMgdG8gTVBFRy1EQVNIIEFkYXB0YXRpb25TZXQgcm9sZSBhbmQgYWNjZXNzaWJpbGl0eSAoc2VlIEVUU0kgVFMgMTAzIDI4NSB2MS4xLjEsIHNlY3Rpb24gNy4xLjIpXHJcbiAgICAgICAgaWYgKGFkYXB0YXRpb25TZXQuc3ViVHlwZSkge1xyXG4gICAgICAgICAgICBpZiAoUk9MRVthZGFwdGF0aW9uU2V0LnN1YlR5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcm9sZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzY2hlbWVJZFVyaTogJ3VybjptcGVnOmRhc2g6cm9sZToyMDExJyxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogUk9MRVthZGFwdGF0aW9uU2V0LnN1YlR5cGVdXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYWRhcHRhdGlvblNldC5Sb2xlID0gcm9sZTtcclxuICAgICAgICAgICAgICAgIGFkYXB0YXRpb25TZXQuUm9sZV9hc0FycmF5ID0gW3JvbGVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChBQ0NFU1NJQklMSVRZW2FkYXB0YXRpb25TZXQuc3ViVHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGxldCBhY2Nlc3NpYmlsaXR5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjaGVtZUlkVXJpOiAndXJuOnR2YTptZXRhZGF0YTpjczpBdWRpb1B1cnBvc2VDUzoyMDA3JyxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogQUNDRVNTSUJJTElUWVthZGFwdGF0aW9uU2V0LnN1YlR5cGVdXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYWRhcHRhdGlvblNldC5BY2Nlc3NpYmlsaXR5ID0gYWNjZXNzaWJpbGl0eTtcclxuICAgICAgICAgICAgICAgIGFkYXB0YXRpb25TZXQuQWNjZXNzaWJpbGl0eV9hc0FycmF5ID0gW2FjY2Vzc2liaWxpdHldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSBTZWdtZW50VGVtcGxhdGUgd2l0aCBhIFNlZ21lbnRUaW1lbGluZVxyXG4gICAgICAgIHNlZ21lbnRUZW1wbGF0ZSA9IG1hcFNlZ21lbnRUZW1wbGF0ZShzdHJlYW1JbmRleCwgdGltZXNjYWxlKTtcclxuXHJcbiAgICAgICAgcXVhbGl0eUxldmVscyA9IHN0cmVhbUluZGV4LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdRdWFsaXR5TGV2ZWwnKTtcclxuICAgICAgICAvLyBGb3IgZWFjaCBRdWFsaXR5TGV2ZWwgbm9kZSwgY3JlYXRlIGEgUmVwcmVzZW50YXRpb24gZWxlbWVudFxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBxdWFsaXR5TGV2ZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vIFByb3BhZ2F0ZSBCYXNlVVJMIGFuZCBtaW1lVHlwZVxyXG4gICAgICAgICAgICBxdWFsaXR5TGV2ZWxzW2ldLkJhc2VVUkwgPSBhZGFwdGF0aW9uU2V0LkJhc2VVUkw7XHJcbiAgICAgICAgICAgIHF1YWxpdHlMZXZlbHNbaV0ubWltZVR5cGUgPSBhZGFwdGF0aW9uU2V0Lm1pbWVUeXBlO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHF1YWxpdHkgbGV2ZWwgaWRcclxuICAgICAgICAgICAgcXVhbGl0eUxldmVsc1tpXS5JZCA9IGFkYXB0YXRpb25TZXQuaWQgKyAnXycgKyBxdWFsaXR5TGV2ZWxzW2ldLmdldEF0dHJpYnV0ZSgnSW5kZXgnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1hcCBSZXByZXNlbnRhdGlvbiB0byBRdWFsaXR5TGV2ZWxcclxuICAgICAgICAgICAgcmVwcmVzZW50YXRpb24gPSBtYXBSZXByZXNlbnRhdGlvbihxdWFsaXR5TGV2ZWxzW2ldLCBzdHJlYW1JbmRleCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVwcmVzZW50YXRpb24gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIENvcHkgU2VnbWVudFRlbXBsYXRlIGludG8gUmVwcmVzZW50YXRpb25cclxuICAgICAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLlNlZ21lbnRUZW1wbGF0ZSA9IHNlZ21lbnRUZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXByZXNlbnRhdGlvbnMucHVzaChyZXByZXNlbnRhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZXByZXNlbnRhdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWRhcHRhdGlvblNldC5SZXByZXNlbnRhdGlvbiA9IChyZXByZXNlbnRhdGlvbnMubGVuZ3RoID4gMSkgPyByZXByZXNlbnRhdGlvbnMgOiByZXByZXNlbnRhdGlvbnNbMF07XHJcbiAgICAgICAgYWRhcHRhdGlvblNldC5SZXByZXNlbnRhdGlvbl9hc0FycmF5ID0gcmVwcmVzZW50YXRpb25zO1xyXG5cclxuICAgICAgICAvLyBTZXQgU2VnbWVudFRlbXBsYXRlXHJcbiAgICAgICAgYWRhcHRhdGlvblNldC5TZWdtZW50VGVtcGxhdGUgPSBzZWdtZW50VGVtcGxhdGU7XHJcblxyXG4gICAgICAgIHNlZ21lbnRzID0gc2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5TX2FzQXJyYXk7XHJcblxyXG4gICAgICAgIHJldHVybiBhZGFwdGF0aW9uU2V0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1hcFJlcHJlc2VudGF0aW9uKHF1YWxpdHlMZXZlbCwgc3RyZWFtSW5kZXgpIHtcclxuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHR5cGUgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ1R5cGUnKTtcclxuICAgICAgICBsZXQgZm91ckNDVmFsdWUgPSBudWxsO1xyXG5cclxuICAgICAgICByZXByZXNlbnRhdGlvbi5pZCA9IHF1YWxpdHlMZXZlbC5JZDtcclxuICAgICAgICByZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggPSBwYXJzZUludChxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdCaXRyYXRlJyksIDEwKTtcclxuICAgICAgICByZXByZXNlbnRhdGlvbi5taW1lVHlwZSA9IHF1YWxpdHlMZXZlbC5taW1lVHlwZTtcclxuICAgICAgICByZXByZXNlbnRhdGlvbi53aWR0aCA9IHBhcnNlSW50KHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ01heFdpZHRoJyksIDEwKTtcclxuICAgICAgICByZXByZXNlbnRhdGlvbi5oZWlnaHQgPSBwYXJzZUludChxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdNYXhIZWlnaHQnKSwgMTApO1xyXG5cclxuICAgICAgICBmb3VyQ0NWYWx1ZSA9IHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0ZvdXJDQycpO1xyXG5cclxuICAgICAgICAvLyBJZiBGb3VyQ0Mgbm90IGRlZmluZWQgYXQgUXVhbGl0eUxldmVsIGxldmVsLCB0aGVuIGdldCBpdCBmcm9tIFN0cmVhbUluZGV4IGxldmVsXHJcbiAgICAgICAgaWYgKGZvdXJDQ1ZhbHVlID09PSBudWxsIHx8IGZvdXJDQ1ZhbHVlID09PSAnJykge1xyXG4gICAgICAgICAgICBmb3VyQ0NWYWx1ZSA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnRm91ckNDJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBzdGlsbCBub3QgZGVmaW5lZCAob3B0aW9ubmFsIGZvciBhdWRpbyBzdHJlYW0sIHNlZSBodHRwczovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2ZmNzI4MTE2JTI4dj12cy45NSUyOS5hc3B4KSxcclxuICAgICAgICAvLyB0aGVuIHdlIGNvbnNpZGVyIHRoZSBzdHJlYW0gaXMgYW4gYXVkaW8gQUFDIHN0cmVhbVxyXG4gICAgICAgIGlmIChmb3VyQ0NWYWx1ZSA9PT0gbnVsbCB8fCBmb3VyQ0NWYWx1ZSA9PT0gJycpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IGNvbnN0YW50cy5BVURJTykge1xyXG4gICAgICAgICAgICAgICAgZm91ckNDVmFsdWUgPSAnQUFDJztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBjb25zdGFudHMuVklERU8pIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnRm91ckNDIGlzIG5vdCBkZWZpbmVkIHdoZXJlYXMgaXQgaXMgcmVxdWlyZWQgZm9yIGEgUXVhbGl0eUxldmVsIGVsZW1lbnQgZm9yIGEgU3RyZWFtSW5kZXggb2YgdHlwZSBcInZpZGVvXCInKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBjb2RlYyBpcyBzdXBwb3J0ZWRcclxuICAgICAgICBpZiAoU1VQUE9SVEVEX0NPREVDUy5pbmRleE9mKGZvdXJDQ1ZhbHVlLnRvVXBwZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAvLyBEbyBub3Qgc2VuZCB3YXJuaW5nXHJcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKCdDb2RlYyBub3Qgc3VwcG9ydGVkOiAnICsgZm91ckNDVmFsdWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdldCBjb2RlY3MgdmFsdWUgYWNjb3JkaW5nIHRvIEZvdXJDQyBmaWVsZFxyXG4gICAgICAgIGlmIChmb3VyQ0NWYWx1ZSA9PT0gJ0gyNjQnIHx8IGZvdXJDQ1ZhbHVlID09PSAnQVZDMScpIHtcclxuICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uY29kZWNzID0gZ2V0SDI2NENvZGVjKHF1YWxpdHlMZXZlbCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChmb3VyQ0NWYWx1ZS5pbmRleE9mKCdBQUMnKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLmNvZGVjcyA9IGdldEFBQ0NvZGVjKHF1YWxpdHlMZXZlbCwgZm91ckNDVmFsdWUpO1xyXG4gICAgICAgICAgICByZXByZXNlbnRhdGlvbi5hdWRpb1NhbXBsaW5nUmF0ZSA9IHBhcnNlSW50KHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ1NhbXBsaW5nUmF0ZScpLCAxMCk7XHJcbiAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLmF1ZGlvQ2hhbm5lbHMgPSBwYXJzZUludChxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdDaGFubmVscycpLCAxMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChmb3VyQ0NWYWx1ZS5pbmRleE9mKCdUVE1MJykgfHwgZm91ckNDVmFsdWUuaW5kZXhPZignREZYUCcpKSB7XHJcbiAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLmNvZGVjcyA9IGNvbnN0YW50cy5TVFBQO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVwcmVzZW50YXRpb24uY29kZWNQcml2YXRlRGF0YSA9ICcnICsgcXVhbGl0eUxldmVsLmdldEF0dHJpYnV0ZSgnQ29kZWNQcml2YXRlRGF0YScpO1xyXG4gICAgICAgIHJlcHJlc2VudGF0aW9uLkJhc2VVUkwgPSBxdWFsaXR5TGV2ZWwuQmFzZVVSTDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlcHJlc2VudGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEgyNjRDb2RlYyhxdWFsaXR5TGV2ZWwpIHtcclxuICAgICAgICBsZXQgY29kZWNQcml2YXRlRGF0YSA9IHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0NvZGVjUHJpdmF0ZURhdGEnKS50b1N0cmluZygpO1xyXG4gICAgICAgIGxldCBuYWxIZWFkZXIsXHJcbiAgICAgICAgICAgIGF2Y290aTtcclxuXHJcblxyXG4gICAgICAgIC8vIEV4dHJhY3QgZnJvbSB0aGUgQ29kZWNQcml2YXRlRGF0YSBmaWVsZCB0aGUgaGV4YWRlY2ltYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGZvbGxvd2luZ1xyXG4gICAgICAgIC8vIHRocmVlIGJ5dGVzIGluIHRoZSBzZXF1ZW5jZSBwYXJhbWV0ZXIgc2V0IE5BTCB1bml0LlxyXG4gICAgICAgIC8vID0+IEZpbmQgdGhlIFNQUyBuYWwgaGVhZGVyXHJcbiAgICAgICAgbmFsSGVhZGVyID0gLzAwMDAwMDAxWzAtOV03Ly5leGVjKGNvZGVjUHJpdmF0ZURhdGEpO1xyXG4gICAgICAgIC8vID0+IEZpbmQgdGhlIDYgY2hhcmFjdGVycyBhZnRlciB0aGUgU1BTIG5hbEhlYWRlciAoaWYgaXQgZXhpc3RzKVxyXG4gICAgICAgIGF2Y290aSA9IG5hbEhlYWRlciAmJiBuYWxIZWFkZXJbMF0gPyAoY29kZWNQcml2YXRlRGF0YS5zdWJzdHIoY29kZWNQcml2YXRlRGF0YS5pbmRleE9mKG5hbEhlYWRlclswXSkgKyAxMCwgNikpIDogdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICByZXR1cm4gJ2F2YzEuJyArIGF2Y290aTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRBQUNDb2RlYyhxdWFsaXR5TGV2ZWwsIGZvdXJDQ1ZhbHVlKSB7XHJcbiAgICAgICAgY29uc3Qgc2FtcGxpbmdSYXRlID0gcGFyc2VJbnQocXVhbGl0eUxldmVsLmdldEF0dHJpYnV0ZSgnU2FtcGxpbmdSYXRlJyksIDEwKTtcclxuICAgICAgICBsZXQgY29kZWNQcml2YXRlRGF0YSA9IHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0NvZGVjUHJpdmF0ZURhdGEnKS50b1N0cmluZygpO1xyXG4gICAgICAgIGxldCBvYmplY3RUeXBlID0gMDtcclxuICAgICAgICBsZXQgY29kZWNQcml2YXRlRGF0YUhleCxcclxuICAgICAgICAgICAgYXJyMTYsXHJcbiAgICAgICAgICAgIGluZGV4RnJlcSxcclxuICAgICAgICAgICAgZXh0ZW5zaW9uU2FtcGxpbmdGcmVxdWVuY3lJbmRleDtcclxuXHJcbiAgICAgICAgLy9jaHJvbWUgcHJvYmxlbSwgaW4gaW1wbGljaXQgQUFDIEhFIGRlZmluaXRpb24sIHNvIHdoZW4gQUFDSCBpcyBkZXRlY3RlZCBpbiBGb3VyQ0NcclxuICAgICAgICAvL3NldCBvYmplY3RUeXBlIHRvIDUgPT4gc3RyYW5nZSwgaXQgc2hvdWxkIGJlIDJcclxuICAgICAgICBpZiAoZm91ckNDVmFsdWUgPT09ICdBQUNIJykge1xyXG4gICAgICAgICAgICBvYmplY3RUeXBlID0gMHgwNTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9pZiBjb2RlY1ByaXZhdGVEYXRhIGlzIGVtcHR5LCBidWlsZCBpdCA6XHJcbiAgICAgICAgaWYgKGNvZGVjUHJpdmF0ZURhdGEgPT09IHVuZGVmaW5lZCB8fCBjb2RlY1ByaXZhdGVEYXRhID09PSAnJykge1xyXG4gICAgICAgICAgICBvYmplY3RUeXBlID0gMHgwMjsgLy9BQUMgTWFpbiBMb3cgQ29tcGxleGl0eSA9PiBvYmplY3QgVHlwZSA9IDJcclxuICAgICAgICAgICAgaW5kZXhGcmVxID0gc2FtcGxpbmdGcmVxdWVuY3lJbmRleFtzYW1wbGluZ1JhdGVdO1xyXG4gICAgICAgICAgICBpZiAoZm91ckNDVmFsdWUgPT09ICdBQUNIJykge1xyXG4gICAgICAgICAgICAgICAgLy8gNCBieXRlcyA6ICAgICBYWFhYWCAgICAgICAgIFhYWFggICAgICAgICAgWFhYWCAgICAgICAgICAgICBYWFhYICAgICAgICAgICAgICAgICAgWFhYWFggICAgICBYWFggICBYWFhYWFhYXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgJyBPYmplY3RUeXBlJyAnRnJlcSBJbmRleCcgJ0NoYW5uZWxzIHZhbHVlJyAgICdFeHRlbnMgU2FtcGwgRnJlcScgICdPYmplY3RUeXBlJyAgJ0dBUycgJ2FsaWdubWVudCA9IDAnXHJcbiAgICAgICAgICAgICAgICBvYmplY3RUeXBlID0gMHgwNTsgLy8gSGlnaCBFZmZpY2llbmN5IEFBQyBQcm9maWxlID0gb2JqZWN0IFR5cGUgPSA1IFNCUlxyXG4gICAgICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YSA9IG5ldyBVaW50OEFycmF5KDQpO1xyXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uU2FtcGxpbmdGcmVxdWVuY3lJbmRleCA9IHNhbXBsaW5nRnJlcXVlbmN5SW5kZXhbc2FtcGxpbmdSYXRlICogMl07IC8vIGluIEhFIEFBQyBFeHRlbnNpb24gU2FtcGxpbmcgZnJlcXVlbmNlXHJcbiAgICAgICAgICAgICAgICAvLyBlcXVhbHMgdG8gU2FtcGxpbmdSYXRlKjJcclxuICAgICAgICAgICAgICAgIC8vRnJlcSBJbmRleCBpcyBwcmVzZW50IGZvciAzIGJpdHMgaW4gdGhlIGZpcnN0IGJ5dGUsIGxhc3QgYml0IGlzIGluIHRoZSBzZWNvbmRcclxuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFbMF0gPSAob2JqZWN0VHlwZSA8PCAzKSB8IChpbmRleEZyZXEgPj4gMSk7XHJcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhWzFdID0gKGluZGV4RnJlcSA8PCA3KSB8IChxdWFsaXR5TGV2ZWwuQ2hhbm5lbHMgPDwgMykgfCAoZXh0ZW5zaW9uU2FtcGxpbmdGcmVxdWVuY3lJbmRleCA+PiAxKTtcclxuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFbMl0gPSAoZXh0ZW5zaW9uU2FtcGxpbmdGcmVxdWVuY3lJbmRleCA8PCA3KSB8ICgweDAyIDw8IDIpOyAvLyBvcmlnaW4gb2JqZWN0IHR5cGUgZXF1YWxzIHRvIDIgPT4gQUFDIE1haW4gTG93IENvbXBsZXhpdHlcclxuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFbM10gPSAweDA7IC8vYWxpZ25tZW50IGJpdHNcclxuXHJcbiAgICAgICAgICAgICAgICBhcnIxNiA9IG5ldyBVaW50MTZBcnJheSgyKTtcclxuICAgICAgICAgICAgICAgIGFycjE2WzBdID0gKGNvZGVjUHJpdmF0ZURhdGFbMF0gPDwgOCkgKyBjb2RlY1ByaXZhdGVEYXRhWzFdO1xyXG4gICAgICAgICAgICAgICAgYXJyMTZbMV0gPSAoY29kZWNQcml2YXRlRGF0YVsyXSA8PCA4KSArIGNvZGVjUHJpdmF0ZURhdGFbM107XHJcbiAgICAgICAgICAgICAgICAvL2NvbnZlcnQgZGVjaW1hbCB0byBoZXggdmFsdWVcclxuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFIZXggPSBhcnIxNlswXS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhSGV4ID0gYXJyMTZbMF0udG9TdHJpbmcoMTYpICsgYXJyMTZbMV0udG9TdHJpbmcoMTYpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIDIgYnl0ZXMgOiAgICAgWFhYWFggICAgICAgICBYWFhYICAgICAgICAgIFhYWFggICAgICAgICAgICAgIFhYWFxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICcgT2JqZWN0VHlwZScgJ0ZyZXEgSW5kZXgnICdDaGFubmVscyB2YWx1ZScgICAnR0FTID0gMDAwJ1xyXG4gICAgICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YSA9IG5ldyBVaW50OEFycmF5KDIpO1xyXG4gICAgICAgICAgICAgICAgLy9GcmVxIEluZGV4IGlzIHByZXNlbnQgZm9yIDMgYml0cyBpbiB0aGUgZmlyc3QgYnl0ZSwgbGFzdCBiaXQgaXMgaW4gdGhlIHNlY29uZFxyXG4gICAgICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YVswXSA9IChvYmplY3RUeXBlIDw8IDMpIHwgKGluZGV4RnJlcSA+PiAxKTtcclxuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFbMV0gPSAoaW5kZXhGcmVxIDw8IDcpIHwgKHBhcnNlSW50KHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0NoYW5uZWxzJyksIDEwKSA8PCAzKTtcclxuICAgICAgICAgICAgICAgIC8vIHB1dCB0aGUgMiBieXRlcyBpbiBhbiAxNiBiaXRzIGFycmF5XHJcbiAgICAgICAgICAgICAgICBhcnIxNiA9IG5ldyBVaW50MTZBcnJheSgxKTtcclxuICAgICAgICAgICAgICAgIGFycjE2WzBdID0gKGNvZGVjUHJpdmF0ZURhdGFbMF0gPDwgOCkgKyBjb2RlY1ByaXZhdGVEYXRhWzFdO1xyXG4gICAgICAgICAgICAgICAgLy9jb252ZXJ0IGRlY2ltYWwgdG8gaGV4IHZhbHVlXHJcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhSGV4ID0gYXJyMTZbMF0udG9TdHJpbmcoMTYpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhID0gJycgKyBjb2RlY1ByaXZhdGVEYXRhSGV4O1xyXG4gICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhID0gY29kZWNQcml2YXRlRGF0YS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgICBxdWFsaXR5TGV2ZWwuc2V0QXR0cmlidXRlKCdDb2RlY1ByaXZhdGVEYXRhJywgY29kZWNQcml2YXRlRGF0YSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChvYmplY3RUeXBlID09PSAwKSB7XHJcbiAgICAgICAgICAgIG9iamVjdFR5cGUgPSAocGFyc2VJbnQoY29kZWNQcml2YXRlRGF0YS5zdWJzdHIoMCwgMiksIDE2KSAmIDB4RjgpID4+IDM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJ21wNGEuNDAuJyArIG9iamVjdFR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWFwU2VnbWVudFRlbXBsYXRlKHN0cmVhbUluZGV4LCB0aW1lc2NhbGUpIHtcclxuICAgICAgICBjb25zdCBzZWdtZW50VGVtcGxhdGUgPSB7fTtcclxuICAgICAgICBsZXQgbWVkaWFVcmwsXHJcbiAgICAgICAgICAgIHN0cmVhbUluZGV4VGltZVNjYWxlLFxyXG4gICAgICAgICAgICB1cmw7XHJcblxyXG4gICAgICAgIHVybCA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnVXJsJyk7XHJcbiAgICAgICAgbWVkaWFVcmwgPSB1cmwgPyB1cmwucmVwbGFjZSgne2JpdHJhdGV9JywgJyRCYW5kd2lkdGgkJykgOiBudWxsO1xyXG4gICAgICAgIG1lZGlhVXJsID0gbWVkaWFVcmwgPyBtZWRpYVVybC5yZXBsYWNlKCd7c3RhcnQgdGltZX0nLCAnJFRpbWUkJykgOiBudWxsO1xyXG5cclxuICAgICAgICBzdHJlYW1JbmRleFRpbWVTY2FsZSA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnVGltZVNjYWxlJyk7XHJcbiAgICAgICAgc3RyZWFtSW5kZXhUaW1lU2NhbGUgPSBzdHJlYW1JbmRleFRpbWVTY2FsZSA/IHBhcnNlRmxvYXQoc3RyZWFtSW5kZXhUaW1lU2NhbGUpIDogdGltZXNjYWxlO1xyXG5cclxuICAgICAgICBzZWdtZW50VGVtcGxhdGUubWVkaWEgPSBtZWRpYVVybDtcclxuICAgICAgICBzZWdtZW50VGVtcGxhdGUudGltZXNjYWxlID0gc3RyZWFtSW5kZXhUaW1lU2NhbGU7XHJcblxyXG4gICAgICAgIHNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUgPSBtYXBTZWdtZW50VGltZWxpbmUoc3RyZWFtSW5kZXgsIHNlZ21lbnRUZW1wbGF0ZS50aW1lc2NhbGUpO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VnbWVudFRlbXBsYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1hcFNlZ21lbnRUaW1lbGluZShzdHJlYW1JbmRleCwgdGltZXNjYWxlKSB7XHJcbiAgICAgICAgY29uc3Qgc2VnbWVudFRpbWVsaW5lID0ge307XHJcbiAgICAgICAgY29uc3QgY2h1bmtzID0gc3RyZWFtSW5kZXguZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2MnKTtcclxuICAgICAgICBjb25zdCBzZWdtZW50cyA9IFtdO1xyXG4gICAgICAgIGxldCBzZWdtZW50LFxyXG4gICAgICAgICAgICBwcmV2U2VnbWVudCxcclxuICAgICAgICAgICAgdE1hbmlmZXN0LFxyXG4gICAgICAgICAgICBpLGoscjtcclxuICAgICAgICBsZXQgZHVyYXRpb24gPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHNlZ21lbnQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCB0aW1lICd0JyBhdHRyaWJ1dGUgdmFsdWVcclxuICAgICAgICAgICAgdE1hbmlmZXN0ID0gY2h1bmtzW2ldLmdldEF0dHJpYnV0ZSgndCcpO1xyXG5cclxuICAgICAgICAgICAgLy8gPT4gc2VnbWVudC50TWFuaWZlc3QgPSBvcmlnaW5hbCB0aW1lc3RhbXAgdmFsdWUgYXMgYSBzdHJpbmcgKGZvciBjb25zdHJ1Y3RpbmcgdGhlIGZyYWdtZW50IHJlcXVlc3QgdXJsLCBzZWUgRGFzaEhhbmRsZXIpXHJcbiAgICAgICAgICAgIC8vID0+IHNlZ21lbnQudCA9IG51bWJlciB2YWx1ZSBvZiB0aW1lc3RhbXAgKG1heWJlIHJvdW5kZWQgdmFsdWUsIGJ1dCBvbmx5IGZvciAwLjEgbWljcm9zZWNvbmQpXHJcbiAgICAgICAgICAgIGlmICh0TWFuaWZlc3QgJiYgQmlnSW50KHRNYW5pZmVzdCkuZ3JlYXRlcihCaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpKSkge1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudC50TWFuaWZlc3QgPSB0TWFuaWZlc3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VnbWVudC50ID0gcGFyc2VGbG9hdCh0TWFuaWZlc3QpO1xyXG5cclxuICAgICAgICAgICAgLy8gR2V0IGR1cmF0aW9uICdkJyBhdHRyaWJ1dGUgdmFsdWVcclxuICAgICAgICAgICAgc2VnbWVudC5kID0gcGFyc2VGbG9hdChjaHVua3NbaV0uZ2V0QXR0cmlidXRlKCdkJykpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgJ3QnIG5vdCBkZWZpbmVkIGZvciBmaXJzdCBzZWdtZW50IHRoZW4gdD0wXHJcbiAgICAgICAgICAgIGlmICgoaSA9PT0gMCkgJiYgIXNlZ21lbnQudCkge1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudC50ID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBwcmV2U2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIHByZXZpb3VzIHNlZ21lbnQgZHVyYXRpb24gaWYgbm90IGRlZmluZWRcclxuICAgICAgICAgICAgICAgIGlmICghcHJldlNlZ21lbnQuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2U2VnbWVudC50TWFuaWZlc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlNlZ21lbnQuZCA9IEJpZ0ludCh0TWFuaWZlc3QpLnN1YnRyYWN0KEJpZ0ludChwcmV2U2VnbWVudC50TWFuaWZlc3QpKS50b0pTTnVtYmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlNlZ21lbnQuZCA9IHNlZ21lbnQudCAtIHByZXZTZWdtZW50LnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uICs9IHByZXZTZWdtZW50LmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgc2VnbWVudCBhYnNvbHV0ZSB0aW1lc3RhbXAgaWYgbm90IHNldCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgaWYgKCFzZWdtZW50LnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlNlZ21lbnQudE1hbmlmZXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQudE1hbmlmZXN0ID0gQmlnSW50KHByZXZTZWdtZW50LnRNYW5pZmVzdCkuYWRkKEJpZ0ludChwcmV2U2VnbWVudC5kKSkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudC50ID0gcGFyc2VGbG9hdChzZWdtZW50LnRNYW5pZmVzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudC50ID0gcHJldlNlZ21lbnQudCArIHByZXZTZWdtZW50LmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VnbWVudC5kKSB7XHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiArPSBzZWdtZW50LmQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgc2VnbWVudFxyXG4gICAgICAgICAgICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3VwcG9ydCBmb3IgJ3InIGF0dHJpYnV0ZSAoaS5lLiBcInJlcGVhdFwiIGFzIGluIE1QRUctREFTSClcclxuICAgICAgICAgICAgciA9IHBhcnNlRmxvYXQoY2h1bmtzW2ldLmdldEF0dHJpYnV0ZSgncicpKTtcclxuICAgICAgICAgICAgaWYgKHIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgKHIgLSAxKTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldlNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICBzZWdtZW50ID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudC50ID0gcHJldlNlZ21lbnQudCArIHByZXZTZWdtZW50LmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudC5kID0gcHJldlNlZ21lbnQuZDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlNlZ21lbnQudE1hbmlmZXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQudE1hbmlmZXN0ICA9IEJpZ0ludChwcmV2U2VnbWVudC50TWFuaWZlc3QpLmFkZChCaWdJbnQocHJldlNlZ21lbnQuZCkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uICs9IHNlZ21lbnQuZDtcclxuICAgICAgICAgICAgICAgICAgICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWdtZW50VGltZWxpbmUuUyA9IHNlZ21lbnRzO1xyXG4gICAgICAgIHNlZ21lbnRUaW1lbGluZS5TX2FzQXJyYXkgPSBzZWdtZW50cztcclxuICAgICAgICBzZWdtZW50VGltZWxpbmUuZHVyYXRpb24gPSBkdXJhdGlvbiAvIHRpbWVzY2FsZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlZ21lbnRUaW1lbGluZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRLSURGcm9tUHJvdGVjdGlvbkhlYWRlcihwcm90ZWN0aW9uSGVhZGVyKSB7XHJcbiAgICAgICAgbGV0IHBySGVhZGVyLFxyXG4gICAgICAgICAgICB3cm1IZWFkZXIsXHJcbiAgICAgICAgICAgIHhtbFJlYWRlcixcclxuICAgICAgICAgICAgS0lEO1xyXG5cclxuICAgICAgICAvLyBHZXQgUGxheVJlYWR5IGhlYWRlciBhcyBieXRlIGFycmF5IChiYXNlNjQgZGVjb2RlZClcclxuICAgICAgICBwckhlYWRlciA9IEJBU0U2NC5kZWNvZGVBcnJheShwcm90ZWN0aW9uSGVhZGVyLmZpcnN0Q2hpbGQuZGF0YSk7XHJcblxyXG4gICAgICAgIC8vIEdldCBSaWdodCBNYW5hZ2VtZW50IGhlYWRlciAoV1JNSEVBREVSKSBmcm9tIFBsYXlSZWFkeSBoZWFkZXJcclxuICAgICAgICB3cm1IZWFkZXIgPSBnZXRXUk1IZWFkZXJGcm9tUFJIZWFkZXIocHJIZWFkZXIpO1xyXG5cclxuICAgICAgICBpZiAod3JtSGVhZGVyKSB7XHJcbiAgICAgICAgICAgIC8vIENvbnZlcnQgZnJvbSBtdWx0aS1ieXRlIHRvIHVuaWNvZGVcclxuICAgICAgICAgICAgd3JtSGVhZGVyID0gbmV3IFVpbnQxNkFycmF5KHdybUhlYWRlci5idWZmZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCB0byBzdHJpbmdcclxuICAgICAgICAgICAgd3JtSGVhZGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCB3cm1IZWFkZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gUGFyc2UgPFdSTUhlYWRlcj4gdG8gZ2V0IEtJRCBmaWVsZCB2YWx1ZVxyXG4gICAgICAgICAgICB4bWxSZWFkZXIgPSAobmV3IERPTVBhcnNlcigpKS5wYXJzZUZyb21TdHJpbmcod3JtSGVhZGVyLCAnYXBwbGljYXRpb24veG1sJyk7XHJcbiAgICAgICAgICAgIEtJRCA9IHhtbFJlYWRlci5xdWVyeVNlbGVjdG9yKCdLSUQnKS50ZXh0Q29udGVudDtcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBLSUQgKGJhc2U2NCBkZWNvZGVkKSBhcyBieXRlIGFycmF5XHJcbiAgICAgICAgICAgIEtJRCA9IEJBU0U2NC5kZWNvZGVBcnJheShLSUQpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBVVUlEIGZyb20gbGl0dGxlLWVuZGlhbiB0byBiaWctZW5kaWFuXHJcbiAgICAgICAgICAgIGNvbnZlcnRVdWlkRW5kaWFubmVzcyhLSUQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIEtJRDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRXUk1IZWFkZXJGcm9tUFJIZWFkZXIocHJIZWFkZXIpIHtcclxuICAgICAgICBsZXQgbGVuZ3RoLFxyXG4gICAgICAgICAgICByZWNvcmRDb3VudCxcclxuICAgICAgICAgICAgcmVjb3JkVHlwZSxcclxuICAgICAgICAgICAgcmVjb3JkTGVuZ3RoLFxyXG4gICAgICAgICAgICByZWNvcmRWYWx1ZTtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcblxyXG4gICAgICAgIC8vIFBhcnNlIFBsYXlSZWFkeSBoZWFkZXJcclxuXHJcbiAgICAgICAgLy8gTGVuZ3RoIC0gMzIgYml0cyAoTEUgZm9ybWF0KVxyXG4gICAgICAgIGxlbmd0aCA9IChwckhlYWRlcltpICsgM10gPDwgMjQpICsgKHBySGVhZGVyW2kgKyAyXSA8PCAxNikgKyAocHJIZWFkZXJbaSArIDFdIDw8IDgpICsgcHJIZWFkZXJbaV07XHJcbiAgICAgICAgaSArPSA0O1xyXG5cclxuICAgICAgICAvLyBSZWNvcmQgY291bnQgLSAxNiBiaXRzIChMRSBmb3JtYXQpXHJcbiAgICAgICAgcmVjb3JkQ291bnQgPSAocHJIZWFkZXJbaSArIDFdIDw8IDgpICsgcHJIZWFkZXJbaV07XHJcbiAgICAgICAgaSArPSAyO1xyXG5cclxuICAgICAgICAvLyBQYXJzZSByZWNvcmRzXHJcbiAgICAgICAgd2hpbGUgKGkgPCBwckhlYWRlci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgLy8gUmVjb3JkIHR5cGUgLSAxNiBiaXRzIChMRSBmb3JtYXQpXHJcbiAgICAgICAgICAgIHJlY29yZFR5cGUgPSAocHJIZWFkZXJbaSArIDFdIDw8IDgpICsgcHJIZWFkZXJbaV07XHJcbiAgICAgICAgICAgIGkgKz0gMjtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIFJpZ2h0cyBNYW5hZ2VtZW50IGhlYWRlciAocmVjb3JkIHR5cGUgPSAweDAxKVxyXG4gICAgICAgICAgICBpZiAocmVjb3JkVHlwZSA9PT0gMHgwMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlY29yZCBsZW5ndGggLSAxNiBiaXRzIChMRSBmb3JtYXQpXHJcbiAgICAgICAgICAgICAgICByZWNvcmRMZW5ndGggPSAocHJIZWFkZXJbaSArIDFdIDw8IDgpICsgcHJIZWFkZXJbaV07XHJcbiAgICAgICAgICAgICAgICBpICs9IDI7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIHZhbHVlID0+IGNvbnRhaW5zIDxXUk1IRUFERVI+XHJcbiAgICAgICAgICAgICAgICByZWNvcmRWYWx1ZSA9IG5ldyBVaW50OEFycmF5KHJlY29yZExlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICByZWNvcmRWYWx1ZS5zZXQocHJIZWFkZXIuc3ViYXJyYXkoaSwgaSArIHJlY29yZExlbmd0aCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZFZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjb252ZXJ0VXVpZEVuZGlhbm5lc3ModXVpZCkge1xyXG4gICAgICAgIHN3YXBCeXRlcyh1dWlkLCAwLCAzKTtcclxuICAgICAgICBzd2FwQnl0ZXModXVpZCwgMSwgMik7XHJcbiAgICAgICAgc3dhcEJ5dGVzKHV1aWQsIDQsIDUpO1xyXG4gICAgICAgIHN3YXBCeXRlcyh1dWlkLCA2LCA3KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzd2FwQnl0ZXMoYnl0ZXMsIHBvczEsIHBvczIpIHtcclxuICAgICAgICBjb25zdCB0ZW1wID0gYnl0ZXNbcG9zMV07XHJcbiAgICAgICAgYnl0ZXNbcG9zMV0gPSBieXRlc1twb3MyXTtcclxuICAgICAgICBieXRlc1twb3MyXSA9IHRlbXA7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVBSQ29udGVudFByb3RlY3Rpb24ocHJvdGVjdGlvbkhlYWRlcikge1xyXG4gICAgICAgIGxldCBwcm8gPSB7XHJcbiAgICAgICAgICAgIF9fdGV4dDogcHJvdGVjdGlvbkhlYWRlci5maXJzdENoaWxkLmRhdGEsXHJcbiAgICAgICAgICAgIF9fcHJlZml4OiAnbXNwcidcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNjaGVtZUlkVXJpOiAndXJuOnV1aWQ6OWEwNGYwNzktOTg0MC00Mjg2LWFiOTItZTY1YmUwODg1Zjk1JyxcclxuICAgICAgICAgICAgdmFsdWU6ICdjb20ubWljcm9zb2Z0LnBsYXlyZWFkeScsXHJcbiAgICAgICAgICAgIHBybzogcHJvLFxyXG4gICAgICAgICAgICBwcm9fYXNBcnJheTogcHJvXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVXaWRldmluZUNvbnRlbnRQcm90ZWN0aW9uKEtJRCkge1xyXG4gICAgICAgIGxldCB3aWRldmluZUNQID0ge1xyXG4gICAgICAgICAgICBzY2hlbWVJZFVyaTogJ3Vybjp1dWlkOmVkZWY4YmE5LTc5ZDYtNGFjZS1hM2M4LTI3ZGNkNTFkMjFlZCcsXHJcbiAgICAgICAgICAgIHZhbHVlOiAnY29tLndpZGV2aW5lLmFscGhhJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKCFLSUQpXHJcbiAgICAgICAgICAgIHJldHVybiB3aWRldmluZUNQO1xyXG4gICAgICAgIC8vIENyZWF0ZSBXaWRldmluZSBDRU5DIGhlYWRlciAoUHJvdG9jb2wgQnVmZmVyKSB3aXRoIEtJRCB2YWx1ZVxyXG4gICAgICAgIGNvbnN0IHd2Q2VuY0hlYWRlciA9IG5ldyBVaW50OEFycmF5KDIgKyBLSUQubGVuZ3RoKTtcclxuICAgICAgICB3dkNlbmNIZWFkZXJbMF0gPSAweDEyO1xyXG4gICAgICAgIHd2Q2VuY0hlYWRlclsxXSA9IDB4MTA7XHJcbiAgICAgICAgd3ZDZW5jSGVhZGVyLnNldChLSUQsIDIpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSBwc3NoIGJveFxyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IDEyIC8qIGJveCBsZW5ndGgsIHR5cGUsIHZlcnNpb24gYW5kIGZsYWdzICovICsgMTYgLyogU3lzdGVtSUQgKi8gKyA0IC8qIGRhdGEgbGVuZ3RoICovICsgd3ZDZW5jSGVhZGVyLmxlbmd0aDtcclxuICAgICAgICBsZXQgcHNzaCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aCk7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG5cclxuICAgICAgICAvLyBTZXQgYm94IGxlbmd0aCB2YWx1ZVxyXG4gICAgICAgIHBzc2hbaSsrXSA9IChsZW5ndGggJiAweEZGMDAwMDAwKSA+PiAyNDtcclxuICAgICAgICBwc3NoW2krK10gPSAobGVuZ3RoICYgMHgwMEZGMDAwMCkgPj4gMTY7XHJcbiAgICAgICAgcHNzaFtpKytdID0gKGxlbmd0aCAmIDB4MDAwMEZGMDApID4+IDg7XHJcbiAgICAgICAgcHNzaFtpKytdID0gKGxlbmd0aCAmIDB4MDAwMDAwRkYpO1xyXG5cclxuICAgICAgICAvLyBTZXQgdHlwZSAoJ3Bzc2gnKSwgdmVyc2lvbiAoMCkgYW5kIGZsYWdzICgwKVxyXG4gICAgICAgIHBzc2guc2V0KFsweDcwLCAweDczLCAweDczLCAweDY4LCAweDAwLCAweDAwLCAweDAwLCAweDAwXSwgaSk7XHJcbiAgICAgICAgaSArPSA4O1xyXG5cclxuICAgICAgICAvLyBTZXQgU3lzdGVtSUQgKCdlZGVmOGJhOS03OWQ2LTRhY2UtYTNjOC0yN2RjZDUxZDIxZWQnKVxyXG4gICAgICAgIHBzc2guc2V0KFsweGVkLCAweGVmLCAweDhiLCAweGE5LCAgMHg3OSwgMHhkNiwgMHg0YSwgMHhjZSwgMHhhMywgMHhjOCwgMHgyNywgMHhkYywgMHhkNSwgMHgxZCwgMHgyMSwgMHhlZF0sIGkpO1xyXG4gICAgICAgIGkgKz0gMTY7XHJcblxyXG4gICAgICAgIC8vIFNldCBkYXRhIGxlbmd0aCB2YWx1ZVxyXG4gICAgICAgIHBzc2hbaSsrXSA9ICh3dkNlbmNIZWFkZXIubGVuZ3RoICYgMHhGRjAwMDAwMCkgPj4gMjQ7XHJcbiAgICAgICAgcHNzaFtpKytdID0gKHd2Q2VuY0hlYWRlci5sZW5ndGggJiAweDAwRkYwMDAwKSA+PiAxNjtcclxuICAgICAgICBwc3NoW2krK10gPSAod3ZDZW5jSGVhZGVyLmxlbmd0aCAmIDB4MDAwMEZGMDApID4+IDg7XHJcbiAgICAgICAgcHNzaFtpKytdID0gKHd2Q2VuY0hlYWRlci5sZW5ndGggJiAweDAwMDAwMEZGKTtcclxuXHJcbiAgICAgICAgLy8gQ29weSBXaWRldmluZSBDRU5DIGhlYWRlclxyXG4gICAgICAgIHBzc2guc2V0KHd2Q2VuY0hlYWRlciwgaSk7XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgdG8gQkFTRTY0IHN0cmluZ1xyXG4gICAgICAgIHBzc2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIHBzc2gpO1xyXG4gICAgICAgIHBzc2ggPSBCQVNFNjQuZW5jb2RlQVNDSUkocHNzaCk7XHJcblxyXG4gICAgICAgIHdpZGV2aW5lQ1AucHNzaCA9IHsgX190ZXh0OiBwc3NoIH07XHJcblxyXG4gICAgICAgIHJldHVybiB3aWRldmluZUNQO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHByb2Nlc3NNYW5pZmVzdCh4bWxEb2MsIG1hbmlmZXN0TG9hZGVkVGltZSkge1xyXG4gICAgICAgIGNvbnN0IG1hbmlmZXN0ID0ge307XHJcbiAgICAgICAgY29uc3QgY29udGVudFByb3RlY3Rpb25zID0gW107XHJcbiAgICAgICAgY29uc3Qgc21vb3RoU3RyZWFtaW5nTWVkaWEgPSB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1Ntb290aFN0cmVhbWluZ01lZGlhJylbMF07XHJcbiAgICAgICAgY29uc3QgcHJvdGVjdGlvbiA9IHhtbERvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnUHJvdGVjdGlvbicpWzBdO1xyXG4gICAgICAgIGxldCBwcm90ZWN0aW9uSGVhZGVyID0gbnVsbDtcclxuICAgICAgICBsZXQgcGVyaW9kLFxyXG4gICAgICAgICAgICBhZGFwdGF0aW9ucyxcclxuICAgICAgICAgICAgY29udGVudFByb3RlY3Rpb24sXHJcbiAgICAgICAgICAgIEtJRCxcclxuICAgICAgICAgICAgdGltZXN0YW1wT2Zmc2V0LFxyXG4gICAgICAgICAgICBzdGFydFRpbWUsXHJcbiAgICAgICAgICAgIHNlZ21lbnRzLFxyXG4gICAgICAgICAgICB0aW1lc2NhbGUsXHJcbiAgICAgICAgICAgIHNlZ21lbnREdXJhdGlvbixcclxuICAgICAgICAgICAgaSwgajtcclxuXHJcbiAgICAgICAgLy8gU2V0IG1hbmlmZXN0IG5vZGUgcHJvcGVydGllc1xyXG4gICAgICAgIG1hbmlmZXN0LnByb3RvY29sID0gJ01TUyc7XHJcbiAgICAgICAgbWFuaWZlc3QucHJvZmlsZXMgPSAndXJuOm1wZWc6ZGFzaDpwcm9maWxlOmlzb2ZmLWxpdmU6MjAxMSc7XHJcbiAgICAgICAgbWFuaWZlc3QudHlwZSA9IHNtb290aFN0cmVhbWluZ01lZGlhLmdldEF0dHJpYnV0ZSgnSXNMaXZlJykgPT09ICdUUlVFJyA/ICdkeW5hbWljJyA6ICdzdGF0aWMnO1xyXG4gICAgICAgIHRpbWVzY2FsZSA9ICBzbW9vdGhTdHJlYW1pbmdNZWRpYS5nZXRBdHRyaWJ1dGUoJ1RpbWVTY2FsZScpO1xyXG4gICAgICAgIG1hbmlmZXN0LnRpbWVzY2FsZSA9IHRpbWVzY2FsZSA/IHBhcnNlRmxvYXQodGltZXNjYWxlKSA6IERFRkFVTFRfVElNRV9TQ0FMRTtcclxuICAgICAgICBsZXQgZHZyV2luZG93TGVuZ3RoID0gcGFyc2VGbG9hdChzbW9vdGhTdHJlYW1pbmdNZWRpYS5nZXRBdHRyaWJ1dGUoJ0RWUldpbmRvd0xlbmd0aCcpKTtcclxuICAgICAgICAvLyBJZiB0aGUgRFZSV2luZG93TGVuZ3RoIGZpZWxkIGlzIG9taXR0ZWQgZm9yIGEgbGl2ZSBwcmVzZW50YXRpb24gb3Igc2V0IHRvIDAsIHRoZSBEVlIgd2luZG93IGlzIGVmZmVjdGl2ZWx5IGluZmluaXRlXHJcbiAgICAgICAgaWYgKG1hbmlmZXN0LnR5cGUgPT09ICdkeW5hbWljJyAmJiAoZHZyV2luZG93TGVuZ3RoID09PSAwIHx8IGlzTmFOKGR2cldpbmRvd0xlbmd0aCkpKSB7XHJcbiAgICAgICAgICAgIGR2cldpbmRvd0xlbmd0aCA9IEluZmluaXR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTdGFyLW92ZXJcclxuICAgICAgICBpZiAoZHZyV2luZG93TGVuZ3RoID09PSAwICYmIHNtb290aFN0cmVhbWluZ01lZGlhLmdldEF0dHJpYnV0ZSgnQ2FuU2VlaycpID09PSAnVFJVRScpIHtcclxuICAgICAgICAgICAgZHZyV2luZG93TGVuZ3RoID0gSW5maW5pdHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZHZyV2luZG93TGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA9IGR2cldpbmRvd0xlbmd0aCAvIG1hbmlmZXN0LnRpbWVzY2FsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkdXJhdGlvbiA9IHBhcnNlRmxvYXQoc21vb3RoU3RyZWFtaW5nTWVkaWEuZ2V0QXR0cmlidXRlKCdEdXJhdGlvbicpKTtcclxuICAgICAgICBtYW5pZmVzdC5tZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uID0gKGR1cmF0aW9uID09PSAwKSA/IEluZmluaXR5IDogZHVyYXRpb24gLyBtYW5pZmVzdC50aW1lc2NhbGU7XHJcbiAgICAgICAgLy8gQnkgZGVmYXVsdCwgc2V0IG1pbkJ1ZmZlclRpbWUgdG8gMiBzZWMuIChidXQgc2V0IGJlbG93IGFjY29yZGluZyB0byB2aWRlbyBzZWdtZW50IGR1cmF0aW9uKVxyXG4gICAgICAgIG1hbmlmZXN0Lm1pbkJ1ZmZlclRpbWUgPSAyO1xyXG4gICAgICAgIG1hbmlmZXN0LnR0bWxUaW1lSXNSZWxhdGl2ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIExpdmUgbWFuaWZlc3Qgd2l0aCBEdXJhdGlvbiA9IHN0YXJ0LW92ZXJcclxuICAgICAgICBpZiAobWFuaWZlc3QudHlwZSA9PT0gJ2R5bmFtaWMnICYmIGR1cmF0aW9uID4gMCkge1xyXG4gICAgICAgICAgICBtYW5pZmVzdC50eXBlID0gJ3N0YXRpYyc7XHJcbiAgICAgICAgICAgIC8vIFdlIHNldCB0aW1lU2hpZnRCdWZmZXJEZXB0aCB0byBpbml0aWFsIGR1cmF0aW9uLCB0byBiZSB1c2VkIGJ5IE1zc0ZyYWdtZW50Q29udHJvbGxlciB0byB1cGRhdGUgc2VnbWVudCB0aW1lbGluZVxyXG4gICAgICAgICAgICBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA9IGR1cmF0aW9uIC8gbWFuaWZlc3QudGltZXNjYWxlO1xyXG4gICAgICAgICAgICAvLyBEdXJhdGlvbiB3aWxsIGJlIHNldCBhY2NvcmRpbmcgdG8gY3VycmVudCBzZWdtZW50IHRpbWVsaW5lIGR1cmF0aW9uIChzZWUgYmVsb3cpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWFuaWZlc3QudHlwZSA9PT0gJ2R5bmFtaWMnICAmJiBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA8IEluZmluaXR5KSB7XHJcbiAgICAgICAgICAgIG1hbmlmZXN0LnJlZnJlc2hNYW5pZmVzdE9uU3dpdGNoVHJhY2sgPSB0cnVlOyAvLyBSZWZyZXNoIG1hbmlmZXN0IHdoZW4gc3dpdGNoaW5nIHRyYWNrc1xyXG4gICAgICAgICAgICBtYW5pZmVzdC5kb05vdFVwZGF0ZURWUldpbmRvd09uQnVmZmVyVXBkYXRlZCA9IHRydWU7IC8vIERWUldpbmRvdyBpcyB1cGRhdGUgYnkgTXNzRnJhZ21lbnRNb29mUG9jZXNzb3IgYmFzZWQgb24gdGZyZiBib3hlc1xyXG4gICAgICAgICAgICBtYW5pZmVzdC5pZ25vcmVQb3N0cG9uZVRpbWVQZXJpb2QgPSB0cnVlOyAvLyBOZXZlciB1cGRhdGUgbWFuaWZlc3RcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE1hcCBwZXJpb2Qgbm9kZSB0byBtYW5pZmVzdCByb290IG5vZGVcclxuICAgICAgICBtYW5pZmVzdC5QZXJpb2QgPSBtYXBQZXJpb2Qoc21vb3RoU3RyZWFtaW5nTWVkaWEsIG1hbmlmZXN0LnRpbWVzY2FsZSk7XHJcbiAgICAgICAgbWFuaWZlc3QuUGVyaW9kX2FzQXJyYXkgPSBbbWFuaWZlc3QuUGVyaW9kXTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBwZXJpb2Qgc3RhcnQgdGltZVxyXG4gICAgICAgIHBlcmlvZCA9IG1hbmlmZXN0LlBlcmlvZDtcclxuICAgICAgICBwZXJpb2Quc3RhcnQgPSAwO1xyXG5cclxuICAgICAgICAvLyBVbmNvbW1lbnQgdG8gdGVzdCBsaXZlIHRvIHN0YXRpYyBtYW5pZmVzdHNcclxuICAgICAgICAvLyBpZiAobWFuaWZlc3QudHlwZSAhPT0gJ3N0YXRpYycpIHtcclxuICAgICAgICAvLyAgICAgbWFuaWZlc3QudHlwZSA9ICdzdGF0aWMnO1xyXG4gICAgICAgIC8vICAgICBtYW5pZmVzdC5tZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uID0gbWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGg7XHJcbiAgICAgICAgLy8gICAgIG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID0gbnVsbDtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8vIENvbnRlbnRQcm90ZWN0aW9uIG5vZGVcclxuICAgICAgICBpZiAocHJvdGVjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHByb3RlY3Rpb25IZWFkZXIgPSB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1Byb3RlY3Rpb25IZWFkZXInKVswXTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNvbWUgcGFja2FnZXJzIHB1dCBuZXdsaW5lcyBpbnRvIHRoZSBQcm90ZWN0aW9uSGVhZGVyIGJhc2U2NCBzdHJpbmcsIHdoaWNoIGlzIG5vdCBnb29kXHJcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhpcyBjYW5ub3QgYmUgY29ycmVjdGx5IHBhcnNlZC4gTGV0J3MganVzdCBmaWx0ZXIgb3V0IGFueSBuZXdsaW5lcyBmb3VuZCBpbiB0aGVyZS5cclxuICAgICAgICAgICAgcHJvdGVjdGlvbkhlYWRlci5maXJzdENoaWxkLmRhdGEgPSBwcm90ZWN0aW9uSGVhZGVyLmZpcnN0Q2hpbGQuZGF0YS5yZXBsYWNlKC9cXG58XFxyL2csICcnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBLSUQgKGluIENFTkMgZm9ybWF0KSBmcm9tIHByb3RlY3Rpb24gaGVhZGVyXHJcbiAgICAgICAgICAgIEtJRCA9IGdldEtJREZyb21Qcm90ZWN0aW9uSGVhZGVyKHByb3RlY3Rpb25IZWFkZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIENvbnRlbnRQcm90ZWN0aW9uIGZvciBQbGF5UmVhZHlcclxuICAgICAgICAgICAgY29udGVudFByb3RlY3Rpb24gPSBjcmVhdGVQUkNvbnRlbnRQcm90ZWN0aW9uKHByb3RlY3Rpb25IZWFkZXIpO1xyXG4gICAgICAgICAgICBjb250ZW50UHJvdGVjdGlvblsnY2VuYzpkZWZhdWx0X0tJRCddID0gS0lEO1xyXG4gICAgICAgICAgICBjb250ZW50UHJvdGVjdGlvbnMucHVzaChjb250ZW50UHJvdGVjdGlvbik7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgQ29udGVudFByb3RlY3Rpb24gZm9yIFdpZGV2aW5lIChhcyBhIENFTkMgcHJvdGVjdGlvbilcclxuICAgICAgICAgICAgY29udGVudFByb3RlY3Rpb24gPSBjcmVhdGVXaWRldmluZUNvbnRlbnRQcm90ZWN0aW9uKEtJRCk7XHJcbiAgICAgICAgICAgIGNvbnRlbnRQcm90ZWN0aW9uWydjZW5jOmRlZmF1bHRfS0lEJ10gPSBLSUQ7XHJcbiAgICAgICAgICAgIGNvbnRlbnRQcm90ZWN0aW9ucy5wdXNoKGNvbnRlbnRQcm90ZWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIG1hbmlmZXN0LkNvbnRlbnRQcm90ZWN0aW9uID0gY29udGVudFByb3RlY3Rpb25zO1xyXG4gICAgICAgICAgICBtYW5pZmVzdC5Db250ZW50UHJvdGVjdGlvbl9hc0FycmF5ID0gY29udGVudFByb3RlY3Rpb25zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWRhcHRhdGlvbnMgPSBwZXJpb2QuQWRhcHRhdGlvblNldF9hc0FycmF5O1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYWRhcHRhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLmluaXRpYWxpemF0aW9uID0gJyRCYW5kd2lkdGgkJztcclxuICAgICAgICAgICAgLy8gUHJvcGFnYXRlIGNvbnRlbnQgcHJvdGVjdGlvbiBpbmZvcm1hdGlvbiBpbnRvIGVhY2ggYWRhcHRhdGlvblxyXG4gICAgICAgICAgICBpZiAobWFuaWZlc3QuQ29udGVudFByb3RlY3Rpb24gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgYWRhcHRhdGlvbnNbaV0uQ29udGVudFByb3RlY3Rpb24gPSBtYW5pZmVzdC5Db250ZW50UHJvdGVjdGlvbjtcclxuICAgICAgICAgICAgICAgIGFkYXB0YXRpb25zW2ldLkNvbnRlbnRQcm90ZWN0aW9uX2FzQXJyYXkgPSBtYW5pZmVzdC5Db250ZW50UHJvdGVjdGlvbl9hc0FycmF5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYWRhcHRhdGlvbnNbaV0uY29udGVudFR5cGUgPT09ICd2aWRlbycpIHtcclxuICAgICAgICAgICAgICAgIC8vIEdldCB2aWRlbyBzZWdtZW50IGR1cmF0aW9uXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50RHVyYXRpb24gPSBhZGFwdGF0aW9uc1tpXS5TZWdtZW50VGVtcGxhdGUuU2VnbWVudFRpbWVsaW5lLlNfYXNBcnJheVswXS5kIC8gYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLnRpbWVzY2FsZTtcclxuICAgICAgICAgICAgICAgIC8vIFNldCBtaW5CdWZmZXJUaW1lIHRvIG9uZSBzZWdtZW50IGR1cmF0aW9uXHJcbiAgICAgICAgICAgICAgICBtYW5pZmVzdC5taW5CdWZmZXJUaW1lID0gc2VnbWVudER1cmF0aW9uO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnZHluYW1pYycgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGF2YWlsYWJpbGl0eVN0YXJ0VGltZVxyXG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzID0gYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5TX2FzQXJyYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVuZFRpbWUgPSAoc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0udCArIHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdLmQpIC8gYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLnRpbWVzY2FsZSAqIDEwMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3QuYXZhaWxhYmlsaXR5U3RhcnRUaW1lID0gbmV3IERhdGUobWFuaWZlc3RMb2FkZWRUaW1lLmdldFRpbWUoKSAtIGVuZFRpbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBNYXRjaCB0aW1lU2hpZnRCdWZmZXJEZXB0aCB0byB2aWRlbyBzZWdtZW50IHRpbWVsaW5lIGR1cmF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID4gMCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCAhPT0gSW5maW5pdHkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggPiBhZGFwdGF0aW9uc1tpXS5TZWdtZW50VGVtcGxhdGUuU2VnbWVudFRpbWVsaW5lLmR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID0gYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5kdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhcCBtaW5CdWZmZXJUaW1lIHRvIHRpbWVTaGlmdEJ1ZmZlckRlcHRoXHJcbiAgICAgICAgbWFuaWZlc3QubWluQnVmZmVyVGltZSA9IE1hdGgubWluKG1hbmlmZXN0Lm1pbkJ1ZmZlclRpbWUsIChtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA/IG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoIDogSW5maW5pdHkpKTtcclxuXHJcbiAgICAgICAgLy8gSW4gY2FzZSBvZiBsaXZlIHN0cmVhbXM6XHJcbiAgICAgICAgLy8gMS0gY29uZmlndXJlIHBsYXllciBidWZmZXJpbmcgcHJvcGVydGllcyBhY2NvcmRpbmcgdG8gdGFyZ2V0IGxpdmUgZGVsYXlcclxuICAgICAgICAvLyAyLSBhZGFwdCBsaXZlIGRlbGF5IGFuZCB0aGVuIGJ1ZmZlcnMgbGVuZ3RoIGluIGNhc2UgdGltZVNoaWZ0QnVmZmVyRGVwdGggaXMgdG9vIHNtYWxsIGNvbXBhcmVkIHRvIHRhcmdldCBsaXZlIGRlbGF5IChzZWUgUGxheWJhY2tDb250cm9sbGVyLmNvbXB1dGVMaXZlRGVsYXkoKSlcclxuICAgICAgICBpZiAobWFuaWZlc3QudHlwZSA9PT0gJ2R5bmFtaWMnKSB7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXRMaXZlRGVsYXkgPSBtZWRpYVBsYXllck1vZGVsLmdldExpdmVEZWxheSgpO1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldExpdmVEZWxheSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGl2ZURlbGF5RnJhZ21lbnRDb3VudCA9IHNldHRpbmdzLmdldCgpLnN0cmVhbWluZy5saXZlRGVsYXlGcmFnbWVudENvdW50ICE9PSBudWxsICYmICFpc05hTihzZXR0aW5ncy5nZXQoKS5zdHJlYW1pbmcubGl2ZURlbGF5RnJhZ21lbnRDb3VudCkgPyBzZXR0aW5ncy5nZXQoKS5zdHJlYW1pbmcubGl2ZURlbGF5RnJhZ21lbnRDb3VudCA6IDQ7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRMaXZlRGVsYXkgPSBzZWdtZW50RHVyYXRpb24gKiBsaXZlRGVsYXlGcmFnbWVudENvdW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXREZWxheUNhcHBpbmcgPSBNYXRoLm1heChtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCAtIDEwLypFTkRfT0ZfUExBWUxJU1RfUEFERElORyovLCBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCAvIDIpO1xyXG4gICAgICAgICAgICBsZXQgbGl2ZURlbGF5ID0gTWF0aC5taW4odGFyZ2V0RGVsYXlDYXBwaW5nLCB0YXJnZXRMaXZlRGVsYXkpO1xyXG4gICAgICAgICAgICAvLyBDb25zaWRlciBhIG1hcmdpbiBvZiBvbmUgc2VnbWVudCBpbiBvcmRlciB0byBhdm9pZCBQcmVjb25kaXRpb24gRmFpbGVkIGVycm9ycyAoNDEyKSwgZm9yIGV4YW1wbGUgaWYgYXVkaW8gYW5kIHZpZGVvIGFyZSBub3QgY29ycmVjdGx5IHN5bmNocm9uaXplZFxyXG4gICAgICAgICAgICBsZXQgYnVmZmVyVGltZSA9IGxpdmVEZWxheSAtIHNlZ21lbnREdXJhdGlvbjtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0b3JlIGluaXRpYWwgYnVmZmVyIHNldHRpbmdzXHJcbiAgICAgICAgICAgIGluaXRpYWxCdWZmZXJTZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICdzdHJlYW1pbmcnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ2xpdmVEZWxheSc6IHNldHRpbmdzLmdldCgpLnN0cmVhbWluZy5saXZlRGVsYXksXHJcbiAgICAgICAgICAgICAgICAgICAgJ3N0YWJsZUJ1ZmZlclRpbWUnOiBzZXR0aW5ncy5nZXQoKS5zdHJlYW1pbmcuc3RhYmxlQnVmZmVyVGltZSxcclxuICAgICAgICAgICAgICAgICAgICAnYnVmZmVyVGltZUF0VG9wUXVhbGl0eSc6IHNldHRpbmdzLmdldCgpLnN0cmVhbWluZy5idWZmZXJUaW1lQXRUb3BRdWFsaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICdidWZmZXJUaW1lQXRUb3BRdWFsaXR5TG9uZ0Zvcm0nOiBzZXR0aW5ncy5nZXQoKS5zdHJlYW1pbmcuYnVmZmVyVGltZUF0VG9wUXVhbGl0eUxvbmdGb3JtXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBzZXR0aW5ncy51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgJ3N0cmVhbWluZyc6IHtcclxuICAgICAgICAgICAgICAgICAgICAnbGl2ZURlbGF5JzogbGl2ZURlbGF5LFxyXG4gICAgICAgICAgICAgICAgICAgICdzdGFibGVCdWZmZXJUaW1lJzogYnVmZmVyVGltZSxcclxuICAgICAgICAgICAgICAgICAgICAnYnVmZmVyVGltZUF0VG9wUXVhbGl0eSc6IGJ1ZmZlclRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2J1ZmZlclRpbWVBdFRvcFF1YWxpdHlMb25nRm9ybSc6IGJ1ZmZlclRpbWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZWxldGUgQ29udGVudCBQcm90ZWN0aW9uIHVuZGVyIHJvb3QgbWFuaWZlc3Qgbm9kZVxyXG4gICAgICAgIGRlbGV0ZSBtYW5pZmVzdC5Db250ZW50UHJvdGVjdGlvbjtcclxuICAgICAgICBkZWxldGUgbWFuaWZlc3QuQ29udGVudFByb3RlY3Rpb25fYXNBcnJheTtcclxuXHJcbiAgICAgICAgLy8gSW4gY2FzZSBvZiBWT0Qgc3RyZWFtcywgY2hlY2sgaWYgc3RhcnQgdGltZSBpcyBncmVhdGVyIHRoYW4gMFxyXG4gICAgICAgIC8vIFRoZW4gZGV0ZXJtaW5lIHRpbWVzdGFtcCBvZmZzZXQgYWNjb3JkaW5nIHRvIGhpZ2hlciBhdWRpby92aWRlbyBzdGFydCB0aW1lXHJcbiAgICAgICAgLy8gKHVzZSBjYXNlID0gbGl2ZSBzdHJlYW0gZGVsaW5lYXJpemF0aW9uKVxyXG4gICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnc3RhdGljJykge1xyXG4gICAgICAgICAgICAvLyBJbiBjYXNlIG9mIHN0YXJ0LW92ZXIgc3RyZWFtIGFuZCBtYW5pZmVzdCByZWxvYWRpbmcgKGR1ZSB0byB0cmFjayBzd2l0Y2gpXHJcbiAgICAgICAgICAgIC8vIHdlIGNvbnNpZGVyIHByZXZpb3VzIHRpbWVzdGFtcE9mZnNldCB0byBrZWVwIHRpbWVsaW5lcyBzeW5jaHJvbml6ZWRcclxuICAgICAgICAgICAgdmFyIHByZXZNYW5pZmVzdCA9IG1hbmlmZXN0TW9kZWwuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICAgaWYgKHByZXZNYW5pZmVzdCAmJiBwcmV2TWFuaWZlc3QudGltZXN0YW1wT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBPZmZzZXQgPSBwcmV2TWFuaWZlc3QudGltZXN0YW1wT2Zmc2V0O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFkYXB0YXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkYXB0YXRpb25zW2ldLmNvbnRlbnRUeXBlID09PSBjb25zdGFudHMuQVVESU8gfHwgYWRhcHRhdGlvbnNbaV0uY29udGVudFR5cGUgPT09IGNvbnN0YW50cy5WSURFTykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50cyA9IGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuU19hc0FycmF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBzZWdtZW50c1swXS50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGltZXN0YW1wT2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcE9mZnNldCA9IHN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXBPZmZzZXQgPSBNYXRoLm1pbih0aW1lc3RhbXBPZmZzZXQsIHN0YXJ0VGltZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvcnJlY3QgY29udGVudCBkdXJhdGlvbiBhY2NvcmRpbmcgdG8gbWluaW11bSBhZGFwdGF0aW9uJ3Mgc2VnbWVudCB0aW1lbGluZSBkdXJhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbiBvcmRlciB0byBmb3JjZSA8dmlkZW8+IGVsZW1lbnQgc2VuZGluZyAnZW5kZWQnIGV2ZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0Lm1lZGlhUHJlc2VudGF0aW9uRHVyYXRpb24gPSBNYXRoLm1pbihtYW5pZmVzdC5tZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uLCBhZGFwdGF0aW9uc1tpXS5TZWdtZW50VGVtcGxhdGUuU2VnbWVudFRpbWVsaW5lLmR1cmF0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRpbWVzdGFtcE9mZnNldCA+IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIFBhdGNoIHNlZ21lbnQgdGVtcGxhdGVzIHRpbWVzdGFtcHMgYW5kIGRldGVybWluZSBwZXJpb2Qgc3RhcnQgdGltZSAoc2luY2UgYXVkaW8vdmlkZW8gc2hvdWxkIG5vdCBiZSBhbGlnbmVkIHRvIDApXHJcbiAgICAgICAgICAgICAgICBtYW5pZmVzdC50aW1lc3RhbXBPZmZzZXQgPSB0aW1lc3RhbXBPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYWRhcHRhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWdtZW50cyA9IGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuU19hc0FycmF5O1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBzZWdtZW50cy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNlZ21lbnRzW2pdLnRNYW5pZmVzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudHNbal0udE1hbmlmZXN0ID0gc2VnbWVudHNbal0udC50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzW2pdLnQgLT0gdGltZXN0YW1wT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYWRhcHRhdGlvbnNbaV0uY29udGVudFR5cGUgPT09IGNvbnN0YW50cy5BVURJTyB8fCBhZGFwdGF0aW9uc1tpXS5jb250ZW50VHlwZSA9PT0gY29uc3RhbnRzLlZJREVPKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZC5zdGFydCA9IE1hdGgubWF4KHNlZ21lbnRzWzBdLnQsIHBlcmlvZC5zdGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5wcmVzZW50YXRpb25UaW1lT2Zmc2V0ID0gcGVyaW9kLnN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHBlcmlvZC5zdGFydCAvPSBtYW5pZmVzdC50aW1lc2NhbGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEZsb29yIHRoZSBkdXJhdGlvbiB0byBnZXQgYXJvdW5kIHByZWNpc2lvbiBkaWZmZXJlbmNlcyBiZXR3ZWVuIHNlZ21lbnRzIHRpbWVzdGFtcHMgYW5kIE1TRSBidWZmZXIgdGltZXN0YW1wc1xyXG4gICAgICAgIC8vIGFuZCB0aGVuIGF2b2lkICdlbmRlZCcgZXZlbnQgbm90IGJlaW5nIHJhaXNlZFxyXG4gICAgICAgIG1hbmlmZXN0Lm1lZGlhUHJlc2VudGF0aW9uRHVyYXRpb24gPSBNYXRoLmZsb29yKG1hbmlmZXN0Lm1lZGlhUHJlc2VudGF0aW9uRHVyYXRpb24gKiAxMDAwKSAvIDEwMDA7XHJcbiAgICAgICAgcGVyaW9kLmR1cmF0aW9uID0gbWFuaWZlc3QubWVkaWFQcmVzZW50YXRpb25EdXJhdGlvbjtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1hbmlmZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlRE9NKGRhdGEpIHtcclxuICAgICAgICBsZXQgeG1sRG9jID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKHdpbmRvdy5ET01QYXJzZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IHdpbmRvdy5ET01QYXJzZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHhtbERvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZGF0YSwgJ3RleHQveG1sJyk7XHJcbiAgICAgICAgICAgIGlmICh4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BhcnNlcmVycm9yJykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwYXJzaW5nIHRoZSBtYW5pZmVzdCBmYWlsZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHhtbERvYztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRNYXRjaGVycygpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRJcm9uKCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGludGVybmFsUGFyc2UoZGF0YSkge1xyXG4gICAgICAgIGxldCB4bWxEb2MgPSBudWxsO1xyXG4gICAgICAgIGxldCBtYW5pZmVzdCA9IG51bGw7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcclxuXHJcbiAgICAgICAgLy8gUGFyc2UgdGhlIE1TUyBYTUwgbWFuaWZlc3RcclxuICAgICAgICB4bWxEb2MgPSBwYXJzZURPTShkYXRhKTtcclxuXHJcbiAgICAgICAgY29uc3QgeG1sUGFyc2VUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgICAgICBpZiAoeG1sRG9jID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29udmVydCBNU1MgbWFuaWZlc3QgaW50byBEQVNIIG1hbmlmZXN0XHJcbiAgICAgICAgbWFuaWZlc3QgPSBwcm9jZXNzTWFuaWZlc3QoeG1sRG9jLCBuZXcgRGF0ZSgpKTtcclxuXHJcbiAgICAgICAgY29uc3QgbXNzMmRhc2hUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgICAgICBsb2dnZXIuaW5mbygnUGFyc2luZyBjb21wbGV0ZTogKHhtbFBhcnNpbmc6ICcgKyAoeG1sUGFyc2VUaW1lIC0gc3RhcnRUaW1lKS50b1ByZWNpc2lvbigzKSArICdtcywgbXNzMmRhc2g6ICcgKyAobXNzMmRhc2hUaW1lIC0geG1sUGFyc2VUaW1lKS50b1ByZWNpc2lvbigzKSArICdtcywgdG90YWw6ICcgKyAoKG1zczJkYXNoVGltZSAtIHN0YXJ0VGltZSkgLyAxMDAwKS50b1ByZWNpc2lvbigzKSArICdzKScpO1xyXG5cclxuICAgICAgICByZXR1cm4gbWFuaWZlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgICAgICAgLy8gUmVzdG9yZSBpbml0aWFsIGJ1ZmZlciBzZXR0aW5nc1xyXG4gICAgICAgIGlmIChpbml0aWFsQnVmZmVyU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgc2V0dGluZ3MudXBkYXRlKGluaXRpYWxCdWZmZXJTZXR0aW5ncyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGluc3RhbmNlID0ge1xyXG4gICAgICAgIHBhcnNlOiBpbnRlcm5hbFBhcnNlLFxyXG4gICAgICAgIGdldE1hdGNoZXJzOiBnZXRNYXRjaGVycyxcclxuICAgICAgICBnZXRJcm9uOiBnZXRJcm9uLFxyXG4gICAgICAgIHJlc2V0OiByZXNldFxyXG4gICAgfTtcclxuXHJcbiAgICBzZXR1cCgpO1xyXG5cclxuICAgIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG5cclxuTXNzUGFyc2VyLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSA9ICdNc3NQYXJzZXInO1xyXG5leHBvcnQgZGVmYXVsdCBkYXNoanMuRmFjdG9yeU1ha2VyLmdldENsYXNzRmFjdG9yeShNc3NQYXJzZXIpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cclxuIiwiLyoqXHJcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXHJcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxyXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXHJcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcclxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXHJcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxyXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXHJcbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xyXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxyXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXHJcbiAqXHJcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcclxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcclxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cclxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXHJcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXHJcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXHJcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcclxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcclxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXHJcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuICovXHJcbmltcG9ydCBFdmVudHNCYXNlIGZyb20gJy4uL2NvcmUvZXZlbnRzL0V2ZW50c0Jhc2UnO1xyXG5cclxuLyoqXHJcbiAqIEBjbGFzc1xyXG4gKiBAaW1wbGVtZW50cyBFdmVudHNCYXNlXHJcbiAqL1xyXG5jbGFzcyBNZWRpYVBsYXllckV2ZW50cyBleHRlbmRzIEV2ZW50c0Jhc2Uge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFB1YmxpYyBmYWNpbmcgZXh0ZXJuYWwgZXZlbnRzIHRvIGJlIHVzZWQgd2hlbiBkZXZlbG9waW5nIGEgcGxheWVyIHRoYXQgaW1wbGVtZW50cyBkYXNoLmpzLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHBsYXliYWNrIHdpbGwgbm90IHN0YXJ0IHlldFxyXG4gICAgICAgICAqIGFzIHRoZSBNUEQncyBhdmFpbGFiaWxpdHlTdGFydFRpbWUgaXMgaW4gdGhlIGZ1dHVyZS5cclxuICAgICAgICAgKiBDaGVjayBkZWxheSBwcm9wZXJ0eSBpbiBwYXlsb2FkIHRvIGRldGVybWluZSB0aW1lIGJlZm9yZSBwbGF5YmFjayB3aWxsIHN0YXJ0LlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNBU1RfSU5fRlVUVVJFXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5BU1RfSU5fRlVUVVJFID0gJ2FzdEluRnV0dXJlJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIHZpZGVvIGVsZW1lbnQncyBidWZmZXIgc3RhdGUgY2hhbmdlcyB0byBzdGFsbGVkLlxyXG4gICAgICAgICAqIENoZWNrIG1lZGlhVHlwZSBpbiBwYXlsb2FkIHRvIGRldGVybWluZSB0eXBlIChWaWRlbywgQXVkaW8sIEZyYWdtZW50ZWRUZXh0KS5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQlVGRkVSX0VNUFRZXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5CVUZGRVJfRU1QVFkgPSAnYnVmZmVyU3RhbGxlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSB2aWRlbyBlbGVtZW50J3MgYnVmZmVyIHN0YXRlIGNoYW5nZXMgdG8gbG9hZGVkLlxyXG4gICAgICAgICAqIENoZWNrIG1lZGlhVHlwZSBpbiBwYXlsb2FkIHRvIGRldGVybWluZSB0eXBlIChWaWRlbywgQXVkaW8sIEZyYWdtZW50ZWRUZXh0KS5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQlVGRkVSX0xPQURFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuQlVGRkVSX0xPQURFRCA9ICdidWZmZXJMb2FkZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgdmlkZW8gZWxlbWVudCdzIGJ1ZmZlciBzdGF0ZSBjaGFuZ2VzLCBlaXRoZXIgc3RhbGxlZCBvciBsb2FkZWQuIENoZWNrIHBheWxvYWQgZm9yIHN0YXRlLlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNCVUZGRVJfTEVWRUxfU1RBVEVfQ0hBTkdFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuQlVGRkVSX0xFVkVMX1NUQVRFX0NIQU5HRUQgPSAnYnVmZmVyU3RhdGVDaGFuZ2VkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlcmUgaXMgYW4gZXJyb3IgZnJvbSB0aGUgZWxlbWVudCBvciBNU0Ugc291cmNlIGJ1ZmZlci5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjRVJST1JcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLkVSUk9SID0gJ2Vycm9yJztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIGZyYWdtZW50IGRvd25sb2FkIGhhcyBjb21wbGV0ZWQuXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0ZSQUdNRU5UX0xPQURJTkdfQ09NUExFVEVEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5GUkFHTUVOVF9MT0FESU5HX0NPTVBMRVRFRCA9ICdmcmFnbWVudExvYWRpbmdDb21wbGV0ZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIHBhcnRpYWwgZnJhZ21lbnQgZG93bmxvYWQgaGFzIGNvbXBsZXRlZC5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjRlJBR01FTlRfTE9BRElOR19QUk9HUkVTU1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuRlJBR01FTlRfTE9BRElOR19QUk9HUkVTUyA9ICdmcmFnbWVudExvYWRpbmdQcm9ncmVzcyc7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBmcmFnbWVudCBkb3dubG9hZCBoYXMgc3RhcnRlZC5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjRlJBR01FTlRfTE9BRElOR19TVEFSVEVEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5GUkFHTUVOVF9MT0FESU5HX1NUQVJURUQgPSAnZnJhZ21lbnRMb2FkaW5nU3RhcnRlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgZnJhZ21lbnQgZG93bmxvYWQgaXMgYWJhbmRvbmVkIGR1ZSB0byBkZXRlY3Rpb24gb2Ygc2xvdyBkb3dubG9hZCBiYXNlIG9uIHRoZSBBQlIgYWJhbmRvbiBydWxlLi5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjRlJBR01FTlRfTE9BRElOR19BQkFORE9ORURcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLkZSQUdNRU5UX0xPQURJTkdfQUJBTkRPTkVEID0gJ2ZyYWdtZW50TG9hZGluZ0FiYW5kb25lZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHtAbGluayBtb2R1bGU6RGVidWd9IGxvZ2dlciBtZXRob2RzIGFyZSBjYWxsZWQuXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0xPR1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuTE9HID0gJ2xvZyc7XHJcblxyXG4gICAgICAgIC8vVE9ETyByZWZhY3RvciB3aXRoIGludGVybmFsIGV2ZW50XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIG1hbmlmZXN0IGxvYWQgaXMgY29tcGxldGVcclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjTUFOSUZFU1RfTE9BREVEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5NQU5JRkVTVF9MT0FERUQgPSAnbWFuaWZlc3RMb2FkZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUcmlnZ2VyZWQgYW55dGltZSB0aGVyZSBpcyBhIGNoYW5nZSB0byB0aGUgb3ZlcmFsbCBtZXRyaWNzLlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNNRVRSSUNTX0NIQU5HRURcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLk1FVFJJQ1NfQ0hBTkdFRCA9ICdtZXRyaWNzQ2hhbmdlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGFuIGluZGl2aWR1YWwgbWV0cmljIGlzIGFkZGVkLCB1cGRhdGVkIG9yIGNsZWFyZWQuXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI01FVFJJQ19DSEFOR0VEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5NRVRSSUNfQ0hBTkdFRCA9ICdtZXRyaWNDaGFuZ2VkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIGV2ZXJ5IHRpbWUgYSBuZXcgbWV0cmljIGlzIGFkZGVkLlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNNRVRSSUNfQURERURcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLk1FVFJJQ19BRERFRCA9ICdtZXRyaWNBZGRlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCBldmVyeSB0aW1lIGEgbWV0cmljIGlzIHVwZGF0ZWQuXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI01FVFJJQ19VUERBVEVEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5NRVRSSUNfVVBEQVRFRCA9ICdtZXRyaWNVcGRhdGVkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIGF0IHRoZSBzdHJlYW0gZW5kIG9mIGEgcGVyaW9kLlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQRVJJT0RfU1dJVENIX0NPTVBMRVRFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuUEVSSU9EX1NXSVRDSF9DT01QTEVURUQgPSAncGVyaW9kU3dpdGNoQ29tcGxldGVkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBuZXcgcGVyaW9kIHN0YXJ0cy5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUEVSSU9EX1NXSVRDSF9TVEFSVEVEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5QRVJJT0RfU1dJVENIX1NUQVJURUQgPSAncGVyaW9kU3dpdGNoU3RhcnRlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGFuIEFCUiB1cCAvZG93biBzd2l0Y2ggaXMgaW5pdGlhdGVkOyBlaXRoZXIgYnkgdXNlciBpbiBtYW51YWwgbW9kZSBvciBhdXRvIG1vZGUgdmlhIEFCUiBydWxlcy5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUVVBTElUWV9DSEFOR0VfUkVRVUVTVEVEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5RVUFMSVRZX0NIQU5HRV9SRVFVRVNURUQgPSAncXVhbGl0eUNoYW5nZVJlcXVlc3RlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSBuZXcgQUJSIHF1YWxpdHkgaXMgYmVpbmcgcmVuZGVyZWQgb24tc2NyZWVuLlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNRVUFMSVRZX0NIQU5HRV9SRU5ERVJFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuUVVBTElUWV9DSEFOR0VfUkVOREVSRUQgPSAncXVhbGl0eUNoYW5nZVJlbmRlcmVkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIG5ldyB0cmFjayBpcyBiZWluZyByZW5kZXJlZC5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjVFJBQ0tfQ0hBTkdFX1JFTkRFUkVEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5UUkFDS19DSEFOR0VfUkVOREVSRUQgPSAndHJhY2tDaGFuZ2VSZW5kZXJlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSBzb3VyY2UgaXMgc2V0dXAgYW5kIHJlYWR5LlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTT1VSQ0VfSU5JVElBTElaRURcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLlNPVVJDRV9JTklUSUFMSVpFRCA9ICdzb3VyY2VJbml0aWFsaXplZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgc3RyZWFtIChwZXJpb2QpIGlzIGJlaW5nIGxvYWRlZFxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTVFJFQU1fSU5JVElBTElaSU5HXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5TVFJFQU1fSU5JVElBTElaSU5HID0gJ3N0cmVhbUluaXRpYWxpemluZyc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgc3RyZWFtIChwZXJpb2QpIGlzIGxvYWRlZFxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTVFJFQU1fVVBEQVRFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuU1RSRUFNX1VQREFURUQgPSAnc3RyZWFtVXBkYXRlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgc3RyZWFtIChwZXJpb2QpIGlzIHVwZGF0ZWRcclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjU1RSRUFNX0lOSVRJQUxJWkVEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5TVFJFQU1fSU5JVElBTElaRUQgPSAnc3RyZWFtSW5pdGlhbGl6ZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgcGxheWVyIGhhcyBiZWVuIHJlc2V0LlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTVFJFQU1fVEVBUkRPV05fQ09NUExFVEVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLlNUUkVBTV9URUFSRE9XTl9DT01QTEVURSA9ICdzdHJlYW1UZWFyZG93bkNvbXBsZXRlJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIG9uY2UgYWxsIHRleHQgdHJhY2tzIGRldGVjdGVkIGluIHRoZSBNUEQgYXJlIGFkZGVkIHRvIHRoZSB2aWRlbyBlbGVtZW50LlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNURVhUX1RSQUNLU19BRERFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuVEVYVF9UUkFDS1NfQURERUQgPSAnYWxsVGV4dFRyYWNrc0FkZGVkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSB0ZXh0IHRyYWNrIGlzIGFkZGVkIHRvIHRoZSB2aWRlbyBlbGVtZW50J3MgVGV4dFRyYWNrTGlzdFxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNURVhUX1RSQUNLX0FEREVEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5URVhUX1RSQUNLX0FEREVEID0gJ3RleHRUcmFja0FkZGVkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSB0dG1sIGNodW5rIGlzIHBhcnNlZC5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjVFRNTF9QQVJTRURcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLlRUTUxfUEFSU0VEID0gJ3R0bWxQYXJzZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIHR0bWwgY2h1bmsgaGFzIHRvIGJlIHBhcnNlZC5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjVFRNTF9UT19QQVJTRVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuVFRNTF9UT19QQVJTRSA9ICd0dG1sVG9QYXJzZSc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgY2FwdGlvbiBpcyByZW5kZXJlZC5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQ0FQVElPTl9SRU5ERVJFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuQ0FQVElPTl9SRU5ERVJFRCA9ICdjYXB0aW9uUmVuZGVyZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgY2FwdGlvbiBjb250YWluZXIgaXMgcmVzaXplZC5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQ0FQVElPTl9DT05UQUlORVJfUkVTSVpFXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5DQVBUSU9OX0NPTlRBSU5FUl9SRVNJWkUgPSAnY2FwdGlvbkNvbnRhaW5lclJlc2l6ZSc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlbnQgd2hlbiBlbm91Z2ggZGF0YSBpcyBhdmFpbGFibGUgdGhhdCB0aGUgbWVkaWEgY2FuIGJlIHBsYXllZCxcclxuICAgICAgICAgKiBhdCBsZWFzdCBmb3IgYSBjb3VwbGUgb2YgZnJhbWVzLiAgVGhpcyBjb3JyZXNwb25kcyB0byB0aGVcclxuICAgICAgICAgKiBIQVZFX0VOT1VHSF9EQVRBIHJlYWR5U3RhdGUuXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0NBTl9QTEFZXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5DQU5fUExBWSA9ICdjYW5QbGF5JztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VudCB3aGVuIHBsYXliYWNrIGNvbXBsZXRlcy5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfRU5ERURcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLlBMQVlCQUNLX0VOREVEID0gJ3BsYXliYWNrRW5kZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZW50IHdoZW4gYW4gZXJyb3Igb2NjdXJzLiAgVGhlIGVsZW1lbnQncyBlcnJvclxyXG4gICAgICAgICAqIGF0dHJpYnV0ZSBjb250YWlucyBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19FUlJPUlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfRVJST1IgPSAncGxheWJhY2tFcnJvcic7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlbnQgd2hlbiBwbGF5YmFjayBpcyBub3QgYWxsb3dlZCAoZm9yIGV4YW1wbGUgaWYgdXNlciBnZXN0dXJlIGlzIG5lZWRlZCkuXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX05PVF9BTExPV0VEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5QTEFZQkFDS19OT1RfQUxMT1dFRCA9ICdwbGF5YmFja05vdEFsbG93ZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgbWVkaWEncyBtZXRhZGF0YSBoYXMgZmluaXNoZWQgbG9hZGluZzsgYWxsIGF0dHJpYnV0ZXMgbm93XHJcbiAgICAgICAgICogY29udGFpbiBhcyBtdWNoIHVzZWZ1bCBpbmZvcm1hdGlvbiBhcyB0aGV5J3JlIGdvaW5nIHRvLlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19NRVRBREFUQV9MT0FERURcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLlBMQVlCQUNLX01FVEFEQVRBX0xPQURFRCA9ICdwbGF5YmFja01ldGFEYXRhTG9hZGVkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VudCB3aGVuIHBsYXliYWNrIGlzIHBhdXNlZC5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfUEFVU0VEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5QTEFZQkFDS19QQVVTRUQgPSAncGxheWJhY2tQYXVzZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZW50IHdoZW4gdGhlIG1lZGlhIGJlZ2lucyB0byBwbGF5IChlaXRoZXIgZm9yIHRoZSBmaXJzdCB0aW1lLCBhZnRlciBoYXZpbmcgYmVlbiBwYXVzZWQsXHJcbiAgICAgICAgICogb3IgYWZ0ZXIgZW5kaW5nIGFuZCB0aGVuIHJlc3RhcnRpbmcpLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1BMQVlJTkdcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLlBMQVlCQUNLX1BMQVlJTkcgPSAncGxheWJhY2tQbGF5aW5nJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VudCBwZXJpb2RpY2FsbHkgdG8gaW5mb3JtIGludGVyZXN0ZWQgcGFydGllcyBvZiBwcm9ncmVzcyBkb3dubG9hZGluZ1xyXG4gICAgICAgICAqIHRoZSBtZWRpYS4gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgYW1vdW50IG9mIHRoZSBtZWRpYSB0aGF0IGhhc1xyXG4gICAgICAgICAqIGJlZW4gZG93bmxvYWRlZCBpcyBhdmFpbGFibGUgaW4gdGhlIG1lZGlhIGVsZW1lbnQncyBidWZmZXJlZCBhdHRyaWJ1dGUuXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1BST0dSRVNTXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5QTEFZQkFDS19QUk9HUkVTUyA9ICdwbGF5YmFja1Byb2dyZXNzJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VudCB3aGVuIHRoZSBwbGF5YmFjayBzcGVlZCBjaGFuZ2VzLlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19SQVRFX0NIQU5HRURcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLlBMQVlCQUNLX1JBVEVfQ0hBTkdFRCA9ICdwbGF5YmFja1JhdGVDaGFuZ2VkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VudCB3aGVuIGEgc2VlayBvcGVyYXRpb24gY29tcGxldGVzLlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19TRUVLRURcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLlBMQVlCQUNLX1NFRUtFRCA9ICdwbGF5YmFja1NlZWtlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlbnQgd2hlbiBhIHNlZWsgb3BlcmF0aW9uIGJlZ2lucy5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfU0VFS0lOR1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfU0VFS0lORyA9ICdwbGF5YmFja1NlZWtpbmcnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZW50IHdoZW4gYSBzZWVrIG9wZXJhdGlvbiBoYXMgYmVlbiBhc2tlZC5cclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfU0VFS19BU0tFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfU0VFS19BU0tFRCA9ICdwbGF5YmFja1NlZWtBc2tlZCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlbnQgd2hlbiB0aGUgdmlkZW8gZWxlbWVudCByZXBvcnRzIHN0YWxsZWRcclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfU1RBTExFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfU1RBTExFRCA9ICdwbGF5YmFja1N0YWxsZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZW50IHdoZW4gcGxheWJhY2sgb2YgdGhlIG1lZGlhIHN0YXJ0cyBhZnRlciBoYXZpbmcgYmVlbiBwYXVzZWQ7XHJcbiAgICAgICAgICogdGhhdCBpcywgd2hlbiBwbGF5YmFjayBpcyByZXN1bWVkIGFmdGVyIGEgcHJpb3IgcGF1c2UgZXZlbnQuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfU1RBUlRFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfU1RBUlRFRCA9ICdwbGF5YmFja1N0YXJ0ZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgdGltZSBpbmRpY2F0ZWQgYnkgdGhlIGVsZW1lbnQncyBjdXJyZW50VGltZSBhdHRyaWJ1dGUgaGFzIGNoYW5nZWQuXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1RJTUVfVVBEQVRFRFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfVElNRV9VUERBVEVEID0gJ3BsYXliYWNrVGltZVVwZGF0ZWQnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZW50IHdoZW4gdGhlIG1lZGlhIHBsYXliYWNrIGhhcyBzdG9wcGVkIGJlY2F1c2Ugb2YgYSB0ZW1wb3JhcnkgbGFjayBvZiBkYXRhLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1dBSVRJTkdcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLlBMQVlCQUNLX1dBSVRJTkcgPSAncGxheWJhY2tXYWl0aW5nJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTWFuaWZlc3QgdmFsaWRpdHkgY2hhbmdlZCAtIEFzIGEgcmVzdWx0IG9mIGFuIE1QRCB2YWxpZGl0eSBleHBpcmF0aW9uIGV2ZW50LlxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNNQU5JRkVTVF9WQUxJRElUWV9DSEFOR0VEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5NQU5JRkVTVF9WQUxJRElUWV9DSEFOR0VEID0gJ21hbmlmZXN0VmFsaWRpdHlDaGFuZ2VkJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQSBnYXAgb2NjdXJlZCBpbiB0aGUgdGltZWxpbmUgd2hpY2ggcmVxdWlyZXMgYSBzZWVrIHRvIHRoZSBuZXh0IHBlcmlvZFxyXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNHQVBfQ0FVU0VEX1NFRUtfVE9fUEVSSU9EX0VORFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuR0FQX0NBVVNFRF9TRUVLX1RPX1BFUklPRF9FTkQgPSAnZ2FwQ2F1c2VkU2Vla1RvUGVyaW9kRW5kJztcclxuICAgIH1cclxufVxyXG5cclxubGV0IG1lZGlhUGxheWVyRXZlbnRzID0gbmV3IE1lZGlhUGxheWVyRXZlbnRzKCk7XHJcbmV4cG9ydCBkZWZhdWx0IG1lZGlhUGxheWVyRXZlbnRzO1xyXG4iLCIvKipcclxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcclxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXHJcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcclxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcclxuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxyXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXHJcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXHJcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxyXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxyXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxyXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcclxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcclxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcclxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxyXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxyXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcclxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGRhdGEgc3RydWN0dXJlIHRvIGtlZXAgYW5kIGRyaXZlIHtEYXRhQ2h1bmt9XHJcbiAqL1xyXG5cclxuaW1wb3J0IEZhY3RvcnlNYWtlciBmcm9tICcuLi8uLi9jb3JlL0ZhY3RvcnlNYWtlcic7XHJcblxyXG5mdW5jdGlvbiBJbml0Q2FjaGUoKSB7XHJcblxyXG4gICAgbGV0IGRhdGEgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlIChjaHVuaykge1xyXG4gICAgICAgIGNvbnN0IGlkID0gY2h1bmsuc3RyZWFtSWQ7XHJcbiAgICAgICAgY29uc3QgcmVwcmVzZW50YXRpb25JZCA9IGNodW5rLnJlcHJlc2VudGF0aW9uSWQ7XHJcblxyXG4gICAgICAgIGRhdGFbaWRdID0gZGF0YVtpZF0gfHwge307XHJcbiAgICAgICAgZGF0YVtpZF1bcmVwcmVzZW50YXRpb25JZF0gPSBjaHVuaztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHRyYWN0IChzdHJlYW1JZCwgcmVwcmVzZW50YXRpb25JZCkge1xyXG4gICAgICAgIGlmIChkYXRhICYmIGRhdGFbc3RyZWFtSWRdICYmIGRhdGFbc3RyZWFtSWRdW3JlcHJlc2VudGF0aW9uSWRdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhW3N0cmVhbUlkXVtyZXByZXNlbnRhdGlvbklkXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHJlc2V0ICgpIHtcclxuICAgICAgICBkYXRhID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW5zdGFuY2UgPSB7XHJcbiAgICAgICAgc2F2ZTogc2F2ZSxcclxuICAgICAgICBleHRyYWN0OiBleHRyYWN0LFxyXG4gICAgICAgIHJlc2V0OiByZXNldFxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gaW5zdGFuY2U7XHJcbn1cclxuXHJcbkluaXRDYWNoZS5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnSW5pdENhY2hlJztcclxuZXhwb3J0IGRlZmF1bHQgRmFjdG9yeU1ha2VyLmdldFNpbmdsZXRvbkZhY3RvcnkoSW5pdENhY2hlKTtcclxuIiwiLyoqXHJcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXHJcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxyXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXHJcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcclxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXHJcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxyXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXHJcbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xyXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxyXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXHJcbiAqXHJcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcclxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcclxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cclxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXHJcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXHJcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXHJcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcclxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcclxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXHJcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuICovXHJcbi8qKlxyXG4gKiBAY2xhc3NcclxuICogQGlnbm9yZVxyXG4gKi9cclxuY2xhc3MgRGFzaEpTRXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IoY29kZSwgbWVzc2FnZSwgZGF0YSkge1xyXG4gICAgICAgIHRoaXMuY29kZSA9IGNvZGUgfHwgbnVsbDtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8IG51bGw7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YSB8fCBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEYXNoSlNFcnJvcjsiLCIvKipcclxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcclxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXHJcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcclxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcclxuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxyXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXHJcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXHJcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxyXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxyXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxyXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcclxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcclxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcclxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxyXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxyXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcclxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAY2xhc3NcclxuICogQGlnbm9yZVxyXG4gKi9cclxuY2xhc3MgRGF0YUNodW5rIHtcclxuICAgIC8vUmVwcmVzZW50cyBhIGRhdGEgc3RydWN0dXJlIHRoYXQga2VlcCBhbGwgdGhlIG5lY2Vzc2FyeSBpbmZvIGFib3V0IGEgc2luZ2xlIGluaXQvbWVkaWEgc2VnbWVudFxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5zdHJlYW1JZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5tZWRpYUluZm8gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2VnbWVudFR5cGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucXVhbGl0eSA9IE5hTjtcclxuICAgICAgICB0aGlzLmluZGV4ID0gTmFOO1xyXG4gICAgICAgIHRoaXMuYnl0ZXMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBOYU47XHJcbiAgICAgICAgdGhpcy5lbmQgPSBOYU47XHJcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IE5hTjtcclxuICAgICAgICB0aGlzLnJlcHJlc2VudGF0aW9uSWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZW5kRnJhZ21lbnQgPSBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEYXRhQ2h1bms7IiwiLyoqXHJcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXHJcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxyXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXHJcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcclxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXHJcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxyXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXHJcbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xyXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxyXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXHJcbiAqXHJcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcclxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcclxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cclxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXHJcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXHJcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXHJcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcclxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcclxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXHJcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuICovXHJcblxyXG5pbXBvcnQgeyBIVFRQUmVxdWVzdCB9IGZyb20gJy4uL3ZvL21ldHJpY3MvSFRUUFJlcXVlc3QnO1xyXG5cclxuLyoqXHJcbiAqIEBjbGFzc1xyXG4gKiBAaWdub3JlXHJcbiAqL1xyXG5jbGFzcyBGcmFnbWVudFJlcXVlc3Qge1xyXG4gICAgY29uc3RydWN0b3IodXJsKSB7XHJcbiAgICAgICAgdGhpcy5hY3Rpb24gPSBGcmFnbWVudFJlcXVlc3QuQUNUSU9OX0RPV05MT0FEO1xyXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gTmFOO1xyXG4gICAgICAgIHRoaXMubWVkaWFUeXBlID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1lZGlhSW5mbyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy50eXBlID0gbnVsbDtcclxuICAgICAgICB0aGlzLmR1cmF0aW9uID0gTmFOO1xyXG4gICAgICAgIHRoaXMudGltZXNjYWxlID0gTmFOO1xyXG4gICAgICAgIHRoaXMucmFuZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudXJsID0gdXJsIHx8IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlTG9jYXRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMucmVxdWVzdFN0YXJ0RGF0ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5maXJzdEJ5dGVEYXRlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnJlcXVlc3RFbmREYXRlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnF1YWxpdHkgPSBOYU47XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IE5hTjtcclxuICAgICAgICB0aGlzLmF2YWlsYWJpbGl0eVN0YXJ0VGltZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFiaWxpdHlFbmRUaW1lID0gbnVsbDtcclxuICAgICAgICB0aGlzLndhbGxTdGFydFRpbWUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYnl0ZXNMb2FkZWQgPSBOYU47XHJcbiAgICAgICAgdGhpcy5ieXRlc1RvdGFsID0gTmFOO1xyXG4gICAgICAgIHRoaXMuZGVsYXlMb2FkaW5nVGltZSA9IE5hTjtcclxuICAgICAgICB0aGlzLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XHJcbiAgICAgICAgdGhpcy5yZXByZXNlbnRhdGlvbklkID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpc0luaXRpYWxpemF0aW9uUmVxdWVzdCgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMudHlwZSAmJiB0aGlzLnR5cGUgPT09IEhUVFBSZXF1ZXN0LklOSVRfU0VHTUVOVF9UWVBFKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJbmZvKGluZm8pIHtcclxuICAgICAgICB0aGlzLnR5cGUgPSBpbmZvICYmIGluZm8uaW5pdCA/IEhUVFBSZXF1ZXN0LklOSVRfU0VHTUVOVF9UWVBFIDogSFRUUFJlcXVlc3QuTUVESUFfU0VHTUVOVF9UWVBFO1xyXG4gICAgICAgIHRoaXMudXJsID0gaW5mbyAmJiBpbmZvLnVybCA/IGluZm8udXJsIDogbnVsbDtcclxuICAgICAgICB0aGlzLnJhbmdlID0gaW5mbyAmJiBpbmZvLnJhbmdlID8gaW5mby5yYW5nZS5zdGFydCArICctJyArIGluZm8ucmFuZ2UuZW5kIDogbnVsbDtcclxuICAgICAgICB0aGlzLm1lZGlhVHlwZSA9IGluZm8gJiYgaW5mby5tZWRpYVR5cGUgPyBpbmZvLm1lZGlhVHlwZSA6IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbkZyYWdtZW50UmVxdWVzdC5BQ1RJT05fRE9XTkxPQUQgPSAnZG93bmxvYWQnO1xyXG5GcmFnbWVudFJlcXVlc3QuQUNUSU9OX0NPTVBMRVRFID0gJ2NvbXBsZXRlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZyYWdtZW50UmVxdWVzdDtcclxuIiwiLyoqXHJcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXHJcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxyXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXHJcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcclxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXHJcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxyXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXHJcbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xyXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxyXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXHJcbiAqXHJcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcclxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcclxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cclxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXHJcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXHJcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXHJcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcclxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcclxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXHJcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuICovXHJcbi8qKlxyXG4gKiBAY2xhc3NkZXNjIFRoaXMgT2JqZWN0IGhvbGRzIHJlZmVyZW5jZSB0byB0aGUgSFRUUFJlcXVlc3QgZm9yIG1hbmlmZXN0LCBmcmFnbWVudCBhbmQgeGxpbmsgbG9hZGluZy5cclxuICogTWVtYmVycyB3aGljaCBhcmUgbm90IGRlZmluZWQgaW4gSVNPMjMwMDktMSBBbm5leCBEIHNob3VsZCBiZSBwcmVmaXhlZCBieSBhIF8gc28gdGhhdCB0aGV5IGFyZSBpZ25vcmVkXHJcbiAqIGJ5IE1ldHJpY3MgUmVwb3J0aW5nIGNvZGUuXHJcbiAqIEBpZ25vcmVcclxuICovXHJcbmNsYXNzIEhUVFBSZXF1ZXN0IHtcclxuICAgIC8qKlxyXG4gICAgICogQGNsYXNzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElkZW50aWZpZXIgb2YgdGhlIFRDUCBjb25uZWN0aW9uIG9uIHdoaWNoIHRoZSBIVFRQIHJlcXVlc3Qgd2FzIHNlbnQuXHJcbiAgICAgICAgICogQHB1YmxpY1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudGNwaWQgPSBudWxsO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoaXMgaXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIGFuZCBzaG91bGQgbm90IGJlIGluY2x1ZGVkIGluIEhUVFAgcmVxdWVzdC9yZXNwb25zZSB0cmFuc2FjdGlvbnMgZm9yIHByb2dyZXNzaXZlIGRvd25sb2FkLlxyXG4gICAgICAgICAqIFRoZSB0eXBlIG9mIHRoZSByZXF1ZXN0OlxyXG4gICAgICAgICAqIC0gTVBEXHJcbiAgICAgICAgICogLSBYTGluayBleHBhbnNpb25cclxuICAgICAgICAgKiAtIEluaXRpYWxpemF0aW9uIEZyYWdtZW50XHJcbiAgICAgICAgICogLSBJbmRleCBGcmFnbWVudFxyXG4gICAgICAgICAqIC0gTWVkaWEgRnJhZ21lbnRcclxuICAgICAgICAgKiAtIEJpdHN0cmVhbSBTd2l0Y2hpbmcgRnJhZ21lbnRcclxuICAgICAgICAgKiAtIG90aGVyXHJcbiAgICAgICAgICogQHB1YmxpY1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudHlwZSA9IG51bGw7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIG9yaWdpbmFsIFVSTCAoYmVmb3JlIGFueSByZWRpcmVjdHMgb3IgZmFpbHVyZXMpXHJcbiAgICAgICAgICogQHB1YmxpY1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudXJsID0gbnVsbDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgYWN0dWFsIFVSTCByZXF1ZXN0ZWQsIGlmIGRpZmZlcmVudCBmcm9tIGFib3ZlXHJcbiAgICAgICAgICogQHB1YmxpY1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYWN0dWFsdXJsID0gbnVsbDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgY29udGVudHMgb2YgdGhlIGJ5dGUtcmFuZ2Utc3BlYyBwYXJ0IG9mIHRoZSBIVFRQIFJhbmdlIGhlYWRlci5cclxuICAgICAgICAgKiBAcHVibGljXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yYW5nZSA9IG51bGw7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVhbC1UaW1lIHwgVGhlIHJlYWwgdGltZSBhdCB3aGljaCB0aGUgcmVxdWVzdCB3YXMgc2VudC5cclxuICAgICAgICAgKiBAcHVibGljXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy50cmVxdWVzdCA9IG51bGw7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVhbC1UaW1lIHwgVGhlIHJlYWwgdGltZSBhdCB3aGljaCB0aGUgZmlyc3QgYnl0ZSBvZiB0aGUgcmVzcG9uc2Ugd2FzIHJlY2VpdmVkLlxyXG4gICAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnRyZXNwb25zZSA9IG51bGw7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIEhUVFAgcmVzcG9uc2UgY29kZS5cclxuICAgICAgICAgKiBAcHVibGljXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZXNwb25zZWNvZGUgPSBudWxsO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBkdXJhdGlvbiBvZiB0aGUgdGhyb3VnaHB1dCB0cmFjZSBpbnRlcnZhbHMgKG1zKSwgZm9yIHN1Y2Nlc3NmdWwgcmVxdWVzdHMgb25seS5cclxuICAgICAgICAgKiBAcHVibGljXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhyb3VnaHB1dCB0cmFjZXMsIGZvciBzdWNjZXNzZnVsIHJlcXVlc3RzIG9ubHkuXHJcbiAgICAgICAgICogQHB1YmxpY1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudHJhY2UgPSBbXTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHlwZSBvZiBzdHJlYW0gKFwiYXVkaW9cIiB8IFwidmlkZW9cIiBldGMuLilcclxuICAgICAgICAgKiBAcHVibGljXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fc3RyZWFtID0gbnVsbDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWFsLVRpbWUgfCBUaGUgcmVhbCB0aW1lIGF0IHdoaWNoIHRoZSByZXF1ZXN0IGZpbmlzaGVkLlxyXG4gICAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl90ZmluaXNoID0gbnVsbDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgZHVyYXRpb24gb2YgdGhlIG1lZGlhIHJlcXVlc3RzLCBpZiBhdmFpbGFibGUsIGluIG1pbGxpc2Vjb25kcy5cclxuICAgICAgICAgKiBAcHVibGljXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fbWVkaWFkdXJhdGlvbiA9IG51bGw7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIG1lZGlhIHNlZ21lbnQgcXVhbGl0eVxyXG4gICAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9xdWFsaXR5ID0gbnVsbDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBhbGwgdGhlIHJlc3BvbnNlIGhlYWRlcnMgZnJvbSByZXF1ZXN0LlxyXG4gICAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9yZXNwb25zZUhlYWRlcnMgPSBudWxsO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBzZWxlY3RlZCBzZXJ2aWNlIGxvY2F0aW9uIGZvciB0aGUgcmVxdWVzdC4gc3RyaW5nLlxyXG4gICAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9zZXJ2aWNlTG9jYXRpb24gPSBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQGNsYXNzZGVzYyBUaGlzIE9iamVjdCBob2xkcyByZWZlcmVuY2UgdG8gdGhlIHByb2dyZXNzIG9mIHRoZSBIVFRQUmVxdWVzdC5cclxuICogQGlnbm9yZVxyXG4gKi9cclxuY2xhc3MgSFRUUFJlcXVlc3RUcmFjZSB7XHJcbiAgICAvKipcclxuICAgICogQGNsYXNzXHJcbiAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVhbC1UaW1lIHwgTWVhc3VyZW1lbnQgc3RyZWFtIHN0YXJ0LlxyXG4gICAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnMgPSBudWxsO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE1lYXN1cmVtZW50IHN0cmVhbSBkdXJhdGlvbiAobXMpLlxyXG4gICAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmQgPSBudWxsO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExpc3Qgb2YgaW50ZWdlcnMgY291bnRpbmcgdGhlIGJ5dGVzIHJlY2VpdmVkIGluIGVhY2ggdHJhY2UgaW50ZXJ2YWwgd2l0aGluIHRoZSBtZWFzdXJlbWVudCBzdHJlYW0uXHJcbiAgICAgICAgICogQHB1YmxpY1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYiA9IFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG5IVFRQUmVxdWVzdC5HRVQgPSAnR0VUJztcclxuSFRUUFJlcXVlc3QuSEVBRCA9ICdIRUFEJztcclxuSFRUUFJlcXVlc3QuTVBEX1RZUEUgPSAnTVBEJztcclxuSFRUUFJlcXVlc3QuWExJTktfRVhQQU5TSU9OX1RZUEUgPSAnWExpbmtFeHBhbnNpb24nO1xyXG5IVFRQUmVxdWVzdC5JTklUX1NFR01FTlRfVFlQRSA9ICdJbml0aWFsaXphdGlvblNlZ21lbnQnO1xyXG5IVFRQUmVxdWVzdC5JTkRFWF9TRUdNRU5UX1RZUEUgPSAnSW5kZXhTZWdtZW50JztcclxuSFRUUFJlcXVlc3QuTUVESUFfU0VHTUVOVF9UWVBFID0gJ01lZGlhU2VnbWVudCc7XHJcbkhUVFBSZXF1ZXN0LkJJVFNUUkVBTV9TV0lUQ0hJTkdfU0VHTUVOVF9UWVBFID0gJ0JpdHN0cmVhbVN3aXRjaGluZ1NlZ21lbnQnO1xyXG5IVFRQUmVxdWVzdC5PVEhFUl9UWVBFID0gJ290aGVyJztcclxuXHJcbmV4cG9ydCB7IEhUVFBSZXF1ZXN0LCBIVFRQUmVxdWVzdFRyYWNlIH07XHJcbiJdfQ==
