import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createScheduledEncounter, getCatalysts } from '../services/api';
import PickerSelect from '../components/PickerSelect';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const LUGAR_ENCUENTRO_OPTIONS = [
  { label: 'Hotel', value: 'hotel' },
  { label: 'Mi casa', value: 'mi casa' },
  { label: 'Su casa', value: 'su casa' },
  { label: 'Coche', value: 'coche' },
  { label: 'Motel', value: 'motel' },
];

export default function ScheduleEncounterScreen({ navigation }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [catalysts, setCatalysts] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    catalyst_id: null,
    fecha_encuentro: new Date(),
    lugar_encuentro: '',
    notas: '',
  });

  useEffect(() => {
    loadCatalysts();
  }, []);

  const loadCatalysts = async () => {
    try {
      const data = await getCatalysts();
      const options = data.map(cat => ({
        label: cat.alias,
        value: cat.catalyst_id,
      }));
      setCatalysts(options);
    } catch (error) {
      console.error('Error loading catalysts:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.catalyst_id) {
      Alert.alert('Error', 'Por favor selecciona un Catalizador');
      return;
    }

    if (new Date(formData.fecha_encuentro) <= new Date()) {
      Alert.alert('Error', 'La fecha del encuentro debe ser futura');
      return;
    }

    try {
      setLoading(true);
      // Crear un encuentro programado
      const scheduledData = {
        catalyst_id: formData.catalyst_id,
        fecha_encuentro: formData.fecha_encuentro.toISOString(),
        lugar_encuentro: formData.lugar_encuentro || null,
        notas: formData.notas || null,
      };
      await createScheduledEncounter(scheduledData);
      Alert.alert('Éxito', 'Encuentro programado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error scheduling encounter:', error);
      Alert.alert('Error', 'No se pudo programar el encuentro');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Programar Encuentro
        </Text>

        <PickerSelect
          label="Catalizador"
          value={formData.catalyst_id}
          options={catalysts}
          onValueChange={(value) => setFormData({ ...formData, catalyst_id: value })}
          placeholder="Selecciona un catalizador"
        />

        <TouchableOpacity
          style={[styles.datePicker, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <View>
            <Text style={[styles.label, { color: theme.colors.text }]}>Fecha y Hora</Text>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {formatDate(formData.fecha_encuentro)}
            </Text>
          </View>
          <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.fecha_encuentro}
            mode="datetime"
            is24Hour={true}
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'ios') {
                setShowDatePicker(false);
              }
              if (event.type !== 'dismissed' && selectedDate) {
                setFormData({ ...formData, fecha_encuentro: selectedDate });
              }
              if (Platform.OS === 'android') {
                setShowDatePicker(false);
              }
            }}
          />
        )}

        <PickerSelect
          label="Lugar del Encuentro"
          value={formData.lugar_encuentro}
          options={LUGAR_ENCUENTRO_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, lugar_encuentro: value })}
          placeholder="Seleccionar lugar..."
        />

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Notas</Text>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }]}
            value={formData.notas}
            onChangeText={(text) => setFormData({ ...formData, notas: text })}
            multiline
            numberOfLines={4}
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Programar Encuentro</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  dateText: {
    fontSize: 16,
    marginTop: 4,
  },
  submitButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

