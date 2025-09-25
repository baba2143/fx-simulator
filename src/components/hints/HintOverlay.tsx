import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import {
  setCurrentHint,
  markHintAsRead,
  markHintActionTaken,
  dismissHint,
  showNextHint,
} from '../../store/slices/hintSlice';
import { HintCard } from './HintCard';

const { width, height } = Dimensions.get('window');

interface HintOverlayProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export const HintOverlay: React.FC<HintOverlayProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const dispatch = useDispatch();
  const { currentHint, settings } = useSelector((state: RootState) => state.hints);
  const [slideAnim] = React.useState(new Animated.Value(height));

  React.useEffect(() => {
    if (visible && currentHint) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: height,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, currentHint, slideAnim]);

  const handleAction = async (hint: any) => {
    try {
      let success = false;

      if (hint.actionType === 'navigate' && onNavigate) {
        onNavigate(hint.actionData?.screen, hint.actionData);
        success = true;
      } else if (hint.actionType === 'external') {
        // 外部リンクの処理
        success = true;
      } else if (hint.actionType === 'modal') {
        // モーダル表示の処理
        success = true;
      }

      dispatch(markHintActionTaken({ hintId: hint.id, successful: success }));
      dispatch(markHintAsRead(hint.id));
      dispatch(setCurrentHint(null));
      onClose();

      // 次のヒントを表示
      if (settings.autoShow) {
        setTimeout(() => {
          dispatch(showNextHint());
        }, 1000);
      }
    } catch (error) {
      console.error('Error handling hint action:', error);
      dispatch(markHintActionTaken({ hintId: hint.id, successful: false }));
    }
  };

  const handleDismiss = (hintId: string) => {
    dispatch(dismissHint(hintId));
    dispatch(setCurrentHint(null));
    onClose();

    // 次のヒントを表示
    if (settings.autoShow) {
      setTimeout(() => {
        dispatch(showNextHint());
      }, 500);
    }
  };

  const handleRead = (hintId: string) => {
    dispatch(markHintAsRead(hintId));
  };

  const handleBackdropPress = () => {
    if (currentHint) {
      handleDismiss(currentHint.id);
    }
  };

  if (!currentHint) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => handleDismiss(currentHint.id)}
    >
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <Animated.View
            style={[
              styles.hintContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <HintCard
                hint={currentHint}
                onAction={handleAction}
                onDismiss={handleDismiss}
                onRead={handleRead}
                style={styles.hintCard}
              />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  hintContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  hintCard: {
    marginHorizontal: 0,
    marginVertical: 0,
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});