import { defineStore } from "pinia";
import { ref } from "vue";

export const useGameStore = defineStore("game", () => {
  const answerWord = ref<string>("");
  const dilemma = ref<string[]>([]);
  const wordCards = ref<string[]>([]);
  const chosenDilemma = ref<string | null>(null);
  const roomId = ref<string | null>(null);
  const isWitness = ref<boolean | null>(null);
  const wordReady = ref<boolean>(false);
  const chosenDilemmas = ref<string[]>([]);
  const gameWin = ref<boolean | null>(null);

  const setAnswerWord = (word: string) => {
    answerWord.value = word;
  };

  const setDilemma = (dilemmaList: string[]) => {
    dilemma.value = dilemmaList;
  };

  const setWordCards = (wordCardsList: string[]) => {
    wordCards.value = wordCardsList;
  };

  const setChosenDilemma = (chosenDilemmaWord: string) => {
    chosenDilemma.value = chosenDilemmaWord;
  };

  const setRoomId = (roomIdValue: string) => {
    roomId.value = roomIdValue;
  };

  const setIsWitness = (isWitnessValue: boolean) => {
    isWitness.value = isWitnessValue;
  };

  const setWordReady = (wordReadyValue: boolean) => {
    wordReady.value = wordReadyValue;
  };

  const setChosenDilemmas = (chosenDilemmasValue: string[]) => {
    chosenDilemmas.value = chosenDilemmasValue;
  };

  const setGameWin = (gameWinValue: boolean) => {
    gameWin.value = gameWinValue;
  };

  return {
    answerWord,
    dilemma,
    wordCards,
    setAnswerWord,
    setDilemma,
    setWordCards,
    chosenDilemma,
    setChosenDilemma,
    roomId,
    setRoomId,
    isWitness,
    setIsWitness,
    wordReady,
    setWordReady,
    chosenDilemmas,
    setChosenDilemmas,
    gameWin,
    setGameWin,
  };
});

export type GameStore = ReturnType<typeof useGameStore>;
