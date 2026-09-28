import type { ComponentType } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import RawReactEChartsCore from 'echarts-for-react/lib/core'
import type { EChartsReactProps } from 'echarts-for-react/lib/types'

echarts.use([
  BarChart,
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  SVGRenderer,
])

type ComponentModule = {
  readonly default?: unknown
}

function resolveEChartsComponent(
  componentOrModule: unknown
): ComponentType<EChartsReactProps> {
  let current: unknown = componentOrModule
  while (
    current !== null &&
    typeof current === 'object' &&
    'default' in current &&
    (current as ComponentModule).default !== undefined
  ) {
    current = (current as ComponentModule).default
  }
  if (typeof current === 'function') {
    return current as ComponentType<EChartsReactProps>
  }
  throw new Error('Failed to resolve valid ReactEChartsCore component')
}

export const ReactEChartsCore = resolveEChartsComponent(RawReactEChartsCore)

export { echarts }
export type { EChartsOption }
