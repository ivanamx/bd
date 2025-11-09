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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getEncounters, getScheduledEncounters, getCatalysts } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Ionicons } from '@expo/vector-icons';
import AIAnalysisModal from '../components/AIAnalysisModal';

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
  const [showAISelectorModal, setShowAISelectorModal] = useState(false);
  const [catalysts, setCatalysts] = useState([]);
  const [selectedCatalystId, setSelectedCatalystId] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('todos');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    loadEncounters();
    loadCatalysts();
  }, []);

  const loadCatalysts = async () => {
    try {
      const data = await getCatalysts();
      setCatalysts(data);
    } catch (error) {
      console.error('Error loading catalysts:', error);
    }
  };

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
  const allPastEncounters = encounters.sort((a, b) => 
    new Date(b.fecha_encuentro) - new Date(a.fecha_encuentro)
  );

  // Filtrar encuentros según el filtro seleccionado
  const getFilteredEncounters = () => {
    if (historyFilter === 'este-mes') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return allPastEncounters.filter(enc => 
        new Date(enc.fecha_encuentro) >= startOfMonth
      );
    }
    return allPastEncounters;
  };

  const pastEncounters = getFilteredEncounters();

  // Obtener etiqueta del filtro
  const getFilterLabel = () => {
    if (historyFilter === 'este-mes') return 'Este mes';
    return 'Todos';
  };
  
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Historial ({pastEncounters.length})
            </Text>
            <TouchableOpacity
              style={[styles.filterBadge, { 
                backgroundColor: historyFilter !== 'todos' 
                  ? theme.colors.primary + '20' 
                  : theme.colors.surface,
                borderColor: historyFilter !== 'todos' 
                  ? theme.colors.primary 
                  : theme.colors.border,
              }]}
              onPress={() => setShowFilterModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="filter" 
                size={16} 
                color={historyFilter !== 'todos' 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.filterBadgeText,
                { 
                  color: historyFilter !== 'todos' 
                    ? theme.colors.primary 
                    : theme.colors.textSecondary 
                }
              ]}>
                {getFilterLabel()}
              </Text>
            </TouchableOpacity>
          </View>
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
      
      {/* Botón flotante de IA */}
      <TouchableOpacity
        style={[styles.fabAI, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
        onPress={() => setShowAISelectorModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={28} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Botón flotante Agregar */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowMenuModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal de selector de Top para IA */}
      <Modal
        visible={showAISelectorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowAISelectorModal(false);
          setSearchQuery('');
          setSelectedCatalystId(null);
        }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity
            style={styles.aiSelectorOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowAISelectorModal(false);
              setSearchQuery('');
              setSelectedCatalystId(null);
            }}
          >
            <View 
              style={[styles.aiSelectorContent, { backgroundColor: theme.colors.surfaceElevated }]}
              onStartShouldSetResponder={() => true}
            >
            <View style={[styles.aiSelectorHeader, { borderBottomColor: theme.colors.border }]}>
              <Ionicons name="sparkles" size={24} color={theme.colors.primary} />
              <Text style={[styles.aiSelectorTitle, { color: theme.colors.text }]}>
                Selecciona un Top para Análisis IA
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAISelectorModal(false);
                  setSearchQuery('');
                  setSelectedCatalystId(null);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.searchInput, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              }]}
              placeholder="Buscar Top..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />

            <ScrollView style={styles.catalystList} keyboardShouldPersistTaps="handled">
              {/* Opción "Todos" */}
              {(!searchQuery || 'todos'.includes(searchQuery.toLowerCase())) && (
                <TouchableOpacity
                  style={[
                    styles.catalystOption,
                    styles.allOption,
                    {
                      backgroundColor: selectedCatalystId === 'all' 
                        ? theme.colors.primary + '20' 
                        : theme.colors.surface,
                      borderColor: selectedCatalystId === 'all' 
                        ? theme.colors.primary 
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => {
                    setSelectedCatalystId('all');
                    setShowAISelectorModal(false);
                    setSearchQuery('');
                    setShowAIModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.allOptionContent}>
                    <View style={styles.allOptionHeader}>
                      <Ionicons 
                        name="people" 
                        size={20} 
                        color={selectedCatalystId === 'all' 
                          ? theme.colors.primary 
                          : theme.colors.textSecondary} 
                      />
                      <Text style={[
                        styles.catalystOptionText,
                        { 
                          color: selectedCatalystId === 'all' 
                            ? theme.colors.primary 
                            : theme.colors.text 
                        }
                      ]}>
                        Todos
                      </Text>
                    </View>
                    <Text style={[styles.allOptionSubtext, { color: theme.colors.textMuted }]}>
                      Últimos 10 encuentros
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {catalysts
                .filter(cat => 
                  cat.alias.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((catalyst) => (
                  <TouchableOpacity
                    key={catalyst.catalyst_id}
                    style={[
                      styles.catalystOption,
                      {
                        backgroundColor: selectedCatalystId === catalyst.catalyst_id 
                          ? theme.colors.primary + '20' 
                          : theme.colors.surface,
                        borderColor: selectedCatalystId === catalyst.catalyst_id 
                          ? theme.colors.primary 
                          : theme.colors.border,
                      }
                    ]}
                    onPress={() => {
                      setSelectedCatalystId(catalyst.catalyst_id);
                      setShowAISelectorModal(false);
                      setSearchQuery('');
                      setShowAIModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="person" 
                      size={20} 
                      color={selectedCatalystId === catalyst.catalyst_id 
                        ? theme.colors.primary 
                        : theme.colors.textSecondary} 
                    />
                    <Text style={[
                      styles.catalystOptionText,
                      { 
                        color: selectedCatalystId === catalyst.catalyst_id 
                          ? theme.colors.primary 
                          : theme.colors.text 
                      }
                    ]}>
                      {catalyst.alias}
                    </Text>
                    {catalyst.rating_promedio && (
                      <Text style={[styles.catalystRating, { color: theme.colors.textMuted }]}>
                        ⭐ {parseFloat(catalyst.rating_promedio).toFixed(1)}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              {catalysts.filter(cat => 
                cat.alias.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && !searchQuery && (
                <View style={styles.emptyCatalystList}>
                  <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
                  <Text style={[styles.emptyCatalystText, { color: theme.colors.textMuted }]}>
                    No se encontraron tops
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de Análisis IA */}
      <AIAnalysisModal
        visible={showAIModal}
        onClose={() => {
          setShowAIModal(false);
          setSelectedCatalystId(null);
        }}
        formData={{}}
        catalystId={selectedCatalystId}
      />

      {/* Modal de filtro de historial */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.filterModalContent, { backgroundColor: theme.colors.surfaceElevated }]}>
            <View style={[styles.filterModalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.filterModalTitle, { color: theme.colors.text }]}>
                Filtrar Historial
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                {
                  backgroundColor: historyFilter === 'todos' 
                    ? theme.colors.primary + '20' 
                    : theme.colors.surface,
                  borderColor: historyFilter === 'todos' 
                    ? theme.colors.primary 
                    : theme.colors.border,
                }
              ]}
              onPress={() => {
                setHistoryFilter('todos');
                setShowFilterModal(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={historyFilter === 'todos' 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.filterOptionText,
                { 
                  color: historyFilter === 'todos' 
                    ? theme.colors.primary 
                    : theme.colors.text 
                }
              ]}>
                Todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                {
                  backgroundColor: historyFilter === 'este-mes' 
                    ? theme.colors.primary + '20' 
                    : theme.colors.surface,
                  borderColor: historyFilter === 'este-mes' 
                    ? theme.colors.primary 
                    : theme.colors.border,
                }
              ]}
              onPress={() => {
                setHistoryFilter('este-mes');
                setShowFilterModal(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="calendar" 
                size={20} 
                color={historyFilter === 'este-mes' 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.filterOptionText,
                { 
                  color: historyFilter === 'este-mes' 
                    ? theme.colors.primary 
                    : theme.colors.text 
                }
              ]}>
                Este mes
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  filterBadgeText: {
    fontSize: 14,
    fontWeight: '500',
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
  fabAI: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
  keyboardAvoidingView: {
    flex: 1,
  },
  aiSelectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
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
  aiSelectorContent: {
    marginHorizontal: 20,
    borderRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  aiSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    gap: 12,
  },
  aiSelectorTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  searchInput: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  catalystList: {
    maxHeight: 400,
  },
  catalystOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  allOption: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  allOptionContent: {
    width: '100%',
  },
  allOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  catalystOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  allOptionSubtext: {
    fontSize: 12,
    marginLeft: 32,
  },
  catalystRating: {
    fontSize: 14,
  },
  emptyCatalystList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCatalystText: {
    marginTop: 16,
    fontSize: 16,
  },
  filterModalContent: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

