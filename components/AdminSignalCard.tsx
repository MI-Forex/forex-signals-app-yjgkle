import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import Button from './Button';

interface Signal {
  id: string;
  pair: string;
  type: string;
  entryPoint: number;
  stopLoss: number;
  takeProfit: number;
  notes?: string;
  status: 'active' | 'closed' | 'hit_tp' | 'hit_sl' | 'inprogress' | 'pending';
  createdAt: Date;
  signalId?: string;
  segment?: string;
  targetUsers?: 'normal' | 'vip';
}

interface AdminSignalCardProps {
  signal: Signal;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AdminSignalCard({ signal, onEdit, onDelete }: AdminSignalCardProps) {
  const getStatusColor = () => {
    switch (signal.status) {
      case 'active':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'inprogress':
        return colors.primary;
      case 'closed':
        return colors.textMuted;
      case 'hit_tp':
        return colors.success;
      case 'hit_sl':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = () => {
    switch (signal.status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'inprogress':
        return 'In Progress';
      case 'closed':
        return 'Closed';
      case 'hit_tp':
        return 'Hit TP';
      case 'hit_sl':
        return 'Hit SL';
      default:
        return signal.status || 'Unknown';
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

  const formatSegment = (segment?: string) => {
    if (!segment) return '';
    return segment.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

      {/* Signal ID and Segment */}
      <View style={styles.metaContainer}>
        {signal.signalId && (
          <Text style={styles.signalId}>ID: #{signal.signalId}</Text>
        )}
        {signal.segment && (
          <Text style={styles.segment}>{formatSegment(signal.segment)}</Text>
        )}
        {signal.targetUsers && (
          <Text style={[styles.targetUsers, { 
            color: signal.targetUsers === 'vip' ? colors.warning : colors.primary 
          }]}>
            {signal.targetUsers === 'vip' ? 'VIP' : 'Normal'}
          </Text>
        )}
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
        <View style={styles.buttonContainer}>
          <Button
            text="Edit"
            onPress={onEdit}
            variant="outline"
            style={styles.editButton}
          />
          <Button
            text="Delete"
            onPress={onDelete}
            variant="danger"
            style={styles.deleteButton}
          />
        </View>
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
    marginBottom: spacing.sm,
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
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  signalId: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  segment: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  targetUsers: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
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
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
});