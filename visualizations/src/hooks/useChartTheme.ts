import { useMemo } from 'react';
import { useTheme } from '../theme';

export interface ChartThemeTokens {
  gridColor: string;
  axisColor: string;
  textColor: string;
  textMutedColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  textPrimary: string;
  textSecondary: string;

  // Semantic series colors (Direction A)
  primary: string;
  accent: string;
  methodology: string;
  searchCode: string;
  askUser: string;
  success: string;
  warning: string;
  secondarySeries: string;
  baselineSeries: string;

  fontSans: string;
  fontMono: string;

  // Ready-to-use ECharts option sub-objects
  axisLabelStyle: {
    color: string;
    fontSize: number;
    fontFamily: string;
  };
  axisLineStyle: {
    lineStyle: {
      color: string;
    };
  };
  splitLineStyle: {
    lineStyle: {
      color: string;
      type: 'dashed' | 'solid';
    };
  };
  tooltipConfig: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    padding: [number, number];
    textStyle: {
      color: string;
      fontSize: number;
      fontFamily: string;
    };
  };
  legendTextStyle: {
    color: string;
    fontSize: number;
    fontFamily: string;
  };
}

export function useChartTheme(): ChartThemeTokens {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return useMemo(() => {
    const gridColor = isDark ? '#292826' : '#E8E4DC';
    const axisColor = isDark ? '#55504A' : '#AFA69A';
    const textColor = isDark ? '#B5AFA5' : '#504C45';
    const textMutedColor = isDark ? '#8F887E' : '#756F65';
    const tooltipBg = isDark ? '#20201F' : '#FFFFFF';
    const tooltipBorder = isDark ? '#36332F' : '#DED8CD';
    const textPrimary = isDark ? '#ECE8E1' : '#211F1B';
    const textSecondary = isDark ? '#B5AFA5' : '#504C45';

    const primary = isDark ? '#91A7B1' : '#365464';
    const accent = isDark ? '#C07A54' : '#A25F3B';
    const methodology = isDark ? '#C29A5B' : '#86662E';
    const searchCode = isDark ? '#88A5B2' : '#365E72';
    const askUser = isDark ? '#D08A68' : '#98553A';
    const success = isDark ? '#6CA57E' : '#3D7354';
    const warning = isDark ? '#D9A74A' : '#996B26';
    const secondarySeries = isDark ? '#55504A' : '#AFA69A';
    const baselineSeries = isDark ? '#3D3B38' : '#DED8CD';

    const fontSans = '"Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const fontMono = '"JetBrains Mono", ui-monospace, "SF Mono", monospace';

    return {
      gridColor,
      axisColor,
      textColor,
      textMutedColor,
      tooltipBg,
      tooltipBorder,
      textPrimary,
      textSecondary,

      primary,
      accent,
      methodology,
      searchCode,
      askUser,
      success,
      warning,
      secondarySeries,
      baselineSeries,

      fontSans,
      fontMono,

      axisLabelStyle: {
        color: textColor,
        fontSize: 12,
        fontFamily: fontSans,
      },
      axisLineStyle: {
        lineStyle: {
          color: axisColor,
        },
      },
      splitLineStyle: {
        lineStyle: {
          color: gridColor,
          type: 'dashed' as const,
        },
      },
      tooltipConfig: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: [10, 14] as [number, number],
        textStyle: {
          color: textPrimary,
          fontSize: 13,
          fontFamily: fontSans,
        },
      },
      legendTextStyle: {
        color: textColor,
        fontSize: 12,
        fontFamily: fontSans,
      },
    };
  }, [isDark]);
}
