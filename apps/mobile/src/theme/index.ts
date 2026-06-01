import React, { createContext, useContext, type PropsWithChildren } from 'react';
import { colors } from './colors';
import {
  layout,
  radius,
  shadows,
  spacing,
  textStyles,
  tokens,
  typography,
} from './tokens';
import {
  attendanceStatusMap,
  courseStatusMap,
  enrollmentStatusMap,
  getStatusBadgeConfig,
  paymentStatusMap,
  qrTicketStatusMap,
  registrationStatusMap,
  scannerResultStatusMap,
  statusBadgeMaps,
} from './status';

export const mobileTheme = {
  colors,
  ...tokens,
  status: statusBadgeMaps,
} as const;

export type MobileTheme = typeof mobileTheme;

const ThemeContext = createContext<MobileTheme>(mobileTheme);

export function ThemeProvider({ children }: PropsWithChildren) {
  return React.createElement(ThemeContext.Provider, { value: mobileTheme }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}

export {
  attendanceStatusMap,
  colors,
  courseStatusMap,
  enrollmentStatusMap,
  getStatusBadgeConfig,
  layout,
  paymentStatusMap,
  qrTicketStatusMap,
  radius,
  registrationStatusMap,
  scannerResultStatusMap,
  shadows,
  spacing,
  statusBadgeMaps,
  textStyles,
  tokens,
  typography,
};

export type { StatusBadgeConfig, StatusDomain, StatusTone } from './status';
export type { MobileColors } from './colors';
export type { MobileTokens } from './tokens';
