import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getStatistics } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

const { width } = Dimensions.get('window');

const MetricCard = ({ icon, label, value, color, index, size = 'medium', theme }) => {
  const cardWidth = size === 'large' ? width - 32 : (width - 48) / 2;
  const iconSize = size === 'large' ? 40 : 32;
  const valueSize = size === 'large' ? 36 : 28;
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.metricCard,
        {
          width: cardWidth,
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: color + '40',
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.metricIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={iconSize} color={color} />
      </View>
      <Text style={[styles.metricValue, { color: theme.colors.text, fontSize: valueSize }]}>
        {value}
      </Text>
      <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>
        {label}
      </Text>
    </Animated.View>
  );
};

export default function StatisticsScreen({ navigation }) {
  const theme = useTheme();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadStatistics();
  }, []);

  useEffect(() => {
    if (!loading && statistics) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, statistics]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await getStatistics();
      if (data && data.general) {
        setStatistics(data);
      } else {
        console.error('Error: Datos de estadísticas inválidos', data);
        setStatistics(null);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      console.error('Error details:', error.message);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };


  const renderBarChart = (data, label, color, maxValue) => {
    if (!data || data.length === 0) return null;

    return (
      <Animated.View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.colors.surfaceElevated,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.chartHeader}>
          <Ionicons name="bar-chart" size={24} color={color} />
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{label}</Text>
        </View>
        <View style={styles.barChartContainer}>
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? (item.cantidad || item.veces) / maxValue : 0;
            const barWidth = (width - 80) * percentage;
            
            return (
              <View key={index} style={styles.barRow}>
                <View style={styles.barLabelContainer}>
                  <Text style={[styles.barLabel, { color: theme.colors.text }]}>
                    {item.rango || item.lugar || item.posiciones || item.alias}
                  </Text>
                  <Text style={[styles.barValue, { color: theme.colors.textMuted }]}>
                    {item.cantidad || item.veces}
                  </Text>
                </View>
                <View style={styles.barContainer}>
                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        width: barWidth,
                        backgroundColor: color,
                        opacity: fadeAnim,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  const renderLineChart = (data, label, color, maxValue) => {
    if (!data || data.length === 0) return null;

    const chartHeight = 160;
    const pointSize = 10;

    // Calcular posiciones de los puntos
    const points = data.map((item, index) => {
      const value = item.cantidad || item.veces;
      const percentage = maxValue > 0 ? value / maxValue : 0;
      const y = chartHeight - (percentage * (chartHeight - 40)) - 20;
      return { 
        value, 
        y,
        percentage,
        label: item.lugar || item.rango || item.posiciones || item.alias,
        index
      };
    });

    return (
      <Animated.View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.colors.surfaceElevated,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.chartHeader}>
          <Ionicons name="trending-up" size={24} color={color} />
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{label}</Text>
        </View>
        <View style={styles.lineChartContainer}>
          <View style={[styles.lineChart, { height: chartHeight }]}>
            {/* Líneas de conexión entre puntos */}
            {points.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = points[index - 1];
              const dx = (100 / (points.length - 1));
              const dy = prevPoint.y - point.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              
              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.lineConnection,
                    {
                      left: `${(index - 1) * (100 / (points.length - 1))}%`,
                      top: prevPoint.y,
                      width: `${100 / (points.length - 1)}%`,
                      height: 2,
                      backgroundColor: color + 'CC',
                      transform: [{ rotate: `${angle}deg` }],
                      transformOrigin: '0 50%',
                    },
                  ]}
                />
              );
            })}
            
            {/* Puntos */}
            {points.map((point, index) => (
              <View
                key={`point-${index}`}
                style={[
                  styles.lineChartPoint,
                  {
                    left: `${index * (100 / (points.length - 1 || 1))}%`,
                    top: point.y - pointSize / 2,
                    width: pointSize,
                    height: pointSize,
                    borderRadius: pointSize / 2,
                    backgroundColor: color,
                    borderColor: theme.colors.surfaceElevated,
                    borderWidth: 2,
                  },
                ]}
              />
            ))}
            
            {/* Etiquetas */}
            <View style={styles.lineChartLabels}>
              {points.map((point, index) => (
                <View
                  key={`label-${index}`}
                  style={[
                    styles.lineChartLabel,
                    {
                      left: `${index * (100 / (points.length - 1 || 1))}%`,
                      marginLeft: -35,
                      width: 70,
                    },
                  ]}
                >
                  <Text
                    style={[styles.lineChartLabelText, { color: theme.colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {point.label.length > 8 ? point.label.substring(0, 8) + '...' : point.label}
                  </Text>
                  <Text style={[styles.lineChartValueText, { color: color }]}>
                    {point.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderPieChart = (data, label, colors) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + (item.veces || item.cantidad), 0);
    let currentAngle = 0;

    return (
      <Animated.View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.colors.surfaceElevated,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.chartHeader}>
          <Ionicons name="pie-chart" size={24} color={colors[0]} />
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{label}</Text>
        </View>
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChart}>
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.veces || item.cantidad) / total : 0;
              const angle = percentage * 360;
              const color = colors[index % colors.length];
              
              return (
                <View
                  key={index}
                  style={[
                    styles.pieSegment,
                    {
                      backgroundColor: color + '30',
                      borderColor: color,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View style={styles.pieSegmentContent}>
                    <View style={[styles.pieColorDot, { backgroundColor: color }]} />
                    <Text style={[styles.pieLabel, { color: theme.colors.text }]}>
                      {item.posiciones || item.lugar}
                    </Text>
                    <Text style={[styles.piePercentage, { color: theme.colors.textMuted }]}>
                      {Math.round(percentage * 100)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderTopList = (data, label, icon, color) => {
    if (!data || data.length === 0) return null;

    return (
      <Animated.View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.colors.surfaceElevated,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.chartHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{label}</Text>
        </View>
        {data.map((item, index) => {
          const barWidth = ((item.total_encuentros || item.rating_promedio) / 
            Math.max(...data.map(d => d.total_encuentros || d.rating_promedio))) * (width - 80);
          
          return (
            <View key={index} style={styles.topListItem}>
              <View style={styles.topListHeader}>
                <View style={[styles.topListRank, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.topListRankText, { color: color }]}>
                    #{index + 1}
                  </Text>
                </View>
                <View style={styles.topListInfo}>
                  <Text style={[styles.topListName, { color: theme.colors.text }]}>
                    {item.alias}
                  </Text>
                  <View style={styles.topListStats}>
                    <Text style={[styles.topListStat, { color: theme.colors.textMuted }]}>
                      {item.total_encuentros ? `${item.total_encuentros} encuentros` : ''}
                    </Text>
                    {item.rating_promedio && (
                      <Text style={[styles.topListRating, { color: color }]}>
                        ⭐ {item.rating_promedio}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              {item.total_encuentros && (
                <View style={styles.topListBarContainer}>
                  <Animated.View
                    style={[
                      styles.topListBar,
                      {
                        width: barWidth,
                        backgroundColor: color,
                        opacity: fadeAnim,
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          );
        })}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
          Cargando estadísticas...
        </Text>
      </View>
    );
  }

  if (!statistics) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="stats-chart-outline" size={64} color={theme.colors.textMuted} />
        <Text style={[styles.errorText, { color: theme.colors.textMuted }]}>
          No se pudieron cargar las estadísticas
        </Text>
      </View>
    );
  }

  const maxLugares = Math.max(...(statistics.topLugares?.map(l => l.veces) || [0]));
  const maxMonthly = Math.max(...(statistics.monthlyActivity?.map(m => m.cantidad) || [0]));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header con título */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerIconContainer}>
          <Ionicons name="stats-chart" size={48} color={theme.colors.primary} />
        </View>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Estadísticas
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textMuted }]}>
          Análisis completo de tus encuentros
        </Text>
      </Animated.View>

      {/* Métricas principales */}
      <View style={styles.metricsContainer}>
        <MetricCard
          icon="people"
          label="Total Tops"
          value={statistics.general.total_tops}
          color="#d4a5c7"
          index={0}
          size="large"
          theme={theme}
        />
        <MetricCard
          icon="heart"
          label="Encuentros"
          value={statistics.general.total_encuentros}
          color="#ff6b9d"
          index={1}
          theme={theme}
        />
        <MetricCard
          icon="star"
          label="Rating Promedio"
          value={statistics.general.rating_promedio}
          color="#ffd93d"
          index={2}
          theme={theme}
        />
        <MetricCard
          icon="calendar"
          label="Este Mes"
          value={statistics.general.encuentros_este_mes}
          color="#6bcf7f"
          index={3}
          theme={theme}
        />
        <MetricCard
          icon="time"
          label="Duración Prom."
          value={`${statistics.general.duracion_promedio} min`}
          color="#4d96ff"
          index={4}
          theme={theme}
        />
      </View>

      {/* Top 5 Tops más frecuentes */}
      {renderTopList(
        statistics.topTops,
        'Top 5 Tops Más Frecuentes',
        'trophy',
        '#d4a5c7'
      )}

      {/* Lugares más frecuentes */}
      {renderLineChart(
        statistics.topLugares,
        'Lugares Más Frecuentes',
        '#6bcf7f',
        maxLugares
      )}

      {/* Posiciones más comunes */}
      {renderPieChart(
        statistics.topPosiciones,
        'Posiciones Más Comunes',
        ['#ff6b9d', '#4d96ff', '#ffd93d', '#6bcf7f', '#d4a5c7']
      )}

      {/* Actividad mensual */}
      {renderBarChart(
        statistics.monthlyActivity.reverse(),
        'Actividad Mensual (Últimos 12 Meses)',
        '#4d96ff',
        maxMonthly
      )}

      {/* Mejor encuentro */}
      {statistics.bestEncounter && (
        <Animated.View
          style={[
            styles.highlightCard,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: '#ffd93d',
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.highlightHeader}>
            <Ionicons name="medal" size={32} color="#ffd93d" />
            <Text style={[styles.highlightTitle, { color: theme.colors.text }]}>
              Mejor Encuentro
            </Text>
          </View>
          <View style={styles.highlightContent}>
            <Text style={[styles.highlightValue, { color: '#ffd93d' }]}>
              ⭐ {statistics.bestEncounter.rating}
            </Text>
            <Text style={[styles.highlightLabel, { color: theme.colors.text }]}>
              {statistics.bestEncounter.alias || 'Sin alias'}
            </Text>
            <Text style={[styles.highlightDate, { color: theme.colors.textMuted }]}>
              {format(new Date(statistics.bestEncounter.fecha), "d 'de' MMMM, yyyy", { locale: es })}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Estadísticas de programados */}
      <Animated.View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.colors.surfaceElevated,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.chartHeader}>
          <Ionicons name="calendar-check" size={24} color="#6bcf7f" />
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Encuentros Programados
          </Text>
        </View>
        <View style={styles.scheduledStats}>
          <View style={styles.scheduledStat}>
            <Text style={[styles.scheduledValue, { color: theme.colors.text }]}>
              {statistics.scheduled.total_programados}
            </Text>
            <Text style={[styles.scheduledLabel, { color: theme.colors.textMuted }]}>
              Total
            </Text>
          </View>
          <View style={styles.scheduledStat}>
            <Text style={[styles.scheduledValue, { color: '#6bcf7f' }]}>
              {statistics.scheduled.completados}
            </Text>
            <Text style={[styles.scheduledLabel, { color: theme.colors.textMuted }]}>
              Completados
            </Text>
          </View>
          <View style={styles.scheduledStat}>
            <Text style={[styles.scheduledValue, { color: '#ff6b9d' }]}>
              {statistics.scheduled.vencidos}
            </Text>
            <Text style={[styles.scheduledLabel, { color: theme.colors.textMuted }]}>
              Vencidos
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Rating promedio por top */}
      {renderTopList(
        statistics.ratingByTop,
        'Top 10 por Rating Promedio',
        'star',
        '#ffd93d'
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d4a5c720',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  metricCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 199, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  barChartContainer: {
    gap: 12,
  },
  barRow: {
    marginBottom: 12,
  },
  barLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  barValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  barContainer: {
    height: 24,
    backgroundColor: 'rgba(212, 165, 199, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 12,
  },
  lineChartContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  lineChart: {
    position: 'relative',
    width: '100%',
    paddingBottom: 50,
  },
  lineConnection: {
    position: 'absolute',
    transformOrigin: '0 50%',
  },
  lineChartPoint: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  lineChartLabels: {
    position: 'absolute',
    bottom: -45,
    width: '100%',
    height: 40,
  },
  lineChartLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  lineChartLabelText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  lineChartValueText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  pieChart: {
    width: '100%',
    gap: 12,
  },
  pieSegment: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  pieSegmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pieColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  piePercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  topListItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 165, 199, 0.1)',
  },
  topListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  topListRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topListRankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  topListInfo: {
    flex: 1,
  },
  topListName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  topListStats: {
    flexDirection: 'row',
    gap: 12,
  },
  topListStat: {
    fontSize: 12,
  },
  topListRating: {
    fontSize: 12,
    fontWeight: '600',
  },
  topListBarContainer: {
    height: 8,
    backgroundColor: 'rgba(212, 165, 199, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  topListBar: {
    height: '100%',
    borderRadius: 4,
  },
  highlightCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  highlightTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  highlightContent: {
    alignItems: 'center',
  },
  highlightValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  highlightLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightDate: {
    fontSize: 14,
  },
  scheduledStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  scheduledStat: {
    alignItems: 'center',
  },
  scheduledValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  scheduledLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

