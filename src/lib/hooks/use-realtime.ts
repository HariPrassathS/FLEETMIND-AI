'use client';

import { useState, useEffect } from 'react';
import { fleetMindStore } from '../db/store';
import { Shipment, Lorry, Driver, Trip, NotificationItem, Route } from '../optimization/types';
import { UserProfile } from '../../types/database';

/**
 * React hook that provides live, reactive shipments from Supabase & store.
 * Automatically re-renders whenever a Realtime WebSocket update or local mutation occurs.
 */
export function useRealtimeShipments(): Shipment[] {
  const [shipments, setShipments] = useState<Shipment[]>(fleetMindStore.getShipments());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setShipments(fleetMindStore.getShipments());
    });
    return unsub;
  }, []);

  return shipments;
}

/**
 * React hook that provides live, reactive vehicles from Supabase & store.
 */
export function useRealtimeVehicles(): Lorry[] {
  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setLorries(fleetMindStore.getLorries());
    });
    return unsub;
  }, []);

  return lorries;
}

/**
 * React hook that provides live, reactive drivers from Supabase & store.
 */
export function useRealtimeDrivers(): Driver[] {
  const [drivers, setDrivers] = useState<Driver[]>(fleetMindStore.getDrivers());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setDrivers(fleetMindStore.getDrivers());
    });
    return unsub;
  }, []);

  return drivers;
}

/**
 * React hook that provides live, reactive trips from Supabase & store.
 */
export function useRealtimeTrips(): Trip[] {
  const [trips, setTrips] = useState<Trip[]>(fleetMindStore.getTrips());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setTrips(fleetMindStore.getTrips());
    });
    return unsub;
  }, []);

  return trips;
}

/**
 * React hook that provides live, reactive notifications from Supabase & store.
 */
export function useRealtimeNotifications(): NotificationItem[] {
  const [notifications, setNotifications] = useState<NotificationItem[]>(fleetMindStore.getNotifications());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setNotifications(fleetMindStore.getNotifications());
    });
    return unsub;
  }, []);

  return notifications;
}

/**
 * React hook that provides live, reactive user profiles from Supabase & store.
 */
export function useRealtimeUsers(): UserProfile[] {
  const [users, setUsers] = useState<UserProfile[]>(fleetMindStore.getUsers());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setUsers(fleetMindStore.getUsers());
    });
    return unsub;
  }, []);

  return users;
}
