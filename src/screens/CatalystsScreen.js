import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getCatalysts, createCatalyst } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import PickerSelect from '../components/PickerSelect';

const CUERPO_OPTIONS = [
  { label: 'Delgado', value: 'delgado' },
  { label: 'Atlético', value: 'atletico' },
  { label: 'Gordo', value: 'gordo' },
  { label: 'Promedio', value: 'promedio' },
  { label: 'Robusto', value: 'robusto' },
];

const CARA_OPTIONS = [
  { label: 'Guapo', value: 'guapo' },
  { label: 'Normal', value: 'normal' },
  { label: 'Feo', value: 'feo' },
];

export default function CatalystsScreen({ navigation }) {
  const theme = useTheme();
  const [catalysts, setCatalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [newCuerpo, setNewCuerpo] = useState('');
  const [newCara, setNewCara] = useState('');
  const [newEdad, setNewEdad] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCatalysts();
  }, []);

  const loadCatalysts = async () => {
    try {
      setLoading(true);
      const data = await getCatalysts();
      setCatalysts(data);
    } catch (error) {
      console.error('Error loading catalysts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCatalyst = async () => {
    if (!newAlias.trim()) {
      Alert.alert('Error', 'Por favor ingresa un alias');
      return;
    }

    try {
      setSubmitting(true);
      await createCatalyst({
        alias: newAlias.trim(),
        cuerpo: newCuerpo || null,
        cara: newCara || null,
        edad: newEdad.trim() || null,
      });
      setNewAlias('');
      setNewCuerpo('');
      setNewCara('');
      setNewEdad('');
      setShowAddForm(false);
      loadCatalysts();
      Alert.alert('Éxito', 'Catalizador creado correctamente');
    } catch (error) {
      console.error('Error creating catalyst:', error);
      const errorMessage = error.message || 'No se pudo crear el catalizador';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCatalystItem = ({ item }) => {
    const formattedDate = format(new Date(item.fecha_registro), "d 'de' MMMM, yyyy", { locale: es });

    return (
      <View style={[styles.catalystCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.aliasText, { color: theme.colors.primary }]}>
            {item.alias}
          </Text>
          <View style={[styles.ratingBadge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.ratingText, { color: theme.colors.primary }]}>
              {item.rating_promedio ? parseFloat(item.rating_promedio).toFixed(1) : '0.0'}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsRow}>
          {item.cuerpo && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Cuerpo:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>{item.cuerpo}</Text>
            </View>
          )}
          {item.cara && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Cara:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>{item.cara}</Text>
            </View>
          )}
          {item.edad && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Edad:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>{item.edad}</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
          Registrado: {formattedDate}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {showAddForm && (
        <View style={[styles.addForm, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>
            Nuevo Catalizador
          </Text>
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }]}
            placeholder="Alias"
            placeholderTextColor={theme.colors.textMuted}
            value={newAlias}
            onChangeText={setNewAlias}
          />
          
          <PickerSelect
            label="Cuerpo"
            value={newCuerpo}
            options={CUERPO_OPTIONS}
            onValueChange={setNewCuerpo}
            placeholder="Seleccionar cuerpo..."
          />
          
          <PickerSelect
            label="Cara"
            value={newCara}
            options={CARA_OPTIONS}
            onValueChange={setNewCara}
            placeholder="Seleccionar cara..."
          />
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }]}
            placeholder="Edad"
            placeholderTextColor={theme.colors.textMuted}
            value={newEdad}
            onChangeText={setNewEdad}
            keyboardType="numeric"
          />
          
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={() => {
                setShowAddForm(false);
                setNewAlias('');
                setNewCuerpo('');
                setNewCara('');
                setNewEdad('');
              }}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddCatalyst}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonTextWhite}>Crear</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={catalysts}
        renderItem={renderCatalystItem}
        keyExtractor={(item) => item.catalyst_id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              No hay catalizadores registrados
            </Text>
          </View>
        }
      />

      {!showAddForm && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddForm(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  catalystCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aliasText: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.3,
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
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
  },
  dateText: {
    fontSize: 12,
    marginTop: 8,
  },
  addForm: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextWhite: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

