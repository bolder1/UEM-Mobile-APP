import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from './Chip';

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
  row: { gap: 8, paddingVertical: 2, paddingRight: 12 },
});
