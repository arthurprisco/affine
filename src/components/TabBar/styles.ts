import { StyleSheet } from 'react-native';
import { themes } from '../../global/themes';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: themes.colors.primary,
    height: 70,
    // Fazendo a barra flutuar
    position: 'absolute',
    bottom: 18,
    left: 12,
    right: 12,
    borderRadius: 20,
    // Sombra
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  }
});