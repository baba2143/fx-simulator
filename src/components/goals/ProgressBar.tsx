import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#4CAF50',
  backgroundColor = '#333',
  height = 6,
  borderRadius = 3,
  animated = true,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, animatedValue]);

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
          borderRadius,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            height,
            backgroundColor: color,
            borderRadius,
            width: animated
              ? animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                })
              : `${progress}%`,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});