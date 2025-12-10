import React from 'react';
import { Box, Heading, Text } from 'native-base';

export default function ProfileScreen() {
  return (
    <Box flex={1} bg="white" safeArea justifyContent="center" alignItems="center">
      <Heading>Profile</Heading>
      <Text>Manage your account settings</Text>
    </Box>
  );
}
