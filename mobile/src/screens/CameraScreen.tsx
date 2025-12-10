import React from 'react';
import { Box, Heading, Text } from 'native-base';

export default function CameraScreen() {
  return (
    <Box flex={1} bg="white" safeArea justifyContent="center" alignItems="center">
      <Heading>Camera</Heading>
      <Text>Take photos to create listings</Text>
    </Box>
  );
}
