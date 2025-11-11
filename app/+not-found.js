import { Link, Stack } from 'expo-router';
import { VStack, Text, Button } from 'native-base';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <VStack flex={1} alignItems="center" justifyContent="center" p={5}>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Button>Go to home screen!</Button>
        </Link>
      </VStack>
    </>
  );
}
