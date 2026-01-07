import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
}

const App = (): React.JSX.Element => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get<HealthStatus>(`${API_BASE_URL}/api/health`);
      setHealth(response.data);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🧊 Tesseract</Text>
          <Text style={styles.subtitle}>
            The cosmic cube that controls your warehouse Space
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>System Status</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#667eea" />
            ) : health ? (
              <View style={styles.statusInfo}>
                <Text style={styles.statusText}>
                  <Text style={styles.label}>Status:</Text> {health.status}
                </Text>
                <Text style={styles.statusText}>
                  <Text style={styles.label}>Service:</Text> {health.service}
                </Text>
                <Text style={styles.statusText}>
                  <Text style={styles.label}>Time:</Text>{' '}
                  {new Date(health.timestamp).toLocaleString()}
                </Text>
              </View>
            ) : (
              <Text style={styles.error}>Unable to connect to backend</Text>
            )}
          </View>

          <View style={styles.features}>
            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureIcon}>📦</Text>
              <Text style={styles.featureTitle}>Orders</Text>
              <Text style={styles.featureDescription}>
                Manage warehouse orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureIcon}>📋</Text>
              <Text style={styles.featureTitle}>Products</Text>
              <Text style={styles.featureDescription}>
                Track inventory and products
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureTitle}>Users</Text>
              <Text style={styles.featureDescription}>
                User management system
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusInfo: {
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  error: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  features: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;
