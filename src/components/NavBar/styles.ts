import { StyleSheet } from 'react-native';
import { themes } from '../../global/themes';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: themes.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribui os itens (Esquerda, Centro, Direita)
    paddingHorizontal: 20,
    paddingBottom: 15,
    // A sombra para dar um destaque visual
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8, // Área de clique maior para o usuário não errar o dedo
    marginLeft: -8, // Compensa o padding para manter alinhado
  },
  spacer: {
    width: 40, // Mantém o título centralizado quando não houver botão
  }
});