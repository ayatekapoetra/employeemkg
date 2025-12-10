import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye } from 'iconsax-react-native';

export default function DetailPenugasanCard({ 
  assignmentList, 
  onViewList, 
  isDark 
}) {
  const styles = getStyles(isDark);

  return (
    <View style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>Detail Penugasan</Text>
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={onViewList}
        >
          <Eye size={20} color="#f97316" variant="Bold" />
          {assignmentList.length > 0 && (
            <View style={styles.eyeBadge}>
              <Text style={styles.eyeBadgeText}>{assignmentList.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Operator/Driver</Text>
          <Text style={styles.detailValue}>{assignmentList.length} Orang</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Equipment DT</Text>
          <Text style={styles.detailValue}>
            {assignmentList.filter(a => a.equipmentKategori === 'DT').length} Unit
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Equipment HE</Text>
          <Text style={styles.detailValue}>
            {assignmentList.filter(a => a.equipmentKategori === 'HE').length} Unit
          </Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  detailCard: {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: isDark ? '#111827' : '#F8F9FA',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#000',
  },
  eyeButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: isDark ? '#374151' : '#fff5f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  eyeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  eyeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: isDark ? '#9ca3af' : '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#000',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: isDark ? '#374151' : '#E0E0E0',
  },
});
