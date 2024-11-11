<template>
  <v-container class="d-flex align-center justify-center fill-height">
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4">
          <v-card-title class="text-center">역할 선택</v-card-title>
          <v-card-text>
            <v-form>
              <p class="text-center">어떤 역할을 맡으시겠습니까?</p>
              <v-radio-group v-model="selectedRole" row>
                <v-row>
                  <v-col cols="6">
                    <v-radio label="증인" value="witness"></v-radio>
                  </v-col>
                  <v-col cols="6">
                    <v-radio label="탐정" value="detective"></v-radio>
                  </v-col>
                </v-row>
              </v-radio-group>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="submit" :disabled="!selectedRole">
              입장
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { useGameStore } from "@/store/game";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "RoleForm",

  setup() {
    const selectedRole = ref<string | null>(null);
    const gameStore = useGameStore();
    const submit = () => {
      if (selectedRole.value === "witness") {
        gameStore.setIsWitness(true);
      } else {
        gameStore.setIsWitness(false);
      }
    };
    return {
      submit,
      selectedRole,
    };
  },
});
</script>
