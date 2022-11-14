// noinspection JSUnusedGlobalSymbols

const Decimal = require("decimal.js");
const ValidationResult = require("./validation-result");

const DEFAULT_MAX_DIGITS = 11;
const UC_CODE = "doubleNumber.";
const ERRORS = {
  NOT_A_DECIMAL_NUMBER: {
    code: `${UC_CODE}e001`,
    message: "The value is not a valid decimal number."
  },
  DIGITS_EXCEEDED: {
    code: `${UC_CODE}e002`,
    message: "The value exceeded maximum number of digits."
  },
  DECIMAL_PLACES_EXCEEDED: {
    code: `${UC_CODE}e003`,
    message: "The value exceeded maximum number of decimal places."
  }
}

/**
 * Matcher validates that string value represents a decimal number or null.
 * Decimal separator is always "."
 * In addition, it must comply to the rules described below.
 *
 * @param params - Matcher can take 0 to 2 parameters with following rules:
 * - no parameters: validates that number of digits does not exceed the maximum value of 11.
 * - one parameter: the parameter specifies maximum length of number for the above rule (parameter replaces the default value of 11)
 * - two parameters:
 *   -- first parameter represents the total maximum number of digits,
 *   -- the second parameter represents the maximum number of decimal places.
 *   -- both conditions must be met in this case.
 */
class DecimalNumberMatcher {
  constructor(...params) {
    this.params = params;
  }

  match(value) {
    const maxDigits = this.params[0];
    const maxDecimals = this.params[1];

    let validationResult = new ValidationResult();

    if (value) {
      let number = this.getNewDecimal(value, validationResult);
      if (number) {
        this.validateDigits(number, validationResult, maxDigits);
        this.validateDecimals(number, validationResult, maxDecimals);
      }
    }

    return validationResult;
  }

  getNewDecimal(value, validationResult) {
    let number = null;
    try {
      number = new Decimal(value);
    } catch (e) {
      validationResult.addInvalidTypeError(ERRORS.NOT_A_DECIMAL_NUMBER.code, ERRORS.NOT_A_DECIMAL_NUMBER.message);
    }
    return number;
  }

  validateDigits(number, validationResult, maxDigits = DEFAULT_MAX_DIGITS) {
    if (number.precision(true) > maxDigits) {
      validationResult.addInvalidTypeError(ERRORS.DIGITS_EXCEEDED.code, ERRORS.DIGITS_EXCEEDED.message);
    }
  }

  validateDecimals(number, validationResult, maxDecimals) {
    if (maxDecimals) {
      if (number.decimalPlaces() > maxDecimals) {
        validationResult.addInvalidTypeError(ERRORS.DECIMAL_PLACES_EXCEEDED.code, ERRORS.DECIMAL_PLACES_EXCEEDED.message);
      }
    }
  }
}

module.exports = DecimalNumberMatcher;
