import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token) {
      const hubUrl = import.meta.env.DEV ? "http://localhost:5229/notificationHub" : "/notificationHub";
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);
    } else if (connection) {
      connection.stop();
      setConnection(null);
    }
  }, [user]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to Notification Hub');
          
          connection.on('ReceiveNotification', (message) => {
            // Show toast when a notification is received
            addToast('Thông báo mới', message, 'info');
          });
        })
        .catch(e => console.log('Connection failed: ', e));
    }
  }, [connection, addToast]);

  return (
    <NotificationContext.Provider value={{ connection }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
