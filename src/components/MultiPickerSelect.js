import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function MultiPickerSelect({ label, value, options, onValueChange, placeholder = 'Seleccionar...' }) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Convertir el string de valores separados por comas a un array
  const selectedValues = value ? value.split(',').map(v => v.trim()).filter(v => v) : [];
  
  // Obtener las opciones seleccionadas
  const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));
  const selectedLabels = selectedOptions.map(opt => opt.label);

  const toggleOption = (optionValue) => {
    const currentValues = [...selectedValues];
    const index = currentValues.indexOf(optionValue);
    
    if (index > -1) {
      // Remover si ya está seleccionado
      currentValues.splice(index, 1);
    } else {
      // Agregar si no está seleccionado
      currentValues.push(optionValue);
    }
    
    // Convertir el array a string separado por comas
    onValueChange(currentValues.join(', '));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.picker, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.pickerText,
          { color: selectedLabels.length > 0 ? theme.colors.text : theme.colors.textMuted }
        ]}>
          {selectedLabels.length > 0 
            ? selectedLabels.join(', ') 
            : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surfaceElevated }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textMuted }]}>
              Selecciona una o más opciones
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = selectedValues.includes(item.value);
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && { backgroundColor: theme.colors.primary + '20' }
                    ]}
                    onPress={() => toggleOption(item.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <View style={[
                        styles.checkbox,
                        { borderColor: isSelected ? theme.colors.primary : theme.colors.border }
                      ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                        )}
                      </View>
                      <Text style={[
                        styles.optionText,
                        { color: isSelected ? theme.colors.primary : theme.colors.text }
                      ]}>
                        {item.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionItem: {
    marginBottom: 8,
    borderRadius: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  doneButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

