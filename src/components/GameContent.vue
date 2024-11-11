<template>
  <v-container>
    <v-row v-if="wordReady" justify="center" class="my-4">
      <v-col cols="12" md="8" class="text-center">
        <v-typography variant="h4" v-if="answerWord && isWitness">
          정답 단어: {{ answerWord }}
        </v-typography>
      </v-col>
    </v-row>
    <v-row v-if="!isWitness && wordReady" justify="center" class="my-4">
      <v-col cols="12" md="8" class="text-center">
        <v-btn color="success" @click="setWitness" class="text-center"
          >증인이 되기</v-btn
        >
      </v-col>
    </v-row>
    <v-row justify="center" class="my-4">
      <v-col cols="12" md="8" class="text-center">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              선택된 딜레마 목록
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list>
                <v-list-item
                  v-for="(dilemma, index) in chosenDilemmas"
                  :key="index"
                >
                  {{ dilemma }}
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-card-actions class="justify-center">
      <v-btn color="primary" @click="copyInviteLink"> 초대 링크 복사 </v-btn>
    </v-card-actions>
    <v-container v-if="chosenDilemma">
      <v-row justify="center" class="my-4">
        <v-col cols="12" md="8" class="text-center">
          <v-typography variant="h5" class="mr-4">
            {{ round }}라운드 선택된 딜레마: {{ chosenDilemma }}
          </v-typography>
          <v-btn color="red" @click="endRound" v-if="!isWitness && round !== 5"
            >라운드 종료</v-btn
          >
        </v-col>
      </v-row>
      <v-row justify="center" class="my-4" v-if="!isWitness">
        <v-col cols="12" md="8" class="text-center">
          <v-btn color="primary" @click="excludeWord">제외하기</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-row v-if="wordReady && !chosenDilemma" justify="center" class="my-4">
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title class="text-center"
            >{{ round }}라운드 딜레마 카드</v-card-title
          >
          <v-divider></v-divider>
          <v-card-text>
            <v-radio-group v-model="selectedOption">
              <v-row>
                <v-col cols="6" v-for="option in dilemmaChoices" :key="option">
                  <v-radio
                    :label="option"
                    :value="option"
                    :disabled="!isWitness"
                  />
                </v-col>
              </v-row>
            </v-radio-group>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn color="primary" @click="saveDilemma" :disabled="!isWitness"
              >결정</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="!wordReady" justify="center" class="my-4">
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title class="text-center"
            >모르는 단어를 바꿔주세요.</v-card-title
          >
          <v-divider></v-divider>
          <v-card-actions class="justify-center">
            <v-btn color="primary" @click="markWordReady"> 준비 완료 </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-data-table
          :items="formattedWordCards"
          class="elevation-1"
          hide-default-header
          hide-default-footer
          style="table-layout: fixed; width: 100%"
        >
          <template #item="{ item }">
            <tr>
              <td
                v-for="word in [item.first, item.second]"
                :key="word"
                :class="{ strikethrough: isStruckThrough(word) }"
                @click="toggleStrikethrough(word)"
                style="cursor: pointer; width: 50%; word-wrap: break-word"
              >
                <v-icon
                  v-if="!wordReady"
                  @click.stop="replaceWord(word)"
                  icon="mdi-swap-horizontal"
                />
                {{ word }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useGameStore } from "@/store/game";
import { ref as dbRef, getDatabase, set, update } from "firebase/database";
import { useUserStore } from "@/store/user";
import { shuffle } from "lodash";
import { database } from "@/firebase";

const gameStore = useGameStore();
const userStore = useUserStore();
const { roomId } = gameStore;
const wordReady = computed(() => gameStore.wordReady);
const answerWord = computed(() => gameStore.answerWord);
const chosenDilemma = computed(() => gameStore.chosenDilemma);
const chosenDilemmas = computed(() => gameStore.chosenDilemmas);
const round = computed(() => 6 - gameStore.dilemma.length);
const roomRef = dbRef(database, `rooms/${roomId}`);
const snackbar = ref(false);
const isWitness = computed(() => gameStore.isWitness);

const struckWords = ref<string[]>([]); // struckWords 상태 관리
const updateStruckWords = (updatedWords: string[]) => {
  struckWords.value = updatedWords;
};
const formattedWordCards = computed(() => {
  if (!gameStore.wordCards) return [];
  const wordCards = gameStore.wordCards;
  const rows = [];
  for (let i = 0; i < wordCards.length; i += 2) {
    rows.push({ first: wordCards[i], second: wordCards[i + 1] || "" });
  }
  return rows;
});
console.log("formattedWordCards:", formattedWordCards);
// 단어 클릭 시 취소선 상태 변경
const toggleStrikethrough = (word: string) => {
  const updatedStruckWords = [...struckWords.value];
  if (updatedStruckWords.includes(word)) {
    const index = updatedStruckWords.indexOf(word);
    updatedStruckWords.splice(index, 1);
  } else {
    updatedStruckWords.push(word);
  }
  updateStruckWords(updatedStruckWords);
};

// 취소선 상태 확인
const isStruckThrough = (word: string) => {
  return struckWords.value.includes(word);
};

const dilemmaChoices = computed(() => {
  const firstDilemma = gameStore.dilemma[0];
  return firstDilemma.split(", ").map((choice) => choice.trim());
});

// 딜레마 관련 예시 코드
const selectedOption = ref<string | null>(null);
const saveDilemma = async () => {
  if (selectedOption.value) {
    try {
      const db = getDatabase();
      const chosenDilemmaRef = dbRef(db, `rooms/${roomId}/chosenDilemma`); // 경로 수정
      const chosenDilemmasRef = dbRef(db, `rooms/${roomId}/chosenDilemmas`); // 경로 수정
      const chosenDilemmas = gameStore.chosenDilemmas;
      chosenDilemmas.push(selectedOption.value);

      await set(chosenDilemmaRef, selectedOption.value);
      await set(chosenDilemmasRef, chosenDilemmas); // 경로에서 직접 값을 저장
    } catch (error) {
      console.error("데이터 저장 중 오류 발생:", error);
      alert("데이터 저장 중 오류가 발생했습니다.");
    }
  } else {
    alert("먼저 딜레마 카드를 선택해주세요.");
  }
};

const copyInviteLink = () => {
  const inviteLink = window.location.href;
  navigator.clipboard
    .writeText(inviteLink)
    .then(() => {
      snackbar.value = true;
    })
    .catch((err) => {
      console.error("초대 링크 복사에 실패했습니다:", err);
    });
};

const endRound = async () => {
  try {
    const db = getDatabase();

    // 1. 기존 chosenDilemma 제거
    const chosenDilemmaRef = dbRef(db, `rooms/${roomId}/chosenDilemma`);
    await set(chosenDilemmaRef, null); // chosenDilemma를 null로 설정하여 제거

    // 2. dilemmaCards의 0번째 요소 제거 후 데이터베이스에 덮어쓰기
    const dilemmaCards = [...gameStore.dilemma];
    dilemmaCards.shift(); // 첫 번째 요소 제거

    const dilemmaCardsRef = dbRef(db, `rooms/${roomId}/dilemmaCards`);
    await set(dilemmaCardsRef, dilemmaCards); // 수정된 dilemmaCards를 데이터베이스에 저장
  } catch (error) {
    console.error("라운드 종료 중 오류 발생:", error);
    alert("라운드 종료 중 오류가 발생했습니다.");
  }
};

const excludeWord = async () => {
  try {
    const db = getDatabase();
    const wordCards = [...gameStore.wordCards];
    const gameWinRef = dbRef(db, `rooms/${roomId}/gameWin`);
    const updatedWordCards = wordCards.filter(
      (word) => !struckWords.value.includes(word)
    );

    if (updatedWordCards.length < 1) {
      alert("최소 한 개의 단어는 남겨주세요.");
      return;
    }

    if (struckWords.value.includes(answerWord.value)) {
      await set(gameWinRef, false);
      return;
    }

    if (updatedWordCards.length === 1) {
      await set(gameWinRef, true);
      return;
    }

    const wordCardsRef = dbRef(db, `rooms/${roomId}/wordCards`);
    await set(wordCardsRef, updatedWordCards);
  } catch (error) {
    console.error("단어 제외 중 오류 발생:", error);
    alert("단어 제외 중 오류가 발생했습니다.");
  }
};

const markWordReady = () => {
  const db = getDatabase();
  const roomRef = dbRef(db, `rooms/${roomId}`);
  const answerWord = shuffle(gameStore.wordCards)[0];
  update(roomRef, {
    wordReady: true,
    answerWord,
  });
};

const setWitness = () => {
  if (confirm("증인이 되시겠습니까?")) {
    gameStore.setIsWitness(true);
  }
};

const startGame = async () => {
  try {
    const wordResponse = await fetch("/assets/words.txt");
    const wordText = await wordResponse.text();
    const wordList = wordText
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word);

    const selectedWords = shuffle(wordList).slice(0, 16);
    const answerWord = shuffle(selectedWords)[0];
    gameStore.setAnswerWord(answerWord);

    const dilemmaResponse = await fetch("/assets/dilemmas.txt");
    const dilemmaText = await dilemmaResponse.text();
    const dilemmaList = dilemmaText
      .split("\n")
      .map((dilemma) => dilemma.trim())
      .filter((dilemma) => dilemma);

    const selectedDilemmas = shuffle(dilemmaList).slice(0, 5);
    gameStore.setDilemma(selectedDilemmas);

    await update(roomRef, {
      wordCards: selectedWords,
      dilemmaCards: selectedDilemmas,
      wordReady: false,
    });
  } catch (error) {
    console.error("Error starting game:", error);
  }
};

const replaceWord = async (oldWord: string) => {
  console.log("oldWord:", oldWord);
  try {
    // 단어 파일에서 단어 목록을 다시 가져옴
    const wordResponse = await fetch("/assets/words.txt");
    const wordText = await wordResponse.text();
    const wordList = wordText
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word);

    // 현재 게임에 사용되지 않은 단어 목록 필터링
    const currentWords = gameStore.wordCards;
    const availableWords = wordList.filter(
      (word) => !currentWords.includes(word)
    );

    // 새로운 단어를 랜덤하게 선택 (oldWord와 중복되지 않도록)
    const newWord = shuffle(availableWords).find((word) => word !== oldWord);

    if (!newWord) {
      alert("새로운 단어를 가져오는데 실패했습니다.");
      return;
    }

    // 게임의 단어 카드에서 oldWord를 newWord로 교체
    const wordCards = [...gameStore.wordCards];
    const index = wordCards.indexOf(oldWord);
    if (index !== -1) {
      wordCards[index] = newWord;

      // 데이터베이스에 업데이트
      const db = getDatabase();
      const wordCardsRef = dbRef(db, `rooms/${roomId}/wordCards`);
      console.log("wordCards:", wordCards);
      await set(wordCardsRef, wordCards);
      console.log("wordCardsRef:", wordCardsRef);
    }
  } catch (error) {
    console.error("단어 교체 중 오류 발생:", error);
    alert("단어 교체 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.strikethrough {
  text-decoration: line-through;
}
.text-center {
  text-align: center;
}
</style>
