import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function UpdateModal({
  visible,
  updateInfo,
  onUpdate,
  onLater,
}) {
  const mode = useSelector(state => state.themes?.value || 'dark');
  const isDark = mode === 'dark';

  console.log('🎨 UpdateModal render:', {
    visible,
    hasUpdateInfo: !!updateInfo,
    updateAvailable: updateInfo?.updateAvailable,
    forceUpdate: updateInfo?.forceUpdate,
  });

  if (!updateInfo) {
    console.log('⚠️ UpdateModal: No updateInfo, returning null');
    return null;
  }

  const {
    updateAvailable,
    currentVersion,
    forceUpdate,
    message,
    releaseNotes = [],
  } = updateInfo;

  if (!updateAvailable) {
    console.log('⚠️ UpdateModal: updateAvailable is false, returning null');
    return null;
  }

  console.log('✅ UpdateModal: Rendering modal with forceUpdate =', forceUpdate);

  // Theme colors based on mode - employeemkg style
  const backgroundColor = isDark ? COLORS.box.dark : COLORS.box.light;
  const textPrimary = isDark ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const textSecondary = isDark ? COLORS.teks.dark[2] : COLORS.teks.light[2];
  const textTertiary = isDark ? COLORS.teks.dark[3] : COLORS.teks.light[3];
  const borderColor = isDark ? COLORS.line.dark[1] : COLORS.line.light[1];
  const buttonBg = isDark ? COLORS.btn.dark.inactive : COLORS.btn.light.inactive;
  const iconBg = forceUpdate ? '#ef4444' : '#3b82f6';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={forceUpdate ? undefined : onLater}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor },
          ]}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: iconBg },
              ]}>
              <Ionicons
                name={forceUpdate ? 'alert-circle' : 'cloud-download'}
                size={48}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text
            style={[
              styles.title,
              { color: textPrimary },
            ]}>
            {forceUpdate ? 'Update Diperlukan' : 'Update Tersedia'}
          </Text>

          <Text
            style={[
              styles.version,
              { color: textSecondary },
            ]}>
            Versi {currentVersion}
          </Text>

          <Text
            style={[
              styles.message,
              { color: textPrimary },
            ]}>
            {message || 'Versi baru aplikasi telah tersedia di store.'}
          </Text>

          {releaseNotes.length > 0 && (
            <View style={styles.releaseNotesContainer}>
              <Text
                style={[
                  styles.releaseNotesTitle,
                  { color: textPrimary },
                ]}>
                Yang Baru:
              </Text>
              <ScrollView
                style={styles.releaseNotesList}
                showsVerticalScrollIndicator={false}>
                {releaseNotes.map((note, index) => (
                  <View key={index} style={styles.releaseNoteItem}>
                    <Text style={[styles.bulletPoint, { color: iconBg }]}>•</Text>
                    <Text
                      style={[
                        styles.releaseNoteText,
                        { color: textSecondary },
                      ]}>
                      {note}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.updateButton,
                { backgroundColor: iconBg },
              ]}
              onPress={onUpdate}>
              <Text style={styles.updateButtonText}>
                {forceUpdate ? 'Update Sekarang' : 'Update'}
              </Text>
            </TouchableOpacity>

            {!forceUpdate && (
              <TouchableOpacity
                style={[
                  styles.laterButton,
                  {
                    borderColor: borderColor,
                    backgroundColor: buttonBg,
                  },
                ]}
                onPress={onLater}>
                <Text
                  style={[
                    styles.laterButtonText,
                    { color: textPrimary },
                  ]}>
                  Nanti Saja
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {forceUpdate && (
            <Text
              style={[
                styles.forceUpdateNote,
                { color: textTertiary },
              ]}>
              Update ini diperlukan untuk melanjutkan menggunakan aplikasi
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  releaseNotesContainer: {
    marginBottom: 20,
  },
  releaseNotesTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
  },
  releaseNotesList: {
    maxHeight: 150,
  },
  releaseNoteItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    fontFamily: 'Poppins-Medium',
  },
  releaseNoteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  updateButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  laterButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  forceUpdateNote: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
