import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getAIAnalysis } from '../services/api';

export default function AIAnalysisModal({ visible, onClose, formData, catalystId }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('suggestion');
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && catalystId) {
      loadAnalysis();
    } else {
      setAnalysis(null);
      setActiveTab('suggestion');
      setProgress(0);
    }
  }, [visible, catalystId]);

  useEffect(() => {
    if (loading) {
      // Animar la barra de progreso
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // No pasar de 90% hasta que termine
          return prev + Math.random() * 15; // Incremento aleatorio para simular progreso
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loading]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setProgress(10);
      
      const data = await getAIAnalysis(catalystId, formData);
      
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300)); // Esperar un momento para mostrar 100%
      
      if (data && (data.suggestion || data.patterns || data.insights)) {
        setAnalysis(data);
      } else {
        Alert.alert('Info', 'No hay suficientes datos para generar un análisis. Necesitas al menos un encuentro registrado.');
      }
    } catch (error) {
      console.error('Error loading AI analysis:', error);
      Alert.alert('Error', error.message || 'No se pudo cargar el análisis de IA. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleApplySuggestions = (suggestions) => {
    if (suggestions && typeof onClose === 'function') {
      // El componente padre recibirá las sugerencias a través de un callback
      Alert.alert(
        'Aplicar Sugerencias',
        '¿Deseas aplicar estas sugerencias al formulario?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Aplicar',
            onPress: () => {
              // Las sugerencias se aplicarán desde el componente padre
              onClose(suggestions);
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const renderSuggestionTab = () => {
    if (!analysis?.suggestion) return null;

    const { suggestion } = analysis;
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Sugerencia de Próximo Encuentro
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {suggestion.summary || 'Basado en tu historial, aquí tienes recomendaciones personalizadas.'}
          </Text>
        </View>

        {suggestion.fecha_encuentro && (
          <View style={[styles.suggestionCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <View style={styles.suggestionContent}>
              <Text style={[styles.suggestionLabel, { color: theme.colors.textSecondary }]}>
                Fecha y Hora Recomendada
              </Text>
              <Text style={[styles.suggestionValue, { color: theme.colors.text }]}>
                {suggestion.fecha_encuentro}
              </Text>
            </View>
          </View>
        )}

        {suggestion.lugar_encuentro && (
          <View style={[styles.suggestionCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="location" size={24} color={theme.colors.primary} />
            <View style={styles.suggestionContent}>
              <Text style={[styles.suggestionLabel, { color: theme.colors.textSecondary }]}>
                Lugar Recomendado
              </Text>
              <Text style={[styles.suggestionValue, { color: theme.colors.text }]}>
                {suggestion.lugar_encuentro}
              </Text>
            </View>
          </View>
        )}

        {suggestion.posiciones && suggestion.posiciones.length > 0 && (
          <View style={[styles.suggestionCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="body" size={24} color={theme.colors.primary} />
            <View style={styles.suggestionContent}>
              <Text style={[styles.suggestionLabel, { color: theme.colors.textSecondary }]}>
                Posiciones Sugeridas
              </Text>
              <Text style={[styles.suggestionValue, { color: theme.colors.text }]}>
                {Array.isArray(suggestion.posiciones) 
                  ? suggestion.posiciones.join(', ')
                  : suggestion.posiciones}
              </Text>
            </View>
          </View>
        )}

        {suggestion.ropa && (
          <View style={[styles.suggestionCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="shirt" size={24} color={theme.colors.primary} />
            <View style={styles.suggestionContent}>
              <Text style={[styles.suggestionLabel, { color: theme.colors.textSecondary }]}>
                Ropa/Lencería Sugerida
              </Text>
              <Text style={[styles.suggestionValue, { color: theme.colors.text }]}>
                {suggestion.ropa}
              </Text>
            </View>
          </View>
        )}

        {suggestion.duracion_min && (
          <View style={[styles.suggestionCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="time" size={24} color={theme.colors.primary} />
            <View style={styles.suggestionContent}>
              <Text style={[styles.suggestionLabel, { color: theme.colors.textSecondary }]}>
                Duración Recomendada
              </Text>
              <Text style={[styles.suggestionValue, { color: theme.colors.text }]}>
                {suggestion.duracion_min} minutos
              </Text>
            </View>
          </View>
        )}

        {suggestion.recomendaciones && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Recomendaciones Adicionales
            </Text>
            <Text style={[styles.description, { color: theme.colors.text }]}>
              {suggestion.recomendaciones}
            </Text>
          </View>
        )}

        {suggestion.escenario && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Escenario Detallado
            </Text>
            <View style={[styles.escenarioCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.escenarioItem}>
                <Ionicons name="sunny" size={20} color={theme.colors.primary} />
                <View style={styles.escenarioContent}>
                  <Text style={[styles.escenarioLabel, { color: theme.colors.textSecondary }]}>
                    Ambiente
                  </Text>
                  <Text style={[styles.escenarioValue, { color: theme.colors.text }]}>
                    {suggestion.escenario.ambiente}
                  </Text>
                </View>
              </View>
              <View style={styles.escenarioItem}>
                <Ionicons name="bulb" size={20} color={theme.colors.primary} />
                <View style={styles.escenarioContent}>
                  <Text style={[styles.escenarioLabel, { color: theme.colors.textSecondary }]}>
                    Iluminación
                  </Text>
                  <Text style={[styles.escenarioValue, { color: theme.colors.text }]}>
                    {suggestion.escenario.iluminacion}
                  </Text>
                </View>
              </View>
              <View style={styles.escenarioItem}>
                <Ionicons name="musical-notes" size={20} color={theme.colors.primary} />
                <View style={styles.escenarioContent}>
                  <Text style={[styles.escenarioLabel, { color: theme.colors.textSecondary }]}>
                    Música
                  </Text>
                  <Text style={[styles.escenarioValue, { color: theme.colors.text }]}>
                    {suggestion.escenario.musica}
                  </Text>
                </View>
              </View>
              <View style={styles.escenarioItem}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <View style={styles.escenarioContent}>
                  <Text style={[styles.escenarioLabel, { color: theme.colors.textSecondary }]}>
                    Detalles
                  </Text>
                  <Text style={[styles.escenarioValue, { color: theme.colors.text }]}>
                    {suggestion.escenario.detalles}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {suggestion.bottomingTips && suggestion.bottomingTips.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Consejos de Bottoming
            </Text>
            <View style={[styles.bottomingCard, { backgroundColor: theme.colors.surface }]}>
              {suggestion.bottomingTips.map((tip, index) => (
                <View key={index} style={styles.bottomingTipItem}>
                  <View style={[styles.tipNumber, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={[styles.tipNumberText, { color: theme.colors.primary }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.tipText, { color: theme.colors.text }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleApplySuggestions(suggestion)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.applyButtonText}>Aplicar Sugerencias</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderPatternsTab = () => {
    if (!analysis?.patterns) return null;

    const { patterns } = analysis;
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Análisis de Patrones
          </Text>
        </View>

        {patterns.topPosiciones && patterns.topPosiciones.length > 0 && (
          <View style={[styles.patternCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.patternTitle, { color: theme.colors.text }]}>
              Posiciones Más Usadas
            </Text>
            {patterns.topPosiciones.map((pos, index) => (
              <View key={index} style={styles.patternItem}>
                <View style={[styles.rankBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.rankText, { color: theme.colors.primary }]}>
                    #{index + 1}
                  </Text>
                </View>
                <Text style={[styles.patternText, { color: theme.colors.text }]}>
                  {pos.nombre || pos}
                </Text>
                {pos.veces && (
                  <Text style={[styles.patternCount, { color: theme.colors.textSecondary }]}>
                    {pos.veces} veces
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {patterns.lugaresFrecuentes && patterns.lugaresFrecuentes.length > 0 && (
          <View style={[styles.patternCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.patternTitle, { color: theme.colors.text }]}>
              Lugares Más Frecuentes
            </Text>
            {patterns.lugaresFrecuentes.map((lugar, index) => (
              <View key={index} style={styles.patternItem}>
                <Ionicons name="location" size={16} color={theme.colors.primary} />
                <Text style={[styles.patternText, { color: theme.colors.text }]}>
                  {lugar.nombre || lugar}
                </Text>
                {lugar.veces && (
                  <Text style={[styles.patternCount, { color: theme.colors.textSecondary }]}>
                    {lugar.veces} veces
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {patterns.estadisticas && (
          <View style={[styles.patternCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.patternTitle, { color: theme.colors.text }]}>
              Estadísticas Generales
            </Text>
            {patterns.estadisticas.ratingPromedio && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Rating Promedio:
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {patterns.estadisticas.ratingPromedio.toFixed(1)}/10
                </Text>
              </View>
            )}
            {patterns.estadisticas.duracionPromedio && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Duración Promedio:
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {patterns.estadisticas.duracionPromedio} minutos
                </Text>
              </View>
            )}
            {patterns.estadisticas.totalEncuentros && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Total de Encuentros:
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {patterns.estadisticas.totalEncuentros}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderInsightsTab = () => {
    if (!analysis?.insights) return null;

    const { insights } = analysis;
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Insights y Curiosidades
          </Text>
        </View>

        {insights.map((insight, index) => (
          <View
            key={index}
            style={[styles.insightCard, { backgroundColor: theme.colors.surface }]}
          >
            <Ionicons name="bulb" size={24} color={theme.colors.primary} />
            <Text style={[styles.insightText, { color: theme.colors.text }]}>
              {insight}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (loading) {
      const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      });

      return (
        <View style={styles.loadingContainer}>
          <Ionicons name="sparkles" size={48} color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Analizando datos con IA...
          </Text>
          <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surface }]}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      );
    }

    if (!analysis) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="information-circle" size={48} color={theme.colors.textMuted} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Selecciona un Top para ver el análisis
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'suggestion' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('suggestion')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'suggestion' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              Sugerencia
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'patterns' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('patterns')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'patterns' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              Patrones
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'insights' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('insights')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'insights' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              Insights
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'suggestion' && renderSuggestionTab()}
        {activeTab === 'patterns' && renderPatternsTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="sparkles" size={28} color={theme.colors.primary} />
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                Análisis IA
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 24,
    marginBottom: 32,
    fontSize: 18,
    fontWeight: '500',
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  suggestionValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  patternCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  patternTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
  },
  patternText: {
    flex: 1,
    fontSize: 16,
  },
  patternCount: {
    fontSize: 14,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  escenarioCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  escenarioItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  escenarioContent: {
    flex: 1,
  },
  escenarioLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  escenarioValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  bottomingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  bottomingTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  tipNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});

