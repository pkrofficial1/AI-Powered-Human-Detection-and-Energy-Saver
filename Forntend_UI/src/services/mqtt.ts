import mqtt from 'mqtt';

const MQTT_STORAGE_KEY = 'mqtt_config';

const getDefaultConfig = () => ({
  broker: 'Replace your Mqtt URL ',
  port: 8884,
  username: 'qwerty',
  password: 'Test@1234',
  protocol: 'wss',
});

const getMQTTConfig = () => {
  const savedConfig = localStorage.getItem(MQTT_STORAGE_KEY);
  return savedConfig ? JSON.parse(savedConfig) : getDefaultConfig();
};

class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private static instance: MQTTService;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting: boolean = false;
  private config: ReturnType<typeof getDefaultConfig>;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = getMQTTConfig();
    this.connect();
  }

  public static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }

  public updateConfig(newConfig: ReturnType<typeof getDefaultConfig>) {
    this.config = newConfig;
    localStorage.setItem(MQTT_STORAGE_KEY, JSON.stringify(newConfig));
    
    if (this.client?.connected) {
      this.client.end(true);
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.client = null;
    this.connectionPromise = null;
    this.isConnecting = false;
    
    this.connect();
  }

  public getConfig() {
    return { ...this.config };
  }

  private connect() {
    if (this.isConnecting || this.client?.connected) return;
    this.isConnecting = true;

    const options: mqtt.IClientOptions = {
      protocol: this.config.protocol as 'wss',
      hostname: this.config.broker,
      port: this.config.port,
      path: '/mqtt',
      rejectUnauthorized: false,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      clean: true,
    };

    if (this.config.username && this.config.password) {
      options.username = this.config.username;
      options.password = this.config.password;
    }

    const url = `${this.config.protocol}://${this.config.broker}:${this.config.port}/mqtt`;
    console.log('Connecting to MQTT broker:', url);
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(url, options);

        this.client.on('connect', () => {
          console.log('Connected to MQTT broker successfully');
          this.isConnecting = false;
          this.subscribeToTopics();
          resolve();
        });

        this.client.on('error', (error) => {
          console.error('MQTT connection error:', error);
          this.isConnecting = false;
          this.scheduleReconnect();
          reject(error);
        });

        this.client.on('close', () => {
          console.log('MQTT connection closed');
          this.isConnecting = false;
          this.scheduleReconnect();
        });

        this.client.on('reconnect', () => {
          console.log('Attempting to reconnect to MQTT broker...');
        });

        this.client.on('message', (topic, message) => {
          console.log(`Received message on topic ${topic}: ${message.toString()}`);
        });
      } catch (error) {
        console.error('Error creating MQTT client:', error);
        this.isConnecting = false;
        this.scheduleReconnect();
        reject(error);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  private async ensureConnection(): Promise<void> {
    if (this.client?.connected) return;
    
    if (!this.connectionPromise) {
      this.connect();
    }

    try {
      await this.connectionPromise;
    } catch (error) {
      console.error('Failed to establish MQTT connection:', error);
      throw error;
    }
  }

  private subscribeToTopics() {
    if (!this.client?.connected) return;
    
    const topics = ['#'];  // Subscribe to all topics
    topics.forEach(topic => {
      this.client!.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Error subscribing to topic ${topic}:`, err);
        } else {
          console.log(`Successfully subscribed to topic: ${topic}`);
        }
      });
    });
  }

  public async publishDeviceState(room: string, deviceName: string, state: string): Promise<void> {
    try {
      await this.ensureConnection();

      if (!this.client?.connected) {
        throw new Error('MQTT client not connected');
      }

      // Use room name as topic
      const topic = room.toLowerCase().replace(/\s+/g, '_');
      
      // Create message in format "device_name status"
      let message = `${deviceName} ${state}`;

      return new Promise<void>((resolve, reject) => {
        console.log(`Publishing to ${topic}: ${message}`);
        
        this.client!.publish(
          topic, 
          message,
          { 
            qos: 1,
            retain: false
          }, 
          (error) => {
            if (error) {
              console.error('Failed to publish message:', error);
              reject(error);
            } else {
              console.log(`Successfully published message to ${topic}`);
              resolve();
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in publishDeviceState:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.client?.connected || false;
  }
}

export const mqttService = MQTTService.getInstance();