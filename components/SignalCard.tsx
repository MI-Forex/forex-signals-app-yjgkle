import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';

interface Signal {
  id: string;
  pair: string;
  type: string;
  entryPoint: number;
  stopLoss: number;
  takeProfit: number;
  notes?: string;
  status: 'active' | 'closed' | 'hit_tp' | 'hit_sl';
  createdAt: Date;
}

interface SignalCardProps {
  signal: Signal;
}

export default function SignalCard({ signal }: SignalCardProps) {
  const getStatusColor = () => {
    switch (signal.status) {
      case 'active':
        return colors.primary;
      case 'hit_tp':
        return colors.success;
      case 'hit_sl':
        return colors.error;
      case 'closed':
        return colors.textMuted;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = () => {
    switch (signal.status) {
      case 'active':
        return 'Active';
      case 'hit_tp':
        return 'Hit TP';
      case 'hit_sl':
        return 'Hit SL';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  const getTypeColor = () => {
    if (signal.type.includes('BUY')) {
      return colors.success;
    } else if (signal.type.includes('SELL')) {
      return colors.error;
    }
    return colors.primary;
  };

  const formatSignalType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pairContainer}>
          <Text style={styles.pair}>{signal.pair}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
            <Text style={styles.typeText}>{formatSignalType(signal.type)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Entry</Text>
          <Text style={styles.priceValue}>{signal.entryPoint.toFixed(5)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Stop Loss</Text>
          <Text style={[styles.priceValue, { color: colors.error }]}>
            {signal.stopLoss.toFixed(5)}
          </Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Take Profit</Text>
          <Text style={[styles.priceValue, { color: colors.success }]}>
            {signal.takeProfit.toFixed(5)}
          </Text>
        </View>
      </View>

      {signal.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{signal.notes}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.timestamp}>{formatTime(signal.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pairContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pair: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  notesContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});