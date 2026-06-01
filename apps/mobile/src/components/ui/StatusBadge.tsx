import React from 'react';
import { Badge } from './Badge';
import { getStatusBadgeConfig, type StatusDomain } from '../../theme';

export interface StatusBadgeProps {
  domain: StatusDomain;
  status: string;
  label?: string;
}

export function StatusBadge({ domain, status, label }: StatusBadgeProps) {
  const config = getStatusBadgeConfig(domain, status);

  return (
    <Badge
      label={label ?? config.label}
      foreground={config.foreground}
      background={config.background}
      border={config.border}
    />
  );
}
