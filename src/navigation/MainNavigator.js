import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EncountersListScreen from '../screens/EncountersListScreen';
import NewEncounterScreen from '../screens/NewEncounterScreen';
import ScheduleEncounterScreen from '../screens/ScheduleEncounterScreen';
import EncounterDetailScreen from '../screens/EncounterDetailScreen';
import CatalystsScreen from '../screens/CatalystsScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();

export default function MainNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          letterSpacing: 0.5,
        },
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="EncountersList"
        component={EncountersListScreen}
        options={{ title: 'Encuentros' }}
      />
      <Stack.Screen
        name="NewEncounter"
        component={NewEncounterScreen}
        options={{ title: 'Nuevo Encuentro' }}
      />
      <Stack.Screen
        name="ScheduleEncounter"
        component={ScheduleEncounterScreen}
        options={{ title: 'Programar Encuentro' }}
      />
      <Stack.Screen
        name="EncounterDetail"
        component={EncounterDetailScreen}
        options={{ title: 'Detalles' }}
      />
      <Stack.Screen
        name="Catalysts"
        component={CatalystsScreen}
        options={{ title: 'Catalizadores' }}
      />
    </Stack.Navigator>
  );
}

