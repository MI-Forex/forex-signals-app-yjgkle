import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  signalId?: string;
  segment?: string;
}

interface SignalCardProps {
  signal: Signal;
}

export default function SignalCard({ signal }: SignalCardProps) {
  const [notesExpanded, setNotesExpanded] = useState(false);

  const getStatusColor = () => {
    switch (signal.status) {
      case 'active': return colors.success;
      case 'closed': return colors.textMuted;
      case 'hit_tp': return colors.success;
      case 'hit_sl': return colors.danger;
      default: return colors.textMuted;
    }
  };

  const getStatusText = () => {
    switch (signal.status) {
      case 'active': return 'Active';
      case 'closed': return 'Closed';
      case 'hit_tp': return 'Hit TP';
      case 'hit_sl': return 'Hit SL';
      default: return signal.status;
    }
  };

  const getTypeColor = () => {
    return signal.type.includes('BUY') ? colors.success : colors.danger;
  };

  const formatSignalType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDisplayNotes = () => {
    if (!signal.notes) return '';
    if (notesExpanded || signal.notes.length <= 100) {
      return signal.notes;
    }
    return signal.notes.substring(0, 100) + '...';
  };

  const shouldShowReadMore = () => {
    return signal.notes && signal.notes.length > 100;
  };

  const toggleNotesExpanded = () => {
    setNotesExpanded(!notesExpanded);
  };

  const formatSegment = (segment?: string) => {
    if (!segment) return '';
    return segment.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pair}>{signal.pair}</Text>
          {signal.signalId && (
            <Text style={styles.signalId}>#{signal.signalId}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <View style={StyleSheet.flatten([styles.statusBadge, { backgroundColor: getStatusColor() }])}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={StyleSheet.flatten([styles.typeBadge, { backgroundColor: getTypeColor() + '20' }])}>
            <Text style={StyleSheet.flatten([styles.typeText, { color: getTypeColor() }])}>
              {formatSignalType(signal.type)}
            </Text>
          </View>
          {signal.segment && (
            <View style={styles.segmentBadge}>
              <Text style={styles.segmentText}>{formatSegment(signal.segment)}</Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Entry</Text>
            <Text style={styles.priceValue}>{signal.entryPoint}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>SL</Text>
            <Text style={StyleSheet.flatten([styles.priceValue, { color: colors.danger }])}>{signal.stopLoss}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>TP</Text>
            <Text style={StyleSheet.flatten([styles.priceValue, { color: colors.success }])}>{signal.takeProfit}</Text>
          </View>
        </View>

        {signal.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{getDisplayNotes()}</Text>
            {shouldShowReadMore() && (
              <TouchableOpacity onPress={toggleNotesExpanded} style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>
                  {notesExpanded ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.timestamp}>{formatTime(signal.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  pair: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  signalId: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
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
  content: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  segmentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '20',
  },
  segmentText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  notesContainer: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
});