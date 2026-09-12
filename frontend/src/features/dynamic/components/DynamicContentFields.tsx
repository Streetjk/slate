import { isAudioDynamicConfig, type DynamicConfigT, type DynamicTypeT } from 'shared';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { FormSection } from '@/components/ui/FormSection';
import { Input } from '@/components/ui/Input';
import { DashboardConfigPanel } from '@/features/dynamic/components/config/DashboardConfig';
import { DynamicAudioSection } from './config/DynamicAudioSection';
import { DynamicRefreshSettings } from './config/RefreshSettings';
import { FontTestConfigPanel } from './config/FontTestConfig';
import { HistoryTodayConfigPanel } from './config/HistoryTodayConfig';
import { HotListConfigPanel } from './config/HotListConfig';
import { WeatherAlertConfigPanel } from './config/WeatherAlertConfig';
import { WeatherConfigPanel } from './config/WeatherConfig';
import { BtcPriceConfigPanel } from './config/BtcPriceConfig';
import { OutlookCalendarConfigPanel } from './config/OutlookCalendarConfig';
import { GoogleNewsConfigPanel } from './config/GoogleNewsConfig';

export function DynamicContentFields({
  type,
  config,
  frameName,
  onFrameNameChange,
  onConfigChange,
  showParams,
  showAudio,
  contentId,
  dashboardData,
  onDashboardDataChange,
  dashboardDataLabel,
  onCreateBtcTrio,
}: {
  type: DynamicTypeT;
  config: DynamicConfigT;
  frameName: string;
  onFrameNameChange: (value: string) => void;
  onConfigChange: (config: DynamicConfigT) => void;
  showParams: boolean;
  showAudio: boolean;
  contentId?: string;
  dashboardData?: Record<string, unknown> | null;
  onDashboardDataChange?: (data: Record<string, unknown>) => void;
  dashboardDataLabel?: string;
  onCreateBtcTrio?: () => void;
}) {
  return (
    <>
      {type === 'dashboard' && (
        <FormSection label="Frame name (optional, max 64 characters)">
          <Input
            type="text"
            maxLength={64}
            value={frameName}
            onChange={(event) => onFrameNameChange(event.target.value)}
            placeholder="e.g. AI usage statistics"
          />
        </FormSection>
      )}

      {showParams && (
        <FormSection label="Type parameters">
          <ErrorBoundary
            resetKey={`${config.type}:${contentId ?? ''}`}
            fallback={
              <p className="font-sans text-[12px] leading-relaxed text-clay">
                Configuration failed to load. Go back and try again.
              </p>
            }
          >
            <DynamicConfigFields
              config={config}
              onChange={onConfigChange}
              contentId={contentId}
              dashboardData={dashboardData ?? undefined}
              onDashboardDataChange={type === 'dashboard' ? onDashboardDataChange : undefined}
              dashboardDataLabel={dashboardDataLabel}
              onCreateBtcTrio={onCreateBtcTrio}
            />
          </ErrorBoundary>
        </FormSection>
      )}

      {showAudio && isAudioDynamicConfig(config) && (
        <FormSection label="Audio">
          <DynamicAudioSection config={config} onChange={onConfigChange} />
        </FormSection>
      )}
    </>
  );
}

function DynamicConfigFields({
  config,
  onChange,
  contentId,
  dashboardData,
  onDashboardDataChange,
  dashboardDataLabel,
  onCreateBtcTrio,
}: {
  config: DynamicConfigT;
  onChange: (config: DynamicConfigT) => void;
  contentId?: string;
  dashboardData?: Record<string, unknown>;
  onDashboardDataChange?: (data: Record<string, unknown>) => void;
  dashboardDataLabel?: string;
  onCreateBtcTrio?: () => void;
}) {
  switch (config.type) {
    case 'daily_calendar':
    case 'month_calendar':
      return null;
    case 'weather':
      return <WeatherConfigPanel config={config} onChange={onChange} />;
    case 'history_today':
      return <HistoryTodayConfigPanel config={config} onChange={onChange} />;
    case 'weather_alert':
      return <WeatherAlertConfigPanel config={config} onChange={onChange} />;
    case 'earthquake_report':
      return <DynamicRefreshSettings config={config} onChange={onChange} />;
    case 'btc_price':
      return (
        <BtcPriceConfigPanel
          config={config}
          onChange={onChange}
          onCreateBtcTrio={onCreateBtcTrio}
        />
      );
    case 'outlook_calendar':
      return <OutlookCalendarConfigPanel config={config} onChange={onChange} />;
    case 'google_news':
      return <GoogleNewsConfigPanel config={config} onChange={onChange} />;
    case 'dashboard':
      return (
        <DashboardConfigPanel
          config={config}
          onChange={onChange}
          contentId={contentId}
          dashboardData={dashboardData ?? {}}
          onDashboardDataChange={onDashboardDataChange}
          dataLabel={dashboardDataLabel}
        />
      );
    case 'font_test':
      return <FontTestConfigPanel config={config} onChange={onChange} />;
    case 'hot_list':
      return <HotListConfigPanel config={config} onChange={onChange} />;
  }
}
