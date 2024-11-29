import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminTeknis_GetDataByDomainAndDeleted } from './functionAPI';

export const useIndexStore = defineStore('index', () => {
  // State dan logika untuk util

  const logistikData = ref<any>(null);
  const lastUpdated = ref<number | null>(null);

  async function getListLogistik(data: string) {
    const now = Date.now();

    // Check if the last update was less than 1 hour ago
    if (lastUpdated.value && now - lastUpdated.value < 3600000) {
      console.log('Using cached utility data.');
      return logistikData.value;
    }

    console.log('Fetching new utility data...');
    try {
      const response = await adminTeknis_GetDataByDomainAndDeleted(data); // Use the imported function
      logistikData.value = response;
      lastUpdated.value = now;
    } catch (error) {
      console.error('Failed to fetch utility data:', error);
    }

    return logistikData.value;
  }

  return {
    logistikData,
    getListLogistik
  };
});
