import { describe, expect, it } from 'bun:test';
import { ValidationError } from '../../common/errors';
import { validateWeatherCityQuery } from './weather-city-query';

describe('validateWeatherCityQuery', () => {
  it('reports an English validation error for an oversized query', () => {
    try {
      validateWeatherCityQuery('a'.repeat(33));
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toMatchObject({
        code: 'validation_error',
        httpStatus: 400,
        message: 'City search keyword must be 32 characters or fewer',
      } satisfies Partial<ValidationError>);
    }
  });
});
