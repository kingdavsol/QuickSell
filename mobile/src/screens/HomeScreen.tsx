import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Box, Heading, VStack } from 'native-base';

export default function HomeScreen() {
  return (
    <Box flex={1} bg="white" safeArea>
      <VStack space={4} p={4}>
        <Heading size="xl">QuickSell</Heading>
        <Text style={styles.subtitle}>Sell items quickly across multiple marketplaces</Text>
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
