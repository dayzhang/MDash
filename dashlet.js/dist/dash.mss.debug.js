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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsemhhbmcvRG9jdW1lbnRzL1NjaG9vbFdvcmsvY3M1MjUvTURhc2gvZGFzaGxldC5qcy9leHRlcm5hbHMvQmlnSW50ZWdlci5qcyIsIi9Vc2Vycy9kYW5pZWx6aGFuZy9Eb2N1bWVudHMvU2Nob29sV29yay9jczUyNS9NRGFzaC9kYXNobGV0LmpzL3NyYy9jb3JlL0ZhY3RvcnlNYWtlci5qcyIsIi9Vc2Vycy9kYW5pZWx6aGFuZy9Eb2N1bWVudHMvU2Nob29sV29yay9jczUyNS9NRGFzaC9kYXNobGV0LmpzL3NyYy9jb3JlL2Vycm9ycy9FcnJvcnNCYXNlLmpzIiwiL1VzZXJzL2RhbmllbHpoYW5nL0RvY3VtZW50cy9TY2hvb2xXb3JrL2NzNTI1L01EYXNoL2Rhc2hsZXQuanMvc3JjL2NvcmUvZXZlbnRzL0V2ZW50c0Jhc2UuanMiLCIvVXNlcnMvZGFuaWVsemhhbmcvRG9jdW1lbnRzL1NjaG9vbFdvcmsvY3M1MjUvTURhc2gvZGFzaGxldC5qcy9zcmMvbXNzL01zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXIuanMiLCIvVXNlcnMvZGFuaWVsemhhbmcvRG9jdW1lbnRzL1NjaG9vbFdvcmsvY3M1MjUvTURhc2gvZGFzaGxldC5qcy9zcmMvbXNzL01zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvci5qcyIsIi9Vc2Vycy9kYW5pZWx6aGFuZy9Eb2N1bWVudHMvU2Nob29sV29yay9jczUyNS9NRGFzaC9kYXNobGV0LmpzL3NyYy9tc3MvTXNzRnJhZ21lbnRNb292UHJvY2Vzc29yLmpzIiwiL1VzZXJzL2RhbmllbHpoYW5nL0RvY3VtZW50cy9TY2hvb2xXb3JrL2NzNTI1L01EYXNoL2Rhc2hsZXQuanMvc3JjL21zcy9Nc3NGcmFnbWVudFByb2Nlc3Nvci5qcyIsIi9Vc2Vycy9kYW5pZWx6aGFuZy9Eb2N1bWVudHMvU2Nob29sV29yay9jczUyNS9NRGFzaC9kYXNobGV0LmpzL3NyYy9tc3MvTXNzSGFuZGxlci5qcyIsIi9Vc2Vycy9kYW5pZWx6aGFuZy9Eb2N1bWVudHMvU2Nob29sV29yay9jczUyNS9NRGFzaC9kYXNobGV0LmpzL3NyYy9tc3MvZXJyb3JzL01zc0Vycm9ycy5qcyIsIi9Vc2Vycy9kYW5pZWx6aGFuZy9Eb2N1bWVudHMvU2Nob29sV29yay9jczUyNS9NRGFzaC9kYXNobGV0LmpzL3NyYy9tc3MvaW5kZXguanMiLCIvVXNlcnMvZGFuaWVsemhhbmcvRG9jdW1lbnRzL1NjaG9vbFdvcmsvY3M1MjUvTURhc2gvZGFzaGxldC5qcy9zcmMvbXNzL3BhcnNlci9Nc3NQYXJzZXIuanMiLCIvVXNlcnMvZGFuaWVsemhhbmcvRG9jdW1lbnRzL1NjaG9vbFdvcmsvY3M1MjUvTURhc2gvZGFzaGxldC5qcy9zcmMvc3RyZWFtaW5nL01lZGlhUGxheWVyRXZlbnRzLmpzIiwiL1VzZXJzL2RhbmllbHpoYW5nL0RvY3VtZW50cy9TY2hvb2xXb3JrL2NzNTI1L01EYXNoL2Rhc2hsZXQuanMvc3JjL3N0cmVhbWluZy91dGlscy9Jbml0Q2FjaGUuanMiLCIvVXNlcnMvZGFuaWVsemhhbmcvRG9jdW1lbnRzL1NjaG9vbFdvcmsvY3M1MjUvTURhc2gvZGFzaGxldC5qcy9zcmMvc3RyZWFtaW5nL3ZvL0Rhc2hKU0Vycm9yLmpzIiwiL1VzZXJzL2RhbmllbHpoYW5nL0RvY3VtZW50cy9TY2hvb2xXb3JrL2NzNTI1L01EYXNoL2Rhc2hsZXQuanMvc3JjL3N0cmVhbWluZy92by9EYXRhQ2h1bmsuanMiLCIvVXNlcnMvZGFuaWVsemhhbmcvRG9jdW1lbnRzL1NjaG9vbFdvcmsvY3M1MjUvTURhc2gvZGFzaGxldC5qcy9zcmMvc3RyZWFtaW5nL3ZvL0ZyYWdtZW50UmVxdWVzdC5qcyIsIi9Vc2Vycy9kYW5pZWx6aGFuZy9Eb2N1bWVudHMvU2Nob29sV29yay9jczUyNS9NRGFzaC9kYXNobGV0LmpzL3NyYy9zdHJlYW1pbmcvdm8vbWV0cmljcy9IVFRQUmVxdWVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxNQUFNLEdBQUMsQ0FBQSxVQUFTLFNBQVMsRUFBQztBQUFDLGNBQVksQ0FBQyxJQUFJLElBQUksR0FBQyxHQUFHO01BQUMsUUFBUSxHQUFDLENBQUM7TUFBQyxPQUFPLEdBQUMsZ0JBQWdCO01BQUMsV0FBVyxHQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7TUFBQyxnQkFBZ0IsR0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLG9CQUFvQixHQUFDLE9BQU8sTUFBTSxLQUFHLFVBQVUsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLFFBQVEsRUFBQyxhQUFhLEVBQUM7QUFBQyxRQUFHLE9BQU8sQ0FBQyxLQUFHLFdBQVcsRUFBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLE9BQU8sS0FBSyxLQUFHLFdBQVcsRUFBQyxPQUFNLENBQUMsS0FBSyxLQUFHLEVBQUUsSUFBRSxDQUFDLFFBQVEsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxVQUFVLENBQUMsS0FBSyxFQUFDLElBQUksRUFBQztBQUFDLFFBQUksQ0FBQyxLQUFLLEdBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsS0FBSyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsR0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLFlBQVksQ0FBQyxLQUFLLEVBQUM7QUFBQyxRQUFJLENBQUMsS0FBSyxHQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxJQUFJLENBQUE7R0FBQyxZQUFZLENBQUMsU0FBUyxHQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsWUFBWSxDQUFDLEtBQUssRUFBQztBQUFDLFFBQUksQ0FBQyxLQUFLLEdBQUMsS0FBSyxDQUFBO0dBQUMsWUFBWSxDQUFDLFNBQVMsR0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFNLENBQUMsT0FBTyxHQUFDLENBQUMsSUFBRSxDQUFDLEdBQUMsT0FBTyxDQUFBO0dBQUMsU0FBUyxZQUFZLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEdBQUMsR0FBRyxFQUFDLE9BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsR0FBQyxJQUFJLEVBQUMsT0FBTSxDQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUcsTUFBTSxHQUFDLENBQUMsSUFBRSxVQUFVLENBQUMsR0FBRyxFQUFDLFdBQVcsQ0FBQyxHQUFDLENBQUMsRUFBQztBQUFDLGNBQU8sTUFBTSxHQUFFLEtBQUssQ0FBQztBQUFDLGlCQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFBQyxpQkFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQUMsaUJBQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUM7QUFBUSxpQkFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxHQUFFLElBQUksQ0FBQSxDQUFDO0tBQUMsT0FBTyxHQUFHLENBQUE7R0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sRUFBRSxDQUFDLEdBQUMsTUFBTSxFQUFDO0FBQUMsT0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEdBQUMsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxDQUFDLEdBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQUMsS0FBSyxHQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLEdBQUc7UUFBQyxDQUFDLENBQUMsS0FBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxTQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLEdBQUcsSUFBRSxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEtBQUssR0FBQyxJQUFJLENBQUE7S0FBQyxPQUFNLENBQUMsR0FBQyxHQUFHLEVBQUM7QUFBQyxTQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsR0FBRyxLQUFHLElBQUksR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsR0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFBO0tBQUMsSUFBRyxLQUFLLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLENBQUMsR0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLEdBQUc7UUFBQyxDQUFDLENBQUMsS0FBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxTQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksR0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLElBQUUsQ0FBQyxDQUFBO0tBQUMsT0FBTSxLQUFLLEdBQUMsQ0FBQyxFQUFDO0FBQUMsT0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsSUFBSSxDQUFDLElBQUksS0FBRyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQUMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0tBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFBQyxhQUFPLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLFVBQUcsU0FBUyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLElBQUksWUFBWSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLEdBQUcsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLENBQUMsR0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFBQyxNQUFNLEdBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJO1FBQUMsQ0FBQztRQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGdCQUFVLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxVQUFVLEdBQUMsQ0FBQyxFQUFDO0FBQUMsa0JBQVUsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFBO0tBQUMsS0FBSSxDQUFDLEdBQUMsR0FBRyxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxnQkFBVSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBRyxVQUFVLEdBQUMsQ0FBQyxFQUFDLFVBQVUsSUFBRSxJQUFJLENBQUMsS0FBSTtBQUFDLFNBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxNQUFLO09BQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQTtLQUFDLE9BQUssQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLE9BQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLElBQUksRUFBQztBQUFDLFFBQUksS0FBSyxDQUFDLElBQUcsVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUM7QUFBQyxXQUFLLEdBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE1BQUk7QUFBQyxXQUFLLEdBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxJQUFJLENBQUE7S0FBQyxLQUFLLEdBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUcsT0FBTyxLQUFLLEtBQUcsUUFBUSxFQUFDO0FBQUMsVUFBRyxJQUFJLEVBQUMsS0FBSyxHQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUE7S0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsQ0FBQTtHQUFDLFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxDQUFDLEdBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJO1FBQUMsQ0FBQztRQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGdCQUFVLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxJQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxHQUFDLENBQUMsR0FBQyxVQUFVLEdBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQTtLQUFDLENBQUMsR0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxPQUFPLENBQUMsS0FBRyxRQUFRLEVBQUM7QUFBQyxVQUFHLElBQUksRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQyxPQUFPLGFBQWEsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxXQUFXLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLGFBQU8sSUFBSSxZQUFZLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxhQUFhLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxRQUFJLElBQUksR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFDLElBQUksWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEdBQUc7UUFBQyxDQUFDLEdBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJO1FBQUMsT0FBTztRQUFDLEtBQUs7UUFBQyxDQUFDO1FBQUMsR0FBRztRQUFDLEdBQUcsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsRUFBQztBQUFDLFNBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsRUFBQztBQUFDLFdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsSUFBRSxLQUFLLENBQUE7T0FBQztLQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLENBQUMsR0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLEtBQUssR0FBQyxDQUFDO1FBQUMsT0FBTztRQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGFBQU8sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sR0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFBO0tBQUMsT0FBTSxLQUFLLEdBQUMsQ0FBQyxFQUFDO0FBQUMsT0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLFNBQVMsU0FBUyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxFQUFFLENBQUMsT0FBTSxDQUFDLEVBQUUsR0FBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLGlCQUFpQixDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUcsQ0FBQyxJQUFFLEVBQUUsRUFBQyxPQUFPLFlBQVksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQUMsRUFBRSxHQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEdBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxDQUFDLEVBQUUsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxPQUFPLENBQUE7R0FBQyxTQUFTLFlBQVksQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDO0FBQUMsV0FBTSxDQUFDLElBQUksR0FBQyxFQUFFLEdBQUMsSUFBSSxHQUFDLEVBQUUsR0FBQyxLQUFLLEdBQUMsRUFBRSxHQUFDLEVBQUUsR0FBQyxDQUFDLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUs7UUFBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLElBQUksS0FBRyxDQUFDLENBQUMsSUFBSTtRQUFDLEdBQUcsQ0FBQyxJQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFBQyxVQUFHLENBQUMsS0FBRyxDQUFDLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsR0FBRyxHQUFDLElBQUksRUFBQztBQUFDLGVBQU8sSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQTtPQUFDLENBQUMsR0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUE7S0FBQyxJQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBQyxPQUFPLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMscUJBQXFCLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxJQUFJLEVBQUM7QUFBQyxRQUFHLENBQUMsR0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUM7QUFBQyxhQUFPLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQUMsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUcsQ0FBQyxDQUFDLEtBQUssS0FBRyxDQUFDLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsS0FBSyxLQUFHLENBQUMsRUFBQyxPQUFPLElBQUksQ0FBQyxJQUFHLENBQUMsQ0FBQyxLQUFLLEtBQUcsQ0FBQyxDQUFDLEVBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxJQUFJLEtBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsTUFBTSxDQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQUMsSUFBSSxHQUFDLElBQUk7UUFBQyxPQUFPO1FBQUMsS0FBSztRQUFDLENBQUM7UUFBQyxHQUFHO1FBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsU0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFDLENBQUMsSUFBRSxHQUFHLEdBQUMsR0FBRyxDQUFBLEFBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQTtPQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxDQUFBO0tBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFFBQUksS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBQyxPQUFPLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUMsU0FBUyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksR0FBRyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsSUFBSSxHQUFDLElBQUk7UUFBQyxNQUFNLEdBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFBQywyQkFBMkIsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBRSxDQUFDLEdBQUMsMkJBQTJCLENBQUEsQUFBQyxDQUFDO1FBQUMsU0FBUyxHQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsTUFBTSxDQUFDO1FBQUMsT0FBTyxHQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsTUFBTSxDQUFDO1FBQUMsYUFBYTtRQUFDLEtBQUs7UUFBQyxLQUFLO1FBQUMsTUFBTTtRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLElBQUcsU0FBUyxDQUFDLE1BQU0sSUFBRSxHQUFHLEVBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixHQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxLQUFLLEdBQUMsR0FBRyxHQUFDLEdBQUcsRUFBQyxLQUFLLElBQUUsQ0FBQyxFQUFDLEtBQUssRUFBRSxFQUFDO0FBQUMsbUJBQWEsR0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLElBQUcsU0FBUyxDQUFDLEtBQUssR0FBQyxHQUFHLENBQUMsS0FBRywyQkFBMkIsRUFBQztBQUFDLHFCQUFhLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsR0FBRyxDQUFDLEdBQUMsSUFBSSxHQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFBLEdBQUUsMkJBQTJCLENBQUMsQ0FBQTtPQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGFBQUssSUFBRSxhQUFhLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUUsU0FBUyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsSUFBRSxLQUFLLEdBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxBQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxJQUFHLE1BQU0sR0FBQyxDQUFDLEVBQUM7QUFBQyxtQkFBUyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQTtTQUFDLE1BQUk7QUFBQyxtQkFBUyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtTQUFDO09BQUMsT0FBTSxNQUFNLEtBQUcsQ0FBQyxFQUFDO0FBQUMscUJBQWEsSUFBRSxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGVBQUssSUFBRSxTQUFTLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxLQUFLLEdBQUMsQ0FBQyxFQUFDO0FBQUMscUJBQVMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFBO1dBQUMsTUFBSTtBQUFDLHFCQUFTLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFBO1dBQUM7U0FBQyxNQUFNLElBQUUsS0FBSyxDQUFBO09BQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFDLGFBQWEsQ0FBQTtLQUFDLFNBQVMsR0FBQyxXQUFXLENBQUMsU0FBUyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxNQUFNLEdBQUMsRUFBRTtRQUFDLElBQUksR0FBQyxFQUFFO1FBQUMsSUFBSSxHQUFDLElBQUk7UUFBQyxLQUFLO1FBQUMsSUFBSTtRQUFDLEtBQUs7UUFBQyxLQUFLO1FBQUMsS0FBSyxDQUFDLE9BQU0sR0FBRyxFQUFDO0FBQUMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDO0FBQUMsY0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFRO09BQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxJQUFJLEdBQUMsR0FBRyxFQUFDO0FBQUMsYUFBSyxHQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQSxHQUFFLElBQUksQ0FBQTtPQUFDLEtBQUssR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFFO0FBQUMsYUFBSyxHQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLENBQUMsSUFBRyxVQUFVLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxJQUFFLENBQUMsRUFBQyxNQUFNLEtBQUssRUFBRSxDQUFBO09BQUMsUUFBTSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUMsUUFBUSxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQTtLQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQztBQUFDLFFBQUksTUFBTSxHQUFDLEtBQUssQ0FBQyxNQUFNO1FBQUMsUUFBUSxHQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsU0FBUztRQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxHQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQztBQUFDLGFBQU8sR0FBQyxTQUFTLEdBQUMsSUFBSSxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEdBQUMsT0FBTyxHQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxPQUFNLENBQUMsUUFBUSxFQUFDLFNBQVMsR0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLEtBQUs7UUFBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsb0JBQW9CLEVBQUM7QUFBQyxhQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFBQyxlQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksWUFBWSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQUMsT0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLFVBQUcsQ0FBQyxLQUFHLENBQUMsRUFBQyxPQUFNLENBQUMsSUFBSSxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxJQUFFLENBQUMsQ0FBQyxFQUFDLE9BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLEdBQUcsR0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFLLEdBQUMsV0FBVyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEdBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxJQUFJLEVBQUMsU0FBUyxHQUFDLENBQUMsU0FBUyxDQUFDLElBQUcsT0FBTyxRQUFRLEtBQUcsUUFBUSxFQUFDO0FBQUMsY0FBRyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUMsUUFBUSxHQUFDLENBQUMsUUFBUSxDQUFDLE9BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBQyxJQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1NBQUMsT0FBTSxDQUFDLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO09BQUMsQ0FBQyxHQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUFDLElBQUksVUFBVSxHQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxVQUFVLEtBQUcsQ0FBQyxDQUFDLEVBQUMsT0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLFVBQVUsS0FBRyxDQUFDLEVBQUMsT0FBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxNQUFNLElBQUUsR0FBRyxFQUFDLEtBQUssR0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxHQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJO1FBQUMsR0FBRyxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFHLE9BQU8sUUFBUSxLQUFHLFFBQVEsRUFBQztBQUFDLFVBQUcsS0FBSyxFQUFDLFFBQVEsR0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7S0FBQyxNQUFLLFFBQVEsR0FBQyxJQUFJLFVBQVUsQ0FBQyxRQUFRLEVBQUMsS0FBSyxDQUFDLENBQUMsSUFBRyxPQUFPLEdBQUcsS0FBRyxRQUFRLEVBQUM7QUFBQyxVQUFHLEtBQUssRUFBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQUMsTUFBSyxHQUFHLEdBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxFQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU0sQ0FBQyxRQUFRLEVBQUMsR0FBRyxDQUFDLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksTUFBTSxHQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxFQUFDLFFBQVEsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUs7UUFBQyxLQUFLO1FBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxDQUFDLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsRUFBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxDQUFDLENBQUMsRUFBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQUMsYUFBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBQyxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsR0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUM7QUFBQyxVQUFHLFNBQVMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sSUFBSSxFQUFDO0FBQUMsVUFBRyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsRUFBQztBQUFDLFNBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxJQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0tBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUFDLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQUMsRUFBRSxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxFQUFFLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsRUFBRSxFQUFDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sSUFBSSxFQUFDO0FBQUMsVUFBRyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUEsS0FBSSxFQUFFLEVBQUM7QUFBQyxTQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQyxNQUFNLENBQUMsSUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFTLEdBQUcsRUFBQyxHQUFHLEVBQUM7QUFBQyxPQUFHLEdBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBRyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBQztBQUFDLFVBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLENBQUMsTUFBTSxLQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUM7QUFBQyxhQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsT0FBTyxFQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLE9BQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFNLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxJQUFFLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsSUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsUUFBUSxFQUFDO0FBQUMsYUFBTyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBRyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxDQUFDLENBQUMsT0FBTyxFQUFDO0FBQUMsYUFBTyxJQUFJLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBRSxJQUFJLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsUUFBUSxFQUFDO0FBQUMsYUFBTyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsT0FBTyxFQUFDO0FBQUMsYUFBTyxDQUFDLElBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxHQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQUMsYUFBTyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsUUFBUSxFQUFDO0FBQUMsYUFBTyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBRSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQSxLQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQSxLQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLEtBQUssQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxLQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sS0FBSyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsS0FBSyxLQUFHLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEtBQUssS0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sSUFBSSxDQUFDLElBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEVBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLElBQUksQ0FBQyxJQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFBO0dBQUMsU0FBUyxlQUFlLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksS0FBSyxHQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFBQyxDQUFDLEdBQUMsS0FBSztRQUFDLENBQUMsR0FBQyxDQUFDO1FBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLElBQUksRUFBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBQyxTQUFTLEtBQUksQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFNBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBQyxTQUFTLElBQUksQ0FBQTtPQUFDLE9BQU8sS0FBSyxDQUFBO0tBQUMsT0FBTyxJQUFJLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBQyxVQUFTLE1BQU0sRUFBQztBQUFDLFFBQUksT0FBTyxHQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLE9BQU8sS0FBRyxTQUFTLEVBQUMsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxHQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFHLElBQUksSUFBRSxFQUFFLEVBQUMsT0FBTyxlQUFlLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFHLElBQUksR0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxFQUFFLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsT0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFVBQVMsVUFBVSxFQUFDO0FBQUMsUUFBSSxPQUFPLEdBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUcsT0FBTyxLQUFHLFNBQVMsRUFBQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUMsVUFBVSxLQUFHLFNBQVMsR0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsRUFBRSxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLE9BQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUk7UUFBQyxJQUFJLEdBQUMsTUFBTSxDQUFDLEdBQUc7UUFBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQUMsQ0FBQztRQUFDLEtBQUs7UUFBQyxLQUFLLENBQUMsT0FBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLE9BQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUMsT0FBTyxHQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBQyxtQkFBbUIsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsRUFBQztBQUFDLE9BQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUM7QUFBQyxhQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFVO0FBQUMsUUFBSSxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFHLElBQUksQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLGFBQWEsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxRQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUcsS0FBSyxHQUFDLENBQUMsR0FBQyxPQUFPLEVBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxRQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUcsSUFBSSxDQUFDLElBQUksRUFBQztBQUFDLGFBQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLE9BQU8sYUFBYSxDQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFVO0FBQUMsUUFBSSxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFHLEtBQUssR0FBQyxDQUFDLEdBQUMsQ0FBQyxPQUFPLEVBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLElBQUksV0FBVyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLEdBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLElBQUUsSUFBSSxFQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLEdBQUMsV0FBVyxDQUFDLE1BQU07TUFBQyxhQUFhLEdBQUMsV0FBVyxDQUFDLGFBQWEsR0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUUsSUFBSSxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFlBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFDLDZCQUE2QixDQUFDLENBQUE7S0FBQyxJQUFHLENBQUMsR0FBQyxDQUFDLEVBQUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUMsSUFBSSxDQUFDLElBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sTUFBTSxDQUFDLE9BQU0sQ0FBQyxJQUFFLGFBQWEsRUFBQztBQUFDLFlBQU0sR0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBRSxhQUFhLEdBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsWUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsNkJBQTZCLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxHQUFDLENBQUMsRUFBQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBQyxJQUFJLENBQUMsT0FBTSxDQUFDLElBQUUsYUFBYSxFQUFDO0FBQUMsVUFBRyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUMsU0FBUyxDQUFDLE1BQU0sRUFBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFFLGFBQWEsR0FBQyxDQUFDLENBQUE7S0FBQyxNQUFNLEdBQUMsU0FBUyxDQUFDLE1BQU0sRUFBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQztBQUFDLEtBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRTtRQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxJQUFJLEdBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBQyxDQUFDO1FBQUMsSUFBSSxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFDLENBQUM7UUFBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxHQUFDLElBQUk7UUFBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxHQUFDLEVBQUUsQ0FBQyxPQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDO0FBQUMsYUFBTyxHQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFHLEtBQUssRUFBQztBQUFDLGNBQU0sR0FBQyxhQUFhLEdBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQTtPQUFDLE9BQU8sR0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBRyxLQUFLLEVBQUM7QUFBQyxjQUFNLEdBQUMsYUFBYSxHQUFDLENBQUMsR0FBQyxNQUFNLENBQUE7T0FBQyxJQUFJLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFJLEdBQUcsR0FBQyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsTUFBTSxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDO0FBQUMsU0FBRyxHQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxHQUFHLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxhQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxhQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxhQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxHQUFDLENBQUMsSUFBRSxFQUFFO01BQUMsVUFBVSxHQUFDLENBQUMsSUFBSSxHQUFDLENBQUMsSUFBSSxDQUFBLElBQUcsSUFBSSxHQUFDLENBQUMsSUFBSSxDQUFBLEFBQUMsR0FBQyxTQUFTLENBQUMsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLEtBQUcsUUFBUSxHQUFDLENBQUMsR0FBQyxTQUFTLEdBQUMsT0FBTyxDQUFDLEtBQUcsUUFBUSxHQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLEdBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFFLENBQUMsRUFBQztBQUFDLFVBQUksR0FBRyxHQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFFLENBQUMsR0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLEdBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUE7S0FBQyxPQUFNLEVBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxZQUFVO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUM7QUFBQyxPQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEVBQUM7QUFBQyxhQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDO0FBQUMsT0FBQyxHQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLE9BQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsR0FBRTtBQUFDLGFBQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDO0FBQUMsU0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FBQyxJQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxTQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsUUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQUMsSUFBSSxHQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxLQUFLLENBQUMsT0FBTyxFQUFDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxHQUFDLEVBQUU7UUFBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsVUFBSSxHQUFHLEdBQUMsVUFBVSxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUcsS0FBSyxHQUFDLEdBQUcsRUFBQyxVQUFVLEdBQUMsS0FBSyxDQUFBO0tBQUMsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQUMsSUFBSSxTQUFTLEdBQUMsU0FBVixTQUFTLENBQVUsSUFBSSxFQUFDLElBQUksRUFBQyxRQUFRLEVBQUMsYUFBYSxFQUFDO0FBQUMsWUFBUSxHQUFDLFFBQVEsSUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUcsQ0FBQyxhQUFhLEVBQUM7QUFBQyxVQUFJLEdBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsR0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7S0FBQyxJQUFJLE1BQU0sR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksT0FBTyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxjQUFjLEdBQUMsRUFBRSxDQUFDLEtBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLG9CQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0tBQUMsS0FBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsR0FBRyxFQUFDLFNBQVMsSUFBRyxDQUFDLElBQUksY0FBYyxFQUFDO0FBQUMsWUFBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUUsT0FBTyxFQUFDO0FBQUMsY0FBRyxDQUFDLEtBQUcsR0FBRyxJQUFFLE9BQU8sS0FBRyxDQUFDLEVBQUMsU0FBUyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsR0FBQyxnQ0FBZ0MsR0FBQyxJQUFJLEdBQUMsR0FBRyxDQUFDLENBQUE7U0FBQztPQUFDO0tBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBQyxFQUFFLENBQUMsSUFBSSxVQUFVLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFHLEdBQUcsQ0FBQyxLQUFJLENBQUMsR0FBQyxVQUFVLEdBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsSUFBSSxjQUFjLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUcsQ0FBQyxLQUFHLEdBQUcsRUFBQztBQUFDLFlBQUksS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFFO0FBQUMsV0FBQyxFQUFFLENBQUE7U0FBQyxRQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBRyxHQUFHLElBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUMsMkJBQTJCLENBQUMsQ0FBQTtLQUFDLE9BQU8sa0JBQWtCLENBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsQ0FBQTtHQUFDLENBQUMsU0FBUyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUMsSUFBSSxFQUFDLFVBQVUsRUFBQztBQUFDLFFBQUksR0FBRyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFBQyxHQUFHLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsR0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsU0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQUMsT0FBTyxVQUFVLEdBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFDLEdBQUcsQ0FBQTtHQUFDLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBQyxRQUFRLEVBQUM7QUFBQyxZQUFRLEdBQUMsUUFBUSxJQUFFLGdCQUFnQixDQUFDLElBQUcsS0FBSyxHQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUM7QUFBQyxhQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUFDLE9BQU0sR0FBRyxHQUFDLEtBQUssR0FBQyxHQUFHLENBQUE7R0FBQyxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBSSxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLFVBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxPQUFNLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLEtBQUssRUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsSUFBSSxHQUFHLEdBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFDLEdBQUcsQ0FBQyxFQUFDLFVBQVUsRUFBQyxLQUFLLEVBQUMsQ0FBQTtLQUFDLElBQUksR0FBRyxHQUFDLEtBQUssQ0FBQyxJQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUM7QUFBQyxTQUFHLEdBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7S0FBQyxJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLFVBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsT0FBTSxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLEdBQUcsRUFBQyxDQUFBO0tBQUMsSUFBSSxHQUFHLEdBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxHQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsT0FBTSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBRSxDQUFDLEVBQUM7QUFBQyxZQUFNLEdBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssR0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFDO0FBQUMsYUFBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtPQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUE7S0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFDLFVBQVUsRUFBQyxHQUFHLEVBQUMsQ0FBQTtHQUFDLFNBQVMsWUFBWSxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxPQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBQyxHQUFHLEdBQUMsRUFBRSxDQUFBLEdBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxhQUFPLFNBQVMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsVUFBUyxLQUFLLEVBQUM7QUFBQyxXQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsS0FBSyxFQUFDO0FBQUMsV0FBTyxNQUFNLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBQyxVQUFTLEtBQUssRUFBQztBQUFDLFdBQU8sTUFBTSxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUMsVUFBUyxLQUFLLEVBQUMsUUFBUSxFQUFDO0FBQUMsUUFBRyxLQUFLLEtBQUcsU0FBUyxFQUFDLEtBQUssR0FBQyxFQUFFLENBQUMsSUFBRyxLQUFLLEtBQUcsRUFBRSxFQUFDLE9BQU8sWUFBWSxDQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQUMsS0FBSyxHQUFDLFNBQVM7UUFBQyxLQUFLLENBQUMsT0FBTSxFQUFFLENBQUMsSUFBRSxDQUFDLEVBQUM7QUFBQyxXQUFLLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBQyxLQUFLLENBQUE7S0FBQyxJQUFJLElBQUksR0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEdBQUcsR0FBQyxFQUFFLENBQUMsT0FBTyxJQUFJLEdBQUMsR0FBRyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLEtBQUssRUFBQyxRQUFRLEVBQUM7QUFBQyxRQUFHLEtBQUssS0FBRyxTQUFTLEVBQUMsS0FBSyxHQUFDLEVBQUUsQ0FBQyxJQUFHLEtBQUssSUFBRSxFQUFFLEVBQUMsT0FBTyxZQUFZLENBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBVTtBQUFDLFdBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQTtHQUFDLENBQUMsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsVUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sb0JBQW9CLEdBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsR0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUksSUFBSSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxHQUFHLENBQUMsSUFBRyxJQUFJLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLEdBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUcsS0FBSyxDQUFDLE1BQU0sS0FBRyxDQUFDLEVBQUM7QUFBQyxVQUFJLEdBQUcsR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUcsR0FBRyxFQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFHLEdBQUcsS0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsR0FBQyxHQUFHLEdBQUMsMkJBQTJCLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFB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QixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7Ozs7QUFLcEIsTUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Ozs7O0FBS3JCLE1BQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDOzs7OztBQUszQixNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzs7Ozs7QUFLckIsTUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQzs7Ozs7QUFLN0IsTUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztDQUNoQzs7Ozs7Ozs7SUFPQyxnQkFBZ0I7Ozs7QUFJUCxTQUpULGdCQUFnQixHQUlKO3dCQUpaLGdCQUFnQjs7Ozs7O0FBU2QsTUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7Ozs7O0FBS2QsTUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7Ozs7O0FBS2QsTUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDZjs7QUFHTCxXQUFXLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztBQUN4QixXQUFXLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUMxQixXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztBQUM3QixXQUFXLENBQUMsb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUM7QUFDcEQsV0FBVyxDQUFDLGlCQUFpQixHQUFHLHVCQUF1QixDQUFDO0FBQ3hELFdBQVcsQ0FBQyxrQkFBa0IsR0FBRyxjQUFjLENBQUM7QUFDaEQsV0FBVyxDQUFDLGtCQUFrQixHQUFHLGNBQWMsQ0FBQztBQUNoRCxXQUFXLENBQUMsZ0NBQWdDLEdBQUcsMkJBQTJCLENBQUM7QUFDM0UsV0FBVyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7O1FBRXhCLFdBQVcsR0FBWCxXQUFXO1FBQUUsZ0JBQWdCLEdBQWhCLGdCQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBiaWdJbnQ9ZnVuY3Rpb24odW5kZWZpbmVkKXtcInVzZSBzdHJpY3RcIjt2YXIgQkFTRT0xZTcsTE9HX0JBU0U9NyxNQVhfSU5UPTkwMDcxOTkyNTQ3NDA5OTIsTUFYX0lOVF9BUlI9c21hbGxUb0FycmF5KE1BWF9JTlQpLERFRkFVTFRfQUxQSEFCRVQ9XCIwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIjt2YXIgc3VwcG9ydHNOYXRpdmVCaWdJbnQ9dHlwZW9mIEJpZ0ludD09PVwiZnVuY3Rpb25cIjtmdW5jdGlvbiBJbnRlZ2VyKHYscmFkaXgsYWxwaGFiZXQsY2FzZVNlbnNpdGl2ZSl7aWYodHlwZW9mIHY9PT1cInVuZGVmaW5lZFwiKXJldHVybiBJbnRlZ2VyWzBdO2lmKHR5cGVvZiByYWRpeCE9PVwidW5kZWZpbmVkXCIpcmV0dXJuK3JhZGl4PT09MTAmJiFhbHBoYWJldD9wYXJzZVZhbHVlKHYpOnBhcnNlQmFzZSh2LHJhZGl4LGFscGhhYmV0LGNhc2VTZW5zaXRpdmUpO3JldHVybiBwYXJzZVZhbHVlKHYpfWZ1bmN0aW9uIEJpZ0ludGVnZXIodmFsdWUsc2lnbil7dGhpcy52YWx1ZT12YWx1ZTt0aGlzLnNpZ249c2lnbjt0aGlzLmlzU21hbGw9ZmFsc2V9QmlnSW50ZWdlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gU21hbGxJbnRlZ2VyKHZhbHVlKXt0aGlzLnZhbHVlPXZhbHVlO3RoaXMuc2lnbj12YWx1ZTwwO3RoaXMuaXNTbWFsbD10cnVlfVNtYWxsSW50ZWdlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gTmF0aXZlQmlnSW50KHZhbHVlKXt0aGlzLnZhbHVlPXZhbHVlfU5hdGl2ZUJpZ0ludC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gaXNQcmVjaXNlKG4pe3JldHVybi1NQVhfSU5UPG4mJm48TUFYX0lOVH1mdW5jdGlvbiBzbWFsbFRvQXJyYXkobil7aWYobjwxZTcpcmV0dXJuW25dO2lmKG48MWUxNClyZXR1cm5bbiUxZTcsTWF0aC5mbG9vcihuLzFlNyldO3JldHVybltuJTFlNyxNYXRoLmZsb29yKG4vMWU3KSUxZTcsTWF0aC5mbG9vcihuLzFlMTQpXX1mdW5jdGlvbiBhcnJheVRvU21hbGwoYXJyKXt0cmltKGFycik7dmFyIGxlbmd0aD1hcnIubGVuZ3RoO2lmKGxlbmd0aDw0JiZjb21wYXJlQWJzKGFycixNQVhfSU5UX0FSUik8MCl7c3dpdGNoKGxlbmd0aCl7Y2FzZSAwOnJldHVybiAwO2Nhc2UgMTpyZXR1cm4gYXJyWzBdO2Nhc2UgMjpyZXR1cm4gYXJyWzBdK2FyclsxXSpCQVNFO2RlZmF1bHQ6cmV0dXJuIGFyclswXSsoYXJyWzFdK2FyclsyXSpCQVNFKSpCQVNFfX1yZXR1cm4gYXJyfWZ1bmN0aW9uIHRyaW0odil7dmFyIGk9di5sZW5ndGg7d2hpbGUodlstLWldPT09MCk7di5sZW5ndGg9aSsxfWZ1bmN0aW9uIGNyZWF0ZUFycmF5KGxlbmd0aCl7dmFyIHg9bmV3IEFycmF5KGxlbmd0aCk7dmFyIGk9LTE7d2hpbGUoKytpPGxlbmd0aCl7eFtpXT0wfXJldHVybiB4fWZ1bmN0aW9uIHRydW5jYXRlKG4pe2lmKG4+MClyZXR1cm4gTWF0aC5mbG9vcihuKTtyZXR1cm4gTWF0aC5jZWlsKG4pfWZ1bmN0aW9uIGFkZChhLGIpe3ZhciBsX2E9YS5sZW5ndGgsbF9iPWIubGVuZ3RoLHI9bmV3IEFycmF5KGxfYSksY2Fycnk9MCxiYXNlPUJBU0Usc3VtLGk7Zm9yKGk9MDtpPGxfYjtpKyspe3N1bT1hW2ldK2JbaV0rY2Fycnk7Y2Fycnk9c3VtPj1iYXNlPzE6MDtyW2ldPXN1bS1jYXJyeSpiYXNlfXdoaWxlKGk8bF9hKXtzdW09YVtpXStjYXJyeTtjYXJyeT1zdW09PT1iYXNlPzE6MDtyW2krK109c3VtLWNhcnJ5KmJhc2V9aWYoY2Fycnk+MClyLnB1c2goY2FycnkpO3JldHVybiByfWZ1bmN0aW9uIGFkZEFueShhLGIpe2lmKGEubGVuZ3RoPj1iLmxlbmd0aClyZXR1cm4gYWRkKGEsYik7cmV0dXJuIGFkZChiLGEpfWZ1bmN0aW9uIGFkZFNtYWxsKGEsY2Fycnkpe3ZhciBsPWEubGVuZ3RoLHI9bmV3IEFycmF5KGwpLGJhc2U9QkFTRSxzdW0saTtmb3IoaT0wO2k8bDtpKyspe3N1bT1hW2ldLWJhc2UrY2Fycnk7Y2Fycnk9TWF0aC5mbG9vcihzdW0vYmFzZSk7cltpXT1zdW0tY2FycnkqYmFzZTtjYXJyeSs9MX13aGlsZShjYXJyeT4wKXtyW2krK109Y2FycnklYmFzZTtjYXJyeT1NYXRoLmZsb29yKGNhcnJ5L2Jhc2UpfXJldHVybiByfUJpZ0ludGVnZXIucHJvdG90eXBlLmFkZD1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpO2lmKHRoaXMuc2lnbiE9PW4uc2lnbil7cmV0dXJuIHRoaXMuc3VidHJhY3Qobi5uZWdhdGUoKSl9dmFyIGE9dGhpcy52YWx1ZSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkU21hbGwoYSxNYXRoLmFicyhiKSksdGhpcy5zaWduKX1yZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkQW55KGEsYiksdGhpcy5zaWduKX07QmlnSW50ZWdlci5wcm90b3R5cGUucGx1cz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlO2lmKGE8MCE9PW4uc2lnbil7cmV0dXJuIHRoaXMuc3VidHJhY3Qobi5uZWdhdGUoKSl9dmFyIGI9bi52YWx1ZTtpZihuLmlzU21hbGwpe2lmKGlzUHJlY2lzZShhK2IpKXJldHVybiBuZXcgU21hbGxJbnRlZ2VyKGErYik7Yj1zbWFsbFRvQXJyYXkoTWF0aC5hYnMoYikpfXJldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbChiLE1hdGguYWJzKGEpKSxhPDApfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnBsdXM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZStwYXJzZVZhbHVlKHYpLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5wbHVzPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuYWRkO2Z1bmN0aW9uIHN1YnRyYWN0KGEsYil7dmFyIGFfbD1hLmxlbmd0aCxiX2w9Yi5sZW5ndGgscj1uZXcgQXJyYXkoYV9sKSxib3Jyb3c9MCxiYXNlPUJBU0UsaSxkaWZmZXJlbmNlO2ZvcihpPTA7aTxiX2w7aSsrKXtkaWZmZXJlbmNlPWFbaV0tYm9ycm93LWJbaV07aWYoZGlmZmVyZW5jZTwwKXtkaWZmZXJlbmNlKz1iYXNlO2JvcnJvdz0xfWVsc2UgYm9ycm93PTA7cltpXT1kaWZmZXJlbmNlfWZvcihpPWJfbDtpPGFfbDtpKyspe2RpZmZlcmVuY2U9YVtpXS1ib3Jyb3c7aWYoZGlmZmVyZW5jZTwwKWRpZmZlcmVuY2UrPWJhc2U7ZWxzZXtyW2krK109ZGlmZmVyZW5jZTticmVha31yW2ldPWRpZmZlcmVuY2V9Zm9yKDtpPGFfbDtpKyspe3JbaV09YVtpXX10cmltKHIpO3JldHVybiByfWZ1bmN0aW9uIHN1YnRyYWN0QW55KGEsYixzaWduKXt2YXIgdmFsdWU7aWYoY29tcGFyZUFicyhhLGIpPj0wKXt2YWx1ZT1zdWJ0cmFjdChhLGIpfWVsc2V7dmFsdWU9c3VidHJhY3QoYixhKTtzaWduPSFzaWdufXZhbHVlPWFycmF5VG9TbWFsbCh2YWx1ZSk7aWYodHlwZW9mIHZhbHVlPT09XCJudW1iZXJcIil7aWYoc2lnbil2YWx1ZT0tdmFsdWU7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUpfXJldHVybiBuZXcgQmlnSW50ZWdlcih2YWx1ZSxzaWduKX1mdW5jdGlvbiBzdWJ0cmFjdFNtYWxsKGEsYixzaWduKXt2YXIgbD1hLmxlbmd0aCxyPW5ldyBBcnJheShsKSxjYXJyeT0tYixiYXNlPUJBU0UsaSxkaWZmZXJlbmNlO2ZvcihpPTA7aTxsO2krKyl7ZGlmZmVyZW5jZT1hW2ldK2NhcnJ5O2NhcnJ5PU1hdGguZmxvb3IoZGlmZmVyZW5jZS9iYXNlKTtkaWZmZXJlbmNlJT1iYXNlO3JbaV09ZGlmZmVyZW5jZTwwP2RpZmZlcmVuY2UrYmFzZTpkaWZmZXJlbmNlfXI9YXJyYXlUb1NtYWxsKHIpO2lmKHR5cGVvZiByPT09XCJudW1iZXJcIil7aWYoc2lnbilyPS1yO3JldHVybiBuZXcgU21hbGxJbnRlZ2VyKHIpfXJldHVybiBuZXcgQmlnSW50ZWdlcihyLHNpZ24pfUJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0PWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodik7aWYodGhpcy5zaWduIT09bi5zaWduKXtyZXR1cm4gdGhpcy5hZGQobi5uZWdhdGUoKSl9dmFyIGE9dGhpcy52YWx1ZSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXJldHVybiBzdWJ0cmFjdFNtYWxsKGEsTWF0aC5hYnMoYiksdGhpcy5zaWduKTtyZXR1cm4gc3VidHJhY3RBbnkoYSxiLHRoaXMuc2lnbil9O0JpZ0ludGVnZXIucHJvdG90eXBlLm1pbnVzPUJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuc3VidHJhY3Q9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlO2lmKGE8MCE9PW4uc2lnbil7cmV0dXJuIHRoaXMuYWRkKG4ubmVnYXRlKCkpfXZhciBiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcihhLWIpfXJldHVybiBzdWJ0cmFjdFNtYWxsKGIsTWF0aC5hYnMoYSksYT49MCl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUubWludXM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zdWJ0cmFjdDtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnN1YnRyYWN0PWZ1bmN0aW9uKHYpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUtcGFyc2VWYWx1ZSh2KS52YWx1ZSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubWludXM9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5zdWJ0cmFjdDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIodGhpcy52YWx1ZSwhdGhpcy5zaWduKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGU9ZnVuY3Rpb24oKXt2YXIgc2lnbj10aGlzLnNpZ247dmFyIHNtYWxsPW5ldyBTbWFsbEludGVnZXIoLXRoaXMudmFsdWUpO3NtYWxsLnNpZ249IXNpZ247cmV0dXJuIHNtYWxsfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5lZ2F0ZT1mdW5jdGlvbigpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KC10aGlzLnZhbHVlKX07QmlnSW50ZWdlci5wcm90b3R5cGUuYWJzPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHRoaXMudmFsdWUsZmFsc2UpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmFicz1mdW5jdGlvbigpe3JldHVybiBuZXcgU21hbGxJbnRlZ2VyKE1hdGguYWJzKHRoaXMudmFsdWUpKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hYnM9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlPj0wP3RoaXMudmFsdWU6LXRoaXMudmFsdWUpfTtmdW5jdGlvbiBtdWx0aXBseUxvbmcoYSxiKXt2YXIgYV9sPWEubGVuZ3RoLGJfbD1iLmxlbmd0aCxsPWFfbCtiX2wscj1jcmVhdGVBcnJheShsKSxiYXNlPUJBU0UscHJvZHVjdCxjYXJyeSxpLGFfaSxiX2o7Zm9yKGk9MDtpPGFfbDsrK2kpe2FfaT1hW2ldO2Zvcih2YXIgaj0wO2o8Yl9sOysrail7Yl9qPWJbal07cHJvZHVjdD1hX2kqYl9qK3JbaStqXTtjYXJyeT1NYXRoLmZsb29yKHByb2R1Y3QvYmFzZSk7cltpK2pdPXByb2R1Y3QtY2FycnkqYmFzZTtyW2kraisxXSs9Y2Fycnl9fXRyaW0ocik7cmV0dXJuIHJ9ZnVuY3Rpb24gbXVsdGlwbHlTbWFsbChhLGIpe3ZhciBsPWEubGVuZ3RoLHI9bmV3IEFycmF5KGwpLGJhc2U9QkFTRSxjYXJyeT0wLHByb2R1Y3QsaTtmb3IoaT0wO2k8bDtpKyspe3Byb2R1Y3Q9YVtpXSpiK2NhcnJ5O2NhcnJ5PU1hdGguZmxvb3IocHJvZHVjdC9iYXNlKTtyW2ldPXByb2R1Y3QtY2FycnkqYmFzZX13aGlsZShjYXJyeT4wKXtyW2krK109Y2FycnklYmFzZTtjYXJyeT1NYXRoLmZsb29yKGNhcnJ5L2Jhc2UpfXJldHVybiByfWZ1bmN0aW9uIHNoaWZ0TGVmdCh4LG4pe3ZhciByPVtdO3doaWxlKG4tLSA+MClyLnB1c2goMCk7cmV0dXJuIHIuY29uY2F0KHgpfWZ1bmN0aW9uIG11bHRpcGx5S2FyYXRzdWJhKHgseSl7dmFyIG49TWF0aC5tYXgoeC5sZW5ndGgseS5sZW5ndGgpO2lmKG48PTMwKXJldHVybiBtdWx0aXBseUxvbmcoeCx5KTtuPU1hdGguY2VpbChuLzIpO3ZhciBiPXguc2xpY2UobiksYT14LnNsaWNlKDAsbiksZD15LnNsaWNlKG4pLGM9eS5zbGljZSgwLG4pO3ZhciBhYz1tdWx0aXBseUthcmF0c3ViYShhLGMpLGJkPW11bHRpcGx5S2FyYXRzdWJhKGIsZCksYWJjZD1tdWx0aXBseUthcmF0c3ViYShhZGRBbnkoYSxiKSxhZGRBbnkoYyxkKSk7dmFyIHByb2R1Y3Q9YWRkQW55KGFkZEFueShhYyxzaGlmdExlZnQoc3VidHJhY3Qoc3VidHJhY3QoYWJjZCxhYyksYmQpLG4pKSxzaGlmdExlZnQoYmQsMipuKSk7dHJpbShwcm9kdWN0KTtyZXR1cm4gcHJvZHVjdH1mdW5jdGlvbiB1c2VLYXJhdHN1YmEobDEsbDIpe3JldHVybi0uMDEyKmwxLS4wMTIqbDIrMTVlLTYqbDEqbDI+MH1CaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseT1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpLGE9dGhpcy52YWx1ZSxiPW4udmFsdWUsc2lnbj10aGlzLnNpZ24hPT1uLnNpZ24sYWJzO2lmKG4uaXNTbWFsbCl7aWYoYj09PTApcmV0dXJuIEludGVnZXJbMF07aWYoYj09PTEpcmV0dXJuIHRoaXM7aWYoYj09PS0xKXJldHVybiB0aGlzLm5lZ2F0ZSgpO2Ficz1NYXRoLmFicyhiKTtpZihhYnM8QkFTRSl7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKG11bHRpcGx5U21hbGwoYSxhYnMpLHNpZ24pfWI9c21hbGxUb0FycmF5KGFicyl9aWYodXNlS2FyYXRzdWJhKGEubGVuZ3RoLGIubGVuZ3RoKSlyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlLYXJhdHN1YmEoYSxiKSxzaWduKTtyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlMb25nKGEsYiksc2lnbil9O0JpZ0ludGVnZXIucHJvdG90eXBlLnRpbWVzPUJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5O2Z1bmN0aW9uIG11bHRpcGx5U21hbGxBbmRBcnJheShhLGIsc2lnbil7aWYoYTxCQVNFKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlTbWFsbChiLGEpLHNpZ24pfXJldHVybiBuZXcgQmlnSW50ZWdlcihtdWx0aXBseUxvbmcoYixzbWFsbFRvQXJyYXkoYSkpLHNpZ24pfVNtYWxsSW50ZWdlci5wcm90b3R5cGUuX211bHRpcGx5QnlTbWFsbD1mdW5jdGlvbihhKXtpZihpc1ByZWNpc2UoYS52YWx1ZSp0aGlzLnZhbHVlKSl7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIoYS52YWx1ZSp0aGlzLnZhbHVlKX1yZXR1cm4gbXVsdGlwbHlTbWFsbEFuZEFycmF5KE1hdGguYWJzKGEudmFsdWUpLHNtYWxsVG9BcnJheShNYXRoLmFicyh0aGlzLnZhbHVlKSksdGhpcy5zaWduIT09YS5zaWduKX07QmlnSW50ZWdlci5wcm90b3R5cGUuX211bHRpcGx5QnlTbWFsbD1mdW5jdGlvbihhKXtpZihhLnZhbHVlPT09MClyZXR1cm4gSW50ZWdlclswXTtpZihhLnZhbHVlPT09MSlyZXR1cm4gdGhpcztpZihhLnZhbHVlPT09LTEpcmV0dXJuIHRoaXMubmVnYXRlKCk7cmV0dXJuIG11bHRpcGx5U21hbGxBbmRBcnJheShNYXRoLmFicyhhLnZhbHVlKSx0aGlzLnZhbHVlLHRoaXMuc2lnbiE9PWEuc2lnbil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHk9ZnVuY3Rpb24odil7cmV0dXJuIHBhcnNlVmFsdWUodikuX211bHRpcGx5QnlTbWFsbCh0aGlzKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS50aW1lcz1TbWFsbEludGVnZXIucHJvdG90eXBlLm11bHRpcGx5O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubXVsdGlwbHk9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZSpwYXJzZVZhbHVlKHYpLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50aW1lcz1OYXRpdmVCaWdJbnQucHJvdG90eXBlLm11bHRpcGx5O2Z1bmN0aW9uIHNxdWFyZShhKXt2YXIgbD1hLmxlbmd0aCxyPWNyZWF0ZUFycmF5KGwrbCksYmFzZT1CQVNFLHByb2R1Y3QsY2FycnksaSxhX2ksYV9qO2ZvcihpPTA7aTxsO2krKyl7YV9pPWFbaV07Y2Fycnk9MC1hX2kqYV9pO2Zvcih2YXIgaj1pO2o8bDtqKyspe2Ffaj1hW2pdO3Byb2R1Y3Q9MiooYV9pKmFfaikrcltpK2pdK2NhcnJ5O2NhcnJ5PU1hdGguZmxvb3IocHJvZHVjdC9iYXNlKTtyW2kral09cHJvZHVjdC1jYXJyeSpiYXNlfXJbaStsXT1jYXJyeX10cmltKHIpO3JldHVybiByfUJpZ0ludGVnZXIucHJvdG90eXBlLnNxdWFyZT1mdW5jdGlvbigpe3JldHVybiBuZXcgQmlnSW50ZWdlcihzcXVhcmUodGhpcy52YWx1ZSksZmFsc2UpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnNxdWFyZT1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlKnRoaXMudmFsdWU7aWYoaXNQcmVjaXNlKHZhbHVlKSlyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih2YWx1ZSk7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHNxdWFyZShzbWFsbFRvQXJyYXkoTWF0aC5hYnModGhpcy52YWx1ZSkpKSxmYWxzZSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuc3F1YXJlPWZ1bmN0aW9uKHYpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUqdGhpcy52YWx1ZSl9O2Z1bmN0aW9uIGRpdk1vZDEoYSxiKXt2YXIgYV9sPWEubGVuZ3RoLGJfbD1iLmxlbmd0aCxiYXNlPUJBU0UscmVzdWx0PWNyZWF0ZUFycmF5KGIubGVuZ3RoKSxkaXZpc29yTW9zdFNpZ25pZmljYW50RGlnaXQ9YltiX2wtMV0sbGFtYmRhPU1hdGguY2VpbChiYXNlLygyKmRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCkpLHJlbWFpbmRlcj1tdWx0aXBseVNtYWxsKGEsbGFtYmRhKSxkaXZpc29yPW11bHRpcGx5U21hbGwoYixsYW1iZGEpLHF1b3RpZW50RGlnaXQsc2hpZnQsY2FycnksYm9ycm93LGksbCxxO2lmKHJlbWFpbmRlci5sZW5ndGg8PWFfbClyZW1haW5kZXIucHVzaCgwKTtkaXZpc29yLnB1c2goMCk7ZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0PWRpdmlzb3JbYl9sLTFdO2ZvcihzaGlmdD1hX2wtYl9sO3NoaWZ0Pj0wO3NoaWZ0LS0pe3F1b3RpZW50RGlnaXQ9YmFzZS0xO2lmKHJlbWFpbmRlcltzaGlmdCtiX2xdIT09ZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0KXtxdW90aWVudERpZ2l0PU1hdGguZmxvb3IoKHJlbWFpbmRlcltzaGlmdCtiX2xdKmJhc2UrcmVtYWluZGVyW3NoaWZ0K2JfbC0xXSkvZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0KX1jYXJyeT0wO2JvcnJvdz0wO2w9ZGl2aXNvci5sZW5ndGg7Zm9yKGk9MDtpPGw7aSsrKXtjYXJyeSs9cXVvdGllbnREaWdpdCpkaXZpc29yW2ldO3E9TWF0aC5mbG9vcihjYXJyeS9iYXNlKTtib3Jyb3crPXJlbWFpbmRlcltzaGlmdCtpXS0oY2FycnktcSpiYXNlKTtjYXJyeT1xO2lmKGJvcnJvdzwwKXtyZW1haW5kZXJbc2hpZnQraV09Ym9ycm93K2Jhc2U7Ym9ycm93PS0xfWVsc2V7cmVtYWluZGVyW3NoaWZ0K2ldPWJvcnJvdztib3Jyb3c9MH19d2hpbGUoYm9ycm93IT09MCl7cXVvdGllbnREaWdpdC09MTtjYXJyeT0wO2ZvcihpPTA7aTxsO2krKyl7Y2FycnkrPXJlbWFpbmRlcltzaGlmdCtpXS1iYXNlK2Rpdmlzb3JbaV07aWYoY2Fycnk8MCl7cmVtYWluZGVyW3NoaWZ0K2ldPWNhcnJ5K2Jhc2U7Y2Fycnk9MH1lbHNle3JlbWFpbmRlcltzaGlmdCtpXT1jYXJyeTtjYXJyeT0xfX1ib3Jyb3crPWNhcnJ5fXJlc3VsdFtzaGlmdF09cXVvdGllbnREaWdpdH1yZW1haW5kZXI9ZGl2TW9kU21hbGwocmVtYWluZGVyLGxhbWJkYSlbMF07cmV0dXJuW2FycmF5VG9TbWFsbChyZXN1bHQpLGFycmF5VG9TbWFsbChyZW1haW5kZXIpXX1mdW5jdGlvbiBkaXZNb2QyKGEsYil7dmFyIGFfbD1hLmxlbmd0aCxiX2w9Yi5sZW5ndGgscmVzdWx0PVtdLHBhcnQ9W10sYmFzZT1CQVNFLGd1ZXNzLHhsZW4saGlnaHgsaGlnaHksY2hlY2s7d2hpbGUoYV9sKXtwYXJ0LnVuc2hpZnQoYVstLWFfbF0pO3RyaW0ocGFydCk7aWYoY29tcGFyZUFicyhwYXJ0LGIpPDApe3Jlc3VsdC5wdXNoKDApO2NvbnRpbnVlfXhsZW49cGFydC5sZW5ndGg7aGlnaHg9cGFydFt4bGVuLTFdKmJhc2UrcGFydFt4bGVuLTJdO2hpZ2h5PWJbYl9sLTFdKmJhc2UrYltiX2wtMl07aWYoeGxlbj5iX2wpe2hpZ2h4PShoaWdoeCsxKSpiYXNlfWd1ZXNzPU1hdGguY2VpbChoaWdoeC9oaWdoeSk7ZG97Y2hlY2s9bXVsdGlwbHlTbWFsbChiLGd1ZXNzKTtpZihjb21wYXJlQWJzKGNoZWNrLHBhcnQpPD0wKWJyZWFrO2d1ZXNzLS19d2hpbGUoZ3Vlc3MpO3Jlc3VsdC5wdXNoKGd1ZXNzKTtwYXJ0PXN1YnRyYWN0KHBhcnQsY2hlY2spfXJlc3VsdC5yZXZlcnNlKCk7cmV0dXJuW2FycmF5VG9TbWFsbChyZXN1bHQpLGFycmF5VG9TbWFsbChwYXJ0KV19ZnVuY3Rpb24gZGl2TW9kU21hbGwodmFsdWUsbGFtYmRhKXt2YXIgbGVuZ3RoPXZhbHVlLmxlbmd0aCxxdW90aWVudD1jcmVhdGVBcnJheShsZW5ndGgpLGJhc2U9QkFTRSxpLHEscmVtYWluZGVyLGRpdmlzb3I7cmVtYWluZGVyPTA7Zm9yKGk9bGVuZ3RoLTE7aT49MDstLWkpe2Rpdmlzb3I9cmVtYWluZGVyKmJhc2UrdmFsdWVbaV07cT10cnVuY2F0ZShkaXZpc29yL2xhbWJkYSk7cmVtYWluZGVyPWRpdmlzb3ItcSpsYW1iZGE7cXVvdGllbnRbaV09cXwwfXJldHVybltxdW90aWVudCxyZW1haW5kZXJ8MF19ZnVuY3Rpb24gZGl2TW9kQW55KHNlbGYsdil7dmFyIHZhbHVlLG49cGFyc2VWYWx1ZSh2KTtpZihzdXBwb3J0c05hdGl2ZUJpZ0ludCl7cmV0dXJuW25ldyBOYXRpdmVCaWdJbnQoc2VsZi52YWx1ZS9uLnZhbHVlKSxuZXcgTmF0aXZlQmlnSW50KHNlbGYudmFsdWUlbi52YWx1ZSldfXZhciBhPXNlbGYudmFsdWUsYj1uLnZhbHVlO3ZhciBxdW90aWVudDtpZihiPT09MCl0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZGl2aWRlIGJ5IHplcm9cIik7aWYoc2VsZi5pc1NtYWxsKXtpZihuLmlzU21hbGwpe3JldHVybltuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKGEvYikpLG5ldyBTbWFsbEludGVnZXIoYSViKV19cmV0dXJuW0ludGVnZXJbMF0sc2VsZl19aWYobi5pc1NtYWxsKXtpZihiPT09MSlyZXR1cm5bc2VsZixJbnRlZ2VyWzBdXTtpZihiPT0tMSlyZXR1cm5bc2VsZi5uZWdhdGUoKSxJbnRlZ2VyWzBdXTt2YXIgYWJzPU1hdGguYWJzKGIpO2lmKGFiczxCQVNFKXt2YWx1ZT1kaXZNb2RTbWFsbChhLGFicyk7cXVvdGllbnQ9YXJyYXlUb1NtYWxsKHZhbHVlWzBdKTt2YXIgcmVtYWluZGVyPXZhbHVlWzFdO2lmKHNlbGYuc2lnbilyZW1haW5kZXI9LXJlbWFpbmRlcjtpZih0eXBlb2YgcXVvdGllbnQ9PT1cIm51bWJlclwiKXtpZihzZWxmLnNpZ24hPT1uLnNpZ24pcXVvdGllbnQ9LXF1b3RpZW50O3JldHVybltuZXcgU21hbGxJbnRlZ2VyKHF1b3RpZW50KSxuZXcgU21hbGxJbnRlZ2VyKHJlbWFpbmRlcildfXJldHVybltuZXcgQmlnSW50ZWdlcihxdW90aWVudCxzZWxmLnNpZ24hPT1uLnNpZ24pLG5ldyBTbWFsbEludGVnZXIocmVtYWluZGVyKV19Yj1zbWFsbFRvQXJyYXkoYWJzKX12YXIgY29tcGFyaXNvbj1jb21wYXJlQWJzKGEsYik7aWYoY29tcGFyaXNvbj09PS0xKXJldHVybltJbnRlZ2VyWzBdLHNlbGZdO2lmKGNvbXBhcmlzb249PT0wKXJldHVybltJbnRlZ2VyW3NlbGYuc2lnbj09PW4uc2lnbj8xOi0xXSxJbnRlZ2VyWzBdXTtpZihhLmxlbmd0aCtiLmxlbmd0aDw9MjAwKXZhbHVlPWRpdk1vZDEoYSxiKTtlbHNlIHZhbHVlPWRpdk1vZDIoYSxiKTtxdW90aWVudD12YWx1ZVswXTt2YXIgcVNpZ249c2VsZi5zaWduIT09bi5zaWduLG1vZD12YWx1ZVsxXSxtU2lnbj1zZWxmLnNpZ247aWYodHlwZW9mIHF1b3RpZW50PT09XCJudW1iZXJcIil7aWYocVNpZ24pcXVvdGllbnQ9LXF1b3RpZW50O3F1b3RpZW50PW5ldyBTbWFsbEludGVnZXIocXVvdGllbnQpfWVsc2UgcXVvdGllbnQ9bmV3IEJpZ0ludGVnZXIocXVvdGllbnQscVNpZ24pO2lmKHR5cGVvZiBtb2Q9PT1cIm51bWJlclwiKXtpZihtU2lnbiltb2Q9LW1vZDttb2Q9bmV3IFNtYWxsSW50ZWdlcihtb2QpfWVsc2UgbW9kPW5ldyBCaWdJbnRlZ2VyKG1vZCxtU2lnbik7cmV0dXJuW3F1b3RpZW50LG1vZF19QmlnSW50ZWdlci5wcm90b3R5cGUuZGl2bW9kPWZ1bmN0aW9uKHYpe3ZhciByZXN1bHQ9ZGl2TW9kQW55KHRoaXMsdik7cmV0dXJue3F1b3RpZW50OnJlc3VsdFswXSxyZW1haW5kZXI6cmVzdWx0WzFdfX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5kaXZtb2Q9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZtb2Q9QmlnSW50ZWdlci5wcm90b3R5cGUuZGl2bW9kO0JpZ0ludGVnZXIucHJvdG90eXBlLmRpdmlkZT1mdW5jdGlvbih2KXtyZXR1cm4gZGl2TW9kQW55KHRoaXMsdilbMF19O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUub3Zlcj1OYXRpdmVCaWdJbnQucHJvdG90eXBlLmRpdmlkZT1mdW5jdGlvbih2KXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlL3BhcnNlVmFsdWUodikudmFsdWUpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLm92ZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGU9QmlnSW50ZWdlci5wcm90b3R5cGUub3Zlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGU7QmlnSW50ZWdlci5wcm90b3R5cGUubW9kPWZ1bmN0aW9uKHYpe3JldHVybiBkaXZNb2RBbnkodGhpcyx2KVsxXX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5tb2Q9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5yZW1haW5kZXI9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZSVwYXJzZVZhbHVlKHYpLnZhbHVlKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5yZW1haW5kZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tb2Q9QmlnSW50ZWdlci5wcm90b3R5cGUucmVtYWluZGVyPUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3c9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlLHZhbHVlLHgseTtpZihiPT09MClyZXR1cm4gSW50ZWdlclsxXTtpZihhPT09MClyZXR1cm4gSW50ZWdlclswXTtpZihhPT09MSlyZXR1cm4gSW50ZWdlclsxXTtpZihhPT09LTEpcmV0dXJuIG4uaXNFdmVuKCk/SW50ZWdlclsxXTpJbnRlZ2VyWy0xXTtpZihuLnNpZ24pe3JldHVybiBJbnRlZ2VyWzBdfWlmKCFuLmlzU21hbGwpdGhyb3cgbmV3IEVycm9yKFwiVGhlIGV4cG9uZW50IFwiK24udG9TdHJpbmcoKStcIiBpcyB0b28gbGFyZ2UuXCIpO2lmKHRoaXMuaXNTbWFsbCl7aWYoaXNQcmVjaXNlKHZhbHVlPU1hdGgucG93KGEsYikpKXJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKHZhbHVlKSl9eD10aGlzO3k9SW50ZWdlclsxXTt3aGlsZSh0cnVlKXtpZihiJjE9PT0xKXt5PXkudGltZXMoeCk7LS1ifWlmKGI9PT0wKWJyZWFrO2IvPTI7eD14LnNxdWFyZSgpfXJldHVybiB5fTtTbWFsbEludGVnZXIucHJvdG90eXBlLnBvdz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3c7TmF0aXZlQmlnSW50LnByb3RvdHlwZS5wb3c9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlLGI9bi52YWx1ZTt2YXIgXzA9QmlnSW50KDApLF8xPUJpZ0ludCgxKSxfMj1CaWdJbnQoMik7aWYoYj09PV8wKXJldHVybiBJbnRlZ2VyWzFdO2lmKGE9PT1fMClyZXR1cm4gSW50ZWdlclswXTtpZihhPT09XzEpcmV0dXJuIEludGVnZXJbMV07aWYoYT09PUJpZ0ludCgtMSkpcmV0dXJuIG4uaXNFdmVuKCk/SW50ZWdlclsxXTpJbnRlZ2VyWy0xXTtpZihuLmlzTmVnYXRpdmUoKSlyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludChfMCk7dmFyIHg9dGhpczt2YXIgeT1JbnRlZ2VyWzFdO3doaWxlKHRydWUpe2lmKChiJl8xKT09PV8xKXt5PXkudGltZXMoeCk7LS1ifWlmKGI9PT1fMClicmVhaztiLz1fMjt4PXguc3F1YXJlKCl9cmV0dXJuIHl9O0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdz1mdW5jdGlvbihleHAsbW9kKXtleHA9cGFyc2VWYWx1ZShleHApO21vZD1wYXJzZVZhbHVlKG1vZCk7aWYobW9kLmlzWmVybygpKXRocm93IG5ldyBFcnJvcihcIkNhbm5vdCB0YWtlIG1vZFBvdyB3aXRoIG1vZHVsdXMgMFwiKTt2YXIgcj1JbnRlZ2VyWzFdLGJhc2U9dGhpcy5tb2QobW9kKTt3aGlsZShleHAuaXNQb3NpdGl2ZSgpKXtpZihiYXNlLmlzWmVybygpKXJldHVybiBJbnRlZ2VyWzBdO2lmKGV4cC5pc09kZCgpKXI9ci5tdWx0aXBseShiYXNlKS5tb2QobW9kKTtleHA9ZXhwLmRpdmlkZSgyKTtiYXNlPWJhc2Uuc3F1YXJlKCkubW9kKG1vZCl9cmV0dXJuIHJ9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubW9kUG93PVNtYWxsSW50ZWdlci5wcm90b3R5cGUubW9kUG93PUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdztmdW5jdGlvbiBjb21wYXJlQWJzKGEsYil7aWYoYS5sZW5ndGghPT1iLmxlbmd0aCl7cmV0dXJuIGEubGVuZ3RoPmIubGVuZ3RoPzE6LTF9Zm9yKHZhciBpPWEubGVuZ3RoLTE7aT49MDtpLS0pe2lmKGFbaV0hPT1iW2ldKXJldHVybiBhW2ldPmJbaV0/MTotMX1yZXR1cm4gMH1CaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlQWJzPWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodiksYT10aGlzLnZhbHVlLGI9bi52YWx1ZTtpZihuLmlzU21hbGwpcmV0dXJuIDE7cmV0dXJuIGNvbXBhcmVBYnMoYSxiKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlQWJzPWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodiksYT1NYXRoLmFicyh0aGlzLnZhbHVlKSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtiPU1hdGguYWJzKGIpO3JldHVybiBhPT09Yj8wOmE+Yj8xOi0xfXJldHVybi0xfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmNvbXBhcmVBYnM9ZnVuY3Rpb24odil7dmFyIGE9dGhpcy52YWx1ZTt2YXIgYj1wYXJzZVZhbHVlKHYpLnZhbHVlO2E9YT49MD9hOi1hO2I9Yj49MD9iOi1iO3JldHVybiBhPT09Yj8wOmE+Yj8xOi0xfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlPWZ1bmN0aW9uKHYpe2lmKHY9PT1JbmZpbml0eSl7cmV0dXJuLTF9aWYodj09PS1JbmZpbml0eSl7cmV0dXJuIDF9dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlO2lmKHRoaXMuc2lnbiE9PW4uc2lnbil7cmV0dXJuIG4uc2lnbj8xOi0xfWlmKG4uaXNTbWFsbCl7cmV0dXJuIHRoaXMuc2lnbj8tMToxfXJldHVybiBjb21wYXJlQWJzKGEsYikqKHRoaXMuc2lnbj8tMToxKX07QmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZVRvPUJpZ0ludGVnZXIucHJvdG90eXBlLmNvbXBhcmU7U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlPWZ1bmN0aW9uKHYpe2lmKHY9PT1JbmZpbml0eSl7cmV0dXJuLTF9aWYodj09PS1JbmZpbml0eSl7cmV0dXJuIDF9dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlO2lmKG4uaXNTbWFsbCl7cmV0dXJuIGE9PWI/MDphPmI/MTotMX1pZihhPDAhPT1uLnNpZ24pe3JldHVybiBhPDA/LTE6MX1yZXR1cm4gYTwwPzE6LTF9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZVRvPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmNvbXBhcmU9ZnVuY3Rpb24odil7aWYodj09PUluZmluaXR5KXtyZXR1cm4tMX1pZih2PT09LUluZmluaXR5KXtyZXR1cm4gMX12YXIgYT10aGlzLnZhbHVlO3ZhciBiPXBhcnNlVmFsdWUodikudmFsdWU7cmV0dXJuIGE9PT1iPzA6YT5iPzE6LTF9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuY29tcGFyZVRvPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuY29tcGFyZTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5lcXVhbHM9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KT09PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZXE9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5lcXVhbHM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5lcT1TbWFsbEludGVnZXIucHJvdG90eXBlLmVxdWFscz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5lcT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5lcXVhbHM7QmlnSW50ZWdlci5wcm90b3R5cGUubm90RXF1YWxzPWZ1bmN0aW9uKHYpe3JldHVybiB0aGlzLmNvbXBhcmUodikhPT0wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5lcT1OYXRpdmVCaWdJbnQucHJvdG90eXBlLm5vdEVxdWFscz1TbWFsbEludGVnZXIucHJvdG90eXBlLm5lcT1TbWFsbEludGVnZXIucHJvdG90eXBlLm5vdEVxdWFscz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5uZXE9QmlnSW50ZWdlci5wcm90b3R5cGUubm90RXF1YWxzO0JpZ0ludGVnZXIucHJvdG90eXBlLmdyZWF0ZXI9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KT4wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmd0PU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ3JlYXRlcj1TbWFsbEludGVnZXIucHJvdG90eXBlLmd0PVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ndD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyO0JpZ0ludGVnZXIucHJvdG90eXBlLmxlc3Nlcj1mdW5jdGlvbih2KXtyZXR1cm4gdGhpcy5jb21wYXJlKHYpPDB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubHQ9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXNzZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5sdD1TbWFsbEludGVnZXIucHJvdG90eXBlLmxlc3Nlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sdD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXI7QmlnSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzPWZ1bmN0aW9uKHYpe3JldHVybiB0aGlzLmNvbXBhcmUodik+PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ2VxPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ2VxPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzPUJpZ0ludGVnZXIucHJvdG90eXBlLmdlcT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyT3JFcXVhbHM7QmlnSW50ZWdlci5wcm90b3R5cGUubGVzc2VyT3JFcXVhbHM9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KTw9MH07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXE9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXNzZXJPckVxdWFscz1TbWFsbEludGVnZXIucHJvdG90eXBlLmxlcT1TbWFsbEludGVnZXIucHJvdG90eXBlLmxlc3Nlck9yRXF1YWxzPUJpZ0ludGVnZXIucHJvdG90eXBlLmxlcT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXJPckVxdWFscztCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0V2ZW49ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy52YWx1ZVswXSYxKT09PTB9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNFdmVuPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWUmMSk9PT0wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzRXZlbj1mdW5jdGlvbigpe3JldHVybih0aGlzLnZhbHVlJkJpZ0ludCgxKSk9PT1CaWdJbnQoMCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzT2RkPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWVbMF0mMSk9PT0xfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmlzT2RkPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWUmMSk9PT0xfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzT2RkPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWUmQmlnSW50KDEpKT09PUJpZ0ludCgxKX07QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQb3NpdGl2ZT1mdW5jdGlvbigpe3JldHVybiF0aGlzLnNpZ259O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNQb3NpdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlPjB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNQb3NpdGl2ZT1TbWFsbEludGVnZXIucHJvdG90eXBlLmlzUG9zaXRpdmU7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNOZWdhdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnNpZ259O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNOZWdhdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlPDB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNOZWdhdGl2ZT1TbWFsbEludGVnZXIucHJvdG90eXBlLmlzTmVnYXRpdmU7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNVbml0PWZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmlzVW5pdD1mdW5jdGlvbigpe3JldHVybiBNYXRoLmFicyh0aGlzLnZhbHVlKT09PTF9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNVbml0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYWJzKCkudmFsdWU9PT1CaWdJbnQoMSl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzWmVybz1mdW5jdGlvbigpe3JldHVybiBmYWxzZX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1plcm89ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52YWx1ZT09PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNaZXJvPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudmFsdWU9PT1CaWdJbnQoMCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzRGl2aXNpYmxlQnk9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTtpZihuLmlzWmVybygpKXJldHVybiBmYWxzZTtpZihuLmlzVW5pdCgpKXJldHVybiB0cnVlO2lmKG4uY29tcGFyZUFicygyKT09PTApcmV0dXJuIHRoaXMuaXNFdmVuKCk7cmV0dXJuIHRoaXMubW9kKG4pLmlzWmVybygpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzRGl2aXNpYmxlQnk9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc0RpdmlzaWJsZUJ5PUJpZ0ludGVnZXIucHJvdG90eXBlLmlzRGl2aXNpYmxlQnk7ZnVuY3Rpb24gaXNCYXNpY1ByaW1lKHYpe3ZhciBuPXYuYWJzKCk7aWYobi5pc1VuaXQoKSlyZXR1cm4gZmFsc2U7aWYobi5lcXVhbHMoMil8fG4uZXF1YWxzKDMpfHxuLmVxdWFscyg1KSlyZXR1cm4gdHJ1ZTtpZihuLmlzRXZlbigpfHxuLmlzRGl2aXNpYmxlQnkoMyl8fG4uaXNEaXZpc2libGVCeSg1KSlyZXR1cm4gZmFsc2U7aWYobi5sZXNzZXIoNDkpKXJldHVybiB0cnVlfWZ1bmN0aW9uIG1pbGxlclJhYmluVGVzdChuLGEpe3ZhciBuUHJldj1uLnByZXYoKSxiPW5QcmV2LHI9MCxkLHQsaSx4O3doaWxlKGIuaXNFdmVuKCkpYj1iLmRpdmlkZSgyKSxyKys7bmV4dDpmb3IoaT0wO2k8YS5sZW5ndGg7aSsrKXtpZihuLmxlc3NlcihhW2ldKSljb250aW51ZTt4PWJpZ0ludChhW2ldKS5tb2RQb3coYixuKTtpZih4LmlzVW5pdCgpfHx4LmVxdWFscyhuUHJldikpY29udGludWU7Zm9yKGQ9ci0xO2QhPTA7ZC0tKXt4PXguc3F1YXJlKCkubW9kKG4pO2lmKHguaXNVbml0KCkpcmV0dXJuIGZhbHNlO2lmKHguZXF1YWxzKG5QcmV2KSljb250aW51ZSBuZXh0fXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1CaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1ByaW1lPWZ1bmN0aW9uKHN0cmljdCl7dmFyIGlzUHJpbWU9aXNCYXNpY1ByaW1lKHRoaXMpO2lmKGlzUHJpbWUhPT11bmRlZmluZWQpcmV0dXJuIGlzUHJpbWU7dmFyIG49dGhpcy5hYnMoKTt2YXIgYml0cz1uLmJpdExlbmd0aCgpO2lmKGJpdHM8PTY0KXJldHVybiBtaWxsZXJSYWJpblRlc3QobixbMiwzLDUsNywxMSwxMywxNywxOSwyMywyOSwzMSwzN10pO3ZhciBsb2dOPU1hdGgubG9nKDIpKmJpdHMudG9KU051bWJlcigpO3ZhciB0PU1hdGguY2VpbChzdHJpY3Q9PT10cnVlPzIqTWF0aC5wb3cobG9nTiwyKTpsb2dOKTtmb3IodmFyIGE9W10saT0wO2k8dDtpKyspe2EucHVzaChiaWdJbnQoaSsyKSl9cmV0dXJuIG1pbGxlclJhYmluVGVzdChuLGEpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzUHJpbWU9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1ByaW1lPUJpZ0ludGVnZXIucHJvdG90eXBlLmlzUHJpbWU7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lPWZ1bmN0aW9uKGl0ZXJhdGlvbnMpe3ZhciBpc1ByaW1lPWlzQmFzaWNQcmltZSh0aGlzKTtpZihpc1ByaW1lIT09dW5kZWZpbmVkKXJldHVybiBpc1ByaW1lO3ZhciBuPXRoaXMuYWJzKCk7dmFyIHQ9aXRlcmF0aW9ucz09PXVuZGVmaW5lZD81Oml0ZXJhdGlvbnM7Zm9yKHZhciBhPVtdLGk9MDtpPHQ7aSsrKXthLnB1c2goYmlnSW50LnJhbmRCZXR3ZWVuKDIsbi5taW51cygyKSkpfXJldHVybiBtaWxsZXJSYWJpblRlc3QobixhKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWU9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWU9QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lO0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludj1mdW5jdGlvbihuKXt2YXIgdD1iaWdJbnQuemVybyxuZXdUPWJpZ0ludC5vbmUscj1wYXJzZVZhbHVlKG4pLG5ld1I9dGhpcy5hYnMoKSxxLGxhc3RULGxhc3RSO3doaWxlKCFuZXdSLmlzWmVybygpKXtxPXIuZGl2aWRlKG5ld1IpO2xhc3RUPXQ7bGFzdFI9cjt0PW5ld1Q7cj1uZXdSO25ld1Q9bGFzdFQuc3VidHJhY3QocS5tdWx0aXBseShuZXdUKSk7bmV3Uj1sYXN0Ui5zdWJ0cmFjdChxLm11bHRpcGx5KG5ld1IpKX1pZighci5pc1VuaXQoKSl0aHJvdyBuZXcgRXJyb3IodGhpcy50b1N0cmluZygpK1wiIGFuZCBcIituLnRvU3RyaW5nKCkrXCIgYXJlIG5vdCBjby1wcmltZVwiKTtpZih0LmNvbXBhcmUoMCk9PT0tMSl7dD10LmFkZChuKX1pZih0aGlzLmlzTmVnYXRpdmUoKSl7cmV0dXJuIHQubmVnYXRlKCl9cmV0dXJuIHR9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubW9kSW52PVNtYWxsSW50ZWdlci5wcm90b3R5cGUubW9kSW52PUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludjtCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZXh0PWZ1bmN0aW9uKCl7dmFyIHZhbHVlPXRoaXMudmFsdWU7aWYodGhpcy5zaWduKXtyZXR1cm4gc3VidHJhY3RTbWFsbCh2YWx1ZSwxLHRoaXMuc2lnbil9cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGFkZFNtYWxsKHZhbHVlLDEpLHRoaXMuc2lnbil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUubmV4dD1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlO2lmKHZhbHVlKzE8TUFYX0lOVClyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih2YWx1ZSsxKTtyZXR1cm4gbmV3IEJpZ0ludGVnZXIoTUFYX0lOVF9BUlIsZmFsc2UpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5leHQ9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlK0JpZ0ludCgxKSl9O0JpZ0ludGVnZXIucHJvdG90eXBlLnByZXY9ZnVuY3Rpb24oKXt2YXIgdmFsdWU9dGhpcy52YWx1ZTtpZih0aGlzLnNpZ24pe3JldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbCh2YWx1ZSwxKSx0cnVlKX1yZXR1cm4gc3VidHJhY3RTbWFsbCh2YWx1ZSwxLHRoaXMuc2lnbil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUucHJldj1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlO2lmKHZhbHVlLTE+LU1BWF9JTlQpcmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUtMSk7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKE1BWF9JTlRfQVJSLHRydWUpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnByZXY9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlLUJpZ0ludCgxKSl9O3ZhciBwb3dlcnNPZlR3bz1bMV07d2hpbGUoMipwb3dlcnNPZlR3b1twb3dlcnNPZlR3by5sZW5ndGgtMV08PUJBU0UpcG93ZXJzT2ZUd28ucHVzaCgyKnBvd2Vyc09mVHdvW3Bvd2Vyc09mVHdvLmxlbmd0aC0xXSk7dmFyIHBvd2VyczJMZW5ndGg9cG93ZXJzT2ZUd28ubGVuZ3RoLGhpZ2hlc3RQb3dlcjI9cG93ZXJzT2ZUd29bcG93ZXJzMkxlbmd0aC0xXTtmdW5jdGlvbiBzaGlmdF9pc1NtYWxsKG4pe3JldHVybiBNYXRoLmFicyhuKTw9QkFTRX1CaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQ9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KS50b0pTTnVtYmVyKCk7aWYoIXNoaWZ0X2lzU21hbGwobikpe3Rocm93IG5ldyBFcnJvcihTdHJpbmcobikrXCIgaXMgdG9vIGxhcmdlIGZvciBzaGlmdGluZy5cIil9aWYobjwwKXJldHVybiB0aGlzLnNoaWZ0UmlnaHQoLW4pO3ZhciByZXN1bHQ9dGhpcztpZihyZXN1bHQuaXNaZXJvKCkpcmV0dXJuIHJlc3VsdDt3aGlsZShuPj1wb3dlcnMyTGVuZ3RoKXtyZXN1bHQ9cmVzdWx0Lm11bHRpcGx5KGhpZ2hlc3RQb3dlcjIpO24tPXBvd2VyczJMZW5ndGgtMX1yZXR1cm4gcmVzdWx0Lm11bHRpcGx5KHBvd2Vyc09mVHdvW25dKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5zaGlmdExlZnQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQ9QmlnSW50ZWdlci5wcm90b3R5cGUuc2hpZnRMZWZ0O0JpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQ9ZnVuY3Rpb24odil7dmFyIHJlbVF1bzt2YXIgbj1wYXJzZVZhbHVlKHYpLnRvSlNOdW1iZXIoKTtpZighc2hpZnRfaXNTbWFsbChuKSl7dGhyb3cgbmV3IEVycm9yKFN0cmluZyhuKStcIiBpcyB0b28gbGFyZ2UgZm9yIHNoaWZ0aW5nLlwiKX1pZihuPDApcmV0dXJuIHRoaXMuc2hpZnRMZWZ0KC1uKTt2YXIgcmVzdWx0PXRoaXM7d2hpbGUobj49cG93ZXJzMkxlbmd0aCl7aWYocmVzdWx0LmlzWmVybygpfHxyZXN1bHQuaXNOZWdhdGl2ZSgpJiZyZXN1bHQuaXNVbml0KCkpcmV0dXJuIHJlc3VsdDtyZW1RdW89ZGl2TW9kQW55KHJlc3VsdCxoaWdoZXN0UG93ZXIyKTtyZXN1bHQ9cmVtUXVvWzFdLmlzTmVnYXRpdmUoKT9yZW1RdW9bMF0ucHJldigpOnJlbVF1b1swXTtuLT1wb3dlcnMyTGVuZ3RoLTF9cmVtUXVvPWRpdk1vZEFueShyZXN1bHQscG93ZXJzT2ZUd29bbl0pO3JldHVybiByZW1RdW9bMV0uaXNOZWdhdGl2ZSgpP3JlbVF1b1swXS5wcmV2KCk6cmVtUXVvWzBdfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnNoaWZ0UmlnaHQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdFJpZ2h0PUJpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQ7ZnVuY3Rpb24gYml0d2lzZSh4LHksZm4pe3k9cGFyc2VWYWx1ZSh5KTt2YXIgeFNpZ249eC5pc05lZ2F0aXZlKCkseVNpZ249eS5pc05lZ2F0aXZlKCk7dmFyIHhSZW09eFNpZ24/eC5ub3QoKTp4LHlSZW09eVNpZ24/eS5ub3QoKTp5O3ZhciB4RGlnaXQ9MCx5RGlnaXQ9MDt2YXIgeERpdk1vZD1udWxsLHlEaXZNb2Q9bnVsbDt2YXIgcmVzdWx0PVtdO3doaWxlKCF4UmVtLmlzWmVybygpfHwheVJlbS5pc1plcm8oKSl7eERpdk1vZD1kaXZNb2RBbnkoeFJlbSxoaWdoZXN0UG93ZXIyKTt4RGlnaXQ9eERpdk1vZFsxXS50b0pTTnVtYmVyKCk7aWYoeFNpZ24pe3hEaWdpdD1oaWdoZXN0UG93ZXIyLTEteERpZ2l0fXlEaXZNb2Q9ZGl2TW9kQW55KHlSZW0saGlnaGVzdFBvd2VyMik7eURpZ2l0PXlEaXZNb2RbMV0udG9KU051bWJlcigpO2lmKHlTaWduKXt5RGlnaXQ9aGlnaGVzdFBvd2VyMi0xLXlEaWdpdH14UmVtPXhEaXZNb2RbMF07eVJlbT15RGl2TW9kWzBdO3Jlc3VsdC5wdXNoKGZuKHhEaWdpdCx5RGlnaXQpKX12YXIgc3VtPWZuKHhTaWduPzE6MCx5U2lnbj8xOjApIT09MD9iaWdJbnQoLTEpOmJpZ0ludCgwKTtmb3IodmFyIGk9cmVzdWx0Lmxlbmd0aC0xO2k+PTA7aS09MSl7c3VtPXN1bS5tdWx0aXBseShoaWdoZXN0UG93ZXIyKS5hZGQoYmlnSW50KHJlc3VsdFtpXSkpfXJldHVybiBzdW19QmlnSW50ZWdlci5wcm90b3R5cGUubm90PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubmVnYXRlKCkucHJldigpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5vdD1TbWFsbEludGVnZXIucHJvdG90eXBlLm5vdD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ub3Q7QmlnSW50ZWdlci5wcm90b3R5cGUuYW5kPWZ1bmN0aW9uKG4pe3JldHVybiBiaXR3aXNlKHRoaXMsbixmdW5jdGlvbihhLGIpe3JldHVybiBhJmJ9KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hbmQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hbmQ9QmlnSW50ZWdlci5wcm90b3R5cGUuYW5kO0JpZ0ludGVnZXIucHJvdG90eXBlLm9yPWZ1bmN0aW9uKG4pe3JldHVybiBiaXR3aXNlKHRoaXMsbixmdW5jdGlvbihhLGIpe3JldHVybiBhfGJ9KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5vcj1TbWFsbEludGVnZXIucHJvdG90eXBlLm9yPUJpZ0ludGVnZXIucHJvdG90eXBlLm9yO0JpZ0ludGVnZXIucHJvdG90eXBlLnhvcj1mdW5jdGlvbihuKXtyZXR1cm4gYml0d2lzZSh0aGlzLG4sZnVuY3Rpb24oYSxiKXtyZXR1cm4gYV5ifSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUueG9yPVNtYWxsSW50ZWdlci5wcm90b3R5cGUueG9yPUJpZ0ludGVnZXIucHJvdG90eXBlLnhvcjt2YXIgTE9CTUFTS19JPTE8PDMwLExPQk1BU0tfQkk9KEJBU0UmLUJBU0UpKihCQVNFJi1CQVNFKXxMT0JNQVNLX0k7ZnVuY3Rpb24gcm91Z2hMT0Iobil7dmFyIHY9bi52YWx1ZSx4PXR5cGVvZiB2PT09XCJudW1iZXJcIj92fExPQk1BU0tfSTp0eXBlb2Ygdj09PVwiYmlnaW50XCI/dnxCaWdJbnQoTE9CTUFTS19JKTp2WzBdK3ZbMV0qQkFTRXxMT0JNQVNLX0JJO3JldHVybiB4Ji14fWZ1bmN0aW9uIGludGVnZXJMb2dhcml0aG0odmFsdWUsYmFzZSl7aWYoYmFzZS5jb21wYXJlVG8odmFsdWUpPD0wKXt2YXIgdG1wPWludGVnZXJMb2dhcml0aG0odmFsdWUsYmFzZS5zcXVhcmUoYmFzZSkpO3ZhciBwPXRtcC5wO3ZhciBlPXRtcC5lO3ZhciB0PXAubXVsdGlwbHkoYmFzZSk7cmV0dXJuIHQuY29tcGFyZVRvKHZhbHVlKTw9MD97cDp0LGU6ZSoyKzF9OntwOnAsZTplKjJ9fXJldHVybntwOmJpZ0ludCgxKSxlOjB9fUJpZ0ludGVnZXIucHJvdG90eXBlLmJpdExlbmd0aD1mdW5jdGlvbigpe3ZhciBuPXRoaXM7aWYobi5jb21wYXJlVG8oYmlnSW50KDApKTwwKXtuPW4ubmVnYXRlKCkuc3VidHJhY3QoYmlnSW50KDEpKX1pZihuLmNvbXBhcmVUbyhiaWdJbnQoMCkpPT09MCl7cmV0dXJuIGJpZ0ludCgwKX1yZXR1cm4gYmlnSW50KGludGVnZXJMb2dhcml0aG0obixiaWdJbnQoMikpLmUpLmFkZChiaWdJbnQoMSkpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmJpdExlbmd0aD1TbWFsbEludGVnZXIucHJvdG90eXBlLmJpdExlbmd0aD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXRMZW5ndGg7ZnVuY3Rpb24gbWF4KGEsYil7YT1wYXJzZVZhbHVlKGEpO2I9cGFyc2VWYWx1ZShiKTtyZXR1cm4gYS5ncmVhdGVyKGIpP2E6Yn1mdW5jdGlvbiBtaW4oYSxiKXthPXBhcnNlVmFsdWUoYSk7Yj1wYXJzZVZhbHVlKGIpO3JldHVybiBhLmxlc3NlcihiKT9hOmJ9ZnVuY3Rpb24gZ2NkKGEsYil7YT1wYXJzZVZhbHVlKGEpLmFicygpO2I9cGFyc2VWYWx1ZShiKS5hYnMoKTtpZihhLmVxdWFscyhiKSlyZXR1cm4gYTtpZihhLmlzWmVybygpKXJldHVybiBiO2lmKGIuaXNaZXJvKCkpcmV0dXJuIGE7dmFyIGM9SW50ZWdlclsxXSxkLHQ7d2hpbGUoYS5pc0V2ZW4oKSYmYi5pc0V2ZW4oKSl7ZD1taW4ocm91Z2hMT0IoYSkscm91Z2hMT0IoYikpO2E9YS5kaXZpZGUoZCk7Yj1iLmRpdmlkZShkKTtjPWMubXVsdGlwbHkoZCl9d2hpbGUoYS5pc0V2ZW4oKSl7YT1hLmRpdmlkZShyb3VnaExPQihhKSl9ZG97d2hpbGUoYi5pc0V2ZW4oKSl7Yj1iLmRpdmlkZShyb3VnaExPQihiKSl9aWYoYS5ncmVhdGVyKGIpKXt0PWI7Yj1hO2E9dH1iPWIuc3VidHJhY3QoYSl9d2hpbGUoIWIuaXNaZXJvKCkpO3JldHVybiBjLmlzVW5pdCgpP2E6YS5tdWx0aXBseShjKX1mdW5jdGlvbiBsY20oYSxiKXthPXBhcnNlVmFsdWUoYSkuYWJzKCk7Yj1wYXJzZVZhbHVlKGIpLmFicygpO3JldHVybiBhLmRpdmlkZShnY2QoYSxiKSkubXVsdGlwbHkoYil9ZnVuY3Rpb24gcmFuZEJldHdlZW4oYSxiKXthPXBhcnNlVmFsdWUoYSk7Yj1wYXJzZVZhbHVlKGIpO3ZhciBsb3c9bWluKGEsYiksaGlnaD1tYXgoYSxiKTt2YXIgcmFuZ2U9aGlnaC5zdWJ0cmFjdChsb3cpLmFkZCgxKTtpZihyYW5nZS5pc1NtYWxsKXJldHVybiBsb3cuYWRkKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpyYW5nZSkpO3ZhciBkaWdpdHM9dG9CYXNlKHJhbmdlLEJBU0UpLnZhbHVlO3ZhciByZXN1bHQ9W10scmVzdHJpY3RlZD10cnVlO2Zvcih2YXIgaT0wO2k8ZGlnaXRzLmxlbmd0aDtpKyspe3ZhciB0b3A9cmVzdHJpY3RlZD9kaWdpdHNbaV06QkFTRTt2YXIgZGlnaXQ9dHJ1bmNhdGUoTWF0aC5yYW5kb20oKSp0b3ApO3Jlc3VsdC5wdXNoKGRpZ2l0KTtpZihkaWdpdDx0b3ApcmVzdHJpY3RlZD1mYWxzZX1yZXR1cm4gbG93LmFkZChJbnRlZ2VyLmZyb21BcnJheShyZXN1bHQsQkFTRSxmYWxzZSkpfXZhciBwYXJzZUJhc2U9ZnVuY3Rpb24odGV4dCxiYXNlLGFscGhhYmV0LGNhc2VTZW5zaXRpdmUpe2FscGhhYmV0PWFscGhhYmV0fHxERUZBVUxUX0FMUEhBQkVUO3RleHQ9U3RyaW5nKHRleHQpO2lmKCFjYXNlU2Vuc2l0aXZlKXt0ZXh0PXRleHQudG9Mb3dlckNhc2UoKTthbHBoYWJldD1hbHBoYWJldC50b0xvd2VyQ2FzZSgpfXZhciBsZW5ndGg9dGV4dC5sZW5ndGg7dmFyIGk7dmFyIGFic0Jhc2U9TWF0aC5hYnMoYmFzZSk7dmFyIGFscGhhYmV0VmFsdWVzPXt9O2ZvcihpPTA7aTxhbHBoYWJldC5sZW5ndGg7aSsrKXthbHBoYWJldFZhbHVlc1thbHBoYWJldFtpXV09aX1mb3IoaT0wO2k8bGVuZ3RoO2krKyl7dmFyIGM9dGV4dFtpXTtpZihjPT09XCItXCIpY29udGludWU7aWYoYyBpbiBhbHBoYWJldFZhbHVlcyl7aWYoYWxwaGFiZXRWYWx1ZXNbY10+PWFic0Jhc2Upe2lmKGM9PT1cIjFcIiYmYWJzQmFzZT09PTEpY29udGludWU7dGhyb3cgbmV3IEVycm9yKGMrXCIgaXMgbm90IGEgdmFsaWQgZGlnaXQgaW4gYmFzZSBcIitiYXNlK1wiLlwiKX19fWJhc2U9cGFyc2VWYWx1ZShiYXNlKTt2YXIgZGlnaXRzPVtdO3ZhciBpc05lZ2F0aXZlPXRleHRbMF09PT1cIi1cIjtmb3IoaT1pc05lZ2F0aXZlPzE6MDtpPHRleHQubGVuZ3RoO2krKyl7dmFyIGM9dGV4dFtpXTtpZihjIGluIGFscGhhYmV0VmFsdWVzKWRpZ2l0cy5wdXNoKHBhcnNlVmFsdWUoYWxwaGFiZXRWYWx1ZXNbY10pKTtlbHNlIGlmKGM9PT1cIjxcIil7dmFyIHN0YXJ0PWk7ZG97aSsrfXdoaWxlKHRleHRbaV0hPT1cIj5cIiYmaTx0ZXh0Lmxlbmd0aCk7ZGlnaXRzLnB1c2gocGFyc2VWYWx1ZSh0ZXh0LnNsaWNlKHN0YXJ0KzEsaSkpKX1lbHNlIHRocm93IG5ldyBFcnJvcihjK1wiIGlzIG5vdCBhIHZhbGlkIGNoYXJhY3RlclwiKX1yZXR1cm4gcGFyc2VCYXNlRnJvbUFycmF5KGRpZ2l0cyxiYXNlLGlzTmVnYXRpdmUpfTtmdW5jdGlvbiBwYXJzZUJhc2VGcm9tQXJyYXkoZGlnaXRzLGJhc2UsaXNOZWdhdGl2ZSl7dmFyIHZhbD1JbnRlZ2VyWzBdLHBvdz1JbnRlZ2VyWzFdLGk7Zm9yKGk9ZGlnaXRzLmxlbmd0aC0xO2k+PTA7aS0tKXt2YWw9dmFsLmFkZChkaWdpdHNbaV0udGltZXMocG93KSk7cG93PXBvdy50aW1lcyhiYXNlKX1yZXR1cm4gaXNOZWdhdGl2ZT92YWwubmVnYXRlKCk6dmFsfWZ1bmN0aW9uIHN0cmluZ2lmeShkaWdpdCxhbHBoYWJldCl7YWxwaGFiZXQ9YWxwaGFiZXR8fERFRkFVTFRfQUxQSEFCRVQ7aWYoZGlnaXQ8YWxwaGFiZXQubGVuZ3RoKXtyZXR1cm4gYWxwaGFiZXRbZGlnaXRdfXJldHVyblwiPFwiK2RpZ2l0K1wiPlwifWZ1bmN0aW9uIHRvQmFzZShuLGJhc2Upe2Jhc2U9YmlnSW50KGJhc2UpO2lmKGJhc2UuaXNaZXJvKCkpe2lmKG4uaXNaZXJvKCkpcmV0dXJue3ZhbHVlOlswXSxpc05lZ2F0aXZlOmZhbHNlfTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY29udmVydCBub256ZXJvIG51bWJlcnMgdG8gYmFzZSAwLlwiKX1pZihiYXNlLmVxdWFscygtMSkpe2lmKG4uaXNaZXJvKCkpcmV0dXJue3ZhbHVlOlswXSxpc05lZ2F0aXZlOmZhbHNlfTtpZihuLmlzTmVnYXRpdmUoKSlyZXR1cm57dmFsdWU6W10uY29uY2F0LmFwcGx5KFtdLEFycmF5LmFwcGx5KG51bGwsQXJyYXkoLW4udG9KU051bWJlcigpKSkubWFwKEFycmF5LnByb3RvdHlwZS52YWx1ZU9mLFsxLDBdKSksaXNOZWdhdGl2ZTpmYWxzZX07dmFyIGFycj1BcnJheS5hcHBseShudWxsLEFycmF5KG4udG9KU051bWJlcigpLTEpKS5tYXAoQXJyYXkucHJvdG90eXBlLnZhbHVlT2YsWzAsMV0pO2Fyci51bnNoaWZ0KFsxXSk7cmV0dXJue3ZhbHVlOltdLmNvbmNhdC5hcHBseShbXSxhcnIpLGlzTmVnYXRpdmU6ZmFsc2V9fXZhciBuZWc9ZmFsc2U7aWYobi5pc05lZ2F0aXZlKCkmJmJhc2UuaXNQb3NpdGl2ZSgpKXtuZWc9dHJ1ZTtuPW4uYWJzKCl9aWYoYmFzZS5pc1VuaXQoKSl7aWYobi5pc1plcm8oKSlyZXR1cm57dmFsdWU6WzBdLGlzTmVnYXRpdmU6ZmFsc2V9O3JldHVybnt2YWx1ZTpBcnJheS5hcHBseShudWxsLEFycmF5KG4udG9KU051bWJlcigpKSkubWFwKE51bWJlci5wcm90b3R5cGUudmFsdWVPZiwxKSxpc05lZ2F0aXZlOm5lZ319dmFyIG91dD1bXTt2YXIgbGVmdD1uLGRpdm1vZDt3aGlsZShsZWZ0LmlzTmVnYXRpdmUoKXx8bGVmdC5jb21wYXJlQWJzKGJhc2UpPj0wKXtkaXZtb2Q9bGVmdC5kaXZtb2QoYmFzZSk7bGVmdD1kaXZtb2QucXVvdGllbnQ7dmFyIGRpZ2l0PWRpdm1vZC5yZW1haW5kZXI7aWYoZGlnaXQuaXNOZWdhdGl2ZSgpKXtkaWdpdD1iYXNlLm1pbnVzKGRpZ2l0KS5hYnMoKTtsZWZ0PWxlZnQubmV4dCgpfW91dC5wdXNoKGRpZ2l0LnRvSlNOdW1iZXIoKSl9b3V0LnB1c2gobGVmdC50b0pTTnVtYmVyKCkpO3JldHVybnt2YWx1ZTpvdXQucmV2ZXJzZSgpLGlzTmVnYXRpdmU6bmVnfX1mdW5jdGlvbiB0b0Jhc2VTdHJpbmcobixiYXNlLGFscGhhYmV0KXt2YXIgYXJyPXRvQmFzZShuLGJhc2UpO3JldHVybihhcnIuaXNOZWdhdGl2ZT9cIi1cIjpcIlwiKSthcnIudmFsdWUubWFwKGZ1bmN0aW9uKHgpe3JldHVybiBzdHJpbmdpZnkoeCxhbHBoYWJldCl9KS5qb2luKFwiXCIpfUJpZ0ludGVnZXIucHJvdG90eXBlLnRvQXJyYXk9ZnVuY3Rpb24ocmFkaXgpe3JldHVybiB0b0Jhc2UodGhpcyxyYWRpeCl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUudG9BcnJheT1mdW5jdGlvbihyYWRpeCl7cmV0dXJuIHRvQmFzZSh0aGlzLHJhZGl4KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50b0FycmF5PWZ1bmN0aW9uKHJhZGl4KXtyZXR1cm4gdG9CYXNlKHRoaXMscmFkaXgpfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbihyYWRpeCxhbHBoYWJldCl7aWYocmFkaXg9PT11bmRlZmluZWQpcmFkaXg9MTA7aWYocmFkaXghPT0xMClyZXR1cm4gdG9CYXNlU3RyaW5nKHRoaXMscmFkaXgsYWxwaGFiZXQpO3ZhciB2PXRoaXMudmFsdWUsbD12Lmxlbmd0aCxzdHI9U3RyaW5nKHZbLS1sXSksemVyb3M9XCIwMDAwMDAwXCIsZGlnaXQ7d2hpbGUoLS1sPj0wKXtkaWdpdD1TdHJpbmcodltsXSk7c3RyKz16ZXJvcy5zbGljZShkaWdpdC5sZW5ndGgpK2RpZ2l0fXZhciBzaWduPXRoaXMuc2lnbj9cIi1cIjpcIlwiO3JldHVybiBzaWduK3N0cn07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbihyYWRpeCxhbHBoYWJldCl7aWYocmFkaXg9PT11bmRlZmluZWQpcmFkaXg9MTA7aWYocmFkaXghPTEwKXJldHVybiB0b0Jhc2VTdHJpbmcodGhpcyxyYWRpeCxhbHBoYWJldCk7cmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50b1N0cmluZz1TbWFsbEludGVnZXIucHJvdG90eXBlLnRvU3RyaW5nO05hdGl2ZUJpZ0ludC5wcm90b3R5cGUudG9KU09OPUJpZ0ludGVnZXIucHJvdG90eXBlLnRvSlNPTj1TbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnRvU3RyaW5nKCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLnZhbHVlT2Y9ZnVuY3Rpb24oKXtyZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLDEwKX07QmlnSW50ZWdlci5wcm90b3R5cGUudG9KU051bWJlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS52YWx1ZU9mO1NtYWxsSW50ZWdlci5wcm90b3R5cGUudmFsdWVPZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNOdW1iZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS52YWx1ZU9mO05hdGl2ZUJpZ0ludC5wcm90b3R5cGUudmFsdWVPZj1OYXRpdmVCaWdJbnQucHJvdG90eXBlLnRvSlNOdW1iZXI9ZnVuY3Rpb24oKXtyZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLDEwKX07ZnVuY3Rpb24gcGFyc2VTdHJpbmdWYWx1ZSh2KXtpZihpc1ByZWNpc2UoK3YpKXt2YXIgeD0rdjtpZih4PT09dHJ1bmNhdGUoeCkpcmV0dXJuIHN1cHBvcnRzTmF0aXZlQmlnSW50P25ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHgpKTpuZXcgU21hbGxJbnRlZ2VyKHgpO3Rocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIrdil9dmFyIHNpZ249dlswXT09PVwiLVwiO2lmKHNpZ24pdj12LnNsaWNlKDEpO3ZhciBzcGxpdD12LnNwbGl0KC9lL2kpO2lmKHNwbGl0Lmxlbmd0aD4yKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIrc3BsaXQuam9pbihcImVcIikpO2lmKHNwbGl0Lmxlbmd0aD09PTIpe3ZhciBleHA9c3BsaXRbMV07aWYoZXhwWzBdPT09XCIrXCIpZXhwPWV4cC5zbGljZSgxKTtleHA9K2V4cDtpZihleHAhPT10cnVuY2F0ZShleHApfHwhaXNQcmVjaXNlKGV4cCkpdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnRlZ2VyOiBcIitleHArXCIgaXMgbm90IGEgdmFsaWQgZXhwb25lbnQuXCIpO3ZhciB0ZXh0PXNwbGl0WzBdO3ZhciBkZWNpbWFsUGxhY2U9dGV4dC5pbmRleE9mKFwiLlwiKTtpZihkZWNpbWFsUGxhY2U+PTApe2V4cC09dGV4dC5sZW5ndGgtZGVjaW1hbFBsYWNlLTE7dGV4dD10ZXh0LnNsaWNlKDAsZGVjaW1hbFBsYWNlKSt0ZXh0LnNsaWNlKGRlY2ltYWxQbGFjZSsxKX1pZihleHA8MCl0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgaW5jbHVkZSBuZWdhdGl2ZSBleHBvbmVudCBwYXJ0IGZvciBpbnRlZ2Vyc1wiKTt0ZXh0Kz1uZXcgQXJyYXkoZXhwKzEpLmpvaW4oXCIwXCIpO3Y9dGV4dH12YXIgaXNWYWxpZD0vXihbMC05XVswLTldKikkLy50ZXN0KHYpO2lmKCFpc1ZhbGlkKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIrdik7aWYoc3VwcG9ydHNOYXRpdmVCaWdJbnQpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KEJpZ0ludChzaWduP1wiLVwiK3Y6dikpfXZhciByPVtdLG1heD12Lmxlbmd0aCxsPUxPR19CQVNFLG1pbj1tYXgtbDt3aGlsZShtYXg+MCl7ci5wdXNoKCt2LnNsaWNlKG1pbixtYXgpKTttaW4tPWw7aWYobWluPDApbWluPTA7bWF4LT1sfXRyaW0ocik7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHIsc2lnbil9ZnVuY3Rpb24gcGFyc2VOdW1iZXJWYWx1ZSh2KXtpZihzdXBwb3J0c05hdGl2ZUJpZ0ludCl7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHYpKX1pZihpc1ByZWNpc2Uodikpe2lmKHYhPT10cnVuY2F0ZSh2KSl0aHJvdyBuZXcgRXJyb3IoditcIiBpcyBub3QgYW4gaW50ZWdlci5cIik7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIodil9cmV0dXJuIHBhcnNlU3RyaW5nVmFsdWUodi50b1N0cmluZygpKX1mdW5jdGlvbiBwYXJzZVZhbHVlKHYpe2lmKHR5cGVvZiB2PT09XCJudW1iZXJcIil7cmV0dXJuIHBhcnNlTnVtYmVyVmFsdWUodil9aWYodHlwZW9mIHY9PT1cInN0cmluZ1wiKXtyZXR1cm4gcGFyc2VTdHJpbmdWYWx1ZSh2KX1pZih0eXBlb2Ygdj09PVwiYmlnaW50XCIpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHYpfXJldHVybiB2fWZvcih2YXIgaT0wO2k8MWUzO2krKyl7SW50ZWdlcltpXT1wYXJzZVZhbHVlKGkpO2lmKGk+MClJbnRlZ2VyWy1pXT1wYXJzZVZhbHVlKC1pKX1JbnRlZ2VyLm9uZT1JbnRlZ2VyWzFdO0ludGVnZXIuemVybz1JbnRlZ2VyWzBdO0ludGVnZXIubWludXNPbmU9SW50ZWdlclstMV07SW50ZWdlci5tYXg9bWF4O0ludGVnZXIubWluPW1pbjtJbnRlZ2VyLmdjZD1nY2Q7SW50ZWdlci5sY209bGNtO0ludGVnZXIuaXNJbnN0YW5jZT1mdW5jdGlvbih4KXtyZXR1cm4geCBpbnN0YW5jZW9mIEJpZ0ludGVnZXJ8fHggaW5zdGFuY2VvZiBTbWFsbEludGVnZXJ8fHggaW5zdGFuY2VvZiBOYXRpdmVCaWdJbnR9O0ludGVnZXIucmFuZEJldHdlZW49cmFuZEJldHdlZW47SW50ZWdlci5mcm9tQXJyYXk9ZnVuY3Rpb24oZGlnaXRzLGJhc2UsaXNOZWdhdGl2ZSl7cmV0dXJuIHBhcnNlQmFzZUZyb21BcnJheShkaWdpdHMubWFwKHBhcnNlVmFsdWUpLHBhcnNlVmFsdWUoYmFzZXx8MTApLGlzTmVnYXRpdmUpfTtyZXR1cm4gSW50ZWdlcn0oKTtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmhhc093blByb3BlcnR5KFwiZXhwb3J0c1wiKSl7bW9kdWxlLmV4cG9ydHM9YmlnSW50fWlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShcImJpZy1pbnRlZ2VyXCIsW10sZnVuY3Rpb24oKXtyZXR1cm4gYmlnSW50fSl9IiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbi8qKlxuICogQG1vZHVsZSBGYWN0b3J5TWFrZXJcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgRmFjdG9yeU1ha2VyID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIGxldCBpbnN0YW5jZTtcbiAgICBjb25zdCBzaW5nbGV0b25Db250ZXh0cyA9IFtdO1xuICAgIGNvbnN0IHNpbmdsZXRvbkZhY3RvcmllcyA9IHt9O1xuICAgIGNvbnN0IGNsYXNzRmFjdG9yaWVzID0ge307XG5cbiAgICBmdW5jdGlvbiBleHRlbmQobmFtZSwgY2hpbGRJbnN0YW5jZSwgb3ZlcnJpZGUsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCFjb250ZXh0W25hbWVdICYmIGNoaWxkSW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGNvbnRleHRbbmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2U6IGNoaWxkSW5zdGFuY2UsXG4gICAgICAgICAgICAgICAgb3ZlcnJpZGU6IG92ZXJyaWRlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgbWV0aG9kIGZyb20geW91ciBleHRlbmRlZCBvYmplY3QuICB0aGlzLmZhY3RvcnkgaXMgaW5qZWN0ZWQgaW50byB5b3VyIG9iamVjdC5cbiAgICAgKiB0aGlzLmZhY3RvcnkuZ2V0U2luZ2xldG9uSW5zdGFuY2UodGhpcy5jb250ZXh0LCAnVmlkZW9Nb2RlbCcpXG4gICAgICogd2lsbCByZXR1cm4gdGhlIHZpZGVvIG1vZGVsIGZvciB1c2UgaW4gdGhlIGV4dGVuZGVkIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gaW5qZWN0ZWQgaW50byBleHRlbmRlZCBvYmplY3QgYXMgdGhpcy5jb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSAtIHN0cmluZyBuYW1lIGZvdW5kIGluIGFsbCBkYXNoLmpzIG9iamVjdHNcbiAgICAgKiB3aXRoIG5hbWUgX19kYXNoanNfZmFjdG9yeV9uYW1lIFdpbGwgYmUgYXQgdGhlIGJvdHRvbS4gV2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgb2JqZWN0J3MgbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7Kn0gQ29udGV4dCBhd2FyZSBpbnN0YW5jZSBvZiBzcGVjaWZpZWQgc2luZ2xldG9uIG5hbWUuXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpGYWN0b3J5TWFrZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRTaW5nbGV0b25JbnN0YW5jZShjb250ZXh0LCBjbGFzc05hbWUpIHtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHNpbmdsZXRvbkNvbnRleHRzKSB7XG4gICAgICAgICAgICBjb25zdCBvYmogPSBzaW5nbGV0b25Db250ZXh0c1tpXTtcbiAgICAgICAgICAgIGlmIChvYmouY29udGV4dCA9PT0gY29udGV4dCAmJiBvYmoubmFtZSA9PT0gY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iai5pbnN0YW5jZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyBtZXRob2QgdG8gYWRkIGFuIHNpbmdsZXRvbiBpbnN0YW5jZSB0byB0aGUgc3lzdGVtLiAgVXNlZnVsIGZvciB1bml0IHRlc3RpbmcgdG8gbW9jayBvYmplY3RzIGV0Yy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6RmFjdG9yeU1ha2VyXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2V0U2luZ2xldG9uSW5zdGFuY2UoY29udGV4dCwgY2xhc3NOYW1lLCBpbnN0YW5jZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gc2luZ2xldG9uQ29udGV4dHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IHNpbmdsZXRvbkNvbnRleHRzW2ldO1xuICAgICAgICAgICAgaWYgKG9iai5jb250ZXh0ID09PSBjb250ZXh0ICYmIG9iai5uYW1lID09PSBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICBzaW5nbGV0b25Db250ZXh0c1tpXS5pbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzaW5nbGV0b25Db250ZXh0cy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2VcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLy8gRmFjdG9yaWVzIHN0b3JhZ2UgTWFuYWdlbWVudFxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgZnVuY3Rpb24gZ2V0RmFjdG9yeUJ5TmFtZShuYW1lLCBmYWN0b3JpZXNBcnJheSkge1xuICAgICAgICByZXR1cm4gZmFjdG9yaWVzQXJyYXlbbmFtZV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlRmFjdG9yeShuYW1lLCBmYWN0b3J5LCBmYWN0b3JpZXNBcnJheSkge1xuICAgICAgICBpZiAobmFtZSBpbiBmYWN0b3JpZXNBcnJheSkge1xuICAgICAgICAgICAgZmFjdG9yaWVzQXJyYXlbbmFtZV0gPSBmYWN0b3J5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLy8gQ2xhc3MgRmFjdG9yaWVzIE1hbmFnZW1lbnRcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsYXNzRmFjdG9yeShuYW1lLCBmYWN0b3J5KSB7XG4gICAgICAgIHVwZGF0ZUZhY3RvcnkobmFtZSwgZmFjdG9yeSwgY2xhc3NGYWN0b3JpZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldENsYXNzRmFjdG9yeUJ5TmFtZShuYW1lKSB7XG4gICAgICAgIHJldHVybiBnZXRGYWN0b3J5QnlOYW1lKG5hbWUsIGNsYXNzRmFjdG9yaWVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDbGFzc0ZhY3RvcnkoY2xhc3NDb25zdHJ1Y3Rvcikge1xuICAgICAgICBsZXQgZmFjdG9yeSA9IGdldEZhY3RvcnlCeU5hbWUoY2xhc3NDb25zdHJ1Y3Rvci5fX2Rhc2hqc19mYWN0b3J5X25hbWUsIGNsYXNzRmFjdG9yaWVzKTtcblxuICAgICAgICBpZiAoIWZhY3RvcnkpIHtcbiAgICAgICAgICAgIGZhY3RvcnkgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXJnZShjbGFzc0NvbnN0cnVjdG9yLCBjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNsYXNzRmFjdG9yaWVzW2NsYXNzQ29uc3RydWN0b3IuX19kYXNoanNfZmFjdG9yeV9uYW1lXSA9IGZhY3Rvcnk7IC8vIHN0b3JlIGZhY3RvcnlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBTaW5nbGV0b24gRmFjdG9yeSBNQWFuZ2VtZW50XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTaW5nbGV0b25GYWN0b3J5KG5hbWUsIGZhY3RvcnkpIHtcbiAgICAgICAgdXBkYXRlRmFjdG9yeShuYW1lLCBmYWN0b3J5LCBzaW5nbGV0b25GYWN0b3JpZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNpbmdsZXRvbkZhY3RvcnlCeU5hbWUobmFtZSkge1xuICAgICAgICByZXR1cm4gZ2V0RmFjdG9yeUJ5TmFtZShuYW1lLCBzaW5nbGV0b25GYWN0b3JpZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNpbmdsZXRvbkZhY3RvcnkoY2xhc3NDb25zdHJ1Y3Rvcikge1xuICAgICAgICBsZXQgZmFjdG9yeSA9IGdldEZhY3RvcnlCeU5hbWUoY2xhc3NDb25zdHJ1Y3Rvci5fX2Rhc2hqc19mYWN0b3J5X25hbWUsIHNpbmdsZXRvbkZhY3Rvcmllcyk7XG4gICAgICAgIGlmICghZmFjdG9yeSkge1xuICAgICAgICAgICAgZmFjdG9yeSA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgbGV0IGluc3RhbmNlO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBnZXRJbnN0YW5jZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBpbnN0YW5jZSB5ZXQgY2hlY2sgZm9yIG9uZSBvbiB0aGUgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlID0gZ2V0U2luZ2xldG9uSW5zdGFuY2UoY29udGV4dCwgY2xhc3NDb25zdHJ1Y3Rvci5fX2Rhc2hqc19mYWN0b3J5X25hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyBpbnN0YW5jZSBvbiB0aGUgY29udGV4dCB0aGVuIGNyZWF0ZSBvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG1lcmdlKGNsYXNzQ29uc3RydWN0b3IsIGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2luZ2xldG9uQ29udGV4dHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNsYXNzQ29uc3RydWN0b3IuX19kYXNoanNfZmFjdG9yeV9uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2luZ2xldG9uRmFjdG9yaWVzW2NsYXNzQ29uc3RydWN0b3IuX19kYXNoanNfZmFjdG9yeV9uYW1lXSA9IGZhY3Rvcnk7IC8vIHN0b3JlIGZhY3RvcnlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWN0b3J5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1lcmdlKGNsYXNzQ29uc3RydWN0b3IsIGNvbnRleHQsIGFyZ3MpIHtcblxuICAgICAgICBsZXQgY2xhc3NJbnN0YW5jZTtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NDb25zdHJ1Y3Rvci5fX2Rhc2hqc19mYWN0b3J5X25hbWU7XG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbk9iamVjdCA9IGNvbnRleHRbY2xhc3NOYW1lXTtcblxuICAgICAgICBpZiAoZXh0ZW5zaW9uT2JqZWN0KSB7XG5cbiAgICAgICAgICAgIGxldCBleHRlbnNpb24gPSBleHRlbnNpb25PYmplY3QuaW5zdGFuY2U7XG5cbiAgICAgICAgICAgIGlmIChleHRlbnNpb25PYmplY3Qub3ZlcnJpZGUpIHsgLy9PdmVycmlkZSBwdWJsaWMgbWV0aG9kcyBpbiBwYXJlbnQgYnV0IGtlZXAgcGFyZW50LlxuXG4gICAgICAgICAgICAgICAgY2xhc3NJbnN0YW5jZSA9IGNsYXNzQ29uc3RydWN0b3IuYXBwbHkoe2NvbnRleHR9LCBhcmdzKTtcbiAgICAgICAgICAgICAgICBleHRlbnNpb24gPSBleHRlbnNpb24uYXBwbHkoe1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICBmYWN0b3J5OiBpbnN0YW5jZSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjbGFzc0luc3RhbmNlXG4gICAgICAgICAgICAgICAgfSwgYXJncyk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gZXh0ZW5zaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbGFzc0luc3RhbmNlLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc0luc3RhbmNlW3Byb3BdID0gZXh0ZW5zaW9uW3Byb3BdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgeyAvL3JlcGxhY2UgcGFyZW50IG9iamVjdCBjb21wbGV0ZWx5IHdpdGggbmV3IG9iamVjdC4gU2FtZSBhcyBkaWpvbi5cblxuICAgICAgICAgICAgICAgIHJldHVybiBleHRlbnNpb24uYXBwbHkoe1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICBmYWN0b3J5OiBpbnN0YW5jZVxuICAgICAgICAgICAgICAgIH0sIGFyZ3MpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IGluc3RhbmNlIG9mIHRoZSBjbGFzc1xuICAgICAgICAgICAgY2xhc3NJbnN0YW5jZSA9IGNsYXNzQ29uc3RydWN0b3IuYXBwbHkoe2NvbnRleHR9LCBhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBnZXRDbGFzc05hbWUgZnVuY3Rpb24gdG8gY2xhc3MgaW5zdGFuY2UgcHJvdG90eXBlICh1c2VkIGJ5IERlYnVnKVxuICAgICAgICBjbGFzc0luc3RhbmNlLmdldENsYXNzTmFtZSA9IGZ1bmN0aW9uICgpIHtyZXR1cm4gY2xhc3NOYW1lO307XG5cbiAgICAgICAgcmV0dXJuIGNsYXNzSW5zdGFuY2U7XG4gICAgfVxuXG4gICAgaW5zdGFuY2UgPSB7XG4gICAgICAgIGV4dGVuZDogZXh0ZW5kLFxuICAgICAgICBnZXRTaW5nbGV0b25JbnN0YW5jZTogZ2V0U2luZ2xldG9uSW5zdGFuY2UsXG4gICAgICAgIHNldFNpbmdsZXRvbkluc3RhbmNlOiBzZXRTaW5nbGV0b25JbnN0YW5jZSxcbiAgICAgICAgZ2V0U2luZ2xldG9uRmFjdG9yeTogZ2V0U2luZ2xldG9uRmFjdG9yeSxcbiAgICAgICAgZ2V0U2luZ2xldG9uRmFjdG9yeUJ5TmFtZTogZ2V0U2luZ2xldG9uRmFjdG9yeUJ5TmFtZSxcbiAgICAgICAgdXBkYXRlU2luZ2xldG9uRmFjdG9yeTogdXBkYXRlU2luZ2xldG9uRmFjdG9yeSxcbiAgICAgICAgZ2V0Q2xhc3NGYWN0b3J5OiBnZXRDbGFzc0ZhY3RvcnksXG4gICAgICAgIGdldENsYXNzRmFjdG9yeUJ5TmFtZTogZ2V0Q2xhc3NGYWN0b3J5QnlOYW1lLFxuICAgICAgICB1cGRhdGVDbGFzc0ZhY3Rvcnk6IHVwZGF0ZUNsYXNzRmFjdG9yeVxuICAgIH07XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG5cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IEZhY3RvcnlNYWtlcjtcbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG4vKipcbiAqIEBjbGFzc1xuICogQGlnbm9yZVxuICovXG5jbGFzcyBFcnJvcnNCYXNlIHtcbiAgICBleHRlbmQgKGVycm9ycywgY29uZmlnKSB7XG4gICAgICAgIGlmICghZXJyb3JzKSByZXR1cm47XG5cbiAgICAgICAgbGV0IG92ZXJyaWRlID0gY29uZmlnID8gY29uZmlnLm92ZXJyaWRlIDogZmFsc2U7XG4gICAgICAgIGxldCBwdWJsaWNPbmx5ID0gY29uZmlnID8gY29uZmlnLnB1YmxpY09ubHkgOiBmYWxzZTtcblxuXG4gICAgICAgIGZvciAoY29uc3QgZXJyIGluIGVycm9ycykge1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaGFzT3duUHJvcGVydHkoZXJyKSB8fCAodGhpc1tlcnJdICYmICFvdmVycmlkZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKHB1YmxpY09ubHkgJiYgZXJyb3JzW2Vycl0uaW5kZXhPZigncHVibGljXycpID09PSAtMSkgY29udGludWU7XG4gICAgICAgICAgICB0aGlzW2Vycl0gPSBlcnJvcnNbZXJyXTtcblxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFcnJvcnNCYXNlOyIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG4vKipcbiAqIEBjbGFzc1xuICogQGlnbm9yZVxuICovXG5jbGFzcyBFdmVudHNCYXNlIHtcbiAgICBleHRlbmQgKGV2ZW50cywgY29uZmlnKSB7XG4gICAgICAgIGlmICghZXZlbnRzKSByZXR1cm47XG5cbiAgICAgICAgbGV0IG92ZXJyaWRlID0gY29uZmlnID8gY29uZmlnLm92ZXJyaWRlIDogZmFsc2U7XG4gICAgICAgIGxldCBwdWJsaWNPbmx5ID0gY29uZmlnID8gY29uZmlnLnB1YmxpY09ubHkgOiBmYWxzZTtcblxuXG4gICAgICAgIGZvciAoY29uc3QgZXZ0IGluIGV2ZW50cykge1xuICAgICAgICAgICAgaWYgKCFldmVudHMuaGFzT3duUHJvcGVydHkoZXZ0KSB8fCAodGhpc1tldnRdICYmICFvdmVycmlkZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKHB1YmxpY09ubHkgJiYgZXZlbnRzW2V2dF0uaW5kZXhPZigncHVibGljXycpID09PSAtMSkgY29udGludWU7XG4gICAgICAgICAgICB0aGlzW2V2dF0gPSBldmVudHNbZXZ0XTtcblxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFdmVudHNCYXNlOyIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmltcG9ydCBGcmFnbWVudFJlcXVlc3QgZnJvbSAnLi4vc3RyZWFtaW5nL3ZvL0ZyYWdtZW50UmVxdWVzdCc7XG5cbmZ1bmN0aW9uIE1zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXIoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG5cbiAgICBsZXQgaW5zdGFuY2UsXG4gICAgICAgIGxvZ2dlcixcbiAgICAgICAgZnJhZ21lbnRNb2RlbCxcbiAgICAgICAgc3RhcnRlZCxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgbG9hZEZyYWdtZW50VGltZW91dCxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBzdGFydEZyYWdtZW50VGltZSxcbiAgICAgICAgaW5kZXg7XG5cbiAgICBjb25zdCBzdHJlYW1Qcm9jZXNzb3IgPSBjb25maWcuc3RyZWFtUHJvY2Vzc29yO1xuICAgIGNvbnN0IGJhc2VVUkxDb250cm9sbGVyID0gY29uZmlnLmJhc2VVUkxDb250cm9sbGVyO1xuICAgIGNvbnN0IGRlYnVnID0gY29uZmlnLmRlYnVnO1xuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gJ01zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXInO1xuXG4gICAgZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgICAgIGxvZ2dlciA9IGRlYnVnLmdldExvZ2dlcihpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgdHlwZSA9IHN0cmVhbVByb2Nlc3Nvci5nZXRUeXBlKCk7XG4gICAgICAgIGZyYWdtZW50TW9kZWwgPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0RnJhZ21lbnRNb2RlbCgpO1xuXG4gICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgc3RhcnRUaW1lID0gbnVsbDtcbiAgICAgICAgc3RhcnRGcmFnbWVudFRpbWUgPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICBpZiAoc3RhcnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnU3RhcnQnKTtcblxuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGluZGV4ID0gMDtcblxuICAgICAgICBsb2FkTmV4dEZyYWdtZW50SW5mbygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgIGlmICghc3RhcnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnU3RvcCcpO1xuXG4gICAgICAgIGNsZWFyVGltZW91dChsb2FkRnJhZ21lbnRUaW1lb3V0KTtcbiAgICAgICAgc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICBzdGFydFRpbWUgPSBudWxsO1xuICAgICAgICBzdGFydEZyYWdtZW50VGltZSA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIHN0b3AoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkTmV4dEZyYWdtZW50SW5mbygpIHtcbiAgICAgICAgaWYgKCFzdGFydGVkKSByZXR1cm47XG5cbiAgICAgICAgLy8gR2V0IGxhc3Qgc2VnbWVudCBmcm9tIFNlZ21lbnRUaW1lbGluZVxuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbiA9IGdldEN1cnJlbnRSZXByZXNlbnRhdGlvbigpO1xuICAgICAgICBjb25zdCBtYW5pZmVzdCA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLm1wZC5tYW5pZmVzdDtcbiAgICAgICAgY29uc3QgYWRhcHRhdGlvbiA9IG1hbmlmZXN0LlBlcmlvZF9hc0FycmF5W3JlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmluZGV4XS5BZGFwdGF0aW9uU2V0X2FzQXJyYXlbcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5pbmRleF07XG4gICAgICAgIGNvbnN0IHNlZ21lbnRzID0gYWRhcHRhdGlvbi5TZWdtZW50VGVtcGxhdGUuU2VnbWVudFRpbWVsaW5lLlNfYXNBcnJheTtcbiAgICAgICAgY29uc3Qgc2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIC8vIGxvZ2dlci5kZWJ1ZygnTGFzdCBmcmFnbWVudCB0aW1lOiAnICsgKHNlZ21lbnQudCAvIGFkYXB0YXRpb24uU2VnbWVudFRlbXBsYXRlLnRpbWVzY2FsZSkpO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIHNlZ21lbnQgcmVxdWVzdFxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gZ2V0UmVxdWVzdEZvclNlZ21lbnQoYWRhcHRhdGlvbiwgcmVwcmVzZW50YXRpb24sIHNlZ21lbnQpO1xuXG4gICAgICAgIC8vIFNlbmQgc2VnbWVudCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3RGcmFnbWVudC5jYWxsKHRoaXMsIHJlcXVlc3QpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFJlcXVlc3RGb3JTZWdtZW50KGFkYXB0YXRpb24sIHJlcHJlc2VudGF0aW9uLCBzZWdtZW50KSB7XG4gICAgICAgIGxldCB0aW1lc2NhbGUgPSBhZGFwdGF0aW9uLlNlZ21lbnRUZW1wbGF0ZS50aW1lc2NhbGU7XG4gICAgICAgIGxldCByZXF1ZXN0ID0gbmV3IEZyYWdtZW50UmVxdWVzdCgpO1xuXG4gICAgICAgIHJlcXVlc3QubWVkaWFUeXBlID0gdHlwZTtcbiAgICAgICAgcmVxdWVzdC50eXBlID0gJ0ZyYWdtZW50SW5mb1NlZ21lbnQnO1xuICAgICAgICAvLyByZXF1ZXN0LnJhbmdlID0gc2VnbWVudC5tZWRpYVJhbmdlO1xuICAgICAgICByZXF1ZXN0LnN0YXJ0VGltZSA9IHNlZ21lbnQudCAvIHRpbWVzY2FsZTtcbiAgICAgICAgcmVxdWVzdC5kdXJhdGlvbiA9IHNlZ21lbnQuZCAvIHRpbWVzY2FsZTtcbiAgICAgICAgcmVxdWVzdC50aW1lc2NhbGUgPSB0aW1lc2NhbGU7XG4gICAgICAgIC8vIHJlcXVlc3QuYXZhaWxhYmlsaXR5U3RhcnRUaW1lID0gc2VnbWVudC5hdmFpbGFiaWxpdHlTdGFydFRpbWU7XG4gICAgICAgIC8vIHJlcXVlc3QuYXZhaWxhYmlsaXR5RW5kVGltZSA9IHNlZ21lbnQuYXZhaWxhYmlsaXR5RW5kVGltZTtcbiAgICAgICAgLy8gcmVxdWVzdC53YWxsU3RhcnRUaW1lID0gc2VnbWVudC53YWxsU3RhcnRUaW1lO1xuICAgICAgICByZXF1ZXN0LnF1YWxpdHkgPSByZXByZXNlbnRhdGlvbi5pbmRleDtcbiAgICAgICAgcmVxdWVzdC5pbmRleCA9IGluZGV4Kys7XG4gICAgICAgIHJlcXVlc3QubWVkaWFJbmZvID0gc3RyZWFtUHJvY2Vzc29yLmdldE1lZGlhSW5mbygpO1xuICAgICAgICByZXF1ZXN0LmFkYXB0YXRpb25JbmRleCA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24uaW5kZXg7XG4gICAgICAgIHJlcXVlc3QucmVwcmVzZW50YXRpb25JZCA9IHJlcHJlc2VudGF0aW9uLmlkO1xuICAgICAgICByZXF1ZXN0LnVybCA9IGJhc2VVUkxDb250cm9sbGVyLnJlc29sdmUocmVwcmVzZW50YXRpb24ucGF0aCkudXJsICsgYWRhcHRhdGlvbi5TZWdtZW50VGVtcGxhdGUubWVkaWE7XG4gICAgICAgIHJlcXVlc3QudXJsID0gcmVxdWVzdC51cmwucmVwbGFjZSgnJEJhbmR3aWR0aCQnLCByZXByZXNlbnRhdGlvbi5iYW5kd2lkdGgpO1xuICAgICAgICByZXF1ZXN0LnVybCA9IHJlcXVlc3QudXJsLnJlcGxhY2UoJyRUaW1lJCcsIHNlZ21lbnQudE1hbmlmZXN0ID8gc2VnbWVudC50TWFuaWZlc3QgOiBzZWdtZW50LnQpO1xuICAgICAgICByZXF1ZXN0LnVybCA9IHJlcXVlc3QudXJsLnJlcGxhY2UoJy9GcmFnbWVudHMoJywgJy9GcmFnbWVudEluZm8oJyk7XG5cbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFJlcHJlc2VudGF0aW9uKCkge1xuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbkNvbnRyb2xsZXIgPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0UmVwcmVzZW50YXRpb25Db250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IHJlcHJlc2VudGF0aW9uID0gcmVwcmVzZW50YXRpb25Db250cm9sbGVyLmdldEN1cnJlbnRSZXByZXNlbnRhdGlvbigpO1xuICAgICAgICByZXR1cm4gcmVwcmVzZW50YXRpb247XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVxdWVzdEZyYWdtZW50KHJlcXVlc3QpIHtcbiAgICAgICAgLy8gbG9nZ2VyLmRlYnVnKCdMb2FkIEZyYWdtZW50SW5mbyBmb3IgdGltZTogJyArIHJlcXVlc3Quc3RhcnRUaW1lKTtcbiAgICAgICAgaWYgKHN0cmVhbVByb2Nlc3Nvci5nZXRGcmFnbWVudE1vZGVsKCkuaXNGcmFnbWVudExvYWRlZE9yUGVuZGluZyhyZXF1ZXN0KSkge1xuICAgICAgICAgICAgLy8gV2UgbWF5IGhhdmUgcmVhY2hlZCBlbmQgb2YgdGltZWxpbmUgaW4gY2FzZSBvZiBzdGFydC1vdmVyIHN0cmVhbXNcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnRW5kIG9mIHRpbWVsaW5lJyk7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmcmFnbWVudE1vZGVsLmV4ZWN1dGVSZXF1ZXN0KHJlcXVlc3QpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZyYWdtZW50SW5mb0xvYWRlZCAoZSkge1xuICAgICAgICBpZiAoIXN0YXJ0ZWQpIHJldHVybjtcblxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gZS5yZXF1ZXN0O1xuICAgICAgICBpZiAoIWUucmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignTG9hZCBlcnJvcicsIHJlcXVlc3QudXJsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZWx0YUZyYWdtZW50VGltZSxcbiAgICAgICAgICAgIGRlbHRhVGltZSxcbiAgICAgICAgICAgIGRlbGF5O1xuXG4gICAgICAgIC8vIGxvZ2dlci5kZWJ1ZygnRnJhZ21lbnRJbmZvIGxvYWRlZDogJywgcmVxdWVzdC51cmwpO1xuXG4gICAgICAgIGlmICghc3RhcnRGcmFnbWVudFRpbWUpIHtcbiAgICAgICAgICAgIHN0YXJ0RnJhZ21lbnRUaW1lID0gcmVxdWVzdC5zdGFydFRpbWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgZGVsYXkgYmVmb3JlIHJlcXVlc3RpbmcgbmV4dCBGcmFnbWVudEluZm9cbiAgICAgICAgZGVsdGFUaW1lID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgICAgIGRlbHRhRnJhZ21lbnRUaW1lID0gKHJlcXVlc3Quc3RhcnRUaW1lICsgcmVxdWVzdC5kdXJhdGlvbikgLSBzdGFydEZyYWdtZW50VGltZTtcbiAgICAgICAgZGVsYXkgPSBNYXRoLm1heCgwLCAoZGVsdGFGcmFnbWVudFRpbWUgLSBkZWx0YVRpbWUpKTtcblxuICAgICAgICAvLyBTZXQgdGltZW91dCBmb3IgcmVxdWVzdGluZyBuZXh0IEZyYWdtZW50SW5mb1xuICAgICAgICBjbGVhclRpbWVvdXQobG9hZEZyYWdtZW50VGltZW91dCk7XG4gICAgICAgIGxvYWRGcmFnbWVudFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxvYWRGcmFnbWVudFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgbG9hZE5leHRGcmFnbWVudEluZm8oKTtcbiAgICAgICAgfSwgZGVsYXkgKiAxMDAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgaW5pdGlhbGl6ZTogaW5pdGlhbGl6ZSxcbiAgICAgICAgY29udHJvbGxlclR5cGU6IGNvbnRyb2xsZXJUeXBlLFxuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIGZyYWdtZW50SW5mb0xvYWRlZDogZnJhZ21lbnRJbmZvTG9hZGVkLFxuICAgICAgICBnZXRUeXBlOiBnZXRUeXBlLFxuICAgICAgICByZXNldDogcmVzZXRcbiAgICB9O1xuXG4gICAgc2V0dXAoKTtcblxuICAgIHJldHVybiBpbnN0YW5jZTtcbn1cblxuTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlci5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlcic7XG5leHBvcnQgZGVmYXVsdCBkYXNoanMuRmFjdG9yeU1ha2VyLmdldENsYXNzRmFjdG9yeShNc3NGcmFnbWVudEluZm9Db250cm9sbGVyKTsgLyoganNoaW50IGlnbm9yZTpsaW5lICovXG4iLCIvKipcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXG4gKiBpbmNsdWRlZCBiZWxvdy4gVGhpcyBzb2Z0d2FyZSBtYXkgYmUgc3ViamVjdCB0byBvdGhlciB0aGlyZCBwYXJ0eSBhbmQgY29udHJpYnV0b3JcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLCBEYXNoIEluZHVzdHJ5IEZvcnVtLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gKiAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcbiAqICBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxuICogIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcbiAqICBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gKiAgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVFxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcbiAqICBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuaW1wb3J0IERhc2hKU0Vycm9yIGZyb20gJy4uL3N0cmVhbWluZy92by9EYXNoSlNFcnJvcic7XG5pbXBvcnQgTXNzRXJyb3JzIGZyb20gJy4vZXJyb3JzL01zc0Vycm9ycyc7XG5cbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vc3RyZWFtaW5nL01lZGlhUGxheWVyRXZlbnRzJztcblxuLyoqXG4gKiBAbW9kdWxlIE1zc0ZyYWdtZW50TW9vZlByb2Nlc3NvclxuICogQGlnbm9yZVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBvYmplY3RcbiAqL1xuZnVuY3Rpb24gTXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGxldCBpbnN0YW5jZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgbG9nZ2VyO1xuICAgIGNvbnN0IGRhc2hNZXRyaWNzID0gY29uZmlnLmRhc2hNZXRyaWNzO1xuICAgIGNvbnN0IHBsYXliYWNrQ29udHJvbGxlciA9IGNvbmZpZy5wbGF5YmFja0NvbnRyb2xsZXI7XG4gICAgY29uc3QgZXJyb3JIYW5kbGVyID0gY29uZmlnLmVyckhhbmRsZXI7XG4gICAgY29uc3QgZXZlbnRCdXMgPSBjb25maWcuZXZlbnRCdXM7XG4gICAgY29uc3QgSVNPQm94ZXIgPSBjb25maWcuSVNPQm94ZXI7XG4gICAgY29uc3QgZGVidWcgPSBjb25maWcuZGVidWc7XG5cbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICAgICAgbG9nZ2VyID0gZGVidWcuZ2V0TG9nZ2VyKGluc3RhbmNlKTtcbiAgICAgICAgdHlwZSA9ICcnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByb2Nlc3NUZnJmKHJlcXVlc3QsIHRmcmYsIHRmZHQsIHN0cmVhbVByb2Nlc3Nvcikge1xuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbkNvbnRyb2xsZXIgPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0UmVwcmVzZW50YXRpb25Db250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IHJlcHJlc2VudGF0aW9uID0gcmVwcmVzZW50YXRpb25Db250cm9sbGVyLmdldEN1cnJlbnRSZXByZXNlbnRhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IG1hbmlmZXN0ID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QubXBkLm1hbmlmZXN0O1xuICAgICAgICBjb25zdCBhZGFwdGF0aW9uID0gbWFuaWZlc3QuUGVyaW9kX2FzQXJyYXlbcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QuaW5kZXhdLkFkYXB0YXRpb25TZXRfYXNBcnJheVtyZXByZXNlbnRhdGlvbi5hZGFwdGF0aW9uLmluZGV4XTtcbiAgICAgICAgY29uc3QgdGltZXNjYWxlID0gYWRhcHRhdGlvbi5TZWdtZW50VGVtcGxhdGUudGltZXNjYWxlO1xuXG4gICAgICAgIHR5cGUgPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0VHlwZSgpO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgdGZyZiBvbmx5IGZvciBsaXZlIHN0cmVhbXMgb3Igc3RhcnQtb3ZlciBzdGF0aWMgc3RyZWFtcyAodGltZVNoaWZ0QnVmZmVyRGVwdGggPiAwKVxuICAgICAgICBpZiAobWFuaWZlc3QudHlwZSAhPT0gJ2R5bmFtaWMnICYmICFtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0ZnJmKSB7XG4gICAgICAgICAgICBlcnJvckhhbmRsZXIuZXJyb3IobmV3IERhc2hKU0Vycm9yKE1zc0Vycm9ycy5NU1NfTk9fVEZSRl9DT0RFLCBNc3NFcnJvcnMuTVNTX05PX1RGUkZfTUVTU0FHRSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IGFkYXB0YXRpb24ncyBzZWdtZW50IHRpbWVsaW5lIChhbHdheXMgYSBTZWdtZW50VGltZWxpbmUgaW4gU21vb3RoIFN0cmVhbWluZyB1c2UgY2FzZSlcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBhZGFwdGF0aW9uLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuUztcbiAgICAgICAgY29uc3QgZW50cmllcyA9IHRmcmYuZW50cnk7XG4gICAgICAgIGxldCBlbnRyeSxcbiAgICAgICAgICAgIHNlZ21lbnRUaW1lLFxuICAgICAgICAgICAgcmFuZ2U7XG4gICAgICAgIGxldCBzZWdtZW50ID0gbnVsbDtcbiAgICAgICAgbGV0IHQgPSAwO1xuICAgICAgICBsZXQgYXZhaWxhYmlsaXR5U3RhcnRUaW1lID0gbnVsbDtcblxuICAgICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnNpZGVyIG9ubHkgZmlyc3QgdGZyZiBlbnRyeSAodG8gYXZvaWQgcHJlLWNvbmRpdGlvbiBmYWlsdXJlIG9uIGZyYWdtZW50IGluZm8gcmVxdWVzdHMpXG4gICAgICAgIGVudHJ5ID0gZW50cmllc1swXTtcblxuICAgICAgICAvLyBJbiBjYXNlIG9mIHN0YXJ0LW92ZXIgc3RyZWFtcywgY2hlY2sgaWYgd2UgaGF2ZSByZWFjaGVkIGVuZCBvZiBvcmlnaW5hbCBtYW5pZmVzdCBkdXJhdGlvbiAoc2V0IGluIHRpbWVTaGlmdEJ1ZmZlckRlcHRoKVxuICAgICAgICAvLyA9PiB0aGVuIGRvIG5vdCB1cGRhdGUgYW55bW9yZSB0aW1lbGluZVxuICAgICAgICBpZiAobWFuaWZlc3QudHlwZSA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAgIC8vIEdldCBmaXJzdCBzZWdtZW50IHRpbWVcbiAgICAgICAgICAgIHNlZ21lbnRUaW1lID0gc2VnbWVudHNbMF0udE1hbmlmZXN0ID8gcGFyc2VGbG9hdChzZWdtZW50c1swXS50TWFuaWZlc3QpIDogc2VnbWVudHNbMF0udDtcbiAgICAgICAgICAgIGlmIChlbnRyeS5mcmFnbWVudF9hYnNvbHV0ZV90aW1lID4gKHNlZ21lbnRUaW1lICsgKG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoICogdGltZXNjYWxlKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsb2dnZXIuZGVidWcoJ2VudHJ5IC0gdCA9ICcsIChlbnRyeS5mcmFnbWVudF9hYnNvbHV0ZV90aW1lIC8gdGltZXNjYWxlKSk7XG5cbiAgICAgICAgLy8gR2V0IGxhc3Qgc2VnbWVudCB0aW1lXG4gICAgICAgIHNlZ21lbnRUaW1lID0gc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0udE1hbmlmZXN0ID8gcGFyc2VGbG9hdChzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS50TWFuaWZlc3QpIDogc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0udDtcbiAgICAgICAgLy8gbG9nZ2VyLmRlYnVnKCdMYXN0IHNlZ21lbnQgLSB0ID0gJywgKHNlZ21lbnRUaW1lIC8gdGltZXNjYWxlKSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSB0byBhcHBlbmQgbmV3IHNlZ21lbnQgdG8gdGltZWxpbmVcbiAgICAgICAgaWYgKGVudHJ5LmZyYWdtZW50X2Fic29sdXRlX3RpbWUgPD0gc2VnbWVudFRpbWUpIHtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBEVlIgd2luZG93IHJhbmdlID0+IHNldCByYW5nZSBlbmQgdG8gZW5kIHRpbWUgb2YgY3VycmVudCBzZWdtZW50XG4gICAgICAgICAgICByYW5nZSA9IHtcbiAgICAgICAgICAgICAgICBzdGFydDogc2VnbWVudHNbMF0udCAvIHRpbWVzY2FsZSxcbiAgICAgICAgICAgICAgICBlbmQ6ICh0ZmR0LmJhc2VNZWRpYURlY29kZVRpbWUgLyB0aW1lc2NhbGUpICsgcmVxdWVzdC5kdXJhdGlvblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdXBkYXRlRFZSKHJlcXVlc3QubWVkaWFUeXBlLCByYW5nZSwgc3RyZWFtUHJvY2Vzc29yLmdldFN0cmVhbUluZm8oKS5tYW5pZmVzdEluZm8pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbG9nZ2VyLmRlYnVnKCdBZGQgbmV3IHNlZ21lbnQgLSB0ID0gJywgKGVudHJ5LmZyYWdtZW50X2Fic29sdXRlX3RpbWUgLyB0aW1lc2NhbGUpKTtcbiAgICAgICAgc2VnbWVudCA9IHt9O1xuICAgICAgICBzZWdtZW50LnQgPSBlbnRyeS5mcmFnbWVudF9hYnNvbHV0ZV90aW1lO1xuICAgICAgICBzZWdtZW50LmQgPSBlbnRyeS5mcmFnbWVudF9kdXJhdGlvbjtcbiAgICAgICAgLy8gSWYgdGltZXN0YW1wcyBzdGFydHMgYXQgMCByZWxhdGl2ZSB0byAxc3Qgc2VnbWVudCAoZHluYW1pYyB0byBzdGF0aWMpIHRoZW4gdXBkYXRlIHNlZ21lbnQgdGltZVxuICAgICAgICBpZiAoc2VnbWVudHNbMF0udE1hbmlmZXN0KSB7XG4gICAgICAgICAgICBzZWdtZW50LnQgLT0gcGFyc2VGbG9hdChzZWdtZW50c1swXS50TWFuaWZlc3QpIC0gc2VnbWVudHNbMF0udDtcbiAgICAgICAgICAgIHNlZ21lbnQudE1hbmlmZXN0ID0gZW50cnkuZnJhZ21lbnRfYWJzb2x1dGVfdGltZTtcbiAgICAgICAgfVxuICAgICAgICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuXG4gICAgICAgIC8vIEluIGNhc2Ugb2Ygc3RhdGljIHN0YXJ0LW92ZXIgc3RyZWFtcywgdXBkYXRlIGNvbnRlbnQgZHVyYXRpb25cbiAgICAgICAgaWYgKG1hbmlmZXN0LnR5cGUgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgICAgICAgIHNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kID0gKHNlZ21lbnQudCArIHNlZ21lbnQuZCkgLyB0aW1lc2NhbGU7XG4gICAgICAgICAgICAgICAgaWYgKGVuZCA+IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QnVzLnRyaWdnZXIoRXZlbnRzLk1BTklGRVNUX1ZBTElESVRZX0NIQU5HRUQsIHsgc2VuZGVyOiB0aGlzLCBuZXdEdXJhdGlvbjogZW5kIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBJbiBjYXNlIG9mIGxpdmUgc3RyZWFtcywgdXBkYXRlIHNlZ21lbnQgdGltZWxpbmUgYWNjb3JkaW5nIHRvIERWUiB3aW5kb3dcbiAgICAgICAgZWxzZSBpZiAobWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggJiYgbWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggPiAwKSB7XG4gICAgICAgICAgICAvLyBHZXQgdGltZXN0YW1wIG9mIHRoZSBsYXN0IHNlZ21lbnRcbiAgICAgICAgICAgIHNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHQgPSBzZWdtZW50LnQ7XG5cbiAgICAgICAgICAgIC8vIERldGVybWluZSB0aGUgc2VnbWVudHMnIGF2YWlsYWJpbGl0eSBzdGFydCB0aW1lXG4gICAgICAgICAgICBhdmFpbGFiaWxpdHlTdGFydFRpbWUgPSBNYXRoLnJvdW5kKCh0IC0gKG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoICogdGltZXNjYWxlKSkgLyB0aW1lc2NhbGUpO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgc2VnbWVudHMgcHJpb3IgdG8gYXZhaWxhYmlsaXR5IHN0YXJ0IHRpbWVcbiAgICAgICAgICAgIHNlZ21lbnQgPSBzZWdtZW50c1swXTtcbiAgICAgICAgICAgIHdoaWxlIChNYXRoLnJvdW5kKHNlZ21lbnQudCAvIHRpbWVzY2FsZSkgPCBhdmFpbGFiaWxpdHlTdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICAvLyBsb2dnZXIuZGVidWcoJ1JlbW92ZSBzZWdtZW50ICAtIHQgPSAnICsgKHNlZ21lbnQudCAvIHRpbWVzY2FsZSkpO1xuICAgICAgICAgICAgICAgIHNlZ21lbnRzLnNwbGljZSgwLCAxKTtcbiAgICAgICAgICAgICAgICBzZWdtZW50ID0gc2VnbWVudHNbMF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBEVlIgd2luZG93IHJhbmdlID0+IHNldCByYW5nZSBlbmQgdG8gZW5kIHRpbWUgb2YgY3VycmVudCBzZWdtZW50XG4gICAgICAgICAgICByYW5nZSA9IHtcbiAgICAgICAgICAgICAgICBzdGFydDogc2VnbWVudHNbMF0udCAvIHRpbWVzY2FsZSxcbiAgICAgICAgICAgICAgICBlbmQ6ICh0ZmR0LmJhc2VNZWRpYURlY29kZVRpbWUgLyB0aW1lc2NhbGUpICsgcmVxdWVzdC5kdXJhdGlvblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdXBkYXRlRFZSKHR5cGUsIHJhbmdlLCBzdHJlYW1Qcm9jZXNzb3IuZ2V0U3RyZWFtSW5mbygpLm1hbmlmZXN0SW5mbyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXByZXNlbnRhdGlvbkNvbnRyb2xsZXIudXBkYXRlUmVwcmVzZW50YXRpb24ocmVwcmVzZW50YXRpb24sIHRydWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZURWUih0eXBlLCByYW5nZSwgbWFuaWZlc3RJbmZvKSB7XG4gICAgICAgIGNvbnN0IGR2ckluZm9zID0gZGFzaE1ldHJpY3MuZ2V0Q3VycmVudERWUkluZm8odHlwZSk7XG4gICAgICAgIGlmICghZHZySW5mb3MgfHwgKHJhbmdlLmVuZCA+IGR2ckluZm9zLnJhbmdlLmVuZCkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnVXBkYXRlIERWUiByYW5nZTogWycgKyByYW5nZS5zdGFydCArICcgLSAnICsgcmFuZ2UuZW5kICsgJ10nKTtcbiAgICAgICAgICAgIGRhc2hNZXRyaWNzLmFkZERWUkluZm8odHlwZSwgcGxheWJhY2tDb250cm9sbGVyLmdldFRpbWUoKSwgbWFuaWZlc3RJbmZvLCByYW5nZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIG9mZnNldCBvZiB0aGUgMXN0IGJ5dGUgb2YgYSBjaGlsZCBib3ggd2l0aGluIGEgY29udGFpbmVyIGJveFxuICAgIGZ1bmN0aW9uIGdldEJveE9mZnNldChwYXJlbnQsIHR5cGUpIHtcbiAgICAgICAgbGV0IG9mZnNldCA9IDg7XG4gICAgICAgIGxldCBpID0gMDtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFyZW50LmJveGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50LmJveGVzW2ldLnR5cGUgPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHBhcmVudC5ib3hlc1tpXS5zaXplO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29udmVydEZyYWdtZW50KGUsIHN0cmVhbVByb2Nlc3Nvcikge1xuICAgICAgICBsZXQgaTtcblxuICAgICAgICAvLyBlLnJlcXVlc3QgY29udGFpbnMgcmVxdWVzdCBkZXNjcmlwdGlvbiBvYmplY3RcbiAgICAgICAgLy8gZS5yZXNwb25zZSBjb250YWlucyBmcmFnbWVudCBieXRlc1xuICAgICAgICBjb25zdCBpc29GaWxlID0gSVNPQm94ZXIucGFyc2VCdWZmZXIoZS5yZXNwb25zZSk7XG4gICAgICAgIC8vIFVwZGF0ZSB0cmFja19JZCBpbiB0ZmhkIGJveFxuICAgICAgICBjb25zdCB0ZmhkID0gaXNvRmlsZS5mZXRjaCgndGZoZCcpO1xuICAgICAgICB0ZmhkLnRyYWNrX0lEID0gZS5yZXF1ZXN0Lm1lZGlhSW5mby5pbmRleCArIDE7XG5cbiAgICAgICAgLy8gQWRkIHRmZHQgYm94XG4gICAgICAgIGxldCB0ZmR0ID0gaXNvRmlsZS5mZXRjaCgndGZkdCcpO1xuICAgICAgICBjb25zdCB0cmFmID0gaXNvRmlsZS5mZXRjaCgndHJhZicpO1xuICAgICAgICBpZiAodGZkdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGZkdCA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3RmZHQnLCB0cmFmLCB0ZmhkKTtcbiAgICAgICAgICAgIHRmZHQudmVyc2lvbiA9IDE7XG4gICAgICAgICAgICB0ZmR0LmZsYWdzID0gMDtcbiAgICAgICAgICAgIHRmZHQuYmFzZU1lZGlhRGVjb2RlVGltZSA9IE1hdGguZmxvb3IoZS5yZXF1ZXN0LnN0YXJ0VGltZSAqIGUucmVxdWVzdC50aW1lc2NhbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJ1biA9IGlzb0ZpbGUuZmV0Y2goJ3RydW4nKTtcblxuICAgICAgICAvLyBQcm9jZXNzIHRmeGQgYm94ZXNcbiAgICAgICAgLy8gVGhpcyBib3ggcHJvdmlkZSBhYnNvbHV0ZSB0aW1lc3RhbXAgYnV0IHdlIHRha2UgdGhlIHNlZ21lbnQgc3RhcnQgdGltZSBmb3IgdGZkdFxuICAgICAgICBsZXQgdGZ4ZCA9IGlzb0ZpbGUuZmV0Y2goJ3RmeGQnKTtcbiAgICAgICAgaWYgKHRmeGQpIHtcbiAgICAgICAgICAgIHRmeGQuX3BhcmVudC5ib3hlcy5zcGxpY2UodGZ4ZC5fcGFyZW50LmJveGVzLmluZGV4T2YodGZ4ZCksIDEpO1xuICAgICAgICAgICAgdGZ4ZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRmcmYgPSBpc29GaWxlLmZldGNoKCd0ZnJmJyk7XG4gICAgICAgIHByb2Nlc3NUZnJmKGUucmVxdWVzdCwgdGZyZiwgdGZkdCwgc3RyZWFtUHJvY2Vzc29yKTtcbiAgICAgICAgaWYgKHRmcmYpIHtcbiAgICAgICAgICAgIHRmcmYuX3BhcmVudC5ib3hlcy5zcGxpY2UodGZyZi5fcGFyZW50LmJveGVzLmluZGV4T2YodGZyZiksIDEpO1xuICAgICAgICAgICAgdGZyZiA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBwcm90ZWN0ZWQgY29udGVudCBpbiBQSUZGMS4xIGZvcm1hdCAoc2VwaWZmIGJveCA9IFNhbXBsZSBFbmNyeXB0aW9uIFBJRkYpXG4gICAgICAgIC8vID0+IGNvbnZlcnQgc2VwaWZmIGJveCBpdCBpbnRvIGEgc2VuYyBib3hcbiAgICAgICAgLy8gPT4gY3JlYXRlIHNhaW8gYW5kIHNhaXogYm94ZXMgKGlmIG5vdCBhbHJlYWR5IHByZXNlbnQpXG4gICAgICAgIGNvbnN0IHNlcGlmZiA9IGlzb0ZpbGUuZmV0Y2goJ3NlcGlmZicpO1xuICAgICAgICBpZiAoc2VwaWZmICE9PSBudWxsKSB7XG4gICAgICAgICAgICBzZXBpZmYudHlwZSA9ICdzZW5jJztcbiAgICAgICAgICAgIHNlcGlmZi51c2VydHlwZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgbGV0IHNhaW8gPSBpc29GaWxlLmZldGNoKCdzYWlvJyk7XG4gICAgICAgICAgICBpZiAoc2FpbyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBTYW1wbGUgQXV4aWxpYXJ5IEluZm9ybWF0aW9uIE9mZnNldHMgQm94IGJveCAoc2FpbylcbiAgICAgICAgICAgICAgICBzYWlvID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgnc2FpbycsIHRyYWYpO1xuICAgICAgICAgICAgICAgIHNhaW8udmVyc2lvbiA9IDA7XG4gICAgICAgICAgICAgICAgc2Fpby5mbGFncyA9IDA7XG4gICAgICAgICAgICAgICAgc2Fpby5lbnRyeV9jb3VudCA9IDE7XG4gICAgICAgICAgICAgICAgc2Fpby5vZmZzZXQgPSBbMF07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzYWl6ID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgnc2FpeicsIHRyYWYpO1xuICAgICAgICAgICAgICAgIHNhaXoudmVyc2lvbiA9IDA7XG4gICAgICAgICAgICAgICAgc2Fpei5mbGFncyA9IDA7XG4gICAgICAgICAgICAgICAgc2Fpei5zYW1wbGVfY291bnQgPSBzZXBpZmYuc2FtcGxlX2NvdW50O1xuICAgICAgICAgICAgICAgIHNhaXouZGVmYXVsdF9zYW1wbGVfaW5mb19zaXplID0gMDtcbiAgICAgICAgICAgICAgICBzYWl6LnNhbXBsZV9pbmZvX3NpemUgPSBbXTtcblxuICAgICAgICAgICAgICAgIGlmIChzZXBpZmYuZmxhZ3MgJiAweDAyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN1Yi1zYW1wbGUgZW5jcnlwdGlvbiA9PiBzZXQgc2FtcGxlX2luZm9fc2l6ZSBmb3IgZWFjaCBzYW1wbGVcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHNlcGlmZi5zYW1wbGVfY291bnQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMTAgPSA4IChJbml0aWFsaXphdGlvblZlY3RvciBmaWVsZCBzaXplKSArIDIgKHN1YnNhbXBsZV9jb3VudCBmaWVsZCBzaXplKVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNiA9IDIgKEJ5dGVzT2ZDbGVhckRhdGEgZmllbGQgc2l6ZSkgKyA0IChCeXRlc09mRW5jcnlwdGVkRGF0YSBmaWVsZCBzaXplKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2Fpei5zYW1wbGVfaW5mb19zaXplW2ldID0gMTAgKyAoNiAqIHNlcGlmZi5lbnRyeVtpXS5OdW1iZXJPZkVudHJpZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gc3ViLXNhbXBsZSBlbmNyeXB0aW9uID0+IHNldCBkZWZhdWx0IHNhbXBsZV9pbmZvX3NpemUgPSBJbml0aWFsaXphdGlvblZlY3RvciBmaWVsZCBzaXplICg4KVxuICAgICAgICAgICAgICAgICAgICBzYWl6LmRlZmF1bHRfc2FtcGxlX2luZm9fc2l6ZSA9IDg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGZoZC5mbGFncyAmPSAweEZGRkZGRTsgLy8gc2V0IHRmaGQuYmFzZS1kYXRhLW9mZnNldC1wcmVzZW50IHRvIGZhbHNlXG4gICAgICAgIHRmaGQuZmxhZ3MgfD0gMHgwMjAwMDA7IC8vIHNldCB0ZmhkLmRlZmF1bHQtYmFzZS1pcy1tb29mIHRvIHRydWVcbiAgICAgICAgdHJ1bi5mbGFncyB8PSAweDAwMDAwMTsgLy8gc2V0IHRydW4uZGF0YS1vZmZzZXQtcHJlc2VudCB0byB0cnVlXG5cbiAgICAgICAgLy8gVXBkYXRlIHRydW4uZGF0YV9vZmZzZXQgZmllbGQgdGhhdCBjb3JyZXNwb25kcyB0byBmaXJzdCBkYXRhIGJ5dGUgKGluc2lkZSBtZGF0IGJveClcbiAgICAgICAgY29uc3QgbW9vZiA9IGlzb0ZpbGUuZmV0Y2goJ21vb2YnKTtcbiAgICAgICAgbGV0IGxlbmd0aCA9IG1vb2YuZ2V0TGVuZ3RoKCk7XG4gICAgICAgIHRydW4uZGF0YV9vZmZzZXQgPSBsZW5ndGggKyA4O1xuXG4gICAgICAgIC8vIFVwZGF0ZSBzYWlvIGJveCBvZmZzZXQgZmllbGQgYWNjb3JkaW5nIHRvIG5ldyBzZW5jIGJveCBvZmZzZXRcbiAgICAgICAgbGV0IHNhaW8gPSBpc29GaWxlLmZldGNoKCdzYWlvJyk7XG4gICAgICAgIGlmIChzYWlvICE9PSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgdHJhZlBvc0luTW9vZiA9IGdldEJveE9mZnNldChtb29mLCAndHJhZicpO1xuICAgICAgICAgICAgbGV0IHNlbmNQb3NJblRyYWYgPSBnZXRCb3hPZmZzZXQodHJhZiwgJ3NlbmMnKTtcbiAgICAgICAgICAgIC8vIFNldCBvZmZzZXQgZnJvbSBiZWdpbiBmcmFnbWVudCB0byB0aGUgZmlyc3QgSVYgZmllbGQgaW4gc2VuYyBib3hcbiAgICAgICAgICAgIHNhaW8ub2Zmc2V0WzBdID0gdHJhZlBvc0luTW9vZiArIHNlbmNQb3NJblRyYWYgKyAxNjsgLy8gMTYgPSBib3ggaGVhZGVyICgxMikgKyBzYW1wbGVfY291bnQgZmllbGQgc2l6ZSAoNClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdyaXRlIHRyYW5zZm9ybWVkL3Byb2Nlc3NlZCBmcmFnbWVudCBpbnRvIHJlcXVlc3QgcmVwb25zZSBkYXRhXG4gICAgICAgIGUucmVzcG9uc2UgPSBpc29GaWxlLndyaXRlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2VnbWVudExpc3QoZSwgc3RyZWFtUHJvY2Vzc29yKSB7XG4gICAgICAgIC8vIGUucmVxdWVzdCBjb250YWlucyByZXF1ZXN0IGRlc2NyaXB0aW9uIG9iamVjdFxuICAgICAgICAvLyBlLnJlc3BvbnNlIGNvbnRhaW5zIGZyYWdtZW50IGJ5dGVzXG4gICAgICAgIGlmICghZS5yZXNwb25zZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdlLnJlc3BvbnNlIHBhcmFtZXRlciBpcyBtaXNzaW5nJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc29GaWxlID0gSVNPQm94ZXIucGFyc2VCdWZmZXIoZS5yZXNwb25zZSk7XG4gICAgICAgIC8vIFVwZGF0ZSB0cmFja19JZCBpbiB0ZmhkIGJveFxuICAgICAgICBjb25zdCB0ZmhkID0gaXNvRmlsZS5mZXRjaCgndGZoZCcpO1xuICAgICAgICB0ZmhkLnRyYWNrX0lEID0gZS5yZXF1ZXN0Lm1lZGlhSW5mby5pbmRleCArIDE7XG5cbiAgICAgICAgLy8gQWRkIHRmZHQgYm94XG4gICAgICAgIGxldCB0ZmR0ID0gaXNvRmlsZS5mZXRjaCgndGZkdCcpO1xuICAgICAgICBsZXQgdHJhZiA9IGlzb0ZpbGUuZmV0Y2goJ3RyYWYnKTtcbiAgICAgICAgaWYgKHRmZHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRmZHQgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCd0ZmR0JywgdHJhZiwgdGZoZCk7XG4gICAgICAgICAgICB0ZmR0LnZlcnNpb24gPSAxO1xuICAgICAgICAgICAgdGZkdC5mbGFncyA9IDA7XG4gICAgICAgICAgICB0ZmR0LmJhc2VNZWRpYURlY29kZVRpbWUgPSBNYXRoLmZsb29yKGUucmVxdWVzdC5zdGFydFRpbWUgKiBlLnJlcXVlc3QudGltZXNjYWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0ZnJmID0gaXNvRmlsZS5mZXRjaCgndGZyZicpO1xuICAgICAgICBwcm9jZXNzVGZyZihlLnJlcXVlc3QsIHRmcmYsIHRmZHQsIHN0cmVhbVByb2Nlc3Nvcik7XG4gICAgICAgIGlmICh0ZnJmKSB7XG4gICAgICAgICAgICB0ZnJmLl9wYXJlbnQuYm94ZXMuc3BsaWNlKHRmcmYuX3BhcmVudC5ib3hlcy5pbmRleE9mKHRmcmYpLCAxKTtcbiAgICAgICAgICAgIHRmcmYgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfVxuXG4gICAgaW5zdGFuY2UgPSB7XG4gICAgICAgIGNvbnZlcnRGcmFnbWVudDogY29udmVydEZyYWdtZW50LFxuICAgICAgICB1cGRhdGVTZWdtZW50TGlzdDogdXBkYXRlU2VnbWVudExpc3QsXG4gICAgICAgIGdldFR5cGU6IGdldFR5cGVcbiAgICB9O1xuXG4gICAgc2V0dXAoKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbk1zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvci5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnTXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yJztcbmV4cG9ydCBkZWZhdWx0IGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0Q2xhc3NGYWN0b3J5KE1zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvcik7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbiBpbXBvcnQgTXNzRXJyb3JzIGZyb20gJy4vZXJyb3JzL01zc0Vycm9ycyc7XG5cbi8qKlxuICogQG1vZHVsZSBNc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3JcbiAqIEBpZ25vcmVcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIE1zc0ZyYWdtZW50TW9vdlByb2Nlc3Nvcihjb25maWcpIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgY29uc3QgTkFMVVRZUEVfU1BTID0gNztcbiAgICBjb25zdCBOQUxVVFlQRV9QUFMgPSA4O1xuICAgIGNvbnN0IGNvbnN0YW50cyA9IGNvbmZpZy5jb25zdGFudHM7XG4gICAgY29uc3QgSVNPQm94ZXIgPSBjb25maWcuSVNPQm94ZXI7XG5cbiAgICBsZXQgcHJvdGVjdGlvbkNvbnRyb2xsZXIgPSBjb25maWcucHJvdGVjdGlvbkNvbnRyb2xsZXI7XG4gICAgbGV0IGluc3RhbmNlLFxuICAgICAgICBwZXJpb2QsXG4gICAgICAgIGFkYXB0YXRpb25TZXQsXG4gICAgICAgIHJlcHJlc2VudGF0aW9uLFxuICAgICAgICBjb250ZW50UHJvdGVjdGlvbixcbiAgICAgICAgdGltZXNjYWxlLFxuICAgICAgICB0cmFja0lkO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlRnR5cEJveChpc29GaWxlKSB7XG4gICAgICAgIGxldCBmdHlwID0gSVNPQm94ZXIuY3JlYXRlQm94KCdmdHlwJywgaXNvRmlsZSk7XG4gICAgICAgIGZ0eXAubWFqb3JfYnJhbmQgPSAnaXNvNic7XG4gICAgICAgIGZ0eXAubWlub3JfdmVyc2lvbiA9IDE7IC8vIGlzIGFuIGluZm9ybWF0aXZlIGludGVnZXIgZm9yIHRoZSBtaW5vciB2ZXJzaW9uIG9mIHRoZSBtYWpvciBicmFuZFxuICAgICAgICBmdHlwLmNvbXBhdGlibGVfYnJhbmRzID0gW107IC8vaXMgYSBsaXN0LCB0byB0aGUgZW5kIG9mIHRoZSBib3gsIG9mIGJyYW5kcyBpc29tLCBpc282IGFuZCBtc2RoXG4gICAgICAgIGZ0eXAuY29tcGF0aWJsZV9icmFuZHNbMF0gPSAnaXNvbSc7IC8vID0+IGRlY2ltYWwgQVNDSUkgdmFsdWUgZm9yIGlzb21cbiAgICAgICAgZnR5cC5jb21wYXRpYmxlX2JyYW5kc1sxXSA9ICdpc282JzsgLy8gPT4gZGVjaW1hbCBBU0NJSSB2YWx1ZSBmb3IgaXNvNlxuICAgICAgICBmdHlwLmNvbXBhdGlibGVfYnJhbmRzWzJdID0gJ21zZGgnOyAvLyA9PiBkZWNpbWFsIEFTQ0lJIHZhbHVlIGZvciBtc2RoXG5cbiAgICAgICAgcmV0dXJuIGZ0eXA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTW9vdkJveChpc29GaWxlKSB7XG5cbiAgICAgICAgLy8gbW9vdiBib3hcbiAgICAgICAgbGV0IG1vb3YgPSBJU09Cb3hlci5jcmVhdGVCb3goJ21vb3YnLCBpc29GaWxlKTtcblxuICAgICAgICAvLyBtb292L212aGRcbiAgICAgICAgY3JlYXRlTXZoZEJveChtb292KTtcblxuICAgICAgICAvLyBtb292L3RyYWtcbiAgICAgICAgbGV0IHRyYWsgPSBJU09Cb3hlci5jcmVhdGVCb3goJ3RyYWsnLCBtb292KTtcblxuICAgICAgICAvLyBtb292L3RyYWsvdGtoZFxuICAgICAgICBjcmVhdGVUa2hkQm94KHRyYWspO1xuXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhXG4gICAgICAgIGxldCBtZGlhID0gSVNPQm94ZXIuY3JlYXRlQm94KCdtZGlhJywgdHJhayk7XG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWRoZFxuICAgICAgICBjcmVhdGVNZGhkQm94KG1kaWEpO1xuXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL2hkbHJcbiAgICAgICAgY3JlYXRlSGRsckJveChtZGlhKTtcblxuICAgICAgICAvLyBtb292L3RyYWsvbWRpYS9taW5mXG4gICAgICAgIGxldCBtaW5mID0gSVNPQm94ZXIuY3JlYXRlQm94KCdtaW5mJywgbWRpYSk7XG5cbiAgICAgICAgc3dpdGNoIChhZGFwdGF0aW9uU2V0LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLlZJREVPOlxuICAgICAgICAgICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmYvdm1oZFxuICAgICAgICAgICAgICAgIGNyZWF0ZVZtaGRCb3gobWluZik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5BVURJTzpcbiAgICAgICAgICAgICAgICAvLyBtb292L3RyYWsvbWRpYS9taW5mL3NtaGRcbiAgICAgICAgICAgICAgICBjcmVhdGVTbWhkQm94KG1pbmYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmYvZGluZlxuICAgICAgICBsZXQgZGluZiA9IElTT0JveGVyLmNyZWF0ZUJveCgnZGluZicsIG1pbmYpO1xuXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmYvZGluZi9kcmVmXG4gICAgICAgIGNyZWF0ZURyZWZCb3goZGluZik7XG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsXG4gICAgICAgIGxldCBzdGJsID0gSVNPQm94ZXIuY3JlYXRlQm94KCdzdGJsJywgbWluZik7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGVtcHR5IHN0dHMsIHN0c2MsIHN0Y28gYW5kIHN0c3ogYm94ZXNcbiAgICAgICAgLy8gVXNlIGRhdGEgZmllbGQgYXMgZm9yIGNvZGVtLWlzb2JveGVyIHVua25vd24gYm94ZXMgZm9yIHNldHRpbmcgZmllbGRzIHZhbHVlXG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsL3N0dHNcbiAgICAgICAgbGV0IHN0dHMgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzdHRzJywgc3RibCk7XG4gICAgICAgIHN0dHMuX2RhdGEgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07IC8vIHZlcnNpb24gPSAwLCBmbGFncyA9IDAsIGVudHJ5X2NvdW50ID0gMFxuXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmYvc3RibC9zdHNjXG4gICAgICAgIGxldCBzdHNjID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgnc3RzYycsIHN0YmwpO1xuICAgICAgICBzdHNjLl9kYXRhID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdOyAvLyB2ZXJzaW9uID0gMCwgZmxhZ3MgPSAwLCBlbnRyeV9jb3VudCA9IDBcblxuICAgICAgICAvLyBtb292L3RyYWsvbWRpYS9taW5mL3N0Ymwvc3Rjb1xuICAgICAgICBsZXQgc3RjbyA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3N0Y28nLCBzdGJsKTtcbiAgICAgICAgc3Rjby5fZGF0YSA9IFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXTsgLy8gdmVyc2lvbiA9IDAsIGZsYWdzID0gMCwgZW50cnlfY291bnQgPSAwXG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsL3N0c3pcbiAgICAgICAgbGV0IHN0c3ogPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzdHN6Jywgc3RibCk7XG4gICAgICAgIHN0c3ouX2RhdGEgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07IC8vIHZlcnNpb24gPSAwLCBmbGFncyA9IDAsIHNhbXBsZV9zaXplID0gMCwgc2FtcGxlX2NvdW50ID0gMFxuXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmYvc3RibC9zdHNkXG4gICAgICAgIGNyZWF0ZVN0c2RCb3goc3RibCk7XG5cbiAgICAgICAgLy8gbW9vdi9tdmV4XG4gICAgICAgIGxldCBtdmV4ID0gSVNPQm94ZXIuY3JlYXRlQm94KCdtdmV4JywgbW9vdik7XG5cbiAgICAgICAgLy8gbW9vdi9tdmV4L3RyZXhcbiAgICAgICAgY3JlYXRlVHJleEJveChtdmV4KTtcblxuICAgICAgICBpZiAoY29udGVudFByb3RlY3Rpb24gJiYgcHJvdGVjdGlvbkNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIGxldCBzdXBwb3J0ZWRLUyA9IHByb3RlY3Rpb25Db250cm9sbGVyLmdldFN1cHBvcnRlZEtleVN5c3RlbXNGcm9tQ29udGVudFByb3RlY3Rpb24oY29udGVudFByb3RlY3Rpb24pO1xuICAgICAgICAgICAgY3JlYXRlUHJvdGVjdGlvblN5c3RlbVNwZWNpZmljSGVhZGVyQm94KG1vb3YsIHN1cHBvcnRlZEtTKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZU12aGRCb3gobW9vdikge1xuXG4gICAgICAgIGxldCBtdmhkID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgnbXZoZCcsIG1vb3YpO1xuXG4gICAgICAgIG12aGQudmVyc2lvbiA9IDE7IC8vIHZlcnNpb24gPSAxICBpbiBvcmRlciB0byBoYXZlIDY0Yml0cyBkdXJhdGlvbiB2YWx1ZVxuXG4gICAgICAgIG12aGQuY3JlYXRpb25fdGltZSA9IDA7IC8vIHRoZSBjcmVhdGlvbiB0aW1lIG9mIHRoZSBwcmVzZW50YXRpb24gPT4gaWdub3JlIChzZXQgdG8gMClcbiAgICAgICAgbXZoZC5tb2RpZmljYXRpb25fdGltZSA9IDA7IC8vIHRoZSBtb3N0IHJlY2VudCB0aW1lIHRoZSBwcmVzZW50YXRpb24gd2FzIG1vZGlmaWVkID0+IGlnbm9yZSAoc2V0IHRvIDApXG4gICAgICAgIG12aGQudGltZXNjYWxlID0gdGltZXNjYWxlOyAvLyB0aGUgdGltZS1zY2FsZSBmb3IgdGhlIGVudGlyZSBwcmVzZW50YXRpb24gPT4gMTAwMDAwMDAgZm9yIE1TU1xuICAgICAgICBtdmhkLmR1cmF0aW9uID0gcGVyaW9kLmR1cmF0aW9uID09PSBJbmZpbml0eSA/IDB4RkZGRkZGRkZGRkZGRkZGRiA6IE1hdGgucm91bmQocGVyaW9kLmR1cmF0aW9uICogdGltZXNjYWxlKTsgLy8gdGhlIGxlbmd0aCBvZiB0aGUgcHJlc2VudGF0aW9uIChpbiB0aGUgaW5kaWNhdGVkIHRpbWVzY2FsZSkgPT4gIHRha2UgZHVyYXRpb24gb2YgcGVyaW9kXG4gICAgICAgIG12aGQucmF0ZSA9IDEuMDsgLy8gMTYuMTYgbnVtYmVyLCAnMS4wJyA9IG5vcm1hbCBwbGF5YmFja1xuICAgICAgICBtdmhkLnZvbHVtZSA9IDEuMDsgLy8gOC44IG51bWJlciwgJzEuMCcgPSBmdWxsIHZvbHVtZVxuICAgICAgICBtdmhkLnJlc2VydmVkMSA9IDA7XG4gICAgICAgIG12aGQucmVzZXJ2ZWQyID0gWzB4MCwgMHgwXTtcbiAgICAgICAgbXZoZC5tYXRyaXggPSBbXG4gICAgICAgICAgICAxLCAwLCAwLCAvLyBwcm92aWRlcyBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBmb3IgdGhlIHZpZGVvO1xuICAgICAgICAgICAgMCwgMSwgMCwgLy8gKHUsdix3KSBhcmUgcmVzdHJpY3RlZCBoZXJlIHRvICgwLDAsMSlcbiAgICAgICAgICAgIDAsIDAsIDE2Mzg0XG4gICAgICAgIF07XG4gICAgICAgIG12aGQucHJlX2RlZmluZWQgPSBbMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgICAgIG12aGQubmV4dF90cmFja19JRCA9IHRyYWNrSWQgKyAxOyAvLyBpbmRpY2F0ZXMgYSB2YWx1ZSB0byB1c2UgZm9yIHRoZSB0cmFjayBJRCBvZiB0aGUgbmV4dCB0cmFjayB0byBiZSBhZGRlZCB0byB0aGlzIHByZXNlbnRhdGlvblxuXG4gICAgICAgIHJldHVybiBtdmhkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVRraGRCb3godHJhaykge1xuXG4gICAgICAgIGxldCB0a2hkID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgndGtoZCcsIHRyYWspO1xuXG4gICAgICAgIHRraGQudmVyc2lvbiA9IDE7IC8vIHZlcnNpb24gPSAxICBpbiBvcmRlciB0byBoYXZlIDY0Yml0cyBkdXJhdGlvbiB2YWx1ZVxuICAgICAgICB0a2hkLmZsYWdzID0gMHgxIHwgLy8gVHJhY2tfZW5hYmxlZCAoMHgwMDAwMDEpOiBJbmRpY2F0ZXMgdGhhdCB0aGUgdHJhY2sgaXMgZW5hYmxlZFxuICAgICAgICAgICAgMHgyIHwgLy8gVHJhY2tfaW5fbW92aWUgKDB4MDAwMDAyKTogIEluZGljYXRlcyB0aGF0IHRoZSB0cmFjayBpcyB1c2VkIGluIHRoZSBwcmVzZW50YXRpb25cbiAgICAgICAgICAgIDB4NDsgLy8gVHJhY2tfaW5fcHJldmlldyAoMHgwMDAwMDQpOiAgSW5kaWNhdGVzIHRoYXQgdGhlIHRyYWNrIGlzIHVzZWQgd2hlbiBwcmV2aWV3aW5nIHRoZSBwcmVzZW50YXRpb25cblxuICAgICAgICB0a2hkLmNyZWF0aW9uX3RpbWUgPSAwOyAvLyB0aGUgY3JlYXRpb24gdGltZSBvZiB0aGUgcHJlc2VudGF0aW9uID0+IGlnbm9yZSAoc2V0IHRvIDApXG4gICAgICAgIHRraGQubW9kaWZpY2F0aW9uX3RpbWUgPSAwOyAvLyB0aGUgbW9zdCByZWNlbnQgdGltZSB0aGUgcHJlc2VudGF0aW9uIHdhcyBtb2RpZmllZCA9PiBpZ25vcmUgKHNldCB0byAwKVxuICAgICAgICB0a2hkLnRyYWNrX0lEID0gdHJhY2tJZDsgLy8gdW5pcXVlbHkgaWRlbnRpZmllcyB0aGlzIHRyYWNrIG92ZXIgdGhlIGVudGlyZSBsaWZlLXRpbWUgb2YgdGhpcyBwcmVzZW50YXRpb25cbiAgICAgICAgdGtoZC5yZXNlcnZlZDEgPSAwO1xuICAgICAgICB0a2hkLmR1cmF0aW9uID0gcGVyaW9kLmR1cmF0aW9uID09PSBJbmZpbml0eSA/IDB4RkZGRkZGRkZGRkZGRkZGRiA6IE1hdGgucm91bmQocGVyaW9kLmR1cmF0aW9uICogdGltZXNjYWxlKTsgLy8gdGhlIGR1cmF0aW9uIG9mIHRoaXMgdHJhY2sgKGluIHRoZSB0aW1lc2NhbGUgaW5kaWNhdGVkIGluIHRoZSBNb3ZpZSBIZWFkZXIgQm94KSA9PiAgdGFrZSBkdXJhdGlvbiBvZiBwZXJpb2RcbiAgICAgICAgdGtoZC5yZXNlcnZlZDIgPSBbMHgwLCAweDBdO1xuICAgICAgICB0a2hkLmxheWVyID0gMDsgLy8gc3BlY2lmaWVzIHRoZSBmcm9udC10by1iYWNrIG9yZGVyaW5nIG9mIHZpZGVvIHRyYWNrczsgdHJhY2tzIHdpdGggbG93ZXIgbnVtYmVycyBhcmUgY2xvc2VyIHRvIHRoZSB2aWV3ZXIgPT4gMCBzaW5jZSBvbmx5IG9uZSB2aWRlbyB0cmFja1xuICAgICAgICB0a2hkLmFsdGVybmF0ZV9ncm91cCA9IDA7IC8vIHNwZWNpZmllcyBhIGdyb3VwIG9yIGNvbGxlY3Rpb24gb2YgdHJhY2tzID0+IGlnbm9yZVxuICAgICAgICB0a2hkLnZvbHVtZSA9IDEuMDsgLy8gJzEuMCcgPSBmdWxsIHZvbHVtZVxuICAgICAgICB0a2hkLnJlc2VydmVkMyA9IDA7XG4gICAgICAgIHRraGQubWF0cml4ID0gW1xuICAgICAgICAgICAgMSwgMCwgMCwgLy8gcHJvdmlkZXMgYSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggZm9yIHRoZSB2aWRlbztcbiAgICAgICAgICAgIDAsIDEsIDAsIC8vICh1LHYsdykgYXJlIHJlc3RyaWN0ZWQgaGVyZSB0byAoMCwwLDEpXG4gICAgICAgICAgICAwLCAwLCAxNjM4NFxuICAgICAgICBdO1xuICAgICAgICB0a2hkLndpZHRoID0gcmVwcmVzZW50YXRpb24ud2lkdGg7IC8vIHZpc3VhbCBwcmVzZW50YXRpb24gd2lkdGhcbiAgICAgICAgdGtoZC5oZWlnaHQgPSByZXByZXNlbnRhdGlvbi5oZWlnaHQ7IC8vIHZpc3VhbCBwcmVzZW50YXRpb24gaGVpZ2h0XG5cbiAgICAgICAgcmV0dXJuIHRraGQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTWRoZEJveChtZGlhKSB7XG5cbiAgICAgICAgbGV0IG1kaGQgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdtZGhkJywgbWRpYSk7XG5cbiAgICAgICAgbWRoZC52ZXJzaW9uID0gMTsgLy8gdmVyc2lvbiA9IDEgIGluIG9yZGVyIHRvIGhhdmUgNjRiaXRzIGR1cmF0aW9uIHZhbHVlXG5cbiAgICAgICAgbWRoZC5jcmVhdGlvbl90aW1lID0gMDsgLy8gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHByZXNlbnRhdGlvbiA9PiBpZ25vcmUgKHNldCB0byAwKVxuICAgICAgICBtZGhkLm1vZGlmaWNhdGlvbl90aW1lID0gMDsgLy8gdGhlIG1vc3QgcmVjZW50IHRpbWUgdGhlIHByZXNlbnRhdGlvbiB3YXMgbW9kaWZpZWQgPT4gaWdub3JlIChzZXQgdG8gMClcbiAgICAgICAgbWRoZC50aW1lc2NhbGUgPSB0aW1lc2NhbGU7IC8vIHRoZSB0aW1lLXNjYWxlIGZvciB0aGUgZW50aXJlIHByZXNlbnRhdGlvblxuICAgICAgICBtZGhkLmR1cmF0aW9uID0gcGVyaW9kLmR1cmF0aW9uID09PSBJbmZpbml0eSA/IDB4RkZGRkZGRkZGRkZGRkZGRiA6IE1hdGgucm91bmQocGVyaW9kLmR1cmF0aW9uICogdGltZXNjYWxlKTsgLy8gdGhlIGR1cmF0aW9uIG9mIHRoaXMgbWVkaWEgKGluIHRoZSBzY2FsZSBvZiB0aGUgdGltZXNjYWxlKS4gSWYgdGhlIGR1cmF0aW9uIGNhbm5vdCBiZSBkZXRlcm1pbmVkIHRoZW4gZHVyYXRpb24gaXMgc2V0IHRvIGFsbCAxcy5cbiAgICAgICAgbWRoZC5sYW5ndWFnZSA9IGFkYXB0YXRpb25TZXQubGFuZyB8fCAndW5kJzsgLy8gZGVjbGFyZXMgdGhlIGxhbmd1YWdlIGNvZGUgZm9yIHRoaXMgbWVkaWFcbiAgICAgICAgbWRoZC5wcmVfZGVmaW5lZCA9IDA7XG5cbiAgICAgICAgcmV0dXJuIG1kaGQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlSGRsckJveChtZGlhKSB7XG5cbiAgICAgICAgbGV0IGhkbHIgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdoZGxyJywgbWRpYSk7XG5cbiAgICAgICAgaGRsci5wcmVfZGVmaW5lZCA9IDA7XG4gICAgICAgIHN3aXRjaCAoYWRhcHRhdGlvblNldC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5WSURFTzpcbiAgICAgICAgICAgICAgICBoZGxyLmhhbmRsZXJfdHlwZSA9ICd2aWRlJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLkFVRElPOlxuICAgICAgICAgICAgICAgIGhkbHIuaGFuZGxlcl90eXBlID0gJ3NvdW4nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBoZGxyLmhhbmRsZXJfdHlwZSA9ICdtZXRhJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBoZGxyLm5hbWUgPSByZXByZXNlbnRhdGlvbi5pZDtcbiAgICAgICAgaGRsci5yZXNlcnZlZCA9IFswLCAwLCAwXTtcblxuICAgICAgICByZXR1cm4gaGRscjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVWbWhkQm94KG1pbmYpIHtcblxuICAgICAgICBsZXQgdm1oZCA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3ZtaGQnLCBtaW5mKTtcblxuICAgICAgICB2bWhkLmZsYWdzID0gMTtcblxuICAgICAgICB2bWhkLmdyYXBoaWNzbW9kZSA9IDA7IC8vIHNwZWNpZmllcyBhIGNvbXBvc2l0aW9uIG1vZGUgZm9yIHRoaXMgdmlkZW8gdHJhY2ssIGZyb20gdGhlIGZvbGxvd2luZyBlbnVtZXJhdGVkIHNldCwgd2hpY2ggbWF5IGJlIGV4dGVuZGVkIGJ5IGRlcml2ZWQgc3BlY2lmaWNhdGlvbnM6IGNvcHkgPSAwIGNvcHkgb3ZlciB0aGUgZXhpc3RpbmcgaW1hZ2VcbiAgICAgICAgdm1oZC5vcGNvbG9yID0gWzAsIDAsIDBdOyAvLyBpcyBhIHNldCBvZiAzIGNvbG91ciB2YWx1ZXMgKHJlZCwgZ3JlZW4sIGJsdWUpIGF2YWlsYWJsZSBmb3IgdXNlIGJ5IGdyYXBoaWNzIG1vZGVzXG5cbiAgICAgICAgcmV0dXJuIHZtaGQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlU21oZEJveChtaW5mKSB7XG5cbiAgICAgICAgbGV0IHNtaGQgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzbWhkJywgbWluZik7XG5cbiAgICAgICAgc21oZC5mbGFncyA9IDE7XG5cbiAgICAgICAgc21oZC5iYWxhbmNlID0gMDsgLy8gaXMgYSBmaXhlZC1wb2ludCA4LjggbnVtYmVyIHRoYXQgcGxhY2VzIG1vbm8gYXVkaW8gdHJhY2tzIGluIGEgc3RlcmVvIHNwYWNlOyAwIGlzIGNlbnRyZSAodGhlIG5vcm1hbCB2YWx1ZSk7IGZ1bGwgbGVmdCBpcyAtMS4wIGFuZCBmdWxsIHJpZ2h0IGlzIDEuMC5cbiAgICAgICAgc21oZC5yZXNlcnZlZCA9IDA7XG5cbiAgICAgICAgcmV0dXJuIHNtaGQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlRHJlZkJveChkaW5mKSB7XG5cbiAgICAgICAgbGV0IGRyZWYgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdkcmVmJywgZGluZik7XG5cbiAgICAgICAgZHJlZi5lbnRyeV9jb3VudCA9IDE7XG4gICAgICAgIGRyZWYuZW50cmllcyA9IFtdO1xuXG4gICAgICAgIGxldCB1cmwgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCd1cmwgJywgZHJlZiwgZmFsc2UpO1xuICAgICAgICB1cmwubG9jYXRpb24gPSAnJztcbiAgICAgICAgdXJsLmZsYWdzID0gMTtcblxuICAgICAgICBkcmVmLmVudHJpZXMucHVzaCh1cmwpO1xuXG4gICAgICAgIHJldHVybiBkcmVmO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVN0c2RCb3goc3RibCkge1xuXG4gICAgICAgIGxldCBzdHNkID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgnc3RzZCcsIHN0YmwpO1xuXG4gICAgICAgIHN0c2QuZW50cmllcyA9IFtdO1xuICAgICAgICBzd2l0Y2ggKGFkYXB0YXRpb25TZXQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBjb25zdGFudHMuVklERU86XG4gICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5BVURJTzpcbiAgICAgICAgICAgICAgICBzdHNkLmVudHJpZXMucHVzaChjcmVhdGVTYW1wbGVFbnRyeShzdHNkKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RzZC5lbnRyeV9jb3VudCA9IHN0c2QuZW50cmllcy5sZW5ndGg7IC8vIGlzIGFuIGludGVnZXIgdGhhdCBjb3VudHMgdGhlIGFjdHVhbCBlbnRyaWVzXG4gICAgICAgIHJldHVybiBzdHNkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNhbXBsZUVudHJ5KHN0c2QpIHtcbiAgICAgICAgbGV0IGNvZGVjID0gcmVwcmVzZW50YXRpb24uY29kZWNzLnN1YnN0cmluZygwLCByZXByZXNlbnRhdGlvbi5jb2RlY3MuaW5kZXhPZignLicpKTtcblxuICAgICAgICBzd2l0Y2ggKGNvZGVjKSB7XG4gICAgICAgICAgICBjYXNlICdhdmMxJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQVZDVmlzdWFsU2FtcGxlRW50cnkoc3RzZCwgY29kZWMpO1xuICAgICAgICAgICAgY2FzZSAnbXA0YSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZU1QNEF1ZGlvU2FtcGxlRW50cnkoc3RzZCwgY29kZWMpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IE1zc0Vycm9ycy5NU1NfVU5TVVBQT1JURURfQ09ERUNfQ09ERSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTXNzRXJyb3JzLk1TU19VTlNVUFBPUlRFRF9DT0RFQ19NRVNTQUdFLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlYzogY29kZWNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVBVkNWaXN1YWxTYW1wbGVFbnRyeShzdHNkLCBjb2RlYykge1xuICAgICAgICBsZXQgYXZjMTtcblxuICAgICAgICBpZiAoY29udGVudFByb3RlY3Rpb24pIHtcbiAgICAgICAgICAgIGF2YzEgPSBJU09Cb3hlci5jcmVhdGVCb3goJ2VuY3YnLCBzdHNkLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdmMxID0gSVNPQm94ZXIuY3JlYXRlQm94KCdhdmMxJywgc3RzZCwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2FtcGxlRW50cnkgZmllbGRzXG4gICAgICAgIGF2YzEucmVzZXJ2ZWQxID0gWzB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDBdO1xuICAgICAgICBhdmMxLmRhdGFfcmVmZXJlbmNlX2luZGV4ID0gMTtcblxuICAgICAgICAvLyBWaXN1YWxTYW1wbGVFbnRyeSBmaWVsZHNcbiAgICAgICAgYXZjMS5wcmVfZGVmaW5lZDEgPSAwO1xuICAgICAgICBhdmMxLnJlc2VydmVkMiA9IDA7XG4gICAgICAgIGF2YzEucHJlX2RlZmluZWQyID0gWzAsIDAsIDBdO1xuICAgICAgICBhdmMxLmhlaWdodCA9IHJlcHJlc2VudGF0aW9uLmhlaWdodDtcbiAgICAgICAgYXZjMS53aWR0aCA9IHJlcHJlc2VudGF0aW9uLndpZHRoO1xuICAgICAgICBhdmMxLmhvcml6cmVzb2x1dGlvbiA9IDcyOyAvLyA3MiBkcGlcbiAgICAgICAgYXZjMS52ZXJ0cmVzb2x1dGlvbiA9IDcyOyAvLyA3MiBkcGlcbiAgICAgICAgYXZjMS5yZXNlcnZlZDMgPSAwO1xuICAgICAgICBhdmMxLmZyYW1lX2NvdW50ID0gMTsgLy8gMSBjb21wcmVzc2VkIHZpZGVvIGZyYW1lIHBlciBzYW1wbGVcbiAgICAgICAgYXZjMS5jb21wcmVzc29ybmFtZSA9IFtcbiAgICAgICAgICAgIDB4MEEsIDB4NDEsIDB4NTYsIDB4NDMsIDB4MjAsIDB4NDMsIDB4NkYsIDB4NjQsIC8vID0gJ0FWQyBDb2RpbmcnO1xuICAgICAgICAgICAgMHg2OSwgMHg2RSwgMHg2NywgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsXG4gICAgICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwXG4gICAgICAgIF07XG4gICAgICAgIGF2YzEuZGVwdGggPSAweDAwMTg7IC8vIDB4MDAxOCDigJMgaW1hZ2VzIGFyZSBpbiBjb2xvdXIgd2l0aCBubyBhbHBoYS5cbiAgICAgICAgYXZjMS5wcmVfZGVmaW5lZDMgPSA2NTUzNTtcbiAgICAgICAgYXZjMS5jb25maWcgPSBjcmVhdGVBVkMxQ29uZmlndXJhdGlvblJlY29yZCgpO1xuICAgICAgICBpZiAoY29udGVudFByb3RlY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIFByb3RlY3Rpb24gU2NoZW1lIEluZm8gQm94XG4gICAgICAgICAgICBsZXQgc2luZiA9IElTT0JveGVyLmNyZWF0ZUJveCgnc2luZicsIGF2YzEpO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBPcmlnaW5hbCBGb3JtYXQgQm94ID0+IGluZGljYXRlIGNvZGVjIHR5cGUgb2YgdGhlIGVuY3J5cHRlZCBjb250ZW50XG4gICAgICAgICAgICBjcmVhdGVPcmlnaW5hbEZvcm1hdEJveChzaW5mLCBjb2RlYyk7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIFNjaGVtZSBUeXBlIGJveFxuICAgICAgICAgICAgY3JlYXRlU2NoZW1lVHlwZUJveChzaW5mKTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgU2NoZW1lIEluZm9ybWF0aW9uIEJveFxuICAgICAgICAgICAgY3JlYXRlU2NoZW1lSW5mb3JtYXRpb25Cb3goc2luZik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXZjMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVBVkMxQ29uZmlndXJhdGlvblJlY29yZCgpIHtcblxuICAgICAgICBsZXQgYXZjQyA9IG51bGw7XG4gICAgICAgIGxldCBhdmNDTGVuZ3RoID0gMTU7IC8vIGxlbmd0aCA9IDE1IGJ5IGRlZmF1bHQgKDAgU1BTIGFuZCAwIFBQUylcblxuICAgICAgICAvLyBGaXJzdCBnZXQgYWxsIFNQUyBhbmQgUFBTIGZyb20gY29kZWNQcml2YXRlRGF0YVxuICAgICAgICBsZXQgc3BzID0gW107XG4gICAgICAgIGxldCBwcHMgPSBbXTtcbiAgICAgICAgbGV0IEFWQ1Byb2ZpbGVJbmRpY2F0aW9uID0gMDtcbiAgICAgICAgbGV0IEFWQ0xldmVsSW5kaWNhdGlvbiA9IDA7XG4gICAgICAgIGxldCBwcm9maWxlX2NvbXBhdGliaWxpdHkgPSAwO1xuXG4gICAgICAgIGxldCBuYWx1cyA9IHJlcHJlc2VudGF0aW9uLmNvZGVjUHJpdmF0ZURhdGEuc3BsaXQoJzAwMDAwMDAxJykuc2xpY2UoMSk7XG4gICAgICAgIGxldCBuYWx1Qnl0ZXMsIG5hbHVUeXBlO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFsdXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5hbHVCeXRlcyA9IGhleFN0cmluZ3RvQnVmZmVyKG5hbHVzW2ldKTtcblxuICAgICAgICAgICAgbmFsdVR5cGUgPSBuYWx1Qnl0ZXNbMF0gJiAweDFGO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKG5hbHVUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBOQUxVVFlQRV9TUFM6XG4gICAgICAgICAgICAgICAgICAgIHNwcy5wdXNoKG5hbHVCeXRlcyk7XG4gICAgICAgICAgICAgICAgICAgIGF2Y0NMZW5ndGggKz0gbmFsdUJ5dGVzLmxlbmd0aCArIDI7IC8vIDIgPSBzZXF1ZW5jZVBhcmFtZXRlclNldExlbmd0aCBmaWVsZCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBOQUxVVFlQRV9QUFM6XG4gICAgICAgICAgICAgICAgICAgIHBwcy5wdXNoKG5hbHVCeXRlcyk7XG4gICAgICAgICAgICAgICAgICAgIGF2Y0NMZW5ndGggKz0gbmFsdUJ5dGVzLmxlbmd0aCArIDI7IC8vIDIgPSBwaWN0dXJlUGFyYW1ldGVyU2V0TGVuZ3RoIGZpZWxkIGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBwcm9maWxlIGFuZCBsZXZlbCBmcm9tIFNQU1xuICAgICAgICBpZiAoc3BzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIEFWQ1Byb2ZpbGVJbmRpY2F0aW9uID0gc3BzWzBdWzFdO1xuICAgICAgICAgICAgcHJvZmlsZV9jb21wYXRpYmlsaXR5ID0gc3BzWzBdWzJdO1xuICAgICAgICAgICAgQVZDTGV2ZWxJbmRpY2F0aW9uID0gc3BzWzBdWzNdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgYXZjQyBidWZmZXJcbiAgICAgICAgYXZjQyA9IG5ldyBVaW50OEFycmF5KGF2Y0NMZW5ndGgpO1xuXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgLy8gbGVuZ3RoXG4gICAgICAgIGF2Y0NbaSsrXSA9IChhdmNDTGVuZ3RoICYgMHhGRjAwMDAwMCkgPj4gMjQ7XG4gICAgICAgIGF2Y0NbaSsrXSA9IChhdmNDTGVuZ3RoICYgMHgwMEZGMDAwMCkgPj4gMTY7XG4gICAgICAgIGF2Y0NbaSsrXSA9IChhdmNDTGVuZ3RoICYgMHgwMDAwRkYwMCkgPj4gODtcbiAgICAgICAgYXZjQ1tpKytdID0gKGF2Y0NMZW5ndGggJiAweDAwMDAwMEZGKTtcbiAgICAgICAgYXZjQy5zZXQoWzB4NjEsIDB4NzYsIDB4NjMsIDB4NDNdLCBpKTsgLy8gdHlwZSA9ICdhdmNDJ1xuICAgICAgICBpICs9IDQ7XG4gICAgICAgIGF2Y0NbaSsrXSA9IDE7IC8vIGNvbmZpZ3VyYXRpb25WZXJzaW9uID0gMVxuICAgICAgICBhdmNDW2krK10gPSBBVkNQcm9maWxlSW5kaWNhdGlvbjtcbiAgICAgICAgYXZjQ1tpKytdID0gcHJvZmlsZV9jb21wYXRpYmlsaXR5O1xuICAgICAgICBhdmNDW2krK10gPSBBVkNMZXZlbEluZGljYXRpb247XG4gICAgICAgIGF2Y0NbaSsrXSA9IDB4RkY7IC8vICcxMTExMScgKyBsZW5ndGhTaXplTWludXNPbmUgPSAzXG4gICAgICAgIGF2Y0NbaSsrXSA9IDB4RTAgfCBzcHMubGVuZ3RoOyAvLyAnMTExJyArIG51bU9mU2VxdWVuY2VQYXJhbWV0ZXJTZXRzXG4gICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgc3BzLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICBhdmNDW2krK10gPSAoc3BzW25dLmxlbmd0aCAmIDB4RkYwMCkgPj4gODtcbiAgICAgICAgICAgIGF2Y0NbaSsrXSA9IChzcHNbbl0ubGVuZ3RoICYgMHgwMEZGKTtcbiAgICAgICAgICAgIGF2Y0Muc2V0KHNwc1tuXSwgaSk7XG4gICAgICAgICAgICBpICs9IHNwc1tuXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgYXZjQ1tpKytdID0gcHBzLmxlbmd0aDsgLy8gbnVtT2ZQaWN0dXJlUGFyYW1ldGVyU2V0c1xuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IHBwcy5sZW5ndGg7IG4rKykge1xuICAgICAgICAgICAgYXZjQ1tpKytdID0gKHBwc1tuXS5sZW5ndGggJiAweEZGMDApID4+IDg7XG4gICAgICAgICAgICBhdmNDW2krK10gPSAocHBzW25dLmxlbmd0aCAmIDB4MDBGRik7XG4gICAgICAgICAgICBhdmNDLnNldChwcHNbbl0sIGkpO1xuICAgICAgICAgICAgaSArPSBwcHNbbl0ubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGF2Y0M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTVA0QXVkaW9TYW1wbGVFbnRyeShzdHNkLCBjb2RlYykge1xuICAgICAgICBsZXQgbXA0YTtcblxuICAgICAgICBpZiAoY29udGVudFByb3RlY3Rpb24pIHtcbiAgICAgICAgICAgIG1wNGEgPSBJU09Cb3hlci5jcmVhdGVCb3goJ2VuY2EnLCBzdHNkLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtcDRhID0gSVNPQm94ZXIuY3JlYXRlQm94KCdtcDRhJywgc3RzZCwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2FtcGxlRW50cnkgZmllbGRzXG4gICAgICAgIG1wNGEucmVzZXJ2ZWQxID0gWzB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDBdO1xuICAgICAgICBtcDRhLmRhdGFfcmVmZXJlbmNlX2luZGV4ID0gMTtcblxuICAgICAgICAvLyBBdWRpb1NhbXBsZUVudHJ5IGZpZWxkc1xuICAgICAgICBtcDRhLnJlc2VydmVkMiA9IFsweDAsIDB4MF07XG4gICAgICAgIG1wNGEuY2hhbm5lbGNvdW50ID0gcmVwcmVzZW50YXRpb24uYXVkaW9DaGFubmVscztcbiAgICAgICAgbXA0YS5zYW1wbGVzaXplID0gMTY7XG4gICAgICAgIG1wNGEucHJlX2RlZmluZWQgPSAwO1xuICAgICAgICBtcDRhLnJlc2VydmVkXzMgPSAwO1xuICAgICAgICBtcDRhLnNhbXBsZXJhdGUgPSByZXByZXNlbnRhdGlvbi5hdWRpb1NhbXBsaW5nUmF0ZSA8PCAxNjtcblxuICAgICAgICBtcDRhLmVzZHMgPSBjcmVhdGVNUEVHNEFBQ0VTRGVzY3JpcHRvcigpO1xuXG4gICAgICAgIGlmIChjb250ZW50UHJvdGVjdGlvbikge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgUHJvdGVjdGlvbiBTY2hlbWUgSW5mbyBCb3hcbiAgICAgICAgICAgIGxldCBzaW5mID0gSVNPQm94ZXIuY3JlYXRlQm94KCdzaW5mJywgbXA0YSk7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIE9yaWdpbmFsIEZvcm1hdCBCb3ggPT4gaW5kaWNhdGUgY29kZWMgdHlwZSBvZiB0aGUgZW5jcnlwdGVkIGNvbnRlbnRcbiAgICAgICAgICAgIGNyZWF0ZU9yaWdpbmFsRm9ybWF0Qm94KHNpbmYsIGNvZGVjKTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgU2NoZW1lIFR5cGUgYm94XG4gICAgICAgICAgICBjcmVhdGVTY2hlbWVUeXBlQm94KHNpbmYpO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBTY2hlbWUgSW5mb3JtYXRpb24gQm94XG4gICAgICAgICAgICBjcmVhdGVTY2hlbWVJbmZvcm1hdGlvbkJveChzaW5mKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtcDRhO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZU1QRUc0QUFDRVNEZXNjcmlwdG9yKCkge1xuXG4gICAgICAgIC8vIEF1ZGlvU3BlY2lmaWNDb25maWcgKHNlZSBJU08vSUVDIDE0NDk2LTMsIHN1YnBhcnQgMSkgPT4gY29ycmVzcG9uZHMgdG8gaGV4IGJ5dGVzIGNvbnRhaW5lZCBpbiAnY29kZWNQcml2YXRlRGF0YScgZmllbGRcbiAgICAgICAgbGV0IGF1ZGlvU3BlY2lmaWNDb25maWcgPSBoZXhTdHJpbmd0b0J1ZmZlcihyZXByZXNlbnRhdGlvbi5jb2RlY1ByaXZhdGVEYXRhKTtcblxuICAgICAgICAvLyBFU0RTIGxlbmd0aCA9IGVzZHMgYm94IGhlYWRlciBsZW5ndGggKD0gMTIpICtcbiAgICAgICAgLy8gICAgICAgICAgICAgICBFU19EZXNjcmlwdG9yIGhlYWRlciBsZW5ndGggKD0gNSkgK1xuICAgICAgICAvLyAgICAgICAgICAgICAgIERlY29kZXJDb25maWdEZXNjcmlwdG9yIGhlYWRlciBsZW5ndGggKD0gMTUpICtcbiAgICAgICAgLy8gICAgICAgICAgICAgICBkZWNvZGVyU3BlY2lmaWNJbmZvIGhlYWRlciBsZW5ndGggKD0gMikgK1xuICAgICAgICAvLyAgICAgICAgICAgICAgIEF1ZGlvU3BlY2lmaWNDb25maWcgbGVuZ3RoICg9IGNvZGVjUHJpdmF0ZURhdGEgbGVuZ3RoKVxuICAgICAgICBsZXQgZXNkc0xlbmd0aCA9IDM0ICsgYXVkaW9TcGVjaWZpY0NvbmZpZy5sZW5ndGg7XG4gICAgICAgIGxldCBlc2RzID0gbmV3IFVpbnQ4QXJyYXkoZXNkc0xlbmd0aCk7XG5cbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAvLyBlc2RzIGJveFxuICAgICAgICBlc2RzW2krK10gPSAoZXNkc0xlbmd0aCAmIDB4RkYwMDAwMDApID4+IDI0OyAvLyBlc2RzIGJveCBsZW5ndGhcbiAgICAgICAgZXNkc1tpKytdID0gKGVzZHNMZW5ndGggJiAweDAwRkYwMDAwKSA+PiAxNjsgLy8gJydcbiAgICAgICAgZXNkc1tpKytdID0gKGVzZHNMZW5ndGggJiAweDAwMDBGRjAwKSA+PiA4OyAvLyAnJ1xuICAgICAgICBlc2RzW2krK10gPSAoZXNkc0xlbmd0aCAmIDB4MDAwMDAwRkYpOyAvLyAnJ1xuICAgICAgICBlc2RzLnNldChbMHg2NSwgMHg3MywgMHg2NCwgMHg3M10sIGkpOyAvLyB0eXBlID0gJ2VzZHMnXG4gICAgICAgIGkgKz0gNDtcbiAgICAgICAgZXNkcy5zZXQoWzAsIDAsIDAsIDBdLCBpKTsgLy8gdmVyc2lvbiA9IDAsIGZsYWdzID0gMFxuICAgICAgICBpICs9IDQ7XG4gICAgICAgIC8vIEVTX0Rlc2NyaXB0b3IgKHNlZSBJU08vSUVDIDE0NDk2LTEgKFN5c3RlbXMpKVxuICAgICAgICBlc2RzW2krK10gPSAweDAzOyAvLyB0YWcgPSAweDAzIChFU19EZXNjclRhZylcbiAgICAgICAgZXNkc1tpKytdID0gMjAgKyBhdWRpb1NwZWNpZmljQ29uZmlnLmxlbmd0aDsgLy8gc2l6ZVxuICAgICAgICBlc2RzW2krK10gPSAodHJhY2tJZCAmIDB4RkYwMCkgPj4gODsgLy8gRVNfSUQgPSB0cmFja19pZFxuICAgICAgICBlc2RzW2krK10gPSAodHJhY2tJZCAmIDB4MDBGRik7IC8vICcnXG4gICAgICAgIGVzZHNbaSsrXSA9IDA7IC8vIGZsYWdzIGFuZCBzdHJlYW1Qcmlvcml0eVxuXG4gICAgICAgIC8vIERlY29kZXJDb25maWdEZXNjcmlwdG9yIChzZWUgSVNPL0lFQyAxNDQ5Ni0xIChTeXN0ZW1zKSlcbiAgICAgICAgZXNkc1tpKytdID0gMHgwNDsgLy8gdGFnID0gMHgwNCAoRGVjb2RlckNvbmZpZ0Rlc2NyVGFnKVxuICAgICAgICBlc2RzW2krK10gPSAxNSArIGF1ZGlvU3BlY2lmaWNDb25maWcubGVuZ3RoOyAvLyBzaXplXG4gICAgICAgIGVzZHNbaSsrXSA9IDB4NDA7IC8vIG9iamVjdFR5cGVJbmRpY2F0aW9uID0gMHg0MCAoTVBFRy00IEFBQylcbiAgICAgICAgZXNkc1tpXSA9IDB4MDUgPDwgMjsgLy8gc3RyZWFtVHlwZSA9IDB4MDUgKEF1ZGlvc3RyZWFtKVxuICAgICAgICBlc2RzW2ldIHw9IDAgPDwgMTsgLy8gdXBTdHJlYW0gPSAwXG4gICAgICAgIGVzZHNbaSsrXSB8PSAxOyAvLyByZXNlcnZlZCA9IDFcbiAgICAgICAgZXNkc1tpKytdID0gMHhGRjsgLy8gYnVmZmVyc2l6ZURCID0gdW5kZWZpbmVkXG4gICAgICAgIGVzZHNbaSsrXSA9IDB4RkY7IC8vICcnXG4gICAgICAgIGVzZHNbaSsrXSA9IDB4RkY7IC8vICcnXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweEZGMDAwMDAwKSA+PiAyNDsgLy8gbWF4Qml0cmF0ZVxuICAgICAgICBlc2RzW2krK10gPSAocmVwcmVzZW50YXRpb24uYmFuZHdpZHRoICYgMHgwMEZGMDAwMCkgPj4gMTY7IC8vICcnXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweDAwMDBGRjAwKSA+PiA4OyAvLyAnJ1xuICAgICAgICBlc2RzW2krK10gPSAocmVwcmVzZW50YXRpb24uYmFuZHdpZHRoICYgMHgwMDAwMDBGRik7IC8vICcnXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweEZGMDAwMDAwKSA+PiAyNDsgLy8gYXZnYml0cmF0ZVxuICAgICAgICBlc2RzW2krK10gPSAocmVwcmVzZW50YXRpb24uYmFuZHdpZHRoICYgMHgwMEZGMDAwMCkgPj4gMTY7IC8vICcnXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweDAwMDBGRjAwKSA+PiA4OyAvLyAnJ1xuICAgICAgICBlc2RzW2krK10gPSAocmVwcmVzZW50YXRpb24uYmFuZHdpZHRoICYgMHgwMDAwMDBGRik7IC8vICcnXG5cbiAgICAgICAgLy8gRGVjb2RlclNwZWNpZmljSW5mbyAoc2VlIElTTy9JRUMgMTQ0OTYtMSAoU3lzdGVtcykpXG4gICAgICAgIGVzZHNbaSsrXSA9IDB4MDU7IC8vIHRhZyA9IDB4MDUgKERlY1NwZWNpZmljSW5mb1RhZylcbiAgICAgICAgZXNkc1tpKytdID0gYXVkaW9TcGVjaWZpY0NvbmZpZy5sZW5ndGg7IC8vIHNpemVcbiAgICAgICAgZXNkcy5zZXQoYXVkaW9TcGVjaWZpY0NvbmZpZywgaSk7IC8vIEF1ZGlvU3BlY2lmaWNDb25maWcgYnl0ZXNcblxuICAgICAgICByZXR1cm4gZXNkcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVPcmlnaW5hbEZvcm1hdEJveChzaW5mLCBjb2RlYykge1xuICAgICAgICBsZXQgZnJtYSA9IElTT0JveGVyLmNyZWF0ZUJveCgnZnJtYScsIHNpbmYpO1xuICAgICAgICBmcm1hLmRhdGFfZm9ybWF0ID0gc3RyaW5nVG9DaGFyQ29kZShjb2RlYyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlU2NoZW1lVHlwZUJveChzaW5mKSB7XG4gICAgICAgIGxldCBzY2htID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgnc2NobScsIHNpbmYpO1xuXG4gICAgICAgIHNjaG0uZmxhZ3MgPSAwO1xuICAgICAgICBzY2htLnZlcnNpb24gPSAwO1xuICAgICAgICBzY2htLnNjaGVtZV90eXBlID0gMHg2MzY1NkU2MzsgLy8gJ2NlbmMnID0+IGNvbW1vbiBlbmNyeXB0aW9uXG4gICAgICAgIHNjaG0uc2NoZW1lX3ZlcnNpb24gPSAweDAwMDEwMDAwOyAvLyB2ZXJzaW9uIHNldCB0byAweDAwMDEwMDAwIChNYWpvciB2ZXJzaW9uIDEsIE1pbm9yIHZlcnNpb24gMClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTY2hlbWVJbmZvcm1hdGlvbkJveChzaW5mKSB7XG4gICAgICAgIGxldCBzY2hpID0gSVNPQm94ZXIuY3JlYXRlQm94KCdzY2hpJywgc2luZik7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgVHJhY2sgRW5jcnlwdGlvbiBCb3hcbiAgICAgICAgY3JlYXRlVHJhY2tFbmNyeXB0aW9uQm94KHNjaGkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVByb3RlY3Rpb25TeXN0ZW1TcGVjaWZpY0hlYWRlckJveChtb292LCBrZXlTeXN0ZW1zKSB7XG4gICAgICAgIGxldCBwc3NoX2J5dGVzLFxuICAgICAgICAgICAgcHNzaCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBwYXJzZWRCdWZmZXI7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleVN5c3RlbXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHBzc2hfYnl0ZXMgPSBrZXlTeXN0ZW1zW2ldLmluaXREYXRhO1xuICAgICAgICAgICAgaWYgKHBzc2hfYnl0ZXMpIHtcbiAgICAgICAgICAgICAgICBwYXJzZWRCdWZmZXIgPSBJU09Cb3hlci5wYXJzZUJ1ZmZlcihwc3NoX2J5dGVzKTtcbiAgICAgICAgICAgICAgICBwc3NoID0gcGFyc2VkQnVmZmVyLmZldGNoKCdwc3NoJyk7XG4gICAgICAgICAgICAgICAgaWYgKHBzc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgSVNPQm94ZXIuVXRpbHMuYXBwZW5kQm94KG1vb3YsIHBzc2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVRyYWNrRW5jcnlwdGlvbkJveChzY2hpKSB7XG4gICAgICAgIGxldCB0ZW5jID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgndGVuYycsIHNjaGkpO1xuXG4gICAgICAgIHRlbmMuZmxhZ3MgPSAwO1xuICAgICAgICB0ZW5jLnZlcnNpb24gPSAwO1xuXG4gICAgICAgIHRlbmMuZGVmYXVsdF9Jc0VuY3J5cHRlZCA9IDB4MTtcbiAgICAgICAgdGVuYy5kZWZhdWx0X0lWX3NpemUgPSA4O1xuICAgICAgICB0ZW5jLmRlZmF1bHRfS0lEID0gKGNvbnRlbnRQcm90ZWN0aW9uICYmIChjb250ZW50UHJvdGVjdGlvbi5sZW5ndGgpID4gMCAmJiBjb250ZW50UHJvdGVjdGlvblswXVsnY2VuYzpkZWZhdWx0X0tJRCddKSA/XG4gICAgICAgICAgICBjb250ZW50UHJvdGVjdGlvblswXVsnY2VuYzpkZWZhdWx0X0tJRCddIDogWzB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlVHJleEJveChtb292KSB7XG4gICAgICAgIGxldCB0cmV4ID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgndHJleCcsIG1vb3YpO1xuXG4gICAgICAgIHRyZXgudHJhY2tfSUQgPSB0cmFja0lkO1xuICAgICAgICB0cmV4LmRlZmF1bHRfc2FtcGxlX2Rlc2NyaXB0aW9uX2luZGV4ID0gMTtcbiAgICAgICAgdHJleC5kZWZhdWx0X3NhbXBsZV9kdXJhdGlvbiA9IDA7XG4gICAgICAgIHRyZXguZGVmYXVsdF9zYW1wbGVfc2l6ZSA9IDA7XG4gICAgICAgIHRyZXguZGVmYXVsdF9zYW1wbGVfZmxhZ3MgPSAwO1xuXG4gICAgICAgIHJldHVybiB0cmV4O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhleFN0cmluZ3RvQnVmZmVyKHN0cikge1xuICAgICAgICBsZXQgYnVmID0gbmV3IFVpbnQ4QXJyYXkoc3RyLmxlbmd0aCAvIDIpO1xuICAgICAgICBsZXQgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3RyLmxlbmd0aCAvIDI7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnVmW2ldID0gcGFyc2VJbnQoJycgKyBzdHJbaSAqIDJdICsgc3RyW2kgKiAyICsgMV0sIDE2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnVmO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0cmluZ1RvQ2hhckNvZGUoc3RyKSB7XG4gICAgICAgIGxldCBjb2RlID0gMDtcbiAgICAgICAgbGV0IGk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgY29kZSB8PSBzdHIuY2hhckNvZGVBdChpKSA8PCAoKHN0ci5sZW5ndGggLSBpIC0gMSkgKiA4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29kZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZU1vb3YocmVwKSB7XG4gICAgICAgIGlmICghcmVwIHx8ICFyZXAuYWRhcHRhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGlzb0ZpbGUsXG4gICAgICAgICAgICBhcnJheUJ1ZmZlcjtcblxuICAgICAgICByZXByZXNlbnRhdGlvbiA9IHJlcDtcbiAgICAgICAgYWRhcHRhdGlvblNldCA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb247XG5cbiAgICAgICAgcGVyaW9kID0gYWRhcHRhdGlvblNldC5wZXJpb2Q7XG4gICAgICAgIHRyYWNrSWQgPSBhZGFwdGF0aW9uU2V0LmluZGV4ICsgMTtcbiAgICAgICAgY29udGVudFByb3RlY3Rpb24gPSBwZXJpb2QubXBkLm1hbmlmZXN0LlBlcmlvZF9hc0FycmF5W3BlcmlvZC5pbmRleF0uQWRhcHRhdGlvblNldF9hc0FycmF5W2FkYXB0YXRpb25TZXQuaW5kZXhdLkNvbnRlbnRQcm90ZWN0aW9uO1xuXG4gICAgICAgIHRpbWVzY2FsZSA9IHBlcmlvZC5tcGQubWFuaWZlc3QuUGVyaW9kX2FzQXJyYXlbcGVyaW9kLmluZGV4XS5BZGFwdGF0aW9uU2V0X2FzQXJyYXlbYWRhcHRhdGlvblNldC5pbmRleF0uU2VnbWVudFRlbXBsYXRlLnRpbWVzY2FsZTtcblxuICAgICAgICBpc29GaWxlID0gSVNPQm94ZXIuY3JlYXRlRmlsZSgpO1xuICAgICAgICBjcmVhdGVGdHlwQm94KGlzb0ZpbGUpO1xuICAgICAgICBjcmVhdGVNb292Qm94KGlzb0ZpbGUpO1xuXG4gICAgICAgIGFycmF5QnVmZmVyID0gaXNvRmlsZS53cml0ZSgpO1xuXG4gICAgICAgIHJldHVybiBhcnJheUJ1ZmZlcjtcbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgZ2VuZXJhdGVNb292OiBnZW5lcmF0ZU1vb3ZcbiAgICB9O1xuXG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5Nc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3IuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ01zc0ZyYWdtZW50TW9vdlByb2Nlc3Nvcic7XG5leHBvcnQgZGVmYXVsdCBkYXNoanMuRmFjdG9yeU1ha2VyLmdldENsYXNzRmFjdG9yeShNc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3IpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmltcG9ydCBNc3NGcmFnbWVudE1vb2ZQcm9jZXNzb3IgZnJvbSAnLi9Nc3NGcmFnbWVudE1vb2ZQcm9jZXNzb3InO1xuaW1wb3J0IE1zc0ZyYWdtZW50TW9vdlByb2Nlc3NvciBmcm9tICcuL01zc0ZyYWdtZW50TW9vdlByb2Nlc3Nvcic7XG5cbi8vIEFkZCBzcGVjaWZpYyBib3ggcHJvY2Vzc29ycyBub3QgcHJvdmlkZWQgYnkgY29kZW0taXNvYm94ZXIgbGlicmFyeVxuXG5mdW5jdGlvbiBhcnJheUVxdWFsKGFycjEsIGFycjIpIHtcbiAgICByZXR1cm4gKGFycjEubGVuZ3RoID09PSBhcnIyLmxlbmd0aCkgJiYgYXJyMS5ldmVyeShmdW5jdGlvbiAoZWxlbWVudCwgaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQgPT09IGFycjJbaW5kZXhdO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzYWlvUHJvY2Vzc29yKCkge1xuICAgIHRoaXMuX3Byb2NGdWxsQm94KCk7XG4gICAgaWYgKHRoaXMuZmxhZ3MgJiAxKSB7XG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnYXV4X2luZm9fdHlwZScsICd1aW50JywgMzIpO1xuICAgICAgICB0aGlzLl9wcm9jRmllbGQoJ2F1eF9pbmZvX3R5cGVfcGFyYW1ldGVyJywgJ3VpbnQnLCAzMik7XG4gICAgfVxuICAgIHRoaXMuX3Byb2NGaWVsZCgnZW50cnlfY291bnQnLCAndWludCcsIDMyKTtcbiAgICB0aGlzLl9wcm9jRmllbGRBcnJheSgnb2Zmc2V0JywgdGhpcy5lbnRyeV9jb3VudCwgJ3VpbnQnLCAodGhpcy52ZXJzaW9uID09PSAxKSA/IDY0IDogMzIpO1xufVxuXG5mdW5jdGlvbiBzYWl6UHJvY2Vzc29yKCkge1xuICAgIHRoaXMuX3Byb2NGdWxsQm94KCk7XG4gICAgaWYgKHRoaXMuZmxhZ3MgJiAxKSB7XG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnYXV4X2luZm9fdHlwZScsICd1aW50JywgMzIpO1xuICAgICAgICB0aGlzLl9wcm9jRmllbGQoJ2F1eF9pbmZvX3R5cGVfcGFyYW1ldGVyJywgJ3VpbnQnLCAzMik7XG4gICAgfVxuICAgIHRoaXMuX3Byb2NGaWVsZCgnZGVmYXVsdF9zYW1wbGVfaW5mb19zaXplJywgJ3VpbnQnLCA4KTtcbiAgICB0aGlzLl9wcm9jRmllbGQoJ3NhbXBsZV9jb3VudCcsICd1aW50JywgMzIpO1xuICAgIGlmICh0aGlzLmRlZmF1bHRfc2FtcGxlX2luZm9fc2l6ZSA9PT0gMCkge1xuICAgICAgICB0aGlzLl9wcm9jRmllbGRBcnJheSgnc2FtcGxlX2luZm9fc2l6ZScsIHRoaXMuc2FtcGxlX2NvdW50LCAndWludCcsIDgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2VuY1Byb2Nlc3NvcigpIHtcbiAgICB0aGlzLl9wcm9jRnVsbEJveCgpO1xuICAgIHRoaXMuX3Byb2NGaWVsZCgnc2FtcGxlX2NvdW50JywgJ3VpbnQnLCAzMik7XG4gICAgaWYgKHRoaXMuZmxhZ3MgJiAxKSB7XG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnSVZfc2l6ZScsICd1aW50JywgOCk7XG4gICAgfVxuICAgIHRoaXMuX3Byb2NFbnRyaWVzKCdlbnRyeScsIHRoaXMuc2FtcGxlX2NvdW50LCBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgdGhpcy5fcHJvY0VudHJ5RmllbGQoZW50cnksICdJbml0aWFsaXphdGlvblZlY3RvcicsICdkYXRhJywgOCk7XG4gICAgICAgIGlmICh0aGlzLmZsYWdzICYgMikge1xuICAgICAgICAgICAgdGhpcy5fcHJvY0VudHJ5RmllbGQoZW50cnksICdOdW1iZXJPZkVudHJpZXMnLCAndWludCcsIDE2KTtcbiAgICAgICAgICAgIHRoaXMuX3Byb2NTdWJFbnRyaWVzKGVudHJ5LCAnY2xlYXJBbmRDcnlwdGVkRGF0YScsIGVudHJ5Lk51bWJlck9mRW50cmllcywgZnVuY3Rpb24gKGNsZWFyQW5kQ3J5cHRlZERhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9jRW50cnlGaWVsZChjbGVhckFuZENyeXB0ZWREYXRhLCAnQnl0ZXNPZkNsZWFyRGF0YScsICd1aW50JywgMTYpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Byb2NFbnRyeUZpZWxkKGNsZWFyQW5kQ3J5cHRlZERhdGEsICdCeXRlc09mRW5jcnlwdGVkRGF0YScsICd1aW50JywgMzIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gdXVpZFByb2Nlc3NvcigpIHtcbiAgICBsZXQgdGZ4ZFVzZXJUeXBlID0gWzB4NkQsIDB4MUQsIDB4OUIsIDB4MDUsIDB4NDIsIDB4RDUsIDB4NDQsIDB4RTYsIDB4ODAsIDB4RTIsIDB4MTQsIDB4MUQsIDB4QUYsIDB4RjcsIDB4NTcsIDB4QjJdO1xuICAgIGxldCB0ZnJmVXNlclR5cGUgPSBbMHhENCwgMHg4MCwgMHg3RSwgMHhGMiwgMHhDQSwgMHgzOSwgMHg0NiwgMHg5NSwgMHg4RSwgMHg1NCwgMHgyNiwgMHhDQiwgMHg5RSwgMHg0NiwgMHhBNywgMHg5Rl07XG4gICAgbGV0IHNlcGlmZlVzZXJUeXBlID0gWzB4QTIsIDB4MzksIDB4NEYsIDB4NTIsIDB4NUEsIDB4OUIsIDB4NGYsIDB4MTQsIDB4QTIsIDB4NDQsIDB4NkMsIDB4NDIsIDB4N0MsIDB4NjQsIDB4OEQsIDB4RjRdO1xuXG4gICAgaWYgKGFycmF5RXF1YWwodGhpcy51c2VydHlwZSwgdGZ4ZFVzZXJUeXBlKSkge1xuICAgICAgICB0aGlzLl9wcm9jRnVsbEJveCgpO1xuICAgICAgICBpZiAodGhpcy5fcGFyc2luZykge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gJ3RmeGQnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnZnJhZ21lbnRfYWJzb2x1dGVfdGltZScsICd1aW50JywgKHRoaXMudmVyc2lvbiA9PT0gMSkgPyA2NCA6IDMyKTtcbiAgICAgICAgdGhpcy5fcHJvY0ZpZWxkKCdmcmFnbWVudF9kdXJhdGlvbicsICd1aW50JywgKHRoaXMudmVyc2lvbiA9PT0gMSkgPyA2NCA6IDMyKTtcbiAgICB9XG5cbiAgICBpZiAoYXJyYXlFcXVhbCh0aGlzLnVzZXJ0eXBlLCB0ZnJmVXNlclR5cGUpKSB7XG4gICAgICAgIHRoaXMuX3Byb2NGdWxsQm94KCk7XG4gICAgICAgIGlmICh0aGlzLl9wYXJzaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAndGZyZic7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcHJvY0ZpZWxkKCdmcmFnbWVudF9jb3VudCcsICd1aW50JywgOCk7XG4gICAgICAgIHRoaXMuX3Byb2NFbnRyaWVzKCdlbnRyeScsIHRoaXMuZnJhZ21lbnRfY291bnQsIGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgdGhpcy5fcHJvY0VudHJ5RmllbGQoZW50cnksICdmcmFnbWVudF9hYnNvbHV0ZV90aW1lJywgJ3VpbnQnLCAodGhpcy52ZXJzaW9uID09PSAxKSA/IDY0IDogMzIpO1xuICAgICAgICAgICAgdGhpcy5fcHJvY0VudHJ5RmllbGQoZW50cnksICdmcmFnbWVudF9kdXJhdGlvbicsICd1aW50JywgKHRoaXMudmVyc2lvbiA9PT0gMSkgPyA2NCA6IDMyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGFycmF5RXF1YWwodGhpcy51c2VydHlwZSwgc2VwaWZmVXNlclR5cGUpKSB7XG4gICAgICAgIGlmICh0aGlzLl9wYXJzaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAnc2VwaWZmJztcbiAgICAgICAgfVxuICAgICAgICBzZW5jUHJvY2Vzc29yLmNhbGwodGhpcyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBNc3NGcmFnbWVudFByb2Nlc3Nvcihjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IGRhc2hNZXRyaWNzID0gY29uZmlnLmRhc2hNZXRyaWNzO1xuICAgIGNvbnN0IHBsYXliYWNrQ29udHJvbGxlciA9IGNvbmZpZy5wbGF5YmFja0NvbnRyb2xsZXI7XG4gICAgY29uc3QgZXZlbnRCdXMgPSBjb25maWcuZXZlbnRCdXM7XG4gICAgY29uc3QgcHJvdGVjdGlvbkNvbnRyb2xsZXIgPSBjb25maWcucHJvdGVjdGlvbkNvbnRyb2xsZXI7XG4gICAgY29uc3QgSVNPQm94ZXIgPSBjb25maWcuSVNPQm94ZXI7XG4gICAgY29uc3QgZGVidWcgPSBjb25maWcuZGVidWc7XG4gICAgbGV0IG1zc0ZyYWdtZW50TW9vdlByb2Nlc3NvcixcbiAgICAgICAgbXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yLFxuICAgICAgICBpbnN0YW5jZTtcblxuICAgIGZ1bmN0aW9uIHNldHVwKCkge1xuICAgICAgICBJU09Cb3hlci5hZGRCb3hQcm9jZXNzb3IoJ3V1aWQnLCB1dWlkUHJvY2Vzc29yKTtcbiAgICAgICAgSVNPQm94ZXIuYWRkQm94UHJvY2Vzc29yKCdzYWlvJywgc2Fpb1Byb2Nlc3Nvcik7XG4gICAgICAgIElTT0JveGVyLmFkZEJveFByb2Nlc3Nvcignc2FpeicsIHNhaXpQcm9jZXNzb3IpO1xuICAgICAgICBJU09Cb3hlci5hZGRCb3hQcm9jZXNzb3IoJ3NlbmMnLCBzZW5jUHJvY2Vzc29yKTtcblxuICAgICAgICBtc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3IgPSBNc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3IoY29udGV4dCkuY3JlYXRlKHtcbiAgICAgICAgICAgIHByb3RlY3Rpb25Db250cm9sbGVyOiBwcm90ZWN0aW9uQ29udHJvbGxlcixcbiAgICAgICAgICAgIGNvbnN0YW50czogY29uZmlnLmNvbnN0YW50cyxcbiAgICAgICAgICAgIElTT0JveGVyOiBJU09Cb3hlcn0pO1xuXG4gICAgICAgIG1zc0ZyYWdtZW50TW9vZlByb2Nlc3NvciA9IE1zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvcihjb250ZXh0KS5jcmVhdGUoe1xuICAgICAgICAgICAgZGFzaE1ldHJpY3M6IGRhc2hNZXRyaWNzLFxuICAgICAgICAgICAgcGxheWJhY2tDb250cm9sbGVyOiBwbGF5YmFja0NvbnRyb2xsZXIsXG4gICAgICAgICAgICBJU09Cb3hlcjogSVNPQm94ZXIsXG4gICAgICAgICAgICBldmVudEJ1czogZXZlbnRCdXMsXG4gICAgICAgICAgICBkZWJ1ZzogZGVidWcsXG4gICAgICAgICAgICBlcnJIYW5kbGVyOiBjb25maWcuZXJySGFuZGxlclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZU1vb3YocmVwKSB7XG4gICAgICAgIHJldHVybiBtc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3IuZ2VuZXJhdGVNb292KHJlcCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0ZyYWdtZW50KGUsIHN0cmVhbVByb2Nlc3Nvcikge1xuICAgICAgICBpZiAoIWUgfHwgIWUucmVxdWVzdCB8fCAhZS5yZXNwb25zZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdlIHBhcmFtZXRlciBpcyBtaXNzaW5nIG9yIG1hbGZvcm1lZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUucmVxdWVzdC50eXBlID09PSAnTWVkaWFTZWdtZW50Jykge1xuICAgICAgICAgICAgLy8gTWVkaWFTZWdtZW50ID0+IGNvbnZlcnQgdG8gU21vb3RoIFN0cmVhbWluZyBtb29mIGZvcm1hdFxuICAgICAgICAgICAgbXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yLmNvbnZlcnRGcmFnbWVudChlLCBzdHJlYW1Qcm9jZXNzb3IpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoZS5yZXF1ZXN0LnR5cGUgPT09ICdGcmFnbWVudEluZm9TZWdtZW50Jykge1xuICAgICAgICAgICAgLy8gRnJhZ21lbnRJbmZvIChsaXZlKSA9PiB1cGRhdGUgc2VnbWVudHMgbGlzdFxuICAgICAgICAgICAgbXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yLnVwZGF0ZVNlZ21lbnRMaXN0KGUsIHN0cmVhbVByb2Nlc3Nvcik7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgZXZlbnQgcHJvcGFnYXRpb24gKEZyYWdtZW50SW5mbyBtdXN0IG5vdCBiZSBhZGRlZCB0byBidWZmZXIpXG4gICAgICAgICAgICBlLnNlbmRlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgZ2VuZXJhdGVNb292OiBnZW5lcmF0ZU1vb3YsXG4gICAgICAgIHByb2Nlc3NGcmFnbWVudDogcHJvY2Vzc0ZyYWdtZW50XG4gICAgfTtcblxuICAgIHNldHVwKCk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbk1zc0ZyYWdtZW50UHJvY2Vzc29yLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSA9ICdNc3NGcmFnbWVudFByb2Nlc3Nvcic7XG5leHBvcnQgZGVmYXVsdCBkYXNoanMuRmFjdG9yeU1ha2VyLmdldENsYXNzRmFjdG9yeShNc3NGcmFnbWVudFByb2Nlc3Nvcik7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuaW1wb3J0IERhdGFDaHVuayBmcm9tICcuLi9zdHJlYW1pbmcvdm8vRGF0YUNodW5rJztcbmltcG9ydCBGcmFnbWVudFJlcXVlc3QgZnJvbSAnLi4vc3RyZWFtaW5nL3ZvL0ZyYWdtZW50UmVxdWVzdCc7XG5pbXBvcnQgTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlciBmcm9tICcuL01zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXInO1xuaW1wb3J0IE1zc0ZyYWdtZW50UHJvY2Vzc29yIGZyb20gJy4vTXNzRnJhZ21lbnRQcm9jZXNzb3InO1xuaW1wb3J0IE1zc1BhcnNlciBmcm9tICcuL3BhcnNlci9Nc3NQYXJzZXInO1xuaW1wb3J0IE1zc0Vycm9ycyBmcm9tICcuL2Vycm9ycy9Nc3NFcnJvcnMnO1xuaW1wb3J0IERhc2hKU0Vycm9yIGZyb20gJy4uL3N0cmVhbWluZy92by9EYXNoSlNFcnJvcic7XG5pbXBvcnQgSW5pdENhY2hlIGZyb20gJy4uL3N0cmVhbWluZy91dGlscy9Jbml0Q2FjaGUnO1xuXG5mdW5jdGlvbiBNc3NIYW5kbGVyKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgZXZlbnRCdXMgPSBjb25maWcuZXZlbnRCdXM7XG4gICAgY29uc3QgZXZlbnRzID0gY29uZmlnLmV2ZW50cztcbiAgICBjb25zdCBjb25zdGFudHMgPSBjb25maWcuY29uc3RhbnRzO1xuICAgIGNvbnN0IGluaXRTZWdtZW50VHlwZSA9IGNvbmZpZy5pbml0U2VnbWVudFR5cGU7XG4gICAgY29uc3QgZGFzaE1ldHJpY3MgPSBjb25maWcuZGFzaE1ldHJpY3M7XG4gICAgY29uc3QgcGxheWJhY2tDb250cm9sbGVyID0gY29uZmlnLnBsYXliYWNrQ29udHJvbGxlcjtcbiAgICBjb25zdCBzdHJlYW1Db250cm9sbGVyID0gY29uZmlnLnN0cmVhbUNvbnRyb2xsZXI7XG4gICAgY29uc3QgcHJvdGVjdGlvbkNvbnRyb2xsZXIgPSBjb25maWcucHJvdGVjdGlvbkNvbnRyb2xsZXI7XG4gICAgY29uc3QgbXNzRnJhZ21lbnRQcm9jZXNzb3IgPSBNc3NGcmFnbWVudFByb2Nlc3Nvcihjb250ZXh0KS5jcmVhdGUoe1xuICAgICAgICBkYXNoTWV0cmljczogZGFzaE1ldHJpY3MsXG4gICAgICAgIHBsYXliYWNrQ29udHJvbGxlcjogcGxheWJhY2tDb250cm9sbGVyLFxuICAgICAgICBwcm90ZWN0aW9uQ29udHJvbGxlcjogcHJvdGVjdGlvbkNvbnRyb2xsZXIsXG4gICAgICAgIHN0cmVhbUNvbnRyb2xsZXI6IHN0cmVhbUNvbnRyb2xsZXIsXG4gICAgICAgIGV2ZW50QnVzOiBldmVudEJ1cyxcbiAgICAgICAgY29uc3RhbnRzOiBjb25zdGFudHMsXG4gICAgICAgIElTT0JveGVyOiBjb25maWcuSVNPQm94ZXIsXG4gICAgICAgIGRlYnVnOiBjb25maWcuZGVidWcsXG4gICAgICAgIGVyckhhbmRsZXI6IGNvbmZpZy5lcnJIYW5kbGVyXG4gICAgfSk7XG4gICAgbGV0IG1zc1BhcnNlcixcbiAgICAgICAgZnJhZ21lbnRJbmZvQ29udHJvbGxlcnMsXG4gICAgICAgIGluaXRDYWNoZSxcbiAgICAgICAgaW5zdGFuY2U7XG5cbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICAgICAgZnJhZ21lbnRJbmZvQ29udHJvbGxlcnMgPSBbXTtcbiAgICAgICAgaW5pdENhY2hlID0gSW5pdENhY2hlKGNvbnRleHQpLmdldEluc3RhbmNlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U3RyZWFtUHJvY2Vzc29yKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHN0cmVhbUNvbnRyb2xsZXIuZ2V0QWN0aXZlU3RyZWFtUHJvY2Vzc29ycygpLmZpbHRlcihwcm9jZXNzb3IgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3Nvci5nZXRUeXBlKCkgPT09IHR5cGU7XG4gICAgICAgIH0pWzBdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEZyYWdtZW50SW5mb0NvbnRyb2xsZXIodHlwZSkge1xuICAgICAgICByZXR1cm4gZnJhZ21lbnRJbmZvQ29udHJvbGxlcnMuZmlsdGVyKGNvbnRyb2xsZXIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjb250cm9sbGVyLmdldFR5cGUoKSA9PT0gdHlwZSk7XG4gICAgICAgIH0pWzBdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZURhdGFDaHVuayhyZXF1ZXN0LCBzdHJlYW1JZCwgZW5kRnJhZ21lbnQpIHtcbiAgICAgICAgY29uc3QgY2h1bmsgPSBuZXcgRGF0YUNodW5rKCk7XG5cbiAgICAgICAgY2h1bmsuc3RyZWFtSWQgPSBzdHJlYW1JZDtcbiAgICAgICAgY2h1bmsubWVkaWFJbmZvID0gcmVxdWVzdC5tZWRpYUluZm87XG4gICAgICAgIGNodW5rLnNlZ21lbnRUeXBlID0gcmVxdWVzdC50eXBlO1xuICAgICAgICBjaHVuay5zdGFydCA9IHJlcXVlc3Quc3RhcnRUaW1lO1xuICAgICAgICBjaHVuay5kdXJhdGlvbiA9IHJlcXVlc3QuZHVyYXRpb247XG4gICAgICAgIGNodW5rLmVuZCA9IGNodW5rLnN0YXJ0ICsgY2h1bmsuZHVyYXRpb247XG4gICAgICAgIGNodW5rLmluZGV4ID0gcmVxdWVzdC5pbmRleDtcbiAgICAgICAgY2h1bmsucXVhbGl0eSA9IHJlcXVlc3QucXVhbGl0eTtcbiAgICAgICAgY2h1bmsucmVwcmVzZW50YXRpb25JZCA9IHJlcXVlc3QucmVwcmVzZW50YXRpb25JZDtcbiAgICAgICAgY2h1bmsuZW5kRnJhZ21lbnQgPSBlbmRGcmFnbWVudDtcblxuICAgICAgICByZXR1cm4gY2h1bms7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnRGcmFnbWVudEluZm9Db250cm9sbGVycygpIHtcblxuICAgICAgICAvLyBDcmVhdGUgTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlcnMgZm9yIGVhY2ggU3RyZWFtUHJvY2Vzc29yIG9mIGFjdGl2ZSBzdHJlYW0gKG9ubHkgZm9yIGF1ZGlvLCB2aWRlbyBvciBmcmFnbWVudGVkVGV4dClcbiAgICAgICAgbGV0IHByb2Nlc3NvcnMgPSBzdHJlYW1Db250cm9sbGVyLmdldEFjdGl2ZVN0cmVhbVByb2Nlc3NvcnMoKTtcbiAgICAgICAgcHJvY2Vzc29ycy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9jZXNzb3IpIHtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzb3IuZ2V0VHlwZSgpID09PSBjb25zdGFudHMuVklERU8gfHxcbiAgICAgICAgICAgICAgICBwcm9jZXNzb3IuZ2V0VHlwZSgpID09PSBjb25zdGFudHMuQVVESU8gfHxcbiAgICAgICAgICAgICAgICBwcm9jZXNzb3IuZ2V0VHlwZSgpID09PSBjb25zdGFudHMuRlJBR01FTlRFRF9URVhUKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgZnJhZ21lbnRJbmZvQ29udHJvbGxlciA9IGdldEZyYWdtZW50SW5mb0NvbnRyb2xsZXIocHJvY2Vzc29yLmdldFR5cGUoKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFmcmFnbWVudEluZm9Db250cm9sbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXIgPSBNc3NGcmFnbWVudEluZm9Db250cm9sbGVyKGNvbnRleHQpLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1Qcm9jZXNzb3I6IHByb2Nlc3NvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VVUkxDb250cm9sbGVyOiBjb25maWcuYmFzZVVSTENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZzogY29uZmlnLmRlYnVnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEluZm9Db250cm9sbGVyLmluaXRpYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRJbmZvQ29udHJvbGxlcnMucHVzaChmcmFnbWVudEluZm9Db250cm9sbGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnJhZ21lbnRJbmZvQ29udHJvbGxlci5zdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdG9wRnJhZ21lbnRJbmZvQ29udHJvbGxlcnMoKSB7XG4gICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXJzLmZvckVhY2goYyA9PiB7XG4gICAgICAgICAgICBjLnJlc2V0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICBmcmFnbWVudEluZm9Db250cm9sbGVycyA9IFtdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uSW5pdEZyYWdtZW50TmVlZGVkKGUpIHtcbiAgICAgICAgbGV0IHN0cmVhbVByb2Nlc3NvciA9IGdldFN0cmVhbVByb2Nlc3NvcihlLnNlbmRlci5nZXRUeXBlKCkpO1xuICAgICAgICBpZiAoIXN0cmVhbVByb2Nlc3NvcikgcmV0dXJuO1xuXG4gICAgICAgIC8vIENyZWF0ZSBpbml0IHNlZ21lbnQgcmVxdWVzdFxuICAgICAgICBsZXQgcmVwcmVzZW50YXRpb25Db250cm9sbGVyID0gc3RyZWFtUHJvY2Vzc29yLmdldFJlcHJlc2VudGF0aW9uQ29udHJvbGxlcigpO1xuICAgICAgICBsZXQgcmVwcmVzZW50YXRpb24gPSByZXByZXNlbnRhdGlvbkNvbnRyb2xsZXIuZ2V0Q3VycmVudFJlcHJlc2VudGF0aW9uKCk7XG4gICAgICAgIGxldCBtZWRpYUluZm8gPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0TWVkaWFJbmZvKCk7XG5cbiAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgRnJhZ21lbnRSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3QubWVkaWFUeXBlID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi50eXBlO1xuICAgICAgICByZXF1ZXN0LnR5cGUgPSBpbml0U2VnbWVudFR5cGU7XG4gICAgICAgIHJlcXVlc3QucmFuZ2UgPSByZXByZXNlbnRhdGlvbi5yYW5nZTtcbiAgICAgICAgcmVxdWVzdC5xdWFsaXR5ID0gcmVwcmVzZW50YXRpb24uaW5kZXg7XG4gICAgICAgIHJlcXVlc3QubWVkaWFJbmZvID0gbWVkaWFJbmZvO1xuICAgICAgICByZXF1ZXN0LnJlcHJlc2VudGF0aW9uSWQgPSByZXByZXNlbnRhdGlvbi5pZDtcblxuICAgICAgICBjb25zdCBjaHVuayA9IGNyZWF0ZURhdGFDaHVuayhyZXF1ZXN0LCBtZWRpYUluZm8uc3RyZWFtSW5mby5pZCwgZS50eXBlICE9PSBldmVudHMuRlJBR01FTlRfTE9BRElOR19QUk9HUkVTUyk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGluaXQgc2VnbWVudCAobW9vdilcbiAgICAgICAgICAgIGNodW5rLmJ5dGVzID0gbXNzRnJhZ21lbnRQcm9jZXNzb3IuZ2VuZXJhdGVNb292KHJlcHJlc2VudGF0aW9uKTtcblxuICAgICAgICAgICAgLy8gTm90aWZ5IGluaXQgc2VnbWVudCBoYXMgYmVlbiBsb2FkZWRcbiAgICAgICAgICAgIGV2ZW50QnVzLnRyaWdnZXIoZXZlbnRzLklOSVRfRlJBR01FTlRfTE9BREVELCB7XG4gICAgICAgICAgICAgICAgY2h1bms6IGNodW5rXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uZmlnLmVyckhhbmRsZXIuZXJyb3IobmV3IERhc2hKU0Vycm9yKGUuY29kZSwgZS5tZXNzYWdlLCBlLmRhdGEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoYW5nZSB0aGUgc2VuZGVyIHZhbHVlIHRvIHN0b3AgZXZlbnQgdG8gYmUgcHJvcGFnYXRlZFxuICAgICAgICBlLnNlbmRlciA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25TZWdtZW50TWVkaWFMb2FkZWQoZSkge1xuICAgICAgICBpZiAoZS5lcnJvcikgIHJldHVybjtcblxuICAgICAgICBsZXQgc3RyZWFtUHJvY2Vzc29yID0gZ2V0U3RyZWFtUHJvY2Vzc29yKGUucmVxdWVzdC5tZWRpYVR5cGUpO1xuICAgICAgICBpZiAoIXN0cmVhbVByb2Nlc3NvcikgcmV0dXJuO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgbW9vZiB0byB0cmFuc2NvZGUgaXQgZnJvbSBNU1MgdG8gREFTSCAob3IgdG8gdXBkYXRlIHNlZ21lbnQgdGltZWxpbmUgZm9yIFNlZ21lbnRJbmZvIGZyYWdtZW50cylcbiAgICAgICAgbXNzRnJhZ21lbnRQcm9jZXNzb3IucHJvY2Vzc0ZyYWdtZW50KGUsIHN0cmVhbVByb2Nlc3Nvcik7XG5cbiAgICAgICAgaWYgKGUucmVxdWVzdC50eXBlID09PSAnRnJhZ21lbnRJbmZvU2VnbWVudCcpIHtcbiAgICAgICAgICAgIC8vIElmIEZyYWdtZW50SW5mbyBsb2FkZWQsIHRoZW4gbm90aWZ5IGNvcnJlc3BvbmRpbmcgTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlclxuICAgICAgICAgICAgbGV0IGZyYWdtZW50SW5mb0NvbnRyb2xsZXIgPSBnZXRGcmFnbWVudEluZm9Db250cm9sbGVyKGUucmVxdWVzdC5tZWRpYVR5cGUpO1xuICAgICAgICAgICAgaWYgKGZyYWdtZW50SW5mb0NvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgICAgICBmcmFnbWVudEluZm9Db250cm9sbGVyLmZyYWdtZW50SW5mb0xvYWRlZChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IE1zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXJzIGluIGNhc2Ugb2Ygc3RhcnQtb3ZlciBzdHJlYW1zXG4gICAgICAgIGxldCBtYW5pZmVzdEluZm8gPSBlLnJlcXVlc3QubWVkaWFJbmZvLnN0cmVhbUluZm8ubWFuaWZlc3RJbmZvO1xuICAgICAgICBpZiAoIW1hbmlmZXN0SW5mby5pc0R5bmFtaWMgJiYgbWFuaWZlc3RJbmZvLkRWUldpbmRvd1NpemUgIT09IEluZmluaXR5KSB7XG4gICAgICAgICAgICBzdGFydEZyYWdtZW50SW5mb0NvbnRyb2xsZXJzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvblBsYXliYWNrUGF1c2VkKCkge1xuICAgICAgICBpZiAocGxheWJhY2tDb250cm9sbGVyLmdldElzRHluYW1pYygpICYmIHBsYXliYWNrQ29udHJvbGxlci5nZXRUaW1lKCkgIT09IDApIHtcbiAgICAgICAgICAgIHN0YXJ0RnJhZ21lbnRJbmZvQ29udHJvbGxlcnMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uUGxheWJhY2tTZWVrQXNrZWQoKSB7XG4gICAgICAgIGlmIChwbGF5YmFja0NvbnRyb2xsZXIuZ2V0SXNEeW5hbWljKCkgJiYgcGxheWJhY2tDb250cm9sbGVyLmdldFRpbWUoKSAhPT0gMCkge1xuICAgICAgICAgICAgc3RhcnRGcmFnbWVudEluZm9Db250cm9sbGVycygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25UVE1MUHJlUHJvY2Vzcyh0dG1sU3VidGl0bGVzKSB7XG4gICAgICAgIGlmICghdHRtbFN1YnRpdGxlcyB8fCAhdHRtbFN1YnRpdGxlcy5kYXRhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0dG1sU3VidGl0bGVzLmRhdGEgPSB0dG1sU3VidGl0bGVzLmRhdGEucmVwbGFjZSgvaHR0cDpcXC9cXC93d3cudzMub3JnXFwvMjAwNlxcLzEwXFwvdHRhZjEvZ2ksICdodHRwOi8vd3d3LnczLm9yZy9ucy90dG1sJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVnaXN0ZXJFdmVudHMoKSB7XG4gICAgICAgIGV2ZW50QnVzLm9uKGV2ZW50cy5JTklUX0ZSQUdNRU5UX05FRURFRCwgb25Jbml0RnJhZ21lbnROZWVkZWQsIGluc3RhbmNlLCBkYXNoanMuRmFjdG9yeU1ha2VyLmdldFNpbmdsZXRvbkZhY3RvcnlCeU5hbWUoZXZlbnRCdXMuZ2V0Q2xhc3NOYW1lKCkpLkVWRU5UX1BSSU9SSVRZX0hJR0gpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbiAgICAgICAgZXZlbnRCdXMub24oZXZlbnRzLlBMQVlCQUNLX1BBVVNFRCwgb25QbGF5YmFja1BhdXNlZCwgaW5zdGFuY2UsIGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0U2luZ2xldG9uRmFjdG9yeUJ5TmFtZShldmVudEJ1cy5nZXRDbGFzc05hbWUoKSkuRVZFTlRfUFJJT1JJVFlfSElHSCk7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xuICAgICAgICBldmVudEJ1cy5vbihldmVudHMuUExBWUJBQ0tfU0VFS19BU0tFRCwgb25QbGF5YmFja1NlZWtBc2tlZCwgaW5zdGFuY2UsIGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0U2luZ2xldG9uRmFjdG9yeUJ5TmFtZShldmVudEJ1cy5nZXRDbGFzc05hbWUoKSkuRVZFTlRfUFJJT1JJVFlfSElHSCk7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xuICAgICAgICBldmVudEJ1cy5vbihldmVudHMuRlJBR01FTlRfTE9BRElOR19DT01QTEVURUQsIG9uU2VnbWVudE1lZGlhTG9hZGVkLCBpbnN0YW5jZSwgZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRTaW5nbGV0b25GYWN0b3J5QnlOYW1lKGV2ZW50QnVzLmdldENsYXNzTmFtZSgpKS5FVkVOVF9QUklPUklUWV9ISUdIKTsgLyoganNoaW50IGlnbm9yZTpsaW5lICovXG4gICAgICAgIGV2ZW50QnVzLm9uKGV2ZW50cy5UVE1MX1RPX1BBUlNFLCBvblRUTUxQcmVQcm9jZXNzLCBpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIGlmIChtc3NQYXJzZXIpIHtcbiAgICAgICAgICAgIG1zc1BhcnNlci5yZXNldCgpO1xuICAgICAgICAgICAgbXNzUGFyc2VyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnRCdXMub2ZmKGV2ZW50cy5JTklUX0ZSQUdNRU5UX05FRURFRCwgb25Jbml0RnJhZ21lbnROZWVkZWQsIHRoaXMpO1xuICAgICAgICBldmVudEJ1cy5vZmYoZXZlbnRzLlBMQVlCQUNLX1BBVVNFRCwgb25QbGF5YmFja1BhdXNlZCwgdGhpcyk7XG4gICAgICAgIGV2ZW50QnVzLm9mZihldmVudHMuUExBWUJBQ0tfU0VFS19BU0tFRCwgb25QbGF5YmFja1NlZWtBc2tlZCwgdGhpcyk7XG4gICAgICAgIGV2ZW50QnVzLm9mZihldmVudHMuRlJBR01FTlRfTE9BRElOR19DT01QTEVURUQsIG9uU2VnbWVudE1lZGlhTG9hZGVkLCB0aGlzKTtcbiAgICAgICAgZXZlbnRCdXMub2ZmKGV2ZW50cy5UVE1MX1RPX1BBUlNFLCBvblRUTUxQcmVQcm9jZXNzLCB0aGlzKTtcblxuICAgICAgICAvLyBSZXNldCBGcmFnbWVudEluZm9Db250cm9sbGVyc1xuICAgICAgICBzdG9wRnJhZ21lbnRJbmZvQ29udHJvbGxlcnMoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVNc3NQYXJzZXIoKSB7XG4gICAgICAgIG1zc1BhcnNlciA9IE1zc1BhcnNlcihjb250ZXh0KS5jcmVhdGUoY29uZmlnKTtcbiAgICAgICAgcmV0dXJuIG1zc1BhcnNlcjtcbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgcmVzZXQ6IHJlc2V0LFxuICAgICAgICBjcmVhdGVNc3NQYXJzZXI6IGNyZWF0ZU1zc1BhcnNlcixcbiAgICAgICAgcmVnaXN0ZXJFdmVudHM6IHJlZ2lzdGVyRXZlbnRzXG4gICAgfTtcblxuICAgIHNldHVwKCk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbk1zc0hhbmRsZXIuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ01zc0hhbmRsZXInO1xuY29uc3QgZmFjdG9yeSA9IGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0Q2xhc3NGYWN0b3J5KE1zc0hhbmRsZXIpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbmZhY3RvcnkuZXJyb3JzID0gTXNzRXJyb3JzO1xuZGFzaGpzLkZhY3RvcnlNYWtlci51cGRhdGVDbGFzc0ZhY3RvcnkoTXNzSGFuZGxlci5fX2Rhc2hqc19mYWN0b3J5X25hbWUsIGZhY3RvcnkpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbmV4cG9ydCBkZWZhdWx0IGZhY3Rvcnk7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbmltcG9ydCBFcnJvcnNCYXNlIGZyb20gJy4uLy4uL2NvcmUvZXJyb3JzL0Vycm9yc0Jhc2UnO1xuLyoqXG4gKiBAY2xhc3NcbiAqXG4gKi9cbmNsYXNzIE1zc0Vycm9ycyBleHRlbmRzIEVycm9yc0Jhc2Uge1xuXHRjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFcnJvciBjb2RlIHJldHVybmVkIHdoZW4gbm8gdGZyZiBib3ggaXMgZGV0ZWN0ZWQgaW4gTVNTIGxpdmUgc3RyZWFtXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1TU19OT19URlJGX0NPREUgPSAyMDA7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVycm9yIGNvZGUgcmV0dXJuZWQgd2hlbiBvbmUgb2YgdGhlIGNvZGVjcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCBpcyBub3Qgc3VwcG9ydGVkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1TU19VTlNVUFBPUlRFRF9DT0RFQ19DT0RFID0gMjAxO1xuXG4gICAgICAgIHRoaXMuTVNTX05PX1RGUkZfTUVTU0FHRSA9ICdNaXNzaW5nIHRmcmYgaW4gbGl2ZSBtZWRpYSBzZWdtZW50JztcbiAgICAgICAgdGhpcy5NU1NfVU5TVVBQT1JURURfQ09ERUNfTUVTU0FHRSA9ICdVbnN1cHBvcnRlZCBjb2RlYyc7XG4gICAgfVxufVxuXG5sZXQgbXNzRXJyb3JzID0gbmV3IE1zc0Vycm9ycygpO1xuZXhwb3J0IGRlZmF1bHQgbXNzRXJyb3JzOyIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmltcG9ydCBNc3NIYW5kbGVyIGZyb20gJy4vTXNzSGFuZGxlcic7XG5cbi8vIFNob3ZlIGJvdGggb2YgdGhlc2UgaW50byB0aGUgZ2xvYmFsIHNjb3BlXG52YXIgY29udGV4dCA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cpIHx8IGdsb2JhbDtcblxudmFyIGRhc2hqcyA9IGNvbnRleHQuZGFzaGpzO1xuaWYgKCFkYXNoanMpIHtcbiAgICBkYXNoanMgPSBjb250ZXh0LmRhc2hqcyA9IHt9O1xufVxuXG5kYXNoanMuTXNzSGFuZGxlciA9IE1zc0hhbmRsZXI7XG5cbmV4cG9ydCBkZWZhdWx0IGRhc2hqcztcbmV4cG9ydCB7IE1zc0hhbmRsZXIgfTtcbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbi8qKlxuICogQG1vZHVsZSBNc3NQYXJzZXJcbiAqIEBpZ25vcmVcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgb2JqZWN0XG4gKi9cblxuaW1wb3J0IEJpZ0ludCBmcm9tICcuLi8uLi8uLi9leHRlcm5hbHMvQmlnSW50ZWdlcic7XG5cbmZ1bmN0aW9uIE1zc1BhcnNlcihjb25maWcpIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgY29uc3QgQkFTRTY0ID0gY29uZmlnLkJBU0U2NDtcbiAgICBjb25zdCBkZWJ1ZyA9IGNvbmZpZy5kZWJ1ZztcbiAgICBjb25zdCBjb25zdGFudHMgPSBjb25maWcuY29uc3RhbnRzO1xuICAgIGNvbnN0IG1hbmlmZXN0TW9kZWwgPSBjb25maWcubWFuaWZlc3RNb2RlbDtcbiAgICBjb25zdCBtZWRpYVBsYXllck1vZGVsID0gY29uZmlnLm1lZGlhUGxheWVyTW9kZWw7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBjb25maWcuc2V0dGluZ3M7XG5cbiAgICBjb25zdCBERUZBVUxUX1RJTUVfU0NBTEUgPSAxMDAwMDAwMC4wO1xuICAgIGNvbnN0IFNVUFBPUlRFRF9DT0RFQ1MgPSBbJ0FBQycsICdBQUNMJywgJ0FWQzEnLCAnSDI2NCcsICdUVE1MJywgJ0RGWFAnXTtcbiAgICAvLyBNUEVHLURBU0ggUm9sZSBhbmQgYWNjZXNzaWJpbGl0eSBtYXBwaW5nIGZvciB0ZXh0IHRyYWNrcyBhY2NvcmRpbmcgdG8gRVRTSSBUUyAxMDMgMjg1IHYxLjEuMSAoc2VjdGlvbiA3LjEuMilcbiAgICBjb25zdCBST0xFID0ge1xuICAgICAgICAnQ0FQVCc6ICdtYWluJyxcbiAgICAgICAgJ1NVQlQnOiAnYWx0ZXJuYXRlJyxcbiAgICAgICAgJ0RFU0MnOiAnbWFpbidcbiAgICB9O1xuICAgIGNvbnN0IEFDQ0VTU0lCSUxJVFkgPSB7XG4gICAgICAgICdERVNDJzogJzInXG4gICAgfTtcbiAgICBjb25zdCBzYW1wbGluZ0ZyZXF1ZW5jeUluZGV4ID0ge1xuICAgICAgICA5NjAwMDogMHgwLFxuICAgICAgICA4ODIwMDogMHgxLFxuICAgICAgICA2NDAwMDogMHgyLFxuICAgICAgICA0ODAwMDogMHgzLFxuICAgICAgICA0NDEwMDogMHg0LFxuICAgICAgICAzMjAwMDogMHg1LFxuICAgICAgICAyNDAwMDogMHg2LFxuICAgICAgICAyMjA1MDogMHg3LFxuICAgICAgICAxNjAwMDogMHg4LFxuICAgICAgICAxMjAwMDogMHg5LFxuICAgICAgICAxMTAyNTogMHhBLFxuICAgICAgICA4MDAwOiAweEIsXG4gICAgICAgIDczNTA6IDB4Q1xuICAgIH07XG4gICAgY29uc3QgbWltZVR5cGVNYXAgPSB7XG4gICAgICAgICd2aWRlbyc6ICd2aWRlby9tcDQnLFxuICAgICAgICAnYXVkaW8nOiAnYXVkaW8vbXA0JyxcbiAgICAgICAgJ3RleHQnOiAnYXBwbGljYXRpb24vbXA0J1xuICAgIH07XG5cbiAgICBsZXQgaW5zdGFuY2UsXG4gICAgICAgIGxvZ2dlcixcbiAgICAgICAgaW5pdGlhbEJ1ZmZlclNldHRpbmdzO1xuXG5cbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICAgICAgbG9nZ2VyID0gZGVidWcuZ2V0TG9nZ2VyKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXBQZXJpb2Qoc21vb3RoU3RyZWFtaW5nTWVkaWEsIHRpbWVzY2FsZSkge1xuICAgICAgICBjb25zdCBwZXJpb2QgPSB7fTtcbiAgICAgICAgbGV0IHN0cmVhbXMsXG4gICAgICAgICAgICBhZGFwdGF0aW9uO1xuXG4gICAgICAgIC8vIEZvciBlYWNoIFN0cmVhbUluZGV4IG5vZGUsIGNyZWF0ZSBhbiBBZGFwdGF0aW9uU2V0IGVsZW1lbnRcbiAgICAgICAgcGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheSA9IFtdO1xuICAgICAgICBzdHJlYW1zID0gc21vb3RoU3RyZWFtaW5nTWVkaWEuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1N0cmVhbUluZGV4Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyZWFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWRhcHRhdGlvbiA9IG1hcEFkYXB0YXRpb25TZXQoc3RyZWFtc1tpXSwgdGltZXNjYWxlKTtcbiAgICAgICAgICAgIGlmIChhZGFwdGF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheS5wdXNoKGFkYXB0YXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBlcmlvZC5BZGFwdGF0aW9uU2V0X2FzQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcGVyaW9kLkFkYXB0YXRpb25TZXQgPSAocGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheS5sZW5ndGggPiAxKSA/IHBlcmlvZC5BZGFwdGF0aW9uU2V0X2FzQXJyYXkgOiBwZXJpb2QuQWRhcHRhdGlvblNldF9hc0FycmF5WzBdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBlcmlvZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXBBZGFwdGF0aW9uU2V0KHN0cmVhbUluZGV4LCB0aW1lc2NhbGUpIHtcbiAgICAgICAgY29uc3QgYWRhcHRhdGlvblNldCA9IHt9O1xuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbnMgPSBbXTtcbiAgICAgICAgbGV0IHNlZ21lbnRUZW1wbGF0ZTtcbiAgICAgICAgbGV0IHF1YWxpdHlMZXZlbHMsXG4gICAgICAgICAgICByZXByZXNlbnRhdGlvbixcbiAgICAgICAgICAgIHNlZ21lbnRzLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICBjb25zdCBuYW1lID0gc3RyZWFtSW5kZXguZ2V0QXR0cmlidXRlKCdOYW1lJyk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ1R5cGUnKTtcbiAgICAgICAgY29uc3QgbGFuZyA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnTGFuZ3VhZ2UnKTtcbiAgICAgICAgY29uc3QgZmFsbEJhY2tJZCA9IGxhbmcgPyB0eXBlICsgJ18nICsgbGFuZyA6IHR5cGU7XG5cbiAgICAgICAgYWRhcHRhdGlvblNldC5pZCA9IG5hbWUgfHwgZmFsbEJhY2tJZDtcbiAgICAgICAgYWRhcHRhdGlvblNldC5jb250ZW50VHlwZSA9IHR5cGU7XG4gICAgICAgIGFkYXB0YXRpb25TZXQubGFuZyA9IGxhbmcgfHwgJ3VuZCc7XG4gICAgICAgIGFkYXB0YXRpb25TZXQubWltZVR5cGUgPSBtaW1lVHlwZU1hcFt0eXBlXTtcbiAgICAgICAgYWRhcHRhdGlvblNldC5zdWJUeXBlID0gc3RyZWFtSW5kZXguZ2V0QXR0cmlidXRlKCdTdWJ0eXBlJyk7XG4gICAgICAgIGFkYXB0YXRpb25TZXQubWF4V2lkdGggPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ01heFdpZHRoJyk7XG4gICAgICAgIGFkYXB0YXRpb25TZXQubWF4SGVpZ2h0ID0gc3RyZWFtSW5kZXguZ2V0QXR0cmlidXRlKCdNYXhIZWlnaHQnKTtcblxuICAgICAgICAvLyBNYXAgdGV4dCB0cmFja3Mgc3ViVHlwZXMgdG8gTVBFRy1EQVNIIEFkYXB0YXRpb25TZXQgcm9sZSBhbmQgYWNjZXNzaWJpbGl0eSAoc2VlIEVUU0kgVFMgMTAzIDI4NSB2MS4xLjEsIHNlY3Rpb24gNy4xLjIpXG4gICAgICAgIGlmIChhZGFwdGF0aW9uU2V0LnN1YlR5cGUpIHtcbiAgICAgICAgICAgIGlmIChST0xFW2FkYXB0YXRpb25TZXQuc3ViVHlwZV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcm9sZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2NoZW1lSWRVcmk6ICd1cm46bXBlZzpkYXNoOnJvbGU6MjAxMScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBST0xFW2FkYXB0YXRpb25TZXQuc3ViVHlwZV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFkYXB0YXRpb25TZXQuUm9sZSA9IHJvbGU7XG4gICAgICAgICAgICAgICAgYWRhcHRhdGlvblNldC5Sb2xlX2FzQXJyYXkgPSBbcm9sZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQUNDRVNTSUJJTElUWVthZGFwdGF0aW9uU2V0LnN1YlR5cGVdKSB7XG4gICAgICAgICAgICAgICAgbGV0IGFjY2Vzc2liaWxpdHkgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNjaGVtZUlkVXJpOiAndXJuOnR2YTptZXRhZGF0YTpjczpBdWRpb1B1cnBvc2VDUzoyMDA3JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IEFDQ0VTU0lCSUxJVFlbYWRhcHRhdGlvblNldC5zdWJUeXBlXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYWRhcHRhdGlvblNldC5BY2Nlc3NpYmlsaXR5ID0gYWNjZXNzaWJpbGl0eTtcbiAgICAgICAgICAgICAgICBhZGFwdGF0aW9uU2V0LkFjY2Vzc2liaWxpdHlfYXNBcnJheSA9IFthY2Nlc3NpYmlsaXR5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBhIFNlZ21lbnRUZW1wbGF0ZSB3aXRoIGEgU2VnbWVudFRpbWVsaW5lXG4gICAgICAgIHNlZ21lbnRUZW1wbGF0ZSA9IG1hcFNlZ21lbnRUZW1wbGF0ZShzdHJlYW1JbmRleCwgdGltZXNjYWxlKTtcblxuICAgICAgICBxdWFsaXR5TGV2ZWxzID0gc3RyZWFtSW5kZXguZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1F1YWxpdHlMZXZlbCcpO1xuICAgICAgICAvLyBGb3IgZWFjaCBRdWFsaXR5TGV2ZWwgbm9kZSwgY3JlYXRlIGEgUmVwcmVzZW50YXRpb24gZWxlbWVudFxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcXVhbGl0eUxldmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gUHJvcGFnYXRlIEJhc2VVUkwgYW5kIG1pbWVUeXBlXG4gICAgICAgICAgICBxdWFsaXR5TGV2ZWxzW2ldLkJhc2VVUkwgPSBhZGFwdGF0aW9uU2V0LkJhc2VVUkw7XG4gICAgICAgICAgICBxdWFsaXR5TGV2ZWxzW2ldLm1pbWVUeXBlID0gYWRhcHRhdGlvblNldC5taW1lVHlwZTtcblxuICAgICAgICAgICAgLy8gU2V0IHF1YWxpdHkgbGV2ZWwgaWRcbiAgICAgICAgICAgIHF1YWxpdHlMZXZlbHNbaV0uSWQgPSBhZGFwdGF0aW9uU2V0LmlkICsgJ18nICsgcXVhbGl0eUxldmVsc1tpXS5nZXRBdHRyaWJ1dGUoJ0luZGV4Jyk7XG5cbiAgICAgICAgICAgIC8vIE1hcCBSZXByZXNlbnRhdGlvbiB0byBRdWFsaXR5TGV2ZWxcbiAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uID0gbWFwUmVwcmVzZW50YXRpb24ocXVhbGl0eUxldmVsc1tpXSwgc3RyZWFtSW5kZXgpO1xuXG4gICAgICAgICAgICBpZiAocmVwcmVzZW50YXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBDb3B5IFNlZ21lbnRUZW1wbGF0ZSBpbnRvIFJlcHJlc2VudGF0aW9uXG4gICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uU2VnbWVudFRlbXBsYXRlID0gc2VnbWVudFRlbXBsYXRlO1xuXG4gICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb25zLnB1c2gocmVwcmVzZW50YXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcHJlc2VudGF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRhcHRhdGlvblNldC5SZXByZXNlbnRhdGlvbiA9IChyZXByZXNlbnRhdGlvbnMubGVuZ3RoID4gMSkgPyByZXByZXNlbnRhdGlvbnMgOiByZXByZXNlbnRhdGlvbnNbMF07XG4gICAgICAgIGFkYXB0YXRpb25TZXQuUmVwcmVzZW50YXRpb25fYXNBcnJheSA9IHJlcHJlc2VudGF0aW9ucztcblxuICAgICAgICAvLyBTZXQgU2VnbWVudFRlbXBsYXRlXG4gICAgICAgIGFkYXB0YXRpb25TZXQuU2VnbWVudFRlbXBsYXRlID0gc2VnbWVudFRlbXBsYXRlO1xuXG4gICAgICAgIHNlZ21lbnRzID0gc2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5TX2FzQXJyYXk7XG5cbiAgICAgICAgcmV0dXJuIGFkYXB0YXRpb25TZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFwUmVwcmVzZW50YXRpb24ocXVhbGl0eUxldmVsLCBzdHJlYW1JbmRleCkge1xuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbiA9IHt9O1xuICAgICAgICBjb25zdCB0eXBlID0gc3RyZWFtSW5kZXguZ2V0QXR0cmlidXRlKCdUeXBlJyk7XG4gICAgICAgIGxldCBmb3VyQ0NWYWx1ZSA9IG51bGw7XG5cbiAgICAgICAgcmVwcmVzZW50YXRpb24uaWQgPSBxdWFsaXR5TGV2ZWwuSWQ7XG4gICAgICAgIHJlcHJlc2VudGF0aW9uLmJhbmR3aWR0aCA9IHBhcnNlSW50KHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0JpdHJhdGUnKSwgMTApO1xuICAgICAgICByZXByZXNlbnRhdGlvbi5taW1lVHlwZSA9IHF1YWxpdHlMZXZlbC5taW1lVHlwZTtcbiAgICAgICAgcmVwcmVzZW50YXRpb24ud2lkdGggPSBwYXJzZUludChxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdNYXhXaWR0aCcpLCAxMCk7XG4gICAgICAgIHJlcHJlc2VudGF0aW9uLmhlaWdodCA9IHBhcnNlSW50KHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ01heEhlaWdodCcpLCAxMCk7XG5cbiAgICAgICAgZm91ckNDVmFsdWUgPSBxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdGb3VyQ0MnKTtcblxuICAgICAgICAvLyBJZiBGb3VyQ0Mgbm90IGRlZmluZWQgYXQgUXVhbGl0eUxldmVsIGxldmVsLCB0aGVuIGdldCBpdCBmcm9tIFN0cmVhbUluZGV4IGxldmVsXG4gICAgICAgIGlmIChmb3VyQ0NWYWx1ZSA9PT0gbnVsbCB8fCBmb3VyQ0NWYWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIGZvdXJDQ1ZhbHVlID0gc3RyZWFtSW5kZXguZ2V0QXR0cmlidXRlKCdGb3VyQ0MnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHN0aWxsIG5vdCBkZWZpbmVkIChvcHRpb25uYWwgZm9yIGF1ZGlvIHN0cmVhbSwgc2VlIGh0dHBzOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvZmY3MjgxMTYlMjh2PXZzLjk1JTI5LmFzcHgpLFxuICAgICAgICAvLyB0aGVuIHdlIGNvbnNpZGVyIHRoZSBzdHJlYW0gaXMgYW4gYXVkaW8gQUFDIHN0cmVhbVxuICAgICAgICBpZiAoZm91ckNDVmFsdWUgPT09IG51bGwgfHwgZm91ckNDVmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gY29uc3RhbnRzLkFVRElPKSB7XG4gICAgICAgICAgICAgICAgZm91ckNDVmFsdWUgPSAnQUFDJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gY29uc3RhbnRzLlZJREVPKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdGb3VyQ0MgaXMgbm90IGRlZmluZWQgd2hlcmVhcyBpdCBpcyByZXF1aXJlZCBmb3IgYSBRdWFsaXR5TGV2ZWwgZWxlbWVudCBmb3IgYSBTdHJlYW1JbmRleCBvZiB0eXBlIFwidmlkZW9cIicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgY29kZWMgaXMgc3VwcG9ydGVkXG4gICAgICAgIGlmIChTVVBQT1JURURfQ09ERUNTLmluZGV4T2YoZm91ckNDVmFsdWUudG9VcHBlckNhc2UoKSkgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBEbyBub3Qgc2VuZCB3YXJuaW5nXG4gICAgICAgICAgICBsb2dnZXIud2FybignQ29kZWMgbm90IHN1cHBvcnRlZDogJyArIGZvdXJDQ1ZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IGNvZGVjcyB2YWx1ZSBhY2NvcmRpbmcgdG8gRm91ckNDIGZpZWxkXG4gICAgICAgIGlmIChmb3VyQ0NWYWx1ZSA9PT0gJ0gyNjQnIHx8IGZvdXJDQ1ZhbHVlID09PSAnQVZDMScpIHtcbiAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLmNvZGVjcyA9IGdldEgyNjRDb2RlYyhxdWFsaXR5TGV2ZWwpO1xuICAgICAgICB9IGVsc2UgaWYgKGZvdXJDQ1ZhbHVlLmluZGV4T2YoJ0FBQycpID49IDApIHtcbiAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLmNvZGVjcyA9IGdldEFBQ0NvZGVjKHF1YWxpdHlMZXZlbCwgZm91ckNDVmFsdWUpO1xuICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uYXVkaW9TYW1wbGluZ1JhdGUgPSBwYXJzZUludChxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdTYW1wbGluZ1JhdGUnKSwgMTApO1xuICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uYXVkaW9DaGFubmVscyA9IHBhcnNlSW50KHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0NoYW5uZWxzJyksIDEwKTtcbiAgICAgICAgfSBlbHNlIGlmIChmb3VyQ0NWYWx1ZS5pbmRleE9mKCdUVE1MJykgfHwgZm91ckNDVmFsdWUuaW5kZXhPZignREZYUCcpKSB7XG4gICAgICAgICAgICByZXByZXNlbnRhdGlvbi5jb2RlY3MgPSBjb25zdGFudHMuU1RQUDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcHJlc2VudGF0aW9uLmNvZGVjUHJpdmF0ZURhdGEgPSAnJyArIHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0NvZGVjUHJpdmF0ZURhdGEnKTtcbiAgICAgICAgcmVwcmVzZW50YXRpb24uQmFzZVVSTCA9IHF1YWxpdHlMZXZlbC5CYXNlVVJMO1xuXG4gICAgICAgIHJldHVybiByZXByZXNlbnRhdGlvbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRIMjY0Q29kZWMocXVhbGl0eUxldmVsKSB7XG4gICAgICAgIGxldCBjb2RlY1ByaXZhdGVEYXRhID0gcXVhbGl0eUxldmVsLmdldEF0dHJpYnV0ZSgnQ29kZWNQcml2YXRlRGF0YScpLnRvU3RyaW5nKCk7XG4gICAgICAgIGxldCBuYWxIZWFkZXIsXG4gICAgICAgICAgICBhdmNvdGk7XG5cblxuICAgICAgICAvLyBFeHRyYWN0IGZyb20gdGhlIENvZGVjUHJpdmF0ZURhdGEgZmllbGQgdGhlIGhleGFkZWNpbWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBmb2xsb3dpbmdcbiAgICAgICAgLy8gdGhyZWUgYnl0ZXMgaW4gdGhlIHNlcXVlbmNlIHBhcmFtZXRlciBzZXQgTkFMIHVuaXQuXG4gICAgICAgIC8vID0+IEZpbmQgdGhlIFNQUyBuYWwgaGVhZGVyXG4gICAgICAgIG5hbEhlYWRlciA9IC8wMDAwMDAwMVswLTldNy8uZXhlYyhjb2RlY1ByaXZhdGVEYXRhKTtcbiAgICAgICAgLy8gPT4gRmluZCB0aGUgNiBjaGFyYWN0ZXJzIGFmdGVyIHRoZSBTUFMgbmFsSGVhZGVyIChpZiBpdCBleGlzdHMpXG4gICAgICAgIGF2Y290aSA9IG5hbEhlYWRlciAmJiBuYWxIZWFkZXJbMF0gPyAoY29kZWNQcml2YXRlRGF0YS5zdWJzdHIoY29kZWNQcml2YXRlRGF0YS5pbmRleE9mKG5hbEhlYWRlclswXSkgKyAxMCwgNikpIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIHJldHVybiAnYXZjMS4nICsgYXZjb3RpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEFBQ0NvZGVjKHF1YWxpdHlMZXZlbCwgZm91ckNDVmFsdWUpIHtcbiAgICAgICAgY29uc3Qgc2FtcGxpbmdSYXRlID0gcGFyc2VJbnQocXVhbGl0eUxldmVsLmdldEF0dHJpYnV0ZSgnU2FtcGxpbmdSYXRlJyksIDEwKTtcbiAgICAgICAgbGV0IGNvZGVjUHJpdmF0ZURhdGEgPSBxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdDb2RlY1ByaXZhdGVEYXRhJykudG9TdHJpbmcoKTtcbiAgICAgICAgbGV0IG9iamVjdFR5cGUgPSAwO1xuICAgICAgICBsZXQgY29kZWNQcml2YXRlRGF0YUhleCxcbiAgICAgICAgICAgIGFycjE2LFxuICAgICAgICAgICAgaW5kZXhGcmVxLFxuICAgICAgICAgICAgZXh0ZW5zaW9uU2FtcGxpbmdGcmVxdWVuY3lJbmRleDtcblxuICAgICAgICAvL2Nocm9tZSBwcm9ibGVtLCBpbiBpbXBsaWNpdCBBQUMgSEUgZGVmaW5pdGlvbiwgc28gd2hlbiBBQUNIIGlzIGRldGVjdGVkIGluIEZvdXJDQ1xuICAgICAgICAvL3NldCBvYmplY3RUeXBlIHRvIDUgPT4gc3RyYW5nZSwgaXQgc2hvdWxkIGJlIDJcbiAgICAgICAgaWYgKGZvdXJDQ1ZhbHVlID09PSAnQUFDSCcpIHtcbiAgICAgICAgICAgIG9iamVjdFR5cGUgPSAweDA1O1xuICAgICAgICB9XG4gICAgICAgIC8vaWYgY29kZWNQcml2YXRlRGF0YSBpcyBlbXB0eSwgYnVpbGQgaXQgOlxuICAgICAgICBpZiAoY29kZWNQcml2YXRlRGF0YSA9PT0gdW5kZWZpbmVkIHx8IGNvZGVjUHJpdmF0ZURhdGEgPT09ICcnKSB7XG4gICAgICAgICAgICBvYmplY3RUeXBlID0gMHgwMjsgLy9BQUMgTWFpbiBMb3cgQ29tcGxleGl0eSA9PiBvYmplY3QgVHlwZSA9IDJcbiAgICAgICAgICAgIGluZGV4RnJlcSA9IHNhbXBsaW5nRnJlcXVlbmN5SW5kZXhbc2FtcGxpbmdSYXRlXTtcbiAgICAgICAgICAgIGlmIChmb3VyQ0NWYWx1ZSA9PT0gJ0FBQ0gnKSB7XG4gICAgICAgICAgICAgICAgLy8gNCBieXRlcyA6ICAgICBYWFhYWCAgICAgICAgIFhYWFggICAgICAgICAgWFhYWCAgICAgICAgICAgICBYWFhYICAgICAgICAgICAgICAgICAgWFhYWFggICAgICBYWFggICBYWFhYWFhYXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICcgT2JqZWN0VHlwZScgJ0ZyZXEgSW5kZXgnICdDaGFubmVscyB2YWx1ZScgICAnRXh0ZW5zIFNhbXBsIEZyZXEnICAnT2JqZWN0VHlwZScgICdHQVMnICdhbGlnbm1lbnQgPSAwJ1xuICAgICAgICAgICAgICAgIG9iamVjdFR5cGUgPSAweDA1OyAvLyBIaWdoIEVmZmljaWVuY3kgQUFDIFByb2ZpbGUgPSBvYmplY3QgVHlwZSA9IDUgU0JSXG4gICAgICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YSA9IG5ldyBVaW50OEFycmF5KDQpO1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvblNhbXBsaW5nRnJlcXVlbmN5SW5kZXggPSBzYW1wbGluZ0ZyZXF1ZW5jeUluZGV4W3NhbXBsaW5nUmF0ZSAqIDJdOyAvLyBpbiBIRSBBQUMgRXh0ZW5zaW9uIFNhbXBsaW5nIGZyZXF1ZW5jZVxuICAgICAgICAgICAgICAgIC8vIGVxdWFscyB0byBTYW1wbGluZ1JhdGUqMlxuICAgICAgICAgICAgICAgIC8vRnJlcSBJbmRleCBpcyBwcmVzZW50IGZvciAzIGJpdHMgaW4gdGhlIGZpcnN0IGJ5dGUsIGxhc3QgYml0IGlzIGluIHRoZSBzZWNvbmRcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhWzBdID0gKG9iamVjdFR5cGUgPDwgMykgfCAoaW5kZXhGcmVxID4+IDEpO1xuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFbMV0gPSAoaW5kZXhGcmVxIDw8IDcpIHwgKHF1YWxpdHlMZXZlbC5DaGFubmVscyA8PCAzKSB8IChleHRlbnNpb25TYW1wbGluZ0ZyZXF1ZW5jeUluZGV4ID4+IDEpO1xuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFbMl0gPSAoZXh0ZW5zaW9uU2FtcGxpbmdGcmVxdWVuY3lJbmRleCA8PCA3KSB8ICgweDAyIDw8IDIpOyAvLyBvcmlnaW4gb2JqZWN0IHR5cGUgZXF1YWxzIHRvIDIgPT4gQUFDIE1haW4gTG93IENvbXBsZXhpdHlcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhWzNdID0gMHgwOyAvL2FsaWdubWVudCBiaXRzXG5cbiAgICAgICAgICAgICAgICBhcnIxNiA9IG5ldyBVaW50MTZBcnJheSgyKTtcbiAgICAgICAgICAgICAgICBhcnIxNlswXSA9IChjb2RlY1ByaXZhdGVEYXRhWzBdIDw8IDgpICsgY29kZWNQcml2YXRlRGF0YVsxXTtcbiAgICAgICAgICAgICAgICBhcnIxNlsxXSA9IChjb2RlY1ByaXZhdGVEYXRhWzJdIDw8IDgpICsgY29kZWNQcml2YXRlRGF0YVszXTtcbiAgICAgICAgICAgICAgICAvL2NvbnZlcnQgZGVjaW1hbCB0byBoZXggdmFsdWVcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhSGV4ID0gYXJyMTZbMF0udG9TdHJpbmcoMTYpO1xuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFIZXggPSBhcnIxNlswXS50b1N0cmluZygxNikgKyBhcnIxNlsxXS50b1N0cmluZygxNik7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gMiBieXRlcyA6ICAgICBYWFhYWCAgICAgICAgIFhYWFggICAgICAgICAgWFhYWCAgICAgICAgICAgICAgWFhYXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICcgT2JqZWN0VHlwZScgJ0ZyZXEgSW5kZXgnICdDaGFubmVscyB2YWx1ZScgICAnR0FTID0gMDAwJ1xuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGEgPSBuZXcgVWludDhBcnJheSgyKTtcbiAgICAgICAgICAgICAgICAvL0ZyZXEgSW5kZXggaXMgcHJlc2VudCBmb3IgMyBiaXRzIGluIHRoZSBmaXJzdCBieXRlLCBsYXN0IGJpdCBpcyBpbiB0aGUgc2Vjb25kXG4gICAgICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YVswXSA9IChvYmplY3RUeXBlIDw8IDMpIHwgKGluZGV4RnJlcSA+PiAxKTtcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhWzFdID0gKGluZGV4RnJlcSA8PCA3KSB8IChwYXJzZUludChxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdDaGFubmVscycpLCAxMCkgPDwgMyk7XG4gICAgICAgICAgICAgICAgLy8gcHV0IHRoZSAyIGJ5dGVzIGluIGFuIDE2IGJpdHMgYXJyYXlcbiAgICAgICAgICAgICAgICBhcnIxNiA9IG5ldyBVaW50MTZBcnJheSgxKTtcbiAgICAgICAgICAgICAgICBhcnIxNlswXSA9IChjb2RlY1ByaXZhdGVEYXRhWzBdIDw8IDgpICsgY29kZWNQcml2YXRlRGF0YVsxXTtcbiAgICAgICAgICAgICAgICAvL2NvbnZlcnQgZGVjaW1hbCB0byBoZXggdmFsdWVcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhSGV4ID0gYXJyMTZbMF0udG9TdHJpbmcoMTYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhID0gJycgKyBjb2RlY1ByaXZhdGVEYXRhSGV4O1xuICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YSA9IGNvZGVjUHJpdmF0ZURhdGEudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIHF1YWxpdHlMZXZlbC5zZXRBdHRyaWJ1dGUoJ0NvZGVjUHJpdmF0ZURhdGEnLCBjb2RlY1ByaXZhdGVEYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChvYmplY3RUeXBlID09PSAwKSB7XG4gICAgICAgICAgICBvYmplY3RUeXBlID0gKHBhcnNlSW50KGNvZGVjUHJpdmF0ZURhdGEuc3Vic3RyKDAsIDIpLCAxNikgJiAweEY4KSA+PiAzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICdtcDRhLjQwLicgKyBvYmplY3RUeXBlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcFNlZ21lbnRUZW1wbGF0ZShzdHJlYW1JbmRleCwgdGltZXNjYWxlKSB7XG4gICAgICAgIGNvbnN0IHNlZ21lbnRUZW1wbGF0ZSA9IHt9O1xuICAgICAgICBsZXQgbWVkaWFVcmwsXG4gICAgICAgICAgICBzdHJlYW1JbmRleFRpbWVTY2FsZSxcbiAgICAgICAgICAgIHVybDtcblxuICAgICAgICB1cmwgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ1VybCcpO1xuICAgICAgICBtZWRpYVVybCA9IHVybCA/IHVybC5yZXBsYWNlKCd7Yml0cmF0ZX0nLCAnJEJhbmR3aWR0aCQnKSA6IG51bGw7XG4gICAgICAgIG1lZGlhVXJsID0gbWVkaWFVcmwgPyBtZWRpYVVybC5yZXBsYWNlKCd7c3RhcnQgdGltZX0nLCAnJFRpbWUkJykgOiBudWxsO1xuXG4gICAgICAgIHN0cmVhbUluZGV4VGltZVNjYWxlID0gc3RyZWFtSW5kZXguZ2V0QXR0cmlidXRlKCdUaW1lU2NhbGUnKTtcbiAgICAgICAgc3RyZWFtSW5kZXhUaW1lU2NhbGUgPSBzdHJlYW1JbmRleFRpbWVTY2FsZSA/IHBhcnNlRmxvYXQoc3RyZWFtSW5kZXhUaW1lU2NhbGUpIDogdGltZXNjYWxlO1xuXG4gICAgICAgIHNlZ21lbnRUZW1wbGF0ZS5tZWRpYSA9IG1lZGlhVXJsO1xuICAgICAgICBzZWdtZW50VGVtcGxhdGUudGltZXNjYWxlID0gc3RyZWFtSW5kZXhUaW1lU2NhbGU7XG5cbiAgICAgICAgc2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZSA9IG1hcFNlZ21lbnRUaW1lbGluZShzdHJlYW1JbmRleCwgc2VnbWVudFRlbXBsYXRlLnRpbWVzY2FsZSk7XG5cbiAgICAgICAgcmV0dXJuIHNlZ21lbnRUZW1wbGF0ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXBTZWdtZW50VGltZWxpbmUoc3RyZWFtSW5kZXgsIHRpbWVzY2FsZSkge1xuICAgICAgICBjb25zdCBzZWdtZW50VGltZWxpbmUgPSB7fTtcbiAgICAgICAgY29uc3QgY2h1bmtzID0gc3RyZWFtSW5kZXguZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2MnKTtcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgbGV0IHNlZ21lbnQsXG4gICAgICAgICAgICBwcmV2U2VnbWVudCxcbiAgICAgICAgICAgIHRNYW5pZmVzdCxcbiAgICAgICAgICAgIGksaixyO1xuICAgICAgICBsZXQgZHVyYXRpb24gPSAwO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNlZ21lbnQgPSB7fTtcblxuICAgICAgICAgICAgLy8gR2V0IHRpbWUgJ3QnIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAgICAgICAgdE1hbmlmZXN0ID0gY2h1bmtzW2ldLmdldEF0dHJpYnV0ZSgndCcpO1xuXG4gICAgICAgICAgICAvLyA9PiBzZWdtZW50LnRNYW5pZmVzdCA9IG9yaWdpbmFsIHRpbWVzdGFtcCB2YWx1ZSBhcyBhIHN0cmluZyAoZm9yIGNvbnN0cnVjdGluZyB0aGUgZnJhZ21lbnQgcmVxdWVzdCB1cmwsIHNlZSBEYXNoSGFuZGxlcilcbiAgICAgICAgICAgIC8vID0+IHNlZ21lbnQudCA9IG51bWJlciB2YWx1ZSBvZiB0aW1lc3RhbXAgKG1heWJlIHJvdW5kZWQgdmFsdWUsIGJ1dCBvbmx5IGZvciAwLjEgbWljcm9zZWNvbmQpXG4gICAgICAgICAgICBpZiAodE1hbmlmZXN0ICYmIEJpZ0ludCh0TWFuaWZlc3QpLmdyZWF0ZXIoQmlnSW50KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSkpIHtcbiAgICAgICAgICAgICAgICBzZWdtZW50LnRNYW5pZmVzdCA9IHRNYW5pZmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlZ21lbnQudCA9IHBhcnNlRmxvYXQodE1hbmlmZXN0KTtcblxuICAgICAgICAgICAgLy8gR2V0IGR1cmF0aW9uICdkJyBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgICAgICAgIHNlZ21lbnQuZCA9IHBhcnNlRmxvYXQoY2h1bmtzW2ldLmdldEF0dHJpYnV0ZSgnZCcpKTtcblxuICAgICAgICAgICAgLy8gSWYgJ3QnIG5vdCBkZWZpbmVkIGZvciBmaXJzdCBzZWdtZW50IHRoZW4gdD0wXG4gICAgICAgICAgICBpZiAoKGkgPT09IDApICYmICFzZWdtZW50LnQpIHtcbiAgICAgICAgICAgICAgICBzZWdtZW50LnQgPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICBwcmV2U2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBwcmV2aW91cyBzZWdtZW50IGR1cmF0aW9uIGlmIG5vdCBkZWZpbmVkXG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2U2VnbWVudC5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2U2VnbWVudC50TWFuaWZlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZTZWdtZW50LmQgPSBCaWdJbnQodE1hbmlmZXN0KS5zdWJ0cmFjdChCaWdJbnQocHJldlNlZ21lbnQudE1hbmlmZXN0KSkudG9KU051bWJlcigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlNlZ21lbnQuZCA9IHNlZ21lbnQudCAtIHByZXZTZWdtZW50LnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gKz0gcHJldlNlZ21lbnQuZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2V0IHNlZ21lbnQgYWJzb2x1dGUgdGltZXN0YW1wIGlmIG5vdCBzZXQgaW4gbWFuaWZlc3RcbiAgICAgICAgICAgICAgICBpZiAoIXNlZ21lbnQudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlNlZ21lbnQudE1hbmlmZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50LnRNYW5pZmVzdCA9IEJpZ0ludChwcmV2U2VnbWVudC50TWFuaWZlc3QpLmFkZChCaWdJbnQocHJldlNlZ21lbnQuZCkpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50LnQgPSBwYXJzZUZsb2F0KHNlZ21lbnQudE1hbmlmZXN0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQudCA9IHByZXZTZWdtZW50LnQgKyBwcmV2U2VnbWVudC5kO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2VnbWVudC5kKSB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gKz0gc2VnbWVudC5kO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IHNlZ21lbnRcbiAgICAgICAgICAgIHNlZ21lbnRzLnB1c2goc2VnbWVudCk7XG5cbiAgICAgICAgICAgIC8vIFN1cHBvcnQgZm9yICdyJyBhdHRyaWJ1dGUgKGkuZS4gXCJyZXBlYXRcIiBhcyBpbiBNUEVHLURBU0gpXG4gICAgICAgICAgICByID0gcGFyc2VGbG9hdChjaHVua3NbaV0uZ2V0QXR0cmlidXRlKCdyJykpO1xuICAgICAgICAgICAgaWYgKHIpIHtcblxuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCAociAtIDEpOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldlNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBzZWdtZW50LnQgPSBwcmV2U2VnbWVudC50ICsgcHJldlNlZ21lbnQuZDtcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudC5kID0gcHJldlNlZ21lbnQuZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZTZWdtZW50LnRNYW5pZmVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudC50TWFuaWZlc3QgID0gQmlnSW50KHByZXZTZWdtZW50LnRNYW5pZmVzdCkuYWRkKEJpZ0ludChwcmV2U2VnbWVudC5kKSkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiArPSBzZWdtZW50LmQ7XG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzLnB1c2goc2VnbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2VnbWVudFRpbWVsaW5lLlMgPSBzZWdtZW50cztcbiAgICAgICAgc2VnbWVudFRpbWVsaW5lLlNfYXNBcnJheSA9IHNlZ21lbnRzO1xuICAgICAgICBzZWdtZW50VGltZWxpbmUuZHVyYXRpb24gPSBkdXJhdGlvbiAvIHRpbWVzY2FsZTtcblxuICAgICAgICByZXR1cm4gc2VnbWVudFRpbWVsaW5lO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEtJREZyb21Qcm90ZWN0aW9uSGVhZGVyKHByb3RlY3Rpb25IZWFkZXIpIHtcbiAgICAgICAgbGV0IHBySGVhZGVyLFxuICAgICAgICAgICAgd3JtSGVhZGVyLFxuICAgICAgICAgICAgeG1sUmVhZGVyLFxuICAgICAgICAgICAgS0lEO1xuXG4gICAgICAgIC8vIEdldCBQbGF5UmVhZHkgaGVhZGVyIGFzIGJ5dGUgYXJyYXkgKGJhc2U2NCBkZWNvZGVkKVxuICAgICAgICBwckhlYWRlciA9IEJBU0U2NC5kZWNvZGVBcnJheShwcm90ZWN0aW9uSGVhZGVyLmZpcnN0Q2hpbGQuZGF0YSk7XG5cbiAgICAgICAgLy8gR2V0IFJpZ2h0IE1hbmFnZW1lbnQgaGVhZGVyIChXUk1IRUFERVIpIGZyb20gUGxheVJlYWR5IGhlYWRlclxuICAgICAgICB3cm1IZWFkZXIgPSBnZXRXUk1IZWFkZXJGcm9tUFJIZWFkZXIocHJIZWFkZXIpO1xuXG4gICAgICAgIGlmICh3cm1IZWFkZXIpIHtcbiAgICAgICAgICAgIC8vIENvbnZlcnQgZnJvbSBtdWx0aS1ieXRlIHRvIHVuaWNvZGVcbiAgICAgICAgICAgIHdybUhlYWRlciA9IG5ldyBVaW50MTZBcnJheSh3cm1IZWFkZXIuYnVmZmVyKTtcblxuICAgICAgICAgICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICAgICAgICAgIHdybUhlYWRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgd3JtSGVhZGVyKTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgPFdSTUhlYWRlcj4gdG8gZ2V0IEtJRCBmaWVsZCB2YWx1ZVxuICAgICAgICAgICAgeG1sUmVhZGVyID0gKG5ldyBET01QYXJzZXIoKSkucGFyc2VGcm9tU3RyaW5nKHdybUhlYWRlciwgJ2FwcGxpY2F0aW9uL3htbCcpO1xuICAgICAgICAgICAgS0lEID0geG1sUmVhZGVyLnF1ZXJ5U2VsZWN0b3IoJ0tJRCcpLnRleHRDb250ZW50O1xuXG4gICAgICAgICAgICAvLyBHZXQgS0lEIChiYXNlNjQgZGVjb2RlZCkgYXMgYnl0ZSBhcnJheVxuICAgICAgICAgICAgS0lEID0gQkFTRTY0LmRlY29kZUFycmF5KEtJRCk7XG5cbiAgICAgICAgICAgIC8vIENvbnZlcnQgVVVJRCBmcm9tIGxpdHRsZS1lbmRpYW4gdG8gYmlnLWVuZGlhblxuICAgICAgICAgICAgY29udmVydFV1aWRFbmRpYW5uZXNzKEtJRCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gS0lEO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFdSTUhlYWRlckZyb21QUkhlYWRlcihwckhlYWRlcikge1xuICAgICAgICBsZXQgbGVuZ3RoLFxuICAgICAgICAgICAgcmVjb3JkQ291bnQsXG4gICAgICAgICAgICByZWNvcmRUeXBlLFxuICAgICAgICAgICAgcmVjb3JkTGVuZ3RoLFxuICAgICAgICAgICAgcmVjb3JkVmFsdWU7XG4gICAgICAgIGxldCBpID0gMDtcblxuICAgICAgICAvLyBQYXJzZSBQbGF5UmVhZHkgaGVhZGVyXG5cbiAgICAgICAgLy8gTGVuZ3RoIC0gMzIgYml0cyAoTEUgZm9ybWF0KVxuICAgICAgICBsZW5ndGggPSAocHJIZWFkZXJbaSArIDNdIDw8IDI0KSArIChwckhlYWRlcltpICsgMl0gPDwgMTYpICsgKHBySGVhZGVyW2kgKyAxXSA8PCA4KSArIHBySGVhZGVyW2ldO1xuICAgICAgICBpICs9IDQ7XG5cbiAgICAgICAgLy8gUmVjb3JkIGNvdW50IC0gMTYgYml0cyAoTEUgZm9ybWF0KVxuICAgICAgICByZWNvcmRDb3VudCA9IChwckhlYWRlcltpICsgMV0gPDwgOCkgKyBwckhlYWRlcltpXTtcbiAgICAgICAgaSArPSAyO1xuXG4gICAgICAgIC8vIFBhcnNlIHJlY29yZHNcbiAgICAgICAgd2hpbGUgKGkgPCBwckhlYWRlci5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFJlY29yZCB0eXBlIC0gMTYgYml0cyAoTEUgZm9ybWF0KVxuICAgICAgICAgICAgcmVjb3JkVHlwZSA9IChwckhlYWRlcltpICsgMV0gPDwgOCkgKyBwckhlYWRlcltpXTtcbiAgICAgICAgICAgIGkgKz0gMjtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgUmlnaHRzIE1hbmFnZW1lbnQgaGVhZGVyIChyZWNvcmQgdHlwZSA9IDB4MDEpXG4gICAgICAgICAgICBpZiAocmVjb3JkVHlwZSA9PT0gMHgwMSkge1xuXG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIGxlbmd0aCAtIDE2IGJpdHMgKExFIGZvcm1hdClcbiAgICAgICAgICAgICAgICByZWNvcmRMZW5ndGggPSAocHJIZWFkZXJbaSArIDFdIDw8IDgpICsgcHJIZWFkZXJbaV07XG4gICAgICAgICAgICAgICAgaSArPSAyO1xuXG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIHZhbHVlID0+IGNvbnRhaW5zIDxXUk1IRUFERVI+XG4gICAgICAgICAgICAgICAgcmVjb3JkVmFsdWUgPSBuZXcgVWludDhBcnJheShyZWNvcmRMZW5ndGgpO1xuICAgICAgICAgICAgICAgIHJlY29yZFZhbHVlLnNldChwckhlYWRlci5zdWJhcnJheShpLCBpICsgcmVjb3JkTGVuZ3RoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZFZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29udmVydFV1aWRFbmRpYW5uZXNzKHV1aWQpIHtcbiAgICAgICAgc3dhcEJ5dGVzKHV1aWQsIDAsIDMpO1xuICAgICAgICBzd2FwQnl0ZXModXVpZCwgMSwgMik7XG4gICAgICAgIHN3YXBCeXRlcyh1dWlkLCA0LCA1KTtcbiAgICAgICAgc3dhcEJ5dGVzKHV1aWQsIDYsIDcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN3YXBCeXRlcyhieXRlcywgcG9zMSwgcG9zMikge1xuICAgICAgICBjb25zdCB0ZW1wID0gYnl0ZXNbcG9zMV07XG4gICAgICAgIGJ5dGVzW3BvczFdID0gYnl0ZXNbcG9zMl07XG4gICAgICAgIGJ5dGVzW3BvczJdID0gdGVtcDtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVBSQ29udGVudFByb3RlY3Rpb24ocHJvdGVjdGlvbkhlYWRlcikge1xuICAgICAgICBsZXQgcHJvID0ge1xuICAgICAgICAgICAgX190ZXh0OiBwcm90ZWN0aW9uSGVhZGVyLmZpcnN0Q2hpbGQuZGF0YSxcbiAgICAgICAgICAgIF9fcHJlZml4OiAnbXNwcidcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNjaGVtZUlkVXJpOiAndXJuOnV1aWQ6OWEwNGYwNzktOTg0MC00Mjg2LWFiOTItZTY1YmUwODg1Zjk1JyxcbiAgICAgICAgICAgIHZhbHVlOiAnY29tLm1pY3Jvc29mdC5wbGF5cmVhZHknLFxuICAgICAgICAgICAgcHJvOiBwcm8sXG4gICAgICAgICAgICBwcm9fYXNBcnJheTogcHJvXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlV2lkZXZpbmVDb250ZW50UHJvdGVjdGlvbihLSUQpIHtcbiAgICAgICAgbGV0IHdpZGV2aW5lQ1AgPSB7XG4gICAgICAgICAgICBzY2hlbWVJZFVyaTogJ3Vybjp1dWlkOmVkZWY4YmE5LTc5ZDYtNGFjZS1hM2M4LTI3ZGNkNTFkMjFlZCcsXG4gICAgICAgICAgICB2YWx1ZTogJ2NvbS53aWRldmluZS5hbHBoYSdcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFLSUQpXG4gICAgICAgICAgICByZXR1cm4gd2lkZXZpbmVDUDtcbiAgICAgICAgLy8gQ3JlYXRlIFdpZGV2aW5lIENFTkMgaGVhZGVyIChQcm90b2NvbCBCdWZmZXIpIHdpdGggS0lEIHZhbHVlXG4gICAgICAgIGNvbnN0IHd2Q2VuY0hlYWRlciA9IG5ldyBVaW50OEFycmF5KDIgKyBLSUQubGVuZ3RoKTtcbiAgICAgICAgd3ZDZW5jSGVhZGVyWzBdID0gMHgxMjtcbiAgICAgICAgd3ZDZW5jSGVhZGVyWzFdID0gMHgxMDtcbiAgICAgICAgd3ZDZW5jSGVhZGVyLnNldChLSUQsIDIpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIHBzc2ggYm94XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IDEyIC8qIGJveCBsZW5ndGgsIHR5cGUsIHZlcnNpb24gYW5kIGZsYWdzICovICsgMTYgLyogU3lzdGVtSUQgKi8gKyA0IC8qIGRhdGEgbGVuZ3RoICovICsgd3ZDZW5jSGVhZGVyLmxlbmd0aDtcbiAgICAgICAgbGV0IHBzc2ggPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xuICAgICAgICBsZXQgaSA9IDA7XG5cbiAgICAgICAgLy8gU2V0IGJveCBsZW5ndGggdmFsdWVcbiAgICAgICAgcHNzaFtpKytdID0gKGxlbmd0aCAmIDB4RkYwMDAwMDApID4+IDI0O1xuICAgICAgICBwc3NoW2krK10gPSAobGVuZ3RoICYgMHgwMEZGMDAwMCkgPj4gMTY7XG4gICAgICAgIHBzc2hbaSsrXSA9IChsZW5ndGggJiAweDAwMDBGRjAwKSA+PiA4O1xuICAgICAgICBwc3NoW2krK10gPSAobGVuZ3RoICYgMHgwMDAwMDBGRik7XG5cbiAgICAgICAgLy8gU2V0IHR5cGUgKCdwc3NoJyksIHZlcnNpb24gKDApIGFuZCBmbGFncyAoMClcbiAgICAgICAgcHNzaC5zZXQoWzB4NzAsIDB4NzMsIDB4NzMsIDB4NjgsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDBdLCBpKTtcbiAgICAgICAgaSArPSA4O1xuXG4gICAgICAgIC8vIFNldCBTeXN0ZW1JRCAoJ2VkZWY4YmE5LTc5ZDYtNGFjZS1hM2M4LTI3ZGNkNTFkMjFlZCcpXG4gICAgICAgIHBzc2guc2V0KFsweGVkLCAweGVmLCAweDhiLCAweGE5LCAgMHg3OSwgMHhkNiwgMHg0YSwgMHhjZSwgMHhhMywgMHhjOCwgMHgyNywgMHhkYywgMHhkNSwgMHgxZCwgMHgyMSwgMHhlZF0sIGkpO1xuICAgICAgICBpICs9IDE2O1xuXG4gICAgICAgIC8vIFNldCBkYXRhIGxlbmd0aCB2YWx1ZVxuICAgICAgICBwc3NoW2krK10gPSAod3ZDZW5jSGVhZGVyLmxlbmd0aCAmIDB4RkYwMDAwMDApID4+IDI0O1xuICAgICAgICBwc3NoW2krK10gPSAod3ZDZW5jSGVhZGVyLmxlbmd0aCAmIDB4MDBGRjAwMDApID4+IDE2O1xuICAgICAgICBwc3NoW2krK10gPSAod3ZDZW5jSGVhZGVyLmxlbmd0aCAmIDB4MDAwMEZGMDApID4+IDg7XG4gICAgICAgIHBzc2hbaSsrXSA9ICh3dkNlbmNIZWFkZXIubGVuZ3RoICYgMHgwMDAwMDBGRik7XG5cbiAgICAgICAgLy8gQ29weSBXaWRldmluZSBDRU5DIGhlYWRlclxuICAgICAgICBwc3NoLnNldCh3dkNlbmNIZWFkZXIsIGkpO1xuXG4gICAgICAgIC8vIENvbnZlcnQgdG8gQkFTRTY0IHN0cmluZ1xuICAgICAgICBwc3NoID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBwc3NoKTtcbiAgICAgICAgcHNzaCA9IEJBU0U2NC5lbmNvZGVBU0NJSShwc3NoKTtcblxuICAgICAgICB3aWRldmluZUNQLnBzc2ggPSB7IF9fdGV4dDogcHNzaCB9O1xuXG4gICAgICAgIHJldHVybiB3aWRldmluZUNQO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByb2Nlc3NNYW5pZmVzdCh4bWxEb2MsIG1hbmlmZXN0TG9hZGVkVGltZSkge1xuICAgICAgICBjb25zdCBtYW5pZmVzdCA9IHt9O1xuICAgICAgICBjb25zdCBjb250ZW50UHJvdGVjdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3Qgc21vb3RoU3RyZWFtaW5nTWVkaWEgPSB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1Ntb290aFN0cmVhbWluZ01lZGlhJylbMF07XG4gICAgICAgIGNvbnN0IHByb3RlY3Rpb24gPSB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1Byb3RlY3Rpb24nKVswXTtcbiAgICAgICAgbGV0IHByb3RlY3Rpb25IZWFkZXIgPSBudWxsO1xuICAgICAgICBsZXQgcGVyaW9kLFxuICAgICAgICAgICAgYWRhcHRhdGlvbnMsXG4gICAgICAgICAgICBjb250ZW50UHJvdGVjdGlvbixcbiAgICAgICAgICAgIEtJRCxcbiAgICAgICAgICAgIHRpbWVzdGFtcE9mZnNldCxcbiAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgIHNlZ21lbnRzLFxuICAgICAgICAgICAgdGltZXNjYWxlLFxuICAgICAgICAgICAgc2VnbWVudER1cmF0aW9uLFxuICAgICAgICAgICAgaSwgajtcblxuICAgICAgICAvLyBTZXQgbWFuaWZlc3Qgbm9kZSBwcm9wZXJ0aWVzXG4gICAgICAgIG1hbmlmZXN0LnByb3RvY29sID0gJ01TUyc7XG4gICAgICAgIG1hbmlmZXN0LnByb2ZpbGVzID0gJ3VybjptcGVnOmRhc2g6cHJvZmlsZTppc29mZi1saXZlOjIwMTEnO1xuICAgICAgICBtYW5pZmVzdC50eXBlID0gc21vb3RoU3RyZWFtaW5nTWVkaWEuZ2V0QXR0cmlidXRlKCdJc0xpdmUnKSA9PT0gJ1RSVUUnID8gJ2R5bmFtaWMnIDogJ3N0YXRpYyc7XG4gICAgICAgIHRpbWVzY2FsZSA9ICBzbW9vdGhTdHJlYW1pbmdNZWRpYS5nZXRBdHRyaWJ1dGUoJ1RpbWVTY2FsZScpO1xuICAgICAgICBtYW5pZmVzdC50aW1lc2NhbGUgPSB0aW1lc2NhbGUgPyBwYXJzZUZsb2F0KHRpbWVzY2FsZSkgOiBERUZBVUxUX1RJTUVfU0NBTEU7XG4gICAgICAgIGxldCBkdnJXaW5kb3dMZW5ndGggPSBwYXJzZUZsb2F0KHNtb290aFN0cmVhbWluZ01lZGlhLmdldEF0dHJpYnV0ZSgnRFZSV2luZG93TGVuZ3RoJykpO1xuICAgICAgICAvLyBJZiB0aGUgRFZSV2luZG93TGVuZ3RoIGZpZWxkIGlzIG9taXR0ZWQgZm9yIGEgbGl2ZSBwcmVzZW50YXRpb24gb3Igc2V0IHRvIDAsIHRoZSBEVlIgd2luZG93IGlzIGVmZmVjdGl2ZWx5IGluZmluaXRlXG4gICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnZHluYW1pYycgJiYgKGR2cldpbmRvd0xlbmd0aCA9PT0gMCB8fCBpc05hTihkdnJXaW5kb3dMZW5ndGgpKSkge1xuICAgICAgICAgICAgZHZyV2luZG93TGVuZ3RoID0gSW5maW5pdHk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU3Rhci1vdmVyXG4gICAgICAgIGlmIChkdnJXaW5kb3dMZW5ndGggPT09IDAgJiYgc21vb3RoU3RyZWFtaW5nTWVkaWEuZ2V0QXR0cmlidXRlKCdDYW5TZWVrJykgPT09ICdUUlVFJykge1xuICAgICAgICAgICAgZHZyV2luZG93TGVuZ3RoID0gSW5maW5pdHk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZHZyV2luZG93TGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggPSBkdnJXaW5kb3dMZW5ndGggLyBtYW5pZmVzdC50aW1lc2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZHVyYXRpb24gPSBwYXJzZUZsb2F0KHNtb290aFN0cmVhbWluZ01lZGlhLmdldEF0dHJpYnV0ZSgnRHVyYXRpb24nKSk7XG4gICAgICAgIG1hbmlmZXN0Lm1lZGlhUHJlc2VudGF0aW9uRHVyYXRpb24gPSAoZHVyYXRpb24gPT09IDApID8gSW5maW5pdHkgOiBkdXJhdGlvbiAvIG1hbmlmZXN0LnRpbWVzY2FsZTtcbiAgICAgICAgLy8gQnkgZGVmYXVsdCwgc2V0IG1pbkJ1ZmZlclRpbWUgdG8gMiBzZWMuIChidXQgc2V0IGJlbG93IGFjY29yZGluZyB0byB2aWRlbyBzZWdtZW50IGR1cmF0aW9uKVxuICAgICAgICBtYW5pZmVzdC5taW5CdWZmZXJUaW1lID0gMjtcbiAgICAgICAgbWFuaWZlc3QudHRtbFRpbWVJc1JlbGF0aXZlID0gdHJ1ZTtcblxuICAgICAgICAvLyBMaXZlIG1hbmlmZXN0IHdpdGggRHVyYXRpb24gPSBzdGFydC1vdmVyXG4gICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnZHluYW1pYycgJiYgZHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICBtYW5pZmVzdC50eXBlID0gJ3N0YXRpYyc7XG4gICAgICAgICAgICAvLyBXZSBzZXQgdGltZVNoaWZ0QnVmZmVyRGVwdGggdG8gaW5pdGlhbCBkdXJhdGlvbiwgdG8gYmUgdXNlZCBieSBNc3NGcmFnbWVudENvbnRyb2xsZXIgdG8gdXBkYXRlIHNlZ21lbnQgdGltZWxpbmVcbiAgICAgICAgICAgIG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID0gZHVyYXRpb24gLyBtYW5pZmVzdC50aW1lc2NhbGU7XG4gICAgICAgICAgICAvLyBEdXJhdGlvbiB3aWxsIGJlIHNldCBhY2NvcmRpbmcgdG8gY3VycmVudCBzZWdtZW50IHRpbWVsaW5lIGR1cmF0aW9uIChzZWUgYmVsb3cpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWFuaWZlc3QudHlwZSA9PT0gJ2R5bmFtaWMnICAmJiBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA8IEluZmluaXR5KSB7XG4gICAgICAgICAgICBtYW5pZmVzdC5yZWZyZXNoTWFuaWZlc3RPblN3aXRjaFRyYWNrID0gdHJ1ZTsgLy8gUmVmcmVzaCBtYW5pZmVzdCB3aGVuIHN3aXRjaGluZyB0cmFja3NcbiAgICAgICAgICAgIG1hbmlmZXN0LmRvTm90VXBkYXRlRFZSV2luZG93T25CdWZmZXJVcGRhdGVkID0gdHJ1ZTsgLy8gRFZSV2luZG93IGlzIHVwZGF0ZSBieSBNc3NGcmFnbWVudE1vb2ZQb2Nlc3NvciBiYXNlZCBvbiB0ZnJmIGJveGVzXG4gICAgICAgICAgICBtYW5pZmVzdC5pZ25vcmVQb3N0cG9uZVRpbWVQZXJpb2QgPSB0cnVlOyAvLyBOZXZlciB1cGRhdGUgbWFuaWZlc3RcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1hcCBwZXJpb2Qgbm9kZSB0byBtYW5pZmVzdCByb290IG5vZGVcbiAgICAgICAgbWFuaWZlc3QuUGVyaW9kID0gbWFwUGVyaW9kKHNtb290aFN0cmVhbWluZ01lZGlhLCBtYW5pZmVzdC50aW1lc2NhbGUpO1xuICAgICAgICBtYW5pZmVzdC5QZXJpb2RfYXNBcnJheSA9IFttYW5pZmVzdC5QZXJpb2RdO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgcGVyaW9kIHN0YXJ0IHRpbWVcbiAgICAgICAgcGVyaW9kID0gbWFuaWZlc3QuUGVyaW9kO1xuICAgICAgICBwZXJpb2Quc3RhcnQgPSAwO1xuXG4gICAgICAgIC8vIFVuY29tbWVudCB0byB0ZXN0IGxpdmUgdG8gc3RhdGljIG1hbmlmZXN0c1xuICAgICAgICAvLyBpZiAobWFuaWZlc3QudHlwZSAhPT0gJ3N0YXRpYycpIHtcbiAgICAgICAgLy8gICAgIG1hbmlmZXN0LnR5cGUgPSAnc3RhdGljJztcbiAgICAgICAgLy8gICAgIG1hbmlmZXN0Lm1lZGlhUHJlc2VudGF0aW9uRHVyYXRpb24gPSBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aDtcbiAgICAgICAgLy8gICAgIG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID0gbnVsbDtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIENvbnRlbnRQcm90ZWN0aW9uIG5vZGVcbiAgICAgICAgaWYgKHByb3RlY3Rpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcHJvdGVjdGlvbkhlYWRlciA9IHhtbERvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnUHJvdGVjdGlvbkhlYWRlcicpWzBdO1xuXG4gICAgICAgICAgICAvLyBTb21lIHBhY2thZ2VycyBwdXQgbmV3bGluZXMgaW50byB0aGUgUHJvdGVjdGlvbkhlYWRlciBiYXNlNjQgc3RyaW5nLCB3aGljaCBpcyBub3QgZ29vZFxuICAgICAgICAgICAgLy8gYmVjYXVzZSB0aGlzIGNhbm5vdCBiZSBjb3JyZWN0bHkgcGFyc2VkLiBMZXQncyBqdXN0IGZpbHRlciBvdXQgYW55IG5ld2xpbmVzIGZvdW5kIGluIHRoZXJlLlxuICAgICAgICAgICAgcHJvdGVjdGlvbkhlYWRlci5maXJzdENoaWxkLmRhdGEgPSBwcm90ZWN0aW9uSGVhZGVyLmZpcnN0Q2hpbGQuZGF0YS5yZXBsYWNlKC9cXG58XFxyL2csICcnKTtcblxuICAgICAgICAgICAgLy8gR2V0IEtJRCAoaW4gQ0VOQyBmb3JtYXQpIGZyb20gcHJvdGVjdGlvbiBoZWFkZXJcbiAgICAgICAgICAgIEtJRCA9IGdldEtJREZyb21Qcm90ZWN0aW9uSGVhZGVyKHByb3RlY3Rpb25IZWFkZXIpO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgQ29udGVudFByb3RlY3Rpb24gZm9yIFBsYXlSZWFkeVxuICAgICAgICAgICAgY29udGVudFByb3RlY3Rpb24gPSBjcmVhdGVQUkNvbnRlbnRQcm90ZWN0aW9uKHByb3RlY3Rpb25IZWFkZXIpO1xuICAgICAgICAgICAgY29udGVudFByb3RlY3Rpb25bJ2NlbmM6ZGVmYXVsdF9LSUQnXSA9IEtJRDtcbiAgICAgICAgICAgIGNvbnRlbnRQcm90ZWN0aW9ucy5wdXNoKGNvbnRlbnRQcm90ZWN0aW9uKTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIENvbnRlbnRQcm90ZWN0aW9uIGZvciBXaWRldmluZSAoYXMgYSBDRU5DIHByb3RlY3Rpb24pXG4gICAgICAgICAgICBjb250ZW50UHJvdGVjdGlvbiA9IGNyZWF0ZVdpZGV2aW5lQ29udGVudFByb3RlY3Rpb24oS0lEKTtcbiAgICAgICAgICAgIGNvbnRlbnRQcm90ZWN0aW9uWydjZW5jOmRlZmF1bHRfS0lEJ10gPSBLSUQ7XG4gICAgICAgICAgICBjb250ZW50UHJvdGVjdGlvbnMucHVzaChjb250ZW50UHJvdGVjdGlvbik7XG5cbiAgICAgICAgICAgIG1hbmlmZXN0LkNvbnRlbnRQcm90ZWN0aW9uID0gY29udGVudFByb3RlY3Rpb25zO1xuICAgICAgICAgICAgbWFuaWZlc3QuQ29udGVudFByb3RlY3Rpb25fYXNBcnJheSA9IGNvbnRlbnRQcm90ZWN0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIGFkYXB0YXRpb25zID0gcGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYWRhcHRhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5pbml0aWFsaXphdGlvbiA9ICckQmFuZHdpZHRoJCc7XG4gICAgICAgICAgICAvLyBQcm9wYWdhdGUgY29udGVudCBwcm90ZWN0aW9uIGluZm9ybWF0aW9uIGludG8gZWFjaCBhZGFwdGF0aW9uXG4gICAgICAgICAgICBpZiAobWFuaWZlc3QuQ29udGVudFByb3RlY3Rpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFkYXB0YXRpb25zW2ldLkNvbnRlbnRQcm90ZWN0aW9uID0gbWFuaWZlc3QuQ29udGVudFByb3RlY3Rpb247XG4gICAgICAgICAgICAgICAgYWRhcHRhdGlvbnNbaV0uQ29udGVudFByb3RlY3Rpb25fYXNBcnJheSA9IG1hbmlmZXN0LkNvbnRlbnRQcm90ZWN0aW9uX2FzQXJyYXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhZGFwdGF0aW9uc1tpXS5jb250ZW50VHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgICAgICAgIC8vIEdldCB2aWRlbyBzZWdtZW50IGR1cmF0aW9uXG4gICAgICAgICAgICAgICAgc2VnbWVudER1cmF0aW9uID0gYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5TX2FzQXJyYXlbMF0uZCAvIGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS50aW1lc2NhbGU7XG4gICAgICAgICAgICAgICAgLy8gU2V0IG1pbkJ1ZmZlclRpbWUgdG8gb25lIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgICAgICAgICAgICBtYW5pZmVzdC5taW5CdWZmZXJUaW1lID0gc2VnbWVudER1cmF0aW9uO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1hbmlmZXN0LnR5cGUgPT09ICdkeW5hbWljJyApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGF2YWlsYWJpbGl0eVN0YXJ0VGltZVxuICAgICAgICAgICAgICAgICAgICBzZWdtZW50cyA9IGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuU19hc0FycmF5O1xuICAgICAgICAgICAgICAgICAgICBsZXQgZW5kVGltZSA9IChzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS50ICsgc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0uZCkgLyBhZGFwdGF0aW9uc1tpXS5TZWdtZW50VGVtcGxhdGUudGltZXNjYWxlICogMTAwMDtcbiAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3QuYXZhaWxhYmlsaXR5U3RhcnRUaW1lID0gbmV3IERhdGUobWFuaWZlc3RMb2FkZWRUaW1lLmdldFRpbWUoKSAtIGVuZFRpbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoIHRpbWVTaGlmdEJ1ZmZlckRlcHRoIHRvIHZpZGVvIHNlZ21lbnQgdGltZWxpbmUgZHVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggIT09IEluZmluaXR5ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA+IGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuZHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID0gYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5kdXJhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhcCBtaW5CdWZmZXJUaW1lIHRvIHRpbWVTaGlmdEJ1ZmZlckRlcHRoXG4gICAgICAgIG1hbmlmZXN0Lm1pbkJ1ZmZlclRpbWUgPSBNYXRoLm1pbihtYW5pZmVzdC5taW5CdWZmZXJUaW1lLCAobWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggPyBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA6IEluZmluaXR5KSk7XG5cbiAgICAgICAgLy8gSW4gY2FzZSBvZiBsaXZlIHN0cmVhbXM6XG4gICAgICAgIC8vIDEtIGNvbmZpZ3VyZSBwbGF5ZXIgYnVmZmVyaW5nIHByb3BlcnRpZXMgYWNjb3JkaW5nIHRvIHRhcmdldCBsaXZlIGRlbGF5XG4gICAgICAgIC8vIDItIGFkYXB0IGxpdmUgZGVsYXkgYW5kIHRoZW4gYnVmZmVycyBsZW5ndGggaW4gY2FzZSB0aW1lU2hpZnRCdWZmZXJEZXB0aCBpcyB0b28gc21hbGwgY29tcGFyZWQgdG8gdGFyZ2V0IGxpdmUgZGVsYXkgKHNlZSBQbGF5YmFja0NvbnRyb2xsZXIuY29tcHV0ZUxpdmVEZWxheSgpKVxuICAgICAgICBpZiAobWFuaWZlc3QudHlwZSA9PT0gJ2R5bmFtaWMnKSB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0TGl2ZURlbGF5ID0gbWVkaWFQbGF5ZXJNb2RlbC5nZXRMaXZlRGVsYXkoKTtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0TGl2ZURlbGF5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGl2ZURlbGF5RnJhZ21lbnRDb3VudCA9IHNldHRpbmdzLmdldCgpLnN0cmVhbWluZy5saXZlRGVsYXlGcmFnbWVudENvdW50ICE9PSBudWxsICYmICFpc05hTihzZXR0aW5ncy5nZXQoKS5zdHJlYW1pbmcubGl2ZURlbGF5RnJhZ21lbnRDb3VudCkgPyBzZXR0aW5ncy5nZXQoKS5zdHJlYW1pbmcubGl2ZURlbGF5RnJhZ21lbnRDb3VudCA6IDQ7XG4gICAgICAgICAgICAgICAgdGFyZ2V0TGl2ZURlbGF5ID0gc2VnbWVudER1cmF0aW9uICogbGl2ZURlbGF5RnJhZ21lbnRDb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0YXJnZXREZWxheUNhcHBpbmcgPSBNYXRoLm1heChtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCAtIDEwLypFTkRfT0ZfUExBWUxJU1RfUEFERElORyovLCBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCAvIDIpO1xuICAgICAgICAgICAgbGV0IGxpdmVEZWxheSA9IE1hdGgubWluKHRhcmdldERlbGF5Q2FwcGluZywgdGFyZ2V0TGl2ZURlbGF5KTtcbiAgICAgICAgICAgIC8vIENvbnNpZGVyIGEgbWFyZ2luIG9mIG9uZSBzZWdtZW50IGluIG9yZGVyIHRvIGF2b2lkIFByZWNvbmRpdGlvbiBGYWlsZWQgZXJyb3JzICg0MTIpLCBmb3IgZXhhbXBsZSBpZiBhdWRpbyBhbmQgdmlkZW8gYXJlIG5vdCBjb3JyZWN0bHkgc3luY2hyb25pemVkXG4gICAgICAgICAgICBsZXQgYnVmZmVyVGltZSA9IGxpdmVEZWxheSAtIHNlZ21lbnREdXJhdGlvbjtcblxuICAgICAgICAgICAgLy8gU3RvcmUgaW5pdGlhbCBidWZmZXIgc2V0dGluZ3NcbiAgICAgICAgICAgIGluaXRpYWxCdWZmZXJTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAnc3RyZWFtaW5nJzoge1xuICAgICAgICAgICAgICAgICAgICAnbGl2ZURlbGF5Jzogc2V0dGluZ3MuZ2V0KCkuc3RyZWFtaW5nLmxpdmVEZWxheSxcbiAgICAgICAgICAgICAgICAgICAgJ3N0YWJsZUJ1ZmZlclRpbWUnOiBzZXR0aW5ncy5nZXQoKS5zdHJlYW1pbmcuc3RhYmxlQnVmZmVyVGltZSxcbiAgICAgICAgICAgICAgICAgICAgJ2J1ZmZlclRpbWVBdFRvcFF1YWxpdHknOiBzZXR0aW5ncy5nZXQoKS5zdHJlYW1pbmcuYnVmZmVyVGltZUF0VG9wUXVhbGl0eSxcbiAgICAgICAgICAgICAgICAgICAgJ2J1ZmZlclRpbWVBdFRvcFF1YWxpdHlMb25nRm9ybSc6IHNldHRpbmdzLmdldCgpLnN0cmVhbWluZy5idWZmZXJUaW1lQXRUb3BRdWFsaXR5TG9uZ0Zvcm1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZXR0aW5ncy51cGRhdGUoe1xuICAgICAgICAgICAgICAgICdzdHJlYW1pbmcnOiB7XG4gICAgICAgICAgICAgICAgICAgICdsaXZlRGVsYXknOiBsaXZlRGVsYXksXG4gICAgICAgICAgICAgICAgICAgICdzdGFibGVCdWZmZXJUaW1lJzogYnVmZmVyVGltZSxcbiAgICAgICAgICAgICAgICAgICAgJ2J1ZmZlclRpbWVBdFRvcFF1YWxpdHknOiBidWZmZXJUaW1lLFxuICAgICAgICAgICAgICAgICAgICAnYnVmZmVyVGltZUF0VG9wUXVhbGl0eUxvbmdGb3JtJzogYnVmZmVyVGltZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVsZXRlIENvbnRlbnQgUHJvdGVjdGlvbiB1bmRlciByb290IG1hbmlmZXN0IG5vZGVcbiAgICAgICAgZGVsZXRlIG1hbmlmZXN0LkNvbnRlbnRQcm90ZWN0aW9uO1xuICAgICAgICBkZWxldGUgbWFuaWZlc3QuQ29udGVudFByb3RlY3Rpb25fYXNBcnJheTtcblxuICAgICAgICAvLyBJbiBjYXNlIG9mIFZPRCBzdHJlYW1zLCBjaGVjayBpZiBzdGFydCB0aW1lIGlzIGdyZWF0ZXIgdGhhbiAwXG4gICAgICAgIC8vIFRoZW4gZGV0ZXJtaW5lIHRpbWVzdGFtcCBvZmZzZXQgYWNjb3JkaW5nIHRvIGhpZ2hlciBhdWRpby92aWRlbyBzdGFydCB0aW1lXG4gICAgICAgIC8vICh1c2UgY2FzZSA9IGxpdmUgc3RyZWFtIGRlbGluZWFyaXphdGlvbilcbiAgICAgICAgaWYgKG1hbmlmZXN0LnR5cGUgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgICAvLyBJbiBjYXNlIG9mIHN0YXJ0LW92ZXIgc3RyZWFtIGFuZCBtYW5pZmVzdCByZWxvYWRpbmcgKGR1ZSB0byB0cmFjayBzd2l0Y2gpXG4gICAgICAgICAgICAvLyB3ZSBjb25zaWRlciBwcmV2aW91cyB0aW1lc3RhbXBPZmZzZXQgdG8ga2VlcCB0aW1lbGluZXMgc3luY2hyb25pemVkXG4gICAgICAgICAgICB2YXIgcHJldk1hbmlmZXN0ID0gbWFuaWZlc3RNb2RlbC5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgaWYgKHByZXZNYW5pZmVzdCAmJiBwcmV2TWFuaWZlc3QudGltZXN0YW1wT2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgdGltZXN0YW1wT2Zmc2V0ID0gcHJldk1hbmlmZXN0LnRpbWVzdGFtcE9mZnNldDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFkYXB0YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhZGFwdGF0aW9uc1tpXS5jb250ZW50VHlwZSA9PT0gY29uc3RhbnRzLkFVRElPIHx8IGFkYXB0YXRpb25zW2ldLmNvbnRlbnRUeXBlID09PSBjb25zdGFudHMuVklERU8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzID0gYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5TX2FzQXJyYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBzZWdtZW50c1swXS50O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVzdGFtcE9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wT2Zmc2V0ID0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wT2Zmc2V0ID0gTWF0aC5taW4odGltZXN0YW1wT2Zmc2V0LCBzdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29ycmVjdCBjb250ZW50IGR1cmF0aW9uIGFjY29yZGluZyB0byBtaW5pbXVtIGFkYXB0YXRpb24ncyBzZWdtZW50IHRpbWVsaW5lIGR1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbiBvcmRlciB0byBmb3JjZSA8dmlkZW8+IGVsZW1lbnQgc2VuZGluZyAnZW5kZWQnIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdC5tZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uID0gTWF0aC5taW4obWFuaWZlc3QubWVkaWFQcmVzZW50YXRpb25EdXJhdGlvbiwgYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5kdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGltZXN0YW1wT2Zmc2V0ID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIFBhdGNoIHNlZ21lbnQgdGVtcGxhdGVzIHRpbWVzdGFtcHMgYW5kIGRldGVybWluZSBwZXJpb2Qgc3RhcnQgdGltZSAoc2luY2UgYXVkaW8vdmlkZW8gc2hvdWxkIG5vdCBiZSBhbGlnbmVkIHRvIDApXG4gICAgICAgICAgICAgICAgbWFuaWZlc3QudGltZXN0YW1wT2Zmc2V0ID0gdGltZXN0YW1wT2Zmc2V0O1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhZGFwdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBzZWdtZW50cyA9IGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuU19hc0FycmF5O1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgc2VnbWVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2VnbWVudHNbal0udE1hbmlmZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudHNbal0udE1hbmlmZXN0ID0gc2VnbWVudHNbal0udC50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudHNbal0udCAtPSB0aW1lc3RhbXBPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkYXB0YXRpb25zW2ldLmNvbnRlbnRUeXBlID09PSBjb25zdGFudHMuQVVESU8gfHwgYWRhcHRhdGlvbnNbaV0uY29udGVudFR5cGUgPT09IGNvbnN0YW50cy5WSURFTykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kLnN0YXJ0ID0gTWF0aC5tYXgoc2VnbWVudHNbMF0udCwgcGVyaW9kLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5wcmVzZW50YXRpb25UaW1lT2Zmc2V0ID0gcGVyaW9kLnN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBlcmlvZC5zdGFydCAvPSBtYW5pZmVzdC50aW1lc2NhbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGbG9vciB0aGUgZHVyYXRpb24gdG8gZ2V0IGFyb3VuZCBwcmVjaXNpb24gZGlmZmVyZW5jZXMgYmV0d2VlbiBzZWdtZW50cyB0aW1lc3RhbXBzIGFuZCBNU0UgYnVmZmVyIHRpbWVzdGFtcHNcbiAgICAgICAgLy8gYW5kIHRoZW4gYXZvaWQgJ2VuZGVkJyBldmVudCBub3QgYmVpbmcgcmFpc2VkXG4gICAgICAgIG1hbmlmZXN0Lm1lZGlhUHJlc2VudGF0aW9uRHVyYXRpb24gPSBNYXRoLmZsb29yKG1hbmlmZXN0Lm1lZGlhUHJlc2VudGF0aW9uRHVyYXRpb24gKiAxMDAwKSAvIDEwMDA7XG4gICAgICAgIHBlcmlvZC5kdXJhdGlvbiA9IG1hbmlmZXN0Lm1lZGlhUHJlc2VudGF0aW9uRHVyYXRpb247XG5cbiAgICAgICAgcmV0dXJuIG1hbmlmZXN0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlRE9NKGRhdGEpIHtcbiAgICAgICAgbGV0IHhtbERvYyA9IG51bGw7XG5cbiAgICAgICAgaWYgKHdpbmRvdy5ET01QYXJzZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyB3aW5kb3cuRE9NUGFyc2VyKCk7XG5cbiAgICAgICAgICAgIHhtbERvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZGF0YSwgJ3RleHQveG1sJyk7XG4gICAgICAgICAgICBpZiAoeG1sRG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwYXJzZXJlcnJvcicpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BhcnNpbmcgdGhlIG1hbmlmZXN0IGZhaWxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHhtbERvYztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRNYXRjaGVycygpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SXJvbigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW50ZXJuYWxQYXJzZShkYXRhKSB7XG4gICAgICAgIGxldCB4bWxEb2MgPSBudWxsO1xuICAgICAgICBsZXQgbWFuaWZlc3QgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcblxuICAgICAgICAvLyBQYXJzZSB0aGUgTVNTIFhNTCBtYW5pZmVzdFxuICAgICAgICB4bWxEb2MgPSBwYXJzZURPTShkYXRhKTtcblxuICAgICAgICBjb25zdCB4bWxQYXJzZVRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgaWYgKHhtbERvYyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb252ZXJ0IE1TUyBtYW5pZmVzdCBpbnRvIERBU0ggbWFuaWZlc3RcbiAgICAgICAgbWFuaWZlc3QgPSBwcm9jZXNzTWFuaWZlc3QoeG1sRG9jLCBuZXcgRGF0ZSgpKTtcblxuICAgICAgICBjb25zdCBtc3MyZGFzaFRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgbG9nZ2VyLmluZm8oJ1BhcnNpbmcgY29tcGxldGU6ICh4bWxQYXJzaW5nOiAnICsgKHhtbFBhcnNlVGltZSAtIHN0YXJ0VGltZSkudG9QcmVjaXNpb24oMykgKyAnbXMsIG1zczJkYXNoOiAnICsgKG1zczJkYXNoVGltZSAtIHhtbFBhcnNlVGltZSkudG9QcmVjaXNpb24oMykgKyAnbXMsIHRvdGFsOiAnICsgKChtc3MyZGFzaFRpbWUgLSBzdGFydFRpbWUpIC8gMTAwMCkudG9QcmVjaXNpb24oMykgKyAncyknKTtcblxuICAgICAgICByZXR1cm4gbWFuaWZlc3Q7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIC8vIFJlc3RvcmUgaW5pdGlhbCBidWZmZXIgc2V0dGluZ3NcbiAgICAgICAgaWYgKGluaXRpYWxCdWZmZXJTZXR0aW5ncykge1xuICAgICAgICAgICAgc2V0dGluZ3MudXBkYXRlKGluaXRpYWxCdWZmZXJTZXR0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgcGFyc2U6IGludGVybmFsUGFyc2UsXG4gICAgICAgIGdldE1hdGNoZXJzOiBnZXRNYXRjaGVycyxcbiAgICAgICAgZ2V0SXJvbjogZ2V0SXJvbixcbiAgICAgICAgcmVzZXQ6IHJlc2V0XG4gICAgfTtcblxuICAgIHNldHVwKCk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbk1zc1BhcnNlci5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnTXNzUGFyc2VyJztcbmV4cG9ydCBkZWZhdWx0IGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0Q2xhc3NGYWN0b3J5KE1zc1BhcnNlcik7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbmltcG9ydCBFdmVudHNCYXNlIGZyb20gJy4uL2NvcmUvZXZlbnRzL0V2ZW50c0Jhc2UnO1xuXG4vKipcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMgRXZlbnRzQmFzZVxuICovXG5jbGFzcyBNZWRpYVBsYXllckV2ZW50cyBleHRlbmRzIEV2ZW50c0Jhc2Uge1xuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFB1YmxpYyBmYWNpbmcgZXh0ZXJuYWwgZXZlbnRzIHRvIGJlIHVzZWQgd2hlbiBkZXZlbG9waW5nIGEgcGxheWVyIHRoYXQgaW1wbGVtZW50cyBkYXNoLmpzLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gcGxheWJhY2sgd2lsbCBub3Qgc3RhcnQgeWV0XG4gICAgICAgICAqIGFzIHRoZSBNUEQncyBhdmFpbGFiaWxpdHlTdGFydFRpbWUgaXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgICogQ2hlY2sgZGVsYXkgcHJvcGVydHkgaW4gcGF5bG9hZCB0byBkZXRlcm1pbmUgdGltZSBiZWZvcmUgcGxheWJhY2sgd2lsbCBzdGFydC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0FTVF9JTl9GVVRVUkVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuQVNUX0lOX0ZVVFVSRSA9ICdhc3RJbkZ1dHVyZSc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSB2aWRlbyBlbGVtZW50J3MgYnVmZmVyIHN0YXRlIGNoYW5nZXMgdG8gc3RhbGxlZC5cbiAgICAgICAgICogQ2hlY2sgbWVkaWFUeXBlIGluIHBheWxvYWQgdG8gZGV0ZXJtaW5lIHR5cGUgKFZpZGVvLCBBdWRpbywgRnJhZ21lbnRlZFRleHQpLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQlVGRkVSX0VNUFRZXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkJVRkZFUl9FTVBUWSA9ICdidWZmZXJTdGFsbGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIHZpZGVvIGVsZW1lbnQncyBidWZmZXIgc3RhdGUgY2hhbmdlcyB0byBsb2FkZWQuXG4gICAgICAgICAqIENoZWNrIG1lZGlhVHlwZSBpbiBwYXlsb2FkIHRvIGRldGVybWluZSB0eXBlIChWaWRlbywgQXVkaW8sIEZyYWdtZW50ZWRUZXh0KS5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0JVRkZFUl9MT0FERURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuQlVGRkVSX0xPQURFRCA9ICdidWZmZXJMb2FkZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgdmlkZW8gZWxlbWVudCdzIGJ1ZmZlciBzdGF0ZSBjaGFuZ2VzLCBlaXRoZXIgc3RhbGxlZCBvciBsb2FkZWQuIENoZWNrIHBheWxvYWQgZm9yIHN0YXRlLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQlVGRkVSX0xFVkVMX1NUQVRFX0NIQU5HRURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuQlVGRkVSX0xFVkVMX1NUQVRFX0NIQU5HRUQgPSAnYnVmZmVyU3RhdGVDaGFuZ2VkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlcmUgaXMgYW4gZXJyb3IgZnJvbSB0aGUgZWxlbWVudCBvciBNU0Ugc291cmNlIGJ1ZmZlci5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0VSUk9SXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkVSUk9SID0gJ2Vycm9yJztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgZnJhZ21lbnQgZG93bmxvYWQgaGFzIGNvbXBsZXRlZC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0ZSQUdNRU5UX0xPQURJTkdfQ09NUExFVEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkZSQUdNRU5UX0xPQURJTkdfQ09NUExFVEVEID0gJ2ZyYWdtZW50TG9hZGluZ0NvbXBsZXRlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgcGFydGlhbCBmcmFnbWVudCBkb3dubG9hZCBoYXMgY29tcGxldGVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjRlJBR01FTlRfTE9BRElOR19QUk9HUkVTU1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5GUkFHTUVOVF9MT0FESU5HX1BST0dSRVNTID0gJ2ZyYWdtZW50TG9hZGluZ1Byb2dyZXNzJztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgZnJhZ21lbnQgZG93bmxvYWQgaGFzIHN0YXJ0ZWQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNGUkFHTUVOVF9MT0FESU5HX1NUQVJURURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuRlJBR01FTlRfTE9BRElOR19TVEFSVEVEID0gJ2ZyYWdtZW50TG9hZGluZ1N0YXJ0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIGZyYWdtZW50IGRvd25sb2FkIGlzIGFiYW5kb25lZCBkdWUgdG8gZGV0ZWN0aW9uIG9mIHNsb3cgZG93bmxvYWQgYmFzZSBvbiB0aGUgQUJSIGFiYW5kb24gcnVsZS4uXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNGUkFHTUVOVF9MT0FESU5HX0FCQU5ET05FRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5GUkFHTUVOVF9MT0FESU5HX0FCQU5ET05FRCA9ICdmcmFnbWVudExvYWRpbmdBYmFuZG9uZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB7QGxpbmsgbW9kdWxlOkRlYnVnfSBsb2dnZXIgbWV0aG9kcyBhcmUgY2FsbGVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjTE9HXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkxPRyA9ICdsb2cnO1xuXG4gICAgICAgIC8vVE9ETyByZWZhY3RvciB3aXRoIGludGVybmFsIGV2ZW50XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgbWFuaWZlc3QgbG9hZCBpcyBjb21wbGV0ZVxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjTUFOSUZFU1RfTE9BREVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1BTklGRVNUX0xPQURFRCA9ICdtYW5pZmVzdExvYWRlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCBhbnl0aW1lIHRoZXJlIGlzIGEgY2hhbmdlIHRvIHRoZSBvdmVyYWxsIG1ldHJpY3MuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNNRVRSSUNTX0NIQU5HRURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuTUVUUklDU19DSEFOR0VEID0gJ21ldHJpY3NDaGFuZ2VkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYW4gaW5kaXZpZHVhbCBtZXRyaWMgaXMgYWRkZWQsIHVwZGF0ZWQgb3IgY2xlYXJlZC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI01FVFJJQ19DSEFOR0VEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1FVFJJQ19DSEFOR0VEID0gJ21ldHJpY0NoYW5nZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgZXZlcnkgdGltZSBhIG5ldyBtZXRyaWMgaXMgYWRkZWQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNNRVRSSUNfQURERURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuTUVUUklDX0FEREVEID0gJ21ldHJpY0FkZGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIGV2ZXJ5IHRpbWUgYSBtZXRyaWMgaXMgdXBkYXRlZC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI01FVFJJQ19VUERBVEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1FVFJJQ19VUERBVEVEID0gJ21ldHJpY1VwZGF0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgYXQgdGhlIHN0cmVhbSBlbmQgb2YgYSBwZXJpb2QuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQRVJJT0RfU1dJVENIX0NPTVBMRVRFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QRVJJT0RfU1dJVENIX0NPTVBMRVRFRCA9ICdwZXJpb2RTd2l0Y2hDb21wbGV0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIG5ldyBwZXJpb2Qgc3RhcnRzLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUEVSSU9EX1NXSVRDSF9TVEFSVEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBFUklPRF9TV0lUQ0hfU1RBUlRFRCA9ICdwZXJpb2RTd2l0Y2hTdGFydGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYW4gQUJSIHVwIC9kb3duIHN3aXRjaCBpcyBpbml0aWF0ZWQ7IGVpdGhlciBieSB1c2VyIGluIG1hbnVhbCBtb2RlIG9yIGF1dG8gbW9kZSB2aWEgQUJSIHJ1bGVzLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUVVBTElUWV9DSEFOR0VfUkVRVUVTVEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlFVQUxJVFlfQ0hBTkdFX1JFUVVFU1RFRCA9ICdxdWFsaXR5Q2hhbmdlUmVxdWVzdGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIG5ldyBBQlIgcXVhbGl0eSBpcyBiZWluZyByZW5kZXJlZCBvbi1zY3JlZW4uXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNRVUFMSVRZX0NIQU5HRV9SRU5ERVJFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5RVUFMSVRZX0NIQU5HRV9SRU5ERVJFRCA9ICdxdWFsaXR5Q2hhbmdlUmVuZGVyZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgbmV3IHRyYWNrIGlzIGJlaW5nIHJlbmRlcmVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjVFJBQ0tfQ0hBTkdFX1JFTkRFUkVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlRSQUNLX0NIQU5HRV9SRU5ERVJFRCA9ICd0cmFja0NoYW5nZVJlbmRlcmVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIHNvdXJjZSBpcyBzZXR1cCBhbmQgcmVhZHkuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTT1VSQ0VfSU5JVElBTElaRURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuU09VUkNFX0lOSVRJQUxJWkVEID0gJ3NvdXJjZUluaXRpYWxpemVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBzdHJlYW0gKHBlcmlvZCkgaXMgYmVpbmcgbG9hZGVkXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTVFJFQU1fSU5JVElBTElaSU5HXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlNUUkVBTV9JTklUSUFMSVpJTkcgPSAnc3RyZWFtSW5pdGlhbGl6aW5nJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBzdHJlYW0gKHBlcmlvZCkgaXMgbG9hZGVkXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTVFJFQU1fVVBEQVRFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5TVFJFQU1fVVBEQVRFRCA9ICdzdHJlYW1VcGRhdGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBzdHJlYW0gKHBlcmlvZCkgaXMgdXBkYXRlZFxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjU1RSRUFNX0lOSVRJQUxJWkVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlNUUkVBTV9JTklUSUFMSVpFRCA9ICdzdHJlYW1Jbml0aWFsaXplZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSBwbGF5ZXIgaGFzIGJlZW4gcmVzZXQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTVFJFQU1fVEVBUkRPV05fQ09NUExFVEVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuU1RSRUFNX1RFQVJET1dOX0NPTVBMRVRFID0gJ3N0cmVhbVRlYXJkb3duQ29tcGxldGUnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgb25jZSBhbGwgdGV4dCB0cmFja3MgZGV0ZWN0ZWQgaW4gdGhlIE1QRCBhcmUgYWRkZWQgdG8gdGhlIHZpZGVvIGVsZW1lbnQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNURVhUX1RSQUNLU19BRERFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5URVhUX1RSQUNLU19BRERFRCA9ICdhbGxUZXh0VHJhY2tzQWRkZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIHRleHQgdHJhY2sgaXMgYWRkZWQgdG8gdGhlIHZpZGVvIGVsZW1lbnQncyBUZXh0VHJhY2tMaXN0XG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNURVhUX1RSQUNLX0FEREVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlRFWFRfVFJBQ0tfQURERUQgPSAndGV4dFRyYWNrQWRkZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIHR0bWwgY2h1bmsgaXMgcGFyc2VkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjVFRNTF9QQVJTRURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuVFRNTF9QQVJTRUQgPSAndHRtbFBhcnNlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgdHRtbCBjaHVuayBoYXMgdG8gYmUgcGFyc2VkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjVFRNTF9UT19QQVJTRVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5UVE1MX1RPX1BBUlNFID0gJ3R0bWxUb1BhcnNlJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBjYXB0aW9uIGlzIHJlbmRlcmVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQ0FQVElPTl9SRU5ERVJFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5DQVBUSU9OX1JFTkRFUkVEID0gJ2NhcHRpb25SZW5kZXJlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSBjYXB0aW9uIGNvbnRhaW5lciBpcyByZXNpemVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQ0FQVElPTl9DT05UQUlORVJfUkVTSVpFXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkNBUFRJT05fQ09OVEFJTkVSX1JFU0laRSA9ICdjYXB0aW9uQ29udGFpbmVyUmVzaXplJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIGVub3VnaCBkYXRhIGlzIGF2YWlsYWJsZSB0aGF0IHRoZSBtZWRpYSBjYW4gYmUgcGxheWVkLFxuICAgICAgICAgKiBhdCBsZWFzdCBmb3IgYSBjb3VwbGUgb2YgZnJhbWVzLiAgVGhpcyBjb3JyZXNwb25kcyB0byB0aGVcbiAgICAgICAgICogSEFWRV9FTk9VR0hfREFUQSByZWFkeVN0YXRlLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQ0FOX1BMQVlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuQ0FOX1BMQVkgPSAnY2FuUGxheSc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbnQgd2hlbiBwbGF5YmFjayBjb21wbGV0ZXMuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19FTkRFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19FTkRFRCA9ICdwbGF5YmFja0VuZGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIGFuIGVycm9yIG9jY3Vycy4gIFRoZSBlbGVtZW50J3MgZXJyb3JcbiAgICAgICAgICogYXR0cmlidXRlIGNvbnRhaW5zIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19FUlJPUlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19FUlJPUiA9ICdwbGF5YmFja0Vycm9yJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIHBsYXliYWNrIGlzIG5vdCBhbGxvd2VkIChmb3IgZXhhbXBsZSBpZiB1c2VyIGdlc3R1cmUgaXMgbmVlZGVkKS5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX05PVF9BTExPV0VEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX05PVF9BTExPV0VEID0gJ3BsYXliYWNrTm90QWxsb3dlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBtZWRpYSdzIG1ldGFkYXRhIGhhcyBmaW5pc2hlZCBsb2FkaW5nOyBhbGwgYXR0cmlidXRlcyBub3dcbiAgICAgICAgICogY29udGFpbiBhcyBtdWNoIHVzZWZ1bCBpbmZvcm1hdGlvbiBhcyB0aGV5J3JlIGdvaW5nIHRvLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfTUVUQURBVEFfTE9BREVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX01FVEFEQVRBX0xPQURFRCA9ICdwbGF5YmFja01ldGFEYXRhTG9hZGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIHBsYXliYWNrIGlzIHBhdXNlZC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1BBVVNFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19QQVVTRUQgPSAncGxheWJhY2tQYXVzZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHdoZW4gdGhlIG1lZGlhIGJlZ2lucyB0byBwbGF5IChlaXRoZXIgZm9yIHRoZSBmaXJzdCB0aW1lLCBhZnRlciBoYXZpbmcgYmVlbiBwYXVzZWQsXG4gICAgICAgICAqIG9yIGFmdGVyIGVuZGluZyBhbmQgdGhlbiByZXN0YXJ0aW5nKS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1BMQVlJTkdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfUExBWUlORyA9ICdwbGF5YmFja1BsYXlpbmcnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHBlcmlvZGljYWxseSB0byBpbmZvcm0gaW50ZXJlc3RlZCBwYXJ0aWVzIG9mIHByb2dyZXNzIGRvd25sb2FkaW5nXG4gICAgICAgICAqIHRoZSBtZWRpYS4gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgYW1vdW50IG9mIHRoZSBtZWRpYSB0aGF0IGhhc1xuICAgICAgICAgKiBiZWVuIGRvd25sb2FkZWQgaXMgYXZhaWxhYmxlIGluIHRoZSBtZWRpYSBlbGVtZW50J3MgYnVmZmVyZWQgYXR0cmlidXRlLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfUFJPR1JFU1NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfUFJPR1JFU1MgPSAncGxheWJhY2tQcm9ncmVzcyc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbnQgd2hlbiB0aGUgcGxheWJhY2sgc3BlZWQgY2hhbmdlcy5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1JBVEVfQ0hBTkdFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19SQVRFX0NIQU5HRUQgPSAncGxheWJhY2tSYXRlQ2hhbmdlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbnQgd2hlbiBhIHNlZWsgb3BlcmF0aW9uIGNvbXBsZXRlcy5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1NFRUtFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19TRUVLRUQgPSAncGxheWJhY2tTZWVrZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHdoZW4gYSBzZWVrIG9wZXJhdGlvbiBiZWdpbnMuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19TRUVLSU5HXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX1NFRUtJTkcgPSAncGxheWJhY2tTZWVraW5nJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIGEgc2VlayBvcGVyYXRpb24gaGFzIGJlZW4gYXNrZWQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19TRUVLX0FTS0VEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX1NFRUtfQVNLRUQgPSAncGxheWJhY2tTZWVrQXNrZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHdoZW4gdGhlIHZpZGVvIGVsZW1lbnQgcmVwb3J0cyBzdGFsbGVkXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19TVEFMTEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX1NUQUxMRUQgPSAncGxheWJhY2tTdGFsbGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIHBsYXliYWNrIG9mIHRoZSBtZWRpYSBzdGFydHMgYWZ0ZXIgaGF2aW5nIGJlZW4gcGF1c2VkO1xuICAgICAgICAgKiB0aGF0IGlzLCB3aGVuIHBsYXliYWNrIGlzIHJlc3VtZWQgYWZ0ZXIgYSBwcmlvciBwYXVzZSBldmVudC5cbiAgICAgICAgICpcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1NUQVJURURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfU1RBUlRFRCA9ICdwbGF5YmFja1N0YXJ0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdGltZSBpbmRpY2F0ZWQgYnkgdGhlIGVsZW1lbnQncyBjdXJyZW50VGltZSBhdHRyaWJ1dGUgaGFzIGNoYW5nZWQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19USU1FX1VQREFURURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfVElNRV9VUERBVEVEID0gJ3BsYXliYWNrVGltZVVwZGF0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHdoZW4gdGhlIG1lZGlhIHBsYXliYWNrIGhhcyBzdG9wcGVkIGJlY2F1c2Ugb2YgYSB0ZW1wb3JhcnkgbGFjayBvZiBkYXRhLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfV0FJVElOR1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19XQUlUSU5HID0gJ3BsYXliYWNrV2FpdGluZyc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hbmlmZXN0IHZhbGlkaXR5IGNoYW5nZWQgLSBBcyBhIHJlc3VsdCBvZiBhbiBNUEQgdmFsaWRpdHkgZXhwaXJhdGlvbiBldmVudC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI01BTklGRVNUX1ZBTElESVRZX0NIQU5HRURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuTUFOSUZFU1RfVkFMSURJVFlfQ0hBTkdFRCA9ICdtYW5pZmVzdFZhbGlkaXR5Q2hhbmdlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgZ2FwIG9jY3VyZWQgaW4gdGhlIHRpbWVsaW5lIHdoaWNoIHJlcXVpcmVzIGEgc2VlayB0byB0aGUgbmV4dCBwZXJpb2RcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0dBUF9DQVVTRURfU0VFS19UT19QRVJJT0RfRU5EXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkdBUF9DQVVTRURfU0VFS19UT19QRVJJT0RfRU5EID0gJ2dhcENhdXNlZFNlZWtUb1BlcmlvZEVuZCc7XG4gICAgfVxufVxuXG5sZXQgbWVkaWFQbGF5ZXJFdmVudHMgPSBuZXcgTWVkaWFQbGF5ZXJFdmVudHMoKTtcbmV4cG9ydCBkZWZhdWx0IG1lZGlhUGxheWVyRXZlbnRzO1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuLyoqXG4gKiBSZXByZXNlbnRzIGRhdGEgc3RydWN0dXJlIHRvIGtlZXAgYW5kIGRyaXZlIHtEYXRhQ2h1bmt9XG4gKi9cblxuaW1wb3J0IEZhY3RvcnlNYWtlciBmcm9tICcuLi8uLi9jb3JlL0ZhY3RvcnlNYWtlcic7XG5cbmZ1bmN0aW9uIEluaXRDYWNoZSgpIHtcblxuICAgIGxldCBkYXRhID0ge307XG5cbiAgICBmdW5jdGlvbiBzYXZlIChjaHVuaykge1xuICAgICAgICBjb25zdCBpZCA9IGNodW5rLnN0cmVhbUlkO1xuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbklkID0gY2h1bmsucmVwcmVzZW50YXRpb25JZDtcblxuICAgICAgICBkYXRhW2lkXSA9IGRhdGFbaWRdIHx8IHt9O1xuICAgICAgICBkYXRhW2lkXVtyZXByZXNlbnRhdGlvbklkXSA9IGNodW5rO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dHJhY3QgKHN0cmVhbUlkLCByZXByZXNlbnRhdGlvbklkKSB7XG4gICAgICAgIGlmIChkYXRhICYmIGRhdGFbc3RyZWFtSWRdICYmIGRhdGFbc3RyZWFtSWRdW3JlcHJlc2VudGF0aW9uSWRdKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YVtzdHJlYW1JZF1bcmVwcmVzZW50YXRpb25JZF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gcmVzZXQgKCkge1xuICAgICAgICBkYXRhID0ge307XG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFuY2UgPSB7XG4gICAgICAgIHNhdmU6IHNhdmUsXG4gICAgICAgIGV4dHJhY3Q6IGV4dHJhY3QsXG4gICAgICAgIHJlc2V0OiByZXNldFxuICAgIH07XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbkluaXRDYWNoZS5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnSW5pdENhY2hlJztcbmV4cG9ydCBkZWZhdWx0IEZhY3RvcnlNYWtlci5nZXRTaW5nbGV0b25GYWN0b3J5KEluaXRDYWNoZSk7XG4iLCIvKipcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXG4gKiBpbmNsdWRlZCBiZWxvdy4gVGhpcyBzb2Z0d2FyZSBtYXkgYmUgc3ViamVjdCB0byBvdGhlciB0aGlyZCBwYXJ0eSBhbmQgY29udHJpYnV0b3JcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLCBEYXNoIEluZHVzdHJ5IEZvcnVtLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gKiAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcbiAqICBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxuICogIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcbiAqICBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gKiAgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVFxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcbiAqICBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuLyoqXG4gKiBAY2xhc3NcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgRGFzaEpTRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKGNvZGUsIG1lc3NhZ2UsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5jb2RlID0gY29kZSB8fCBudWxsO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8IG51bGw7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGEgfHwgbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERhc2hKU0Vycm9yOyIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbi8qKlxuICogQGNsYXNzXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIERhdGFDaHVuayB7XG4gICAgLy9SZXByZXNlbnRzIGEgZGF0YSBzdHJ1Y3R1cmUgdGhhdCBrZWVwIGFsbCB0aGUgbmVjZXNzYXJ5IGluZm8gYWJvdXQgYSBzaW5nbGUgaW5pdC9tZWRpYSBzZWdtZW50XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuc3RyZWFtSWQgPSBudWxsO1xuICAgICAgICB0aGlzLm1lZGlhSW5mbyA9IG51bGw7XG4gICAgICAgIHRoaXMuc2VnbWVudFR5cGUgPSBudWxsO1xuICAgICAgICB0aGlzLnF1YWxpdHkgPSBOYU47XG4gICAgICAgIHRoaXMuaW5kZXggPSBOYU47XG4gICAgICAgIHRoaXMuYnl0ZXMgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gTmFOO1xuICAgICAgICB0aGlzLmVuZCA9IE5hTjtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IE5hTjtcbiAgICAgICAgdGhpcy5yZXByZXNlbnRhdGlvbklkID0gbnVsbDtcbiAgICAgICAgdGhpcy5lbmRGcmFnbWVudCA9IG51bGw7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEYXRhQ2h1bms7IiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuaW1wb3J0IHsgSFRUUFJlcXVlc3QgfSBmcm9tICcuLi92by9tZXRyaWNzL0hUVFBSZXF1ZXN0JztcblxuLyoqXG4gKiBAY2xhc3NcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgRnJhZ21lbnRSZXF1ZXN0IHtcbiAgICBjb25zdHJ1Y3Rvcih1cmwpIHtcbiAgICAgICAgdGhpcy5hY3Rpb24gPSBGcmFnbWVudFJlcXVlc3QuQUNUSU9OX0RPV05MT0FEO1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IE5hTjtcbiAgICAgICAgdGhpcy5tZWRpYVR5cGUgPSBudWxsO1xuICAgICAgICB0aGlzLm1lZGlhSW5mbyA9IG51bGw7XG4gICAgICAgIHRoaXMudHlwZSA9IG51bGw7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBOYU47XG4gICAgICAgIHRoaXMudGltZXNjYWxlID0gTmFOO1xuICAgICAgICB0aGlzLnJhbmdlID0gbnVsbDtcbiAgICAgICAgdGhpcy51cmwgPSB1cmwgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5zZXJ2aWNlTG9jYXRpb24gPSBudWxsO1xuICAgICAgICB0aGlzLnJlcXVlc3RTdGFydERhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLmZpcnN0Qnl0ZURhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLnJlcXVlc3RFbmREYXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gTmFOO1xuICAgICAgICB0aGlzLmluZGV4ID0gTmFOO1xuICAgICAgICB0aGlzLmF2YWlsYWJpbGl0eVN0YXJ0VGltZSA9IG51bGw7XG4gICAgICAgIHRoaXMuYXZhaWxhYmlsaXR5RW5kVGltZSA9IG51bGw7XG4gICAgICAgIHRoaXMud2FsbFN0YXJ0VGltZSA9IG51bGw7XG4gICAgICAgIHRoaXMuYnl0ZXNMb2FkZWQgPSBOYU47XG4gICAgICAgIHRoaXMuYnl0ZXNUb3RhbCA9IE5hTjtcbiAgICAgICAgdGhpcy5kZWxheUxvYWRpbmdUaW1lID0gTmFOO1xuICAgICAgICB0aGlzLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgICAgIHRoaXMucmVwcmVzZW50YXRpb25JZCA9IG51bGw7XG4gICAgfVxuXG4gICAgaXNJbml0aWFsaXphdGlvblJlcXVlc3QoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy50eXBlICYmIHRoaXMudHlwZSA9PT0gSFRUUFJlcXVlc3QuSU5JVF9TRUdNRU5UX1RZUEUpO1xuICAgIH1cblxuICAgIHNldEluZm8oaW5mbykge1xuICAgICAgICB0aGlzLnR5cGUgPSBpbmZvICYmIGluZm8uaW5pdCA/IEhUVFBSZXF1ZXN0LklOSVRfU0VHTUVOVF9UWVBFIDogSFRUUFJlcXVlc3QuTUVESUFfU0VHTUVOVF9UWVBFO1xuICAgICAgICB0aGlzLnVybCA9IGluZm8gJiYgaW5mby51cmwgPyBpbmZvLnVybCA6IG51bGw7XG4gICAgICAgIHRoaXMucmFuZ2UgPSBpbmZvICYmIGluZm8ucmFuZ2UgPyBpbmZvLnJhbmdlLnN0YXJ0ICsgJy0nICsgaW5mby5yYW5nZS5lbmQgOiBudWxsO1xuICAgICAgICB0aGlzLm1lZGlhVHlwZSA9IGluZm8gJiYgaW5mby5tZWRpYVR5cGUgPyBpbmZvLm1lZGlhVHlwZSA6IG51bGw7XG4gICAgfVxufVxuXG5GcmFnbWVudFJlcXVlc3QuQUNUSU9OX0RPV05MT0FEID0gJ2Rvd25sb2FkJztcbkZyYWdtZW50UmVxdWVzdC5BQ1RJT05fQ09NUExFVEUgPSAnY29tcGxldGUnO1xuXG5leHBvcnQgZGVmYXVsdCBGcmFnbWVudFJlcXVlc3Q7XG4iLCIvKipcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXG4gKiBpbmNsdWRlZCBiZWxvdy4gVGhpcyBzb2Z0d2FyZSBtYXkgYmUgc3ViamVjdCB0byBvdGhlciB0aGlyZCBwYXJ0eSBhbmQgY29udHJpYnV0b3JcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLCBEYXNoIEluZHVzdHJ5IEZvcnVtLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gKiAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcbiAqICBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxuICogIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcbiAqICBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gKiAgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVFxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcbiAqICBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuLyoqXG4gKiBAY2xhc3NkZXNjIFRoaXMgT2JqZWN0IGhvbGRzIHJlZmVyZW5jZSB0byB0aGUgSFRUUFJlcXVlc3QgZm9yIG1hbmlmZXN0LCBmcmFnbWVudCBhbmQgeGxpbmsgbG9hZGluZy5cbiAqIE1lbWJlcnMgd2hpY2ggYXJlIG5vdCBkZWZpbmVkIGluIElTTzIzMDA5LTEgQW5uZXggRCBzaG91bGQgYmUgcHJlZml4ZWQgYnkgYSBfIHNvIHRoYXQgdGhleSBhcmUgaWdub3JlZFxuICogYnkgTWV0cmljcyBSZXBvcnRpbmcgY29kZS5cbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgSFRUUFJlcXVlc3Qge1xuICAgIC8qKlxuICAgICAqIEBjbGFzc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogSWRlbnRpZmllciBvZiB0aGUgVENQIGNvbm5lY3Rpb24gb24gd2hpY2ggdGhlIEhUVFAgcmVxdWVzdCB3YXMgc2VudC5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50Y3BpZCA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGlzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciBhbmQgc2hvdWxkIG5vdCBiZSBpbmNsdWRlZCBpbiBIVFRQIHJlcXVlc3QvcmVzcG9uc2UgdHJhbnNhY3Rpb25zIGZvciBwcm9ncmVzc2l2ZSBkb3dubG9hZC5cbiAgICAgICAgICogVGhlIHR5cGUgb2YgdGhlIHJlcXVlc3Q6XG4gICAgICAgICAqIC0gTVBEXG4gICAgICAgICAqIC0gWExpbmsgZXhwYW5zaW9uXG4gICAgICAgICAqIC0gSW5pdGlhbGl6YXRpb24gRnJhZ21lbnRcbiAgICAgICAgICogLSBJbmRleCBGcmFnbWVudFxuICAgICAgICAgKiAtIE1lZGlhIEZyYWdtZW50XG4gICAgICAgICAqIC0gQml0c3RyZWFtIFN3aXRjaGluZyBGcmFnbWVudFxuICAgICAgICAgKiAtIG90aGVyXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudHlwZSA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgb3JpZ2luYWwgVVJMIChiZWZvcmUgYW55IHJlZGlyZWN0cyBvciBmYWlsdXJlcylcbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51cmwgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGFjdHVhbCBVUkwgcmVxdWVzdGVkLCBpZiBkaWZmZXJlbnQgZnJvbSBhYm92ZVxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFjdHVhbHVybCA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgY29udGVudHMgb2YgdGhlIGJ5dGUtcmFuZ2Utc3BlYyBwYXJ0IG9mIHRoZSBIVFRQIFJhbmdlIGhlYWRlci5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yYW5nZSA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFsLVRpbWUgfCBUaGUgcmVhbCB0aW1lIGF0IHdoaWNoIHRoZSByZXF1ZXN0IHdhcyBzZW50LlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRyZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWwtVGltZSB8IFRoZSByZWFsIHRpbWUgYXQgd2hpY2ggdGhlIGZpcnN0IGJ5dGUgb2YgdGhlIHJlc3BvbnNlIHdhcyByZWNlaXZlZC5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50cmVzcG9uc2UgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIEhUVFAgcmVzcG9uc2UgY29kZS5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZXNwb25zZWNvZGUgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGR1cmF0aW9uIG9mIHRoZSB0aHJvdWdocHV0IHRyYWNlIGludGVydmFscyAobXMpLCBmb3Igc3VjY2Vzc2Z1bCByZXF1ZXN0cyBvbmx5LlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRocm91Z2hwdXQgdHJhY2VzLCBmb3Igc3VjY2Vzc2Z1bCByZXF1ZXN0cyBvbmx5LlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRyYWNlID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFR5cGUgb2Ygc3RyZWFtIChcImF1ZGlvXCIgfCBcInZpZGVvXCIgZXRjLi4pXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0cmVhbSA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFsLVRpbWUgfCBUaGUgcmVhbCB0aW1lIGF0IHdoaWNoIHRoZSByZXF1ZXN0IGZpbmlzaGVkLlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl90ZmluaXNoID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBkdXJhdGlvbiBvZiB0aGUgbWVkaWEgcmVxdWVzdHMsIGlmIGF2YWlsYWJsZSwgaW4gbWlsbGlzZWNvbmRzLlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9tZWRpYWR1cmF0aW9uID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBtZWRpYSBzZWdtZW50IHF1YWxpdHlcbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcXVhbGl0eSA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhbGwgdGhlIHJlc3BvbnNlIGhlYWRlcnMgZnJvbSByZXF1ZXN0LlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yZXNwb25zZUhlYWRlcnMgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHNlbGVjdGVkIHNlcnZpY2UgbG9jYXRpb24gZm9yIHRoZSByZXF1ZXN0LiBzdHJpbmcuXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3NlcnZpY2VMb2NhdGlvbiA9IG51bGw7XG4gICAgfVxufVxuXG4vKipcbiAqIEBjbGFzc2Rlc2MgVGhpcyBPYmplY3QgaG9sZHMgcmVmZXJlbmNlIHRvIHRoZSBwcm9ncmVzcyBvZiB0aGUgSFRUUFJlcXVlc3QuXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIEhUVFBSZXF1ZXN0VHJhY2Uge1xuICAgIC8qKlxuICAgICogQGNsYXNzXG4gICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWwtVGltZSB8IE1lYXN1cmVtZW50IHN0cmVhbSBzdGFydC5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1lYXN1cmVtZW50IHN0cmVhbSBkdXJhdGlvbiAobXMpLlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmQgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogTGlzdCBvZiBpbnRlZ2VycyBjb3VudGluZyB0aGUgYnl0ZXMgcmVjZWl2ZWQgaW4gZWFjaCB0cmFjZSBpbnRlcnZhbCB3aXRoaW4gdGhlIG1lYXN1cmVtZW50IHN0cmVhbS5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5iID0gW107XG4gICAgfVxufVxuXG5IVFRQUmVxdWVzdC5HRVQgPSAnR0VUJztcbkhUVFBSZXF1ZXN0LkhFQUQgPSAnSEVBRCc7XG5IVFRQUmVxdWVzdC5NUERfVFlQRSA9ICdNUEQnO1xuSFRUUFJlcXVlc3QuWExJTktfRVhQQU5TSU9OX1RZUEUgPSAnWExpbmtFeHBhbnNpb24nO1xuSFRUUFJlcXVlc3QuSU5JVF9TRUdNRU5UX1RZUEUgPSAnSW5pdGlhbGl6YXRpb25TZWdtZW50JztcbkhUVFBSZXF1ZXN0LklOREVYX1NFR01FTlRfVFlQRSA9ICdJbmRleFNlZ21lbnQnO1xuSFRUUFJlcXVlc3QuTUVESUFfU0VHTUVOVF9UWVBFID0gJ01lZGlhU2VnbWVudCc7XG5IVFRQUmVxdWVzdC5CSVRTVFJFQU1fU1dJVENISU5HX1NFR01FTlRfVFlQRSA9ICdCaXRzdHJlYW1Td2l0Y2hpbmdTZWdtZW50JztcbkhUVFBSZXF1ZXN0Lk9USEVSX1RZUEUgPSAnb3RoZXInO1xuXG5leHBvcnQgeyBIVFRQUmVxdWVzdCwgSFRUUFJlcXVlc3RUcmFjZSB9O1xuIl19
