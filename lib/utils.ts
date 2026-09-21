import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}

export function daysSince(date: string | Date) {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)),
  );
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "1 jour";
  return `${days} jours`;
}

export function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function daysUntil(date: string | Date) {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
