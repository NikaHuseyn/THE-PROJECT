-- Support upserts used by edge functions and services
-- 1) fashion_trends: upsert on external_id
CREATE UNIQUE INDEX IF NOT EXISTS ux_fashion_trends_external_id
  ON public.fashion_trends (external_id);

-- 2) seasonal_forecasts: upsert on (season, year)
CREATE UNIQUE INDEX IF NOT EXISTS ux_seasonal_forecasts_season_year
  ON public.seasonal_forecasts (season, year);

-- 3) trend_predictions: upsert on trend_name
CREATE UNIQUE INDEX IF NOT EXISTS ux_trend_predictions_trend_name
  ON public.trend_predictions (trend_name);
