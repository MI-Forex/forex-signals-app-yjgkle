import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';

interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPoint: number;
  stopLoss: number;
  takeProfit: number;
  notes?: string;
  status: 'active' | 'closed' | 'hit_tp' | 'hit_sl';
  createdAt: Date;
}

interface AdminSignalCardProps {
  signal: Signal;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AdminSignalCard({ signal, onEdit, onDelete }: AdminSignalCardProps) {
  const getStatusColor = () => {
    switch (signal.status) {
      case 'hit_tp':
        return colors.success;
      case 'hit_sl':
        return colors.danger;
      case 'active':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = () => {
    switch (signal.status) {
      case 'hit_tp':
        return 'Take Profit Hit';
      case 'hit_sl':
        return 'Stop Loss Hit';
      case 'active':
        return 'Active';
      case 'closed':
        return 'Closed';
      default:
        return signal.status;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={[commonStyles.card, styles.signalCard]}>
      <View style={commonStyles.spaceBetween}>
        <View style={commonStyles.row}>
          <Text style={styles.pairText}>{signal.pair}</Text>
          <View style={[
            commonStyles.badge,
            signal.type === 'BUY' ? commonStyles.badgeSuccess : commonStyles.badgeDanger
          ]}>
            <Text style={commonStyles.badgeText}>{signal.type}</Text>
          </View>
        </View>
        <View style={[commonStyles.badge, { backgroundColor: getStatusColor() }]}>
          <Text style={commonStyles.badgeText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceItem}>
          <Text style={commonStyles.textMuted}>Entry Point</Text>
          <Text style={styles.priceText}>{signal.entryPoint.toFixed(5)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={commonStyles.textMuted}>Stop Loss</Text>
          <Text style={[styles.priceText, { color: colors.danger }]}>
            {signal.stopLoss.toFixed(5)}
          </Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={commonStyles.textMuted}>Take Profit</Text>
          <Text style={[styles.priceText, { color: colors.success }]}>
            {signal.takeProfit.toFixed(5)}
          </Text>
        </View>
      </View>

      {signal.notes && (
        <View style={styles.notesContainer}>
          <Text style={commonStyles.textMuted}>Notes:</Text>
          <Text style={commonStyles.text}>{signal.notes}</Text>
        </View>
      )}

      <Text style={[commonStyles.textMuted, { fontSize: 12, marginTop: spacing.sm }]}>
        {formatTime(signal.createdAt)}
      </Text>

      <View style={styles.actionButtons}>
        <Button
          text="Edit"
          onPress={onEdit}
          variant="secondary"
          style={{ flex: 1, marginRight: spacing.sm }}
        />
        <Button
          text="Delete"
          onPress={onDelete}
          variant="danger"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  signalCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  pairText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  notesContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});