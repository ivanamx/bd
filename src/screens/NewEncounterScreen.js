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
import { createEncounter, updateEncounter, getEncounterById, getCatalysts } from '../services/api';
import RatingSlider from '../components/RatingSlider';
import PickerSelect from '../components/PickerSelect';
import MultiPickerSelect from '../components/MultiPickerSelect';
import AIAnalysisModal from '../components/AIAnalysisModal';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';

const TAMANO_OPTIONS = [
  { label: 'Pequeño', value: 'Pequeño' },
  { label: 'Mediano', value: 'Mediano' },
  { label: 'Grande', value: 'Grande' },
];

const CONDOM_OPTIONS = [
  { label: 'Sin condón', value: 'Sin condón' },
  { label: 'Normal', value: 'Normal' },
  { label: 'Calor', value: 'Calor' },
  { label: 'Textura', value: 'Textura' },
  { label: 'Sabor', value: 'Sabor' },
];

const LUGAR_ENCUENTRO_OPTIONS = [
  { label: 'Hotel', value: 'Hotel' },
  { label: 'Mi casa', value: 'Mi casa' },
  { label: 'Su casa', value: 'Su casa' },
  { label: 'Coche', value: 'Coche' },
  { label: 'Motel', value: 'Motel' },
];

const POSICIONES_OPTIONS = [
  { label: 'Misionero', value: 'Misionero' },
  { label: 'Perrito', value: 'Perrito' },
  { label: 'Cowgirl', value: 'Cowgirl' },
  { label: 'Cowgirl inversa', value: 'Cowgirl inversa' },
  { label: 'Cucharita', value: 'Cucharita' },
  { label: 'De pie', value: 'De pie' },
  { label: '69', value: '69' },
  { label: 'Sentado en la cara', value: 'Sentado en la cara' },
  { label: 'De lado', value: 'De lado' },
  { label: 'De rodillas', value: 'De rodillas' },
  { label: 'En el borde de la cama', value: 'En el borde de la cama' },
  { label: 'Prone bone', value: 'Prone bone' },
  { label: 'Lotus', value: 'Lotus' },
  { label: 'De espaldas con piernas arriba', value: 'De espaldas con piernas arriba' },
  { label: 'A cuatro patas', value: 'A cuatro patas' },
  { label: 'Contra la pared', value: 'Contra la pared' },
  { label: 'En la silla', value: 'En la silla' },
  { label: 'De lado con pierna arriba', value: 'De lado con pierna arriba' },
];

const FINAL_OPTIONS = [
  { label: 'Cara', value: 'Cara' },
  { label: 'Pecho', value: 'Pecho' },
  { label: 'Boca', value: 'Boca' },
  { label: 'Nalgas', value: 'Nalgas' },
  { label: 'Espalda', value: 'Espalda' },
  { label: 'Dentro', value: 'Dentro' },
];

const ROPA_OPTIONS = [
  { label: 'Liguero completo', value: 'Liguero completo' },
  { label: 'Tanga', value: 'Tanga' },
  { label: 'Medias', value: 'Medias' },
  { label: 'Hilo', value: 'Hilo' },
  { label: 'Panties', value: 'Panties' },
  { label: 'Suspensorio', value: 'Suspensorio' },
  { label: 'Boxer', value: 'Boxer' },
  { label: 'Body', value: 'Body' },
  { label: 'Corsé', value: 'Corsé' },
  { label: 'Body con abertura', value: 'Body con abertura' },
  { label: 'Medias de red', value: 'Medias de red' },
  { label: 'Tanga de encaje', value: 'Tanga de encaje' },
  { label: 'Bralette', value: 'Bralette' },
  { label: 'Top de encaje', value: 'Top de encaje' },
  { label: 'Bustier', value: 'Bustier' },
  { label: 'Babydoll', value: 'Babydoll' },
  { label: 'Chemise', value: 'Chemise' },
  { label: 'Medias hasta el muslo', value: 'Medias hasta el muslo' },
  { label: 'Sin ropa', value: 'Sin ropa' },
];

const ACCESORIOS_OPTIONS = [
  { label: 'Ninguno', value: 'Ninguno' },
  { label: 'Consolador', value: 'Consolador' },
  { label: 'Vibrador', value: 'Vibrador' },
  { label: 'Arnés', value: 'Arnés' },
  { label: 'Gag', value: 'Gag' },
  { label: 'Esposas', value: 'Esposas' },
  { label: 'Máscara', value: 'Máscara' },
  { label: 'Látigo', value: 'Látigo' },
  { label: 'Cuerdas', value: 'Cuerdas' },
  { label: 'Pinzas', value: 'Pinzas' },
  { label: 'Plugs anales', value: 'Plugs anales' },
  { label: 'Bolas chinas', value: 'Bolas chinas' },
  { label: 'Anillos', value: 'Anillos' },
  { label: 'Collar', value: 'Collar' },
  { label: 'Corsé', value: 'Corsé' },
  { label: 'Máscara de cuero', value: 'Máscara de cuero' },
  { label: 'Vendas', value: 'Vendas' },
  { label: 'Spreader bar', value: 'Spreader bar' },
  { label: 'Fustas', value: 'Fustas' },
  { label: 'Juguetes de silicona', value: 'Juguetes de silicona' },
  { label: 'Bondage tape', value: 'Bondage tape' },
];

export default function NewEncounterScreen({ navigation, route }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [catalysts, setCatalysts] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [encounterId, setEncounterId] = useState(null);
  
  const [formData, setFormData] = useState({
    catalyst_id: null,
    fecha_encuentro: new Date(),
    duracion_min: 60,
    lugar_encuentro: '',
    tamano: '',
    condon: '',
    posiciones: '',
    final: '',
    ropa: '',
    accesorios: '',
    score_toma_ruda: 5,
    score_acento_ancla: 5,
    score_compart: 5,
    score_oral_mio: 5,
    score_oral_suyo: 5,
    rating_general: 5.0,
    notas_detalladas: '',
  });

  useEffect(() => {
    loadCatalysts();
    
    // Verificar si estamos en modo edición
    if (route?.params?.encounterId && route?.params?.mode === 'edit') {
      setIsEditMode(true);
      setEncounterId(route.params.encounterId);
      loadEncounterForEdit(route.params.encounterId);
    }
  }, [route?.params]);

  const loadEncounterForEdit = async (id) => {
    try {
      setLoading(true);
      const encounter = await getEncounterById(id);
      
      // Convertir posiciones de string a array si es necesario
      let posiciones = encounter.posiciones || '';
      if (typeof posiciones === 'string' && posiciones.includes(',')) {
        posiciones = posiciones.split(',').map(p => p.trim()).join(',');
      }
      
      setFormData({
        catalyst_id: encounter.catalyst_id,
        fecha_encuentro: new Date(encounter.fecha_encuentro),
        duracion_min: encounter.duracion_min || 60,
        lugar_encuentro: encounter.lugar_encuentro || '',
        tamano: encounter.tamano || '',
        condon: encounter.condon || '',
        posiciones: posiciones,
        final: encounter.final || '',
        ropa: encounter.ropa || '',
        accesorios: encounter.accesorios || '',
        score_toma_ruda: encounter.score_toma_ruda || 5,
        score_acento_ancla: encounter.score_acento_ancla || 5,
        score_compart: encounter.score_compart || 5,
        score_oral_mio: encounter.score_oral_mio || 5,
        score_oral_suyo: encounter.score_oral_suyo || 5,
        rating_general: parseFloat(encounter.rating_general) || 5.0,
        notas_detalladas: encounter.notas_detalladas || '',
      });
    } catch (error) {
      console.error('Error loading encounter for edit:', error);
      Alert.alert('Error', 'No se pudo cargar el encuentro para editar');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si se debe abrir el modal de IA automáticamente
  useEffect(() => {
    const shouldOpenAI = route?.params?.openAI || false;
    if (shouldOpenAI) {
      // Esperar un momento para que el componente se monte completamente
      setTimeout(() => {
        if (!formData.catalyst_id) {
          Alert.alert(
            'Análisis IA',
            'Por favor selecciona un Top primero para ver el análisis de IA',
            [{ text: 'OK' }]
          );
        } else {
          setShowAIModal(true);
        }
      }, 500);
    }
  }, [route?.params?.openAI, formData.catalyst_id]);

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
      Alert.alert('Error', 'Por favor selecciona un Top');
      return;
    }
    if (!formData.tamano) {
      Alert.alert('Error', 'Por favor selecciona el tamaño');
      return;
    }
    if (!formData.condon) {
      Alert.alert('Error', 'Por favor selecciona el tipo de condón');
      return;
    }

    try {
      setLoading(true);
      const encounterData = {
        ...formData,
        fecha_encuentro: formData.fecha_encuentro.toISOString(),
      };
      
      if (isEditMode) {
        await updateEncounter(encounterId, encounterData);
        Alert.alert('Éxito', 'Encuentro actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await createEncounter(encounterData);
        Alert.alert('Éxito', 'Encuentro registrado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error saving encounter:', error);
      Alert.alert('Error', isEditMode ? 'No se pudo actualizar el encuentro' : 'No se pudo registrar el encuentro');
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

  const handleOpenAIModal = () => {
    if (!formData.catalyst_id) {
      Alert.alert('Error', 'Por favor selecciona un Top primero para ver el análisis');
      return;
    }
    setShowAIModal(true);
  };

  const handleCloseAIModal = () => {
    setShowAIModal(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información Básica
        </Text>

        <PickerSelect
          label="Top"
          value={formData.catalyst_id}
          options={catalysts}
          onValueChange={(value) => setFormData({ ...formData, catalyst_id: value })}
          placeholder="Selecciona uno de tus tops"
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

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Duración (minutos)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }]}
            value={formData.duracion_min.toString()}
            onChangeText={(text) => setFormData({ ...formData, duracion_min: parseInt(text) || 0 })}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <PickerSelect
          label="Lugar del Encuentro"
          value={formData.lugar_encuentro}
          options={LUGAR_ENCUENTRO_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, lugar_encuentro: value })}
          placeholder="Seleccionar lugar..."
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Detalles Físicos
        </Text>

        <PickerSelect
          label="Tamaño"
          value={formData.tamano}
          options={TAMANO_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, tamano: value })}
        />

        <PickerSelect
          label="Condón"
          value={formData.condon}
          options={CONDOM_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, condon: value })}
        />

        <MultiPickerSelect
          label="Posiciones"
          value={formData.posiciones}
          options={POSICIONES_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, posiciones: value })}
          placeholder="Seleccionar posiciones..."
        />

        <PickerSelect
          label="Final"
          value={formData.final}
          options={FINAL_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, final: value })}
          placeholder="Seleccionar final..."
        />

        <PickerSelect
          label="Ropa/Lencería"
          value={formData.ropa}
          options={ROPA_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, ropa: value })}
          placeholder="Seleccionar ropa/lencería..."
        />

        <PickerSelect
          label="Accesorios"
          value={formData.accesorios}
          options={ACCESORIOS_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, accesorios: value })}
          placeholder="Seleccionar accesorio..."
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Calificaciones
        </Text>

        <RatingSlider
          label="Intensidad"
          value={formData.score_toma_ruda}
          onValueChange={(value) => setFormData({ ...formData, score_toma_ruda: value })}
        />

        <RatingSlider
          label="Exposición Femenina"
          value={formData.score_acento_ancla}
          onValueChange={(value) => setFormData({ ...formData, score_acento_ancla: value })}
        />

        <RatingSlider
          label="Inmersión"
          value={formData.score_compart}
          onValueChange={(value) => setFormData({ ...formData, score_compart: value })}
        />

        <View style={styles.oralSection}>
          <Text style={[styles.oralSectionTitle, { color: theme.colors.text }]}>Oral</Text>
          
          <View style={styles.oralSlidersRow}>
            <View style={styles.oralSliderContainer}>
              <View style={styles.oralLabelContainer}>
                <Text style={[styles.oralLabel, { color: theme.colors.text }]}>Mi Oral</Text>
                <View style={[styles.oralValueBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.oralValueText, { color: theme.colors.primary }]}>
                    {Math.round(formData.score_oral_mio)}
                  </Text>
                </View>
              </View>
              <Slider
                style={styles.oralSlider}
                minimumValue={1}
                maximumValue={10}
                value={formData.score_oral_mio}
                onValueChange={(value) => setFormData({ ...formData, score_oral_mio: value })}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
                step={1}
              />
            </View>

            <View style={styles.oralSliderContainer}>
              <View style={styles.oralLabelContainer}>
                <Text style={[styles.oralLabel, { color: theme.colors.text }]}>Su Oral</Text>
                <View style={[styles.oralValueBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.oralValueText, { color: theme.colors.primary }]}>
                    {Math.round(formData.score_oral_suyo)}
                  </Text>
                </View>
              </View>
              <Slider
                style={styles.oralSlider}
                minimumValue={1}
                maximumValue={10}
                value={formData.score_oral_suyo}
                onValueChange={(value) => setFormData({ ...formData, score_oral_suyo: value })}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
                step={1}
              />
            </View>
          </View>
        </View>

        <RatingSlider
          label="Rating General"
          value={formData.rating_general}
          onValueChange={(value) => setFormData({ ...formData, rating_general: value })}
          min={0}
          max={10}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Notas Detalladas
        </Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          }]}
          value={formData.notas_detalladas}
          onChangeText={(text) => setFormData({ ...formData, notas_detalladas: text })}
          multiline
          numberOfLines={5}
        />
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
          <Text style={styles.submitButtonText}>
            {isEditMode ? 'Actualizar Encuentro' : 'Registrar Encuentro'}
          </Text>
        )}
      </TouchableOpacity>

      <AIAnalysisModal
        visible={showAIModal}
        onClose={handleCloseAIModal}
        formData={formData}
        catalystId={formData.catalyst_id}
      />
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
  oralSection: {
    marginVertical: 16,
    paddingTop: 8,
  },
  oralSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  oralSlidersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  oralSliderContainer: {
    flex: 1,
  },
  oralLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  oralLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  oralValueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 32,
    alignItems: 'center',
  },
  oralValueText: {
    fontSize: 14,
    fontWeight: '600',
  },
  oralSlider: {
    width: '100%',
    height: 32,
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
    marginTop: 16,
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

