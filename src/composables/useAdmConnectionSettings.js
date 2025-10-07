import {ref} from 'vue';

export function useAdmConnectionSettings() {
  const viewConnectionSettings = ref(false);

  function toggleConnectionSettings() {
    viewConnectionSettings.value = !viewConnectionSettings.value;
  }

  return {toggleConnectionSettings, viewConnectionSettings};
}