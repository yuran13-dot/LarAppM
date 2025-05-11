import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: "25%",
    backgroundColor: '#f5f9ff',
  },

  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    height: 45,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  utenteItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  utenteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  utenteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  utenteQuarto: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  avatar: {
    marginRight: 12,
  },

  iconAction: {
    marginLeft: 12,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  
 
});
