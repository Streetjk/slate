import { ValidationError } from '../../common/errors';

export function validateWeatherCityQuery(query: string | undefined): string {
  const q = query?.trim() ?? '';
  if (q.length > 32) {
    throw new ValidationError('City search keyword must be 32 characters or fewer');
  }
  return q;
}
