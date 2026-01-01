import { Annotation, AppSettings } from "@/types";

const ANNOTATIONS_KEY = "proofsnap_annotations";
const SETTINGS_KEY = "proofsnap_settings";

export const storage = {
  // Annotations
  getAnnotations: (imageId: string): Annotation[] => {
    if (typeof window === "undefined") return [];

    const data = localStorage.getItem(ANNOTATIONS_KEY);
    if (!data) return [];

    const allAnnotations: Annotation[] = JSON.parse(data);
    return allAnnotations.filter((a) => a.imageId === imageId);
  },

  saveAnnotation: (annotation: Annotation): void => {
    if (typeof window === "undefined") return;

    const data = localStorage.getItem(ANNOTATIONS_KEY);
    const allAnnotations: Annotation[] = data ? JSON.parse(data) : [];

    allAnnotations.push(annotation);
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(allAnnotations));
  },

  deleteAnnotation: (annotationId: string): void => {
    if (typeof window === "undefined") return;

    const data = localStorage.getItem(ANNOTATIONS_KEY);
    if (!data) return;

    const allAnnotations: Annotation[] = JSON.parse(data);
    const filtered = allAnnotations.filter((a) => a.id !== annotationId);
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(filtered));
  },

  // Settings
  getSettings: (): AppSettings => {
    if (typeof window === "undefined") return {};

    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {};
  },

  saveSettings: (settings: AppSettings): void => {
    if (typeof window === "undefined") return;

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};
