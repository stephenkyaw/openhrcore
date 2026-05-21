import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface RowProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Row({ children, style }: RowProps): React.ReactElement {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
