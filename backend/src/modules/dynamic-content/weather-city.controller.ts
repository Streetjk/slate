import { Controller, Get, Query } from '@nestjs/common';
import { RateLimit } from '../../common/rate-limit/rate-limit-guard';
import { WeatherProvider, type WeatherCitySearchResult } from './providers/weather.provider';
import { weatherCitySearchRateLimit } from './dynamic-rate-limits';
import { validateWeatherCityQuery } from './weather-city-query';

@Controller('dynamic')
export class WeatherCityController {
  constructor(private readonly weather: WeatherProvider) {}

  @RateLimit(weatherCitySearchRateLimit)
  @Get('weather/cities')
  async searchWeatherCities(
    @Query('q') query: string | undefined
  ): Promise<WeatherCitySearchResult[]> {
    const q = validateWeatherCityQuery(query);
    if (q.length < 1) return [];
    return this.weather.searchCities(q, 8);
  }
}
