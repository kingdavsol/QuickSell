import React from 'react';
import { Box, Heading, Text } from 'native-base';

export default function ListingsScreen() {
  return (
    <Box flex={1} bg="white" safeArea justifyContent="center" alignItems="center">
      <Heading>My Listings</Heading>
      <Text>View your active listings</Text>
    </Box>
  );
}
