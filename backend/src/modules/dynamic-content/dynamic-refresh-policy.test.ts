import { describe, expect, it } from 'bun:test';
import {
  computeDynamicRefreshSchedule,
  computeErrorBackoffAt,
  dynamicSchedulePolicy,
} from './dynamic-refresh-policy';

describe('AI usage refresh scheduling', () => {
  it('honors the configured five-minute refresh interval', () => {
    const now = new Date('2026-09-25T00:00:00.000Z');
    expect(dynamicSchedulePolicy('ai_usage')).toBe('refresh_interval');
    const schedule = computeDynamicRefreshSchedule({
      dynamicType: 'ai_usage',
      config: { type: 'ai_usage', refresh_interval_sec: 300 },
      now,
      defaultTtlSec: 3600,
    });
    expect(schedule.nextRunAt?.toISOString()).toBe('2026-09-25T00:05:00.000Z');
    expect(schedule.refreshDueAt?.toISOString()).toBe('2026-09-25T00:05:00.000Z');
  });
});

describe('computeErrorBackoffAt', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');
  const delaySec = (attempts: number) =>
    (computeErrorBackoffAt(attempts, now).getTime() - now.getTime()) / 1000;

  it('returns a strictly future time for the first failure', () => {
    expect(computeErrorBackoffAt(1, now).getTime()).toBeGreaterThan(now.getTime());
  });

  it('doubles the delay per consecutive failure', () => {
    expect(delaySec(1)).toBe(60);
    expect(delaySec(2)).toBe(120);
    expect(delaySec(3)).toBe(240);
  });

  it('caps the delay at one hour', () => {
    expect(delaySec(10)).toBe(3600);
    expect(delaySec(100)).toBe(3600);
  });

  it('treats non-positive / fractional attempts as the first failure', () => {
    expect(delaySec(0)).toBe(60);
    expect(delaySec(-5)).toBe(60);
    expect(delaySec(1.9)).toBe(60);
  });

  it('treats non-finite attempts as the first failure (no Invalid Date)', () => {
    expect(delaySec(NaN)).toBe(60);
    expect(delaySec(undefined as unknown as number)).toBe(60);
    expect(Number.isNaN(computeErrorBackoffAt(NaN, now).getTime())).toBe(false);
  });
});
