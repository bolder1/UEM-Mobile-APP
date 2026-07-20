import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from './Chip';
import { space } from '../theme/spacing';

export interface FilterOption {
  key: string;
  label: string;
}

interface Props {
  options: FilterOption[];
  value: string;
  onChange: (key: string) => void;
}

/** Single-select filter row that sits directly under a SearchField.
 *  Labels can carry counts, e.g. "Updates · 1". */
export function FilterChips({ options, value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
    >
      {options.map((o) => (
        <Chip key={o.key} label={o.label} active={o.key === value} onPress={() => onChange(o.key)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // The vertical pad is only there so a pressed chip's 0.95 scale doesn't clip
  // against the scroller's edge — 4 is the smallest step that does the job.
  row: { gap: space[2], paddingVertical: space[1], paddingRight: space[3] },
});
