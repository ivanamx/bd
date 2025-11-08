import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getEncounters, getScheduledEncounters } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Ionicons } from '@expo/vector-icons';

export default function EncountersListScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Catalysts')}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="people-outline" size={24} color="#d4a5c7" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  const theme = useTheme();
  const [encounters, setEncounters] = useState([]);
  const [scheduledEncounters, setScheduledEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

  useEffect(() => {
    loadEncounters();
  }, []);

  const loadEncounters = async () => {
    try {
      setLoading(true);
      // Cargar encuentros normales y programados
      const [encountersData, scheduledData] = await Promise.all([
        getEncounters(),
        getScheduledEncounters()
      ]);
      
      // Ordenar encuentros por fecha descendente
      const sorted = encountersData.sort((a, b) => 
        new Date(b.fecha_encuentro) - new Date(a.fecha_encuentro)
      );
      setEncounters(sorted);
      
      // Ordenar encuentros programados por fecha ascendente (más próximos primero)
      const sortedScheduled = scheduledData
        .filter(s => !s.completado) // Solo los no completados
        .sort((a, b) => new Date(a.fecha_encuentro) - new Date(b.fecha_encuentro));
      setScheduledEncounters(sortedScheduled);
    } catch (error) {
      console.error('Error loading encounters:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Separar encuentros:
  // - Los encuentros de la tabla "encounters" (creados con "Agregar") van al HISTORIAL
  // - Los encuentros de la tabla "scheduled_encounters" (creados con "Programar") van a PRÓXIMOS
  
  // Todos los encuentros de "encounters" van al historial (ordenados por fecha descendente)
  const pastEncounters = encounters.sort((a, b) => 
    new Date(b.fecha_encuentro) - new Date(a.fecha_encuentro)
  );
  
  // Todos los encuentros programados van a próximos (ordenados por fecha ascendente)
  const allUpcoming = scheduledEncounters.sort(
    (a, b) => new Date(a.fecha_encuentro) - new Date(b.fecha_encuentro)
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadEncounters();
  };

  // Función para renderizar iconos de tamaño
  const renderSizeIcons = (tamano) => {
    if (!tamano) return null;
    
    const sizes = [
      { label: 'Pequeño', height: 12, width: 4 },
      { label: 'Mediano', height: 18, width: 5 },
      { label: 'Grande', height: 24, width: 6 }
    ];
    
    return (
      <View style={styles.sizeIconsContainer}>
        {sizes.map((size, index) => {
          const isActive = size.label === tamano;
          return (
            <View
              key={index}
              style={[
                styles.sizeBar,
                {
                  height: size.height,
                  width: size.width,
                  backgroundColor: isActive 
                    ? theme.colors.primary 
                    : theme.colors.textMuted + '40',
                  borderRadius: size.width / 2,
                  marginRight: index < sizes.length - 1 ? 4 : 0,
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderEncounterItem = ({ item }) => {
    const formattedDate = format(new Date(item.fecha_encuentro), "d 'de' MMMM, yyyy", { locale: es });
    const isScheduled = !!item.scheduled_encounter_id;
    
    return (
      <TouchableOpacity
        style={[styles.encounterCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => {
          if (isScheduled) {
            // Los encuentros programados no tienen detalles completos aún
            return;
          }
          navigation.navigate('EncounterDetail', { encounterId: item.encounter_id });
        }}
        activeOpacity={0.7}
        disabled={isScheduled}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.aliasText, { color: theme.colors.primary }]}>
              {item.alias || 'Sin alias'}
            </Text>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {formattedDate}
            </Text>
          </View>
          {!isScheduled && (
            <View style={[styles.ratingBadge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.ratingText, { color: theme.colors.primary }]}>
                {item.rating_general ? parseFloat(item.rating_general).toFixed(1) : '0.0'}
              </Text>
            </View>
          )}
          {isScheduled && (
            <View style={[styles.scheduledBadge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.scheduledText, { color: theme.colors.primary }]}>
                Programado
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          {!isScheduled && item.tamano && renderSizeIcons(item.tamano)}
          {item.lugar_encuentro && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
              <Text style={[styles.locationText, { color: theme.colors.textMuted }]}>
                {item.lugar_encuentro}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && encounters.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Sección de Próximos Encuentros */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Próximos
          </Text>
          {allUpcoming.length > 0 ? (
            <View style={styles.sectionContent}>
              {allUpcoming.map((item) => (
                <View key={item.scheduled_encounter_id || item.encounter_id}>
                  {renderEncounterItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No hay próximos encuentros
              </Text>
            </View>
          )}
        </View>

        {/* Sección de Historial */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Historial
          </Text>
          {pastEncounters.length > 0 ? (
            <View style={styles.sectionContent}>
              {pastEncounters.map((item) => (
                <View key={item.encounter_id}>
                  {renderEncounterItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="time-outline" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No hay encuentros en el historial
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowMenuModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal de opciones */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={[styles.menuContent, { backgroundColor: theme.colors.surfaceElevated }]}>
            <TouchableOpacity
              style={[styles.menuOption, { borderBottomColor: theme.colors.border }]}
              onPress={() => {
                setShowMenuModal(false);
                navigation.navigate('NewEncounter');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.menuOptionText, { color: theme.colors.text }]}>
                Agregar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setShowMenuModal(false);
                navigation.navigate('ScheduleEncounter');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.menuOptionText, { color: theme.colors.text }]}>
                Programar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  sectionContent: {
    gap: 12,
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  encounterCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  aliasText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 14,
    marginTop: 4,
  },
  ratingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  scheduledText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sizeIconsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 24,
    gap: 4,
  },
  sizeBar: {
    alignSelf: 'flex-end',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  locationText: {
    fontSize: 13,
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  menuContent: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    gap: 16,
  },
  menuOptionText: {
    fontSize: 18,
    fontWeight: '500',
  },
});

