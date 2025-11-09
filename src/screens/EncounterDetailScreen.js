import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getEncounterById } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Ionicons } from '@expo/vector-icons';

export default function EncounterDetailScreen({ route }) {
  const theme = useTheme();
  const { encounterId } = route.params;
  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEncounter();
  }, []);

  const loadEncounter = async () => {
    try {
      const data = await getEncounterById(encounterId);
      setEncounter(data);
    } catch (error) {
      console.error('Error loading encounter:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!encounter) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.textMuted }]}>
          No se pudo cargar el encuentro
        </Text>
      </View>
    );
  }

  const formattedDate = format(new Date(encounter.fecha_encuentro), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });

  const DetailRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
        <View style={styles.detailContent}>
          <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>{label}</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>
        </View>
      </View>
    );
  };

  const DetailItem = ({ icon, label, value }) => {
    if (!value) return null;
    return (
      <View style={[styles.detailItem, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.detailItemIcon, { backgroundColor: theme.colors.primary + '15' }]}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.detailItemContent}>
          <Text style={[styles.detailItemLabel, { color: theme.colors.textMuted }]}>{label}</Text>
          <Text style={[styles.detailItemValue, { color: theme.colors.text }]} numberOfLines={2}>{value}</Text>
        </View>
      </View>
    );
  };

  const ScoreBadge = ({ label, value }) => (
    <View style={[styles.scoreBadge, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.scoreLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.scoreValue, { color: theme.colors.primary }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.aliasText, { color: theme.colors.primary }]}>
          {encounter.alias || 'Sin alias'}
        </Text>
        <View style={[styles.ratingBadge, { backgroundColor: theme.colors.primary + '20' }]}>
          <Text style={[styles.ratingText, { color: theme.colors.primary }]}>
            {encounter.rating_general ? parseFloat(encounter.rating_general).toFixed(1) : '0.0'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información General
        </Text>
        
        <DetailRow icon="calendar-outline" label="Fecha" value={formattedDate} />
        <DetailRow icon="time-outline" label="Duración" value={`${encounter.duracion_min} minutos`} />
        <DetailRow icon="location-outline" label="Lugar" value={encounter.lugar_encuentro} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Detalles Físicos
        </Text>
        
        <View style={styles.physicalDetailsGrid}>
          <DetailItem icon="resize-outline" label="Tamaño" value={encounter.tamano} />
          <DetailItem icon="shield-outline" label="Condón" value={encounter.condon} />
          <DetailItem icon="body-outline" label="Posiciones" value={encounter.posiciones} />
          <DetailItem icon="star-outline" label="Final" value={encounter.final} />
          <DetailItem icon="shirt-outline" label="Ropa/Lencería" value={encounter.ropa} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Calificaciones
        </Text>
        
        <View style={styles.scoresContainer}>
          <ScoreBadge label="Intensidad" value={encounter.score_toma_ruda} />
          <ScoreBadge label="Exposición Femenina" value={encounter.score_acento_ancla} />
          <ScoreBadge label="Inmersión" value={encounter.score_compart} />
        </View>
      </View>

      {encounter.notas_detalladas && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Notas Detalladas
          </Text>
          <View style={[styles.notesCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
              {encounter.notas_detalladas}
            </Text>
          </View>
        </View>
      )}
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
  contentContainer: {
    padding: 20,
  },
  headerCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aliasText: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.5,
    flex: 1,
  },
  ratingBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 24,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  physicalDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
  },
  detailItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailItemContent: {
    flex: 1,
  },
  detailItemLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  detailItemValue: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreBadge: {
    flex: 1,
    minWidth: '30%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  notesCard: {
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
  },
});

