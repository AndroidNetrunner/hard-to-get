<template>
  <!-- roomId를 props로 NicknameForm에 전달 -->
  <NicknameForm :onSubmit="joinGame" :roomId="roomId" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router"; // Vue Router 사용
import NicknameForm from "@/components/NicknameForm.vue";
import generateRoomId from "@/utils/generateRoomId";
import { shuffle } from "lodash";
import { useGameStore } from "@/store/game";
import { update } from "firebase/database";
import { ref as dbRef } from "firebase/database";
import { database } from "@/firebase";

export default defineComponent({
  name: "MainPage",
  components: {
    NicknameForm,
  },
  setup() {
    const router = useRouter();
    const roomId = generateRoomId(); // roomId를 단순한 상수로 생성
    const gameStore = useGameStore();
    const roomRef = dbRef(database, `rooms/${roomId}`);

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

    const joinGame = async () => {
      await startGame();
      router
        .push({ name: "RoomPage", params: { roomId } })
        .then(() => {
          console.log("Navigation to RoomPage successful with roomId:", roomId);
        })
        .catch((err) => {
          console.error("Navigation error:", err);
        });
    };

    return {
      joinGame,
      roomId, // roomId를 반환하여 template에서 사용 가능하게 함
    };
  },
});
</script>
