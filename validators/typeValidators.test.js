const typeValidators = require('./typeValidators');

describe('typeValidators', () => {
  describe('text', () => {
    it('validates text correctly', () => {
      const textValidator = typeValidators['text'];
      expect(textValidator('test')).toBe(true);
      expect(textValidator(3)).toBe(false);
      expect(textValidator()).toBe(false);
      expect(textValidator({})).toBe(false);
      expect(textValidator(() => { })).toBe(false);
    });
  });

  describe('number', () => {
    it('validates number correctly', () => {
      const textValidator = typeValidators['number'];
      expect(textValidator(3)).toBe(true);
      expect(textValidator('test')).toBe(false);
      expect(textValidator()).toBe(false);
      expect(textValidator({})).toBe(false);
      expect(textValidator(() => {})).toBe(false);
    });
  });

  describe('date', () => {
    it('validates date correctly', () => {
      const dateValidator = typeValidators['date'];
      expect(dateValidator('2022-06-03T15:19:00.176Z')).toBe(true);
      expect(dateValidator('non-date string')).toBe(false);
      expect(dateValidator(3)).toBe(true);
      expect(dateValidator()).toBe(false);
      expect(dateValidator({})).toBe(false);
      expect(dateValidator(() => {})).toBe(false);
    });
  });

  describe('datetime-local', () => {
    it('validates datetime-local correctly', () => {
      const dateValidator = typeValidators['datetime-local'];
      expect(dateValidator('2022-06-03T15:19:00.176Z')).toBe(true);
      expect(dateValidator('non-date string')).toBe(false);
      expect(dateValidator(3)).toBe(true);
      expect(dateValidator()).toBe(false);
      expect(dateValidator({})).toBe(false);
      expect(dateValidator(() => {})).toBe(false);
    });
  });

  describe('month', () => {
    it('validates month correctly', () => {
      const monthValidator = typeValidators['month'];
      expect(monthValidator('2022-00')).toBe(false);
      expect(monthValidator('2022-01')).toBe(true);
      expect(monthValidator('2022-12')).toBe(true);
      expect(monthValidator('2022-13')).toBe(false);
      expect(monthValidator('non-month string')).toBe(false);
      expect(monthValidator(3)).toBe(false);
      expect(monthValidator()).toBe(false);
      expect(monthValidator({})).toBe(false);
      expect(monthValidator(() => {})).toBe(false);
    });
  });

  describe('email', () => {
    it('validates email correctly', () => {
      const emailValidator = typeValidators['email'];
      expect(emailValidator('form.validator@email.com')).toBe(true);
      expect(emailValidator('form@email.com')).toBe(true);
      expect(emailValidator('@email.com')).toBe(false);
      expect(emailValidator('email.com')).toBe(false);
      expect(emailValidator('')).toBe(false);
    });
  });

  describe('week', () => {
    it('validates week correctly', () => {
      const weekValidator = typeValidators['week'];
      expect(weekValidator('2022-W00')).toBe(false);
      expect(weekValidator('2022-W01')).toBe(true);
      expect(weekValidator('2022-W52')).toBe(true);
      expect(weekValidator('2022-W53')).toBe(false);
      expect(weekValidator('non-week string')).toBe(false);
      expect(weekValidator('')).toBe(false);
    });
  });

  describe('url', () => {
    it('validates url correctly', () => {
      const urlValidator = typeValidators['url'];
      expect(urlValidator('http://google.com')).toBe(true);
      expect(urlValidator('http://google.com?arg1=2&arg2=5')).toBe(true);
      expect(urlValidator('http://google.com#fragment?arg1=2&arg2=5')).toBe(true);
      expect(urlValidator('google.com')).toBe(false);
    });
  });

  describe('tel', () => {
    it('validates tel correctly', () => {
      const telValidator = typeValidators['tel'];
      expect(telValidator('string')).toBe(true);
      expect(telValidator(3)).toBe(false);
    });
  });

  describe('color', () => {
    it('validates color correctly', () => {
      const colorValidator = typeValidators['color'];
      expect(colorValidator('')).toBe(false);
      expect(colorValidator('123456')).toBe(false); // too short
      expect(colorValidator('1234567')).toBe(false); // correct length, incorrect format
      expect(colorValidator('12345678')).toBe(false); // too long
      
      expect(colorValidator('#123456')).toBe(true); // valid RGB string with only numbers
      expect(colorValidator('#c0ffee')).toBe(true); // valid alphanumeric RGB string
      expect(colorValidator('#ef14fg')).toBe(false); // invalid RGB string
    });
  });
});