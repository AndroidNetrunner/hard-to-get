<template>
  <v-container>
    <!-- 결과 페이지 -->
    <v-row justify="center" class="my-4">
      <v-col cols="12" md="8" class="text-center">
        <!-- 게임 결과를 강조해서 보여줌 -->
        <v-typography
          :class="gameWinClass"
          variant="h1"
          class="font-weight-bold my-5"
        >
          {{ gameWin ? "승리!" : "실패!" }}
        </v-typography>
      </v-col>
      <v-col cols="12" md="8" class="text-center">
        <v-typography variant="h4" class="my-5">
          정답 단어: {{ answerWord }}
        </v-typography>
      </v-col>
    </v-row>

    <!-- 선택된 딜레마 카드들 표시 -->
    <v-row justify="center" class="my-4">
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title class="text-center">선택된 딜레마 카드들</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(dilemma, index) in chosenDilemmas"
                :key="index"
              >
                <v-list-item-content>
                  <v-list-item-title
                    >딜레마 {{ index + 1 }}: {{ dilemma }}</v-list-item-title
                  >
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useGameStore } from "@/store/game";

// Pinia store 사용
const gameStore = useGameStore();
const answerWord = computed(() => gameStore.answerWord);

// 게임 승리 여부를 결정
const gameWin = computed(() => gameStore.gameWin);

// 승리 시와 패배 시의 스타일을 다르게 설정
const gameWinClass = computed(() =>
  gameWin.value ? "text-success" : "text-error"
);

// 선택된 딜레마 카드 가져오기
const chosenDilemmas = computed(() => gameStore.chosenDilemmas);

onMounted(() => {
  // 게임 결과 페이지 진입 시 게임 결과를 초기화
  localStorage.clear();
});
</script>

<style scoped>
.text-success {
  color: green;
}

.text-error {
  color: red;
}
</style>
