import React, { useEffect } from 'react';
import { Alert, VStack, HStack, Text, IconButton, CloseIcon } from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { hideAlert } from '../../store/slices/alertSlice';

const AlertCustom = () => {
  const dispatch = useDispatch();
  const { show, status, title, subtitle, duration } = useSelector(
    (state) => state.alert
  );

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        dispatch(hideAlert());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, dispatch]);

  if (!show) return null;

  return (
    <Alert
      w="90%"
      status={status}
      variant="solid"
      position="absolute"
      top={10}
      alignSelf="center"
      zIndex={9999}
    >
      <VStack space={2} flexShrink={1} w="100%">
        <HStack flexShrink={1} space={2} justifyContent="space-between">
          <HStack space={2} flexShrink={1}>
            <Alert.Icon mt="1" />
            <Text fontSize="md" color="white" fontFamily="Quicksand-Bold">
              {title}
            </Text>
          </HStack>
          <IconButton
            variant="unstyled"
            icon={<CloseIcon size="3" color="white" />}
            onPress={() => dispatch(hideAlert())}
          />
        </HStack>
        {subtitle && (
          <Text px="6" color="white" fontFamily="Poppins-Light">
            {subtitle}
          </Text>
        )}
      </VStack>
    </Alert>
  );
};

export default AlertCustom;
