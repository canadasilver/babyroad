'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import type { GrowthChartPoint, GrowthStandardSeries } from '@/lib/growth-report'

type GrowthTrendChartProps = {
  title: string
  description: string
  unit: string
  color: string
  points: GrowthChartPoint[]
  valueKey: 'height' | 'weight' | 'headCircumference'
  standardSeries?: GrowthStandardSeries | null
}

const STANDARD_LINE_COLOR = '#25344A'

function formatValue(value: number, unit: string) {
  const decimal = unit === 'kg' ? 2 : 1
  return `${value.toFixed(decimal)} ${unit}`
}

function getValue(point: GrowthChartPoint, key: GrowthTrendChartProps['valueKey']) {
  return point[key]
}

export default function GrowthTrendChart({
  title,
  description,
  unit,
  color,
  points,
  valueKey,
  standardSeries,
}: GrowthTrendChartProps) {
  const validPoints = points
    .map((point) => ({
      ...point,
      value: getValue(point, valueKey),
    }))
    .filter((point): point is GrowthChartPoint & { value: number } => point.value !== null)

  if (validPoints.length === 0) {
    return (
      <EmptyState
        title={`${title} 기록이 아직 없어요`}
        description="기록을 추가하면 이곳에서 추이를 확인할 수 있어요."
      />
    )
  }

  const standardMap = new Map<number, number | null>(
    (standardSeries?.points ?? []).map((point) => [point.ageMonth, point.p50])
  )

  const chartData = validPoints.map((point) => ({
    ...point,
    xLabel: point.ageMonth !== null ? `${point.ageMonth}개월` : point.dateLabel,
    p50: point.ageMonth !== null ? (standardMap.get(point.ageMonth) ?? null) : null,
  }))

  const showStandardLine = standardMap.size > 0 && chartData.some((d) => d.p50 !== null)

  const lastPoint = chartData[chartData.length - 1]

  return (
    <AppCard className="overflow-visible">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#25344A]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#6B7A90]">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#EAF6F2] px-3 py-1 text-xs font-semibold text-[#2F8F84]">
          {validPoints.length}개
        </span>
      </div>

      {showStandardLine && (
        <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-[#6B7A90]">
          <span className="flex items-center gap-1.5">
            <span className="block h-[3px] w-5 rounded-full" style={{ backgroundColor: color }} />
            우리 아이 기록
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="block h-[2px] w-5 rounded-full"
              style={{ backgroundColor: STANDARD_LINE_COLOR }}
            />
            또래 기준 50백분위
          </span>
        </div>
      )}

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 14, right: 14, bottom: 6, left: -10 }}>
            <CartesianGrid stroke="#EEF3EF" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="xLabel"
              tick={{ fill: '#8FA0B5', fontSize: 11 }}
              tickMargin={8}
              tickLine={false}
              axisLine={{ stroke: '#D9E6DF' }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: '#8FA0B5', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => Number(value).toFixed(unit === 'kg' ? 1 : 0)}
            />
            <Tooltip
              cursor={{ stroke: '#CFE3D8', strokeWidth: 2 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const point = payload[0].payload as (typeof chartData)[number]

                return (
                  <div className="rounded-2xl border border-[#E8EEE9] bg-white/95 px-3 py-2 text-xs shadow-[0_12px_30px_rgba(37,52,74,0.12)]">
                    <p className="font-semibold text-[#25344A]">{point.dateLabel}</p>
                    <p className="mt-1" style={{ color }}>
                      우리 아이: {formatValue(point.value, unit)}
                    </p>
                    {point.p50 !== null ? (
                      <p className="mt-0.5 text-[#25344A]">
                        또래 기준 50백분위: {formatValue(point.p50, unit)}
                      </p>
                    ) : null}
                    {point.ageMonth !== null ? (
                      <p className="mt-0.5 text-[#8FA0B5]">{point.ageMonth}개월 기록</p>
                    ) : null}
                  </div>
                )
              }}
            />
            {showStandardLine && (
              <Line
                type="monotone"
                dataKey="p50"
                stroke={STANDARD_LINE_COLOR}
                strokeWidth={2}
                strokeDasharray="6 5"
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
                name="또래 기준 50백분위"
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={4}
              dot={{ r: 4, strokeWidth: 3, fill: '#FFFDF8', stroke: color }}
              activeDot={{ r: 6, strokeWidth: 3, fill: '#FFFDF8', stroke: color }}
              isAnimationActive={false}
              name="우리 아이 기록"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-2xl bg-[#FFFDF8]/78 px-3 py-2">
        <p className="text-xs leading-5 text-[#6B7A90]">
          마지막 기록: {lastPoint.dateLabel} · {formatValue(lastPoint.value, unit)}
        </p>
      </div>
    </AppCard>
  )
}
