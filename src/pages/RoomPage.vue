<template>
  <!-- Nickname이 없으면 NicknameForm을 보여줌 -->
  <NicknameForm
    v-if="!userStore.nickname"
    :onSubmit="joinRoom"
    :roomId="roomId"
  />
  <!-- 게임이 시작되었을 때 GameContent 내용을 보여줌 -->
  <RoleForm v-else-if="isWitness === null" />
  <GameContent v-else-if="gameWin === null" />
  <GameResult v-else-if="gameWin !== null" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { useGameStore } from "@/store/game"; // GameStore 가져오기

import {
  ref as dbRef,
  onValue,
  onDisconnect,
  update,
  set,
  getDatabase,
} from "firebase/database";
import NicknameForm from "@/components/NicknameForm.vue";
import RoleForm from "@/components/RoleForm.vue";
import GameContent from "@/components/GameContent.vue";
import GameResult from "@/components/GameResult.vue";

interface User {
  userId: string;
  nickname: string;
}

export default defineComponent({
  name: "RoomPage",
  components: {
    NicknameForm,
    RoleForm,
    GameContent,
    GameResult,
  },
  props: {
    roomId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    const gameStore = useGameStore();

    const gameWin = computed(() => gameStore.gameWin);
    const isWitness = computed(() => gameStore.isWitness);

    const users = ref<User[]>([]);
    const ownerId = ref<string | null>(null);
    const selectedUserId = ref<string | null>(null);

    const database = getDatabase();

    const userId = userStore.userId;
    const userRef = dbRef(database, `rooms/${props.roomId}/users/${userId}`);
    const roomRef = dbRef(database, `rooms/${props.roomId}`);
    const usersRef = dbRef(database, `rooms/${props.roomId}/users`);
    onBeforeMount(async () => {
      // localStorage에서 userId와 nickname을 가져옴
      const storedUserId = localStorage.getItem("userId");
      const storedNickname = localStorage.getItem("nickname");

      if (storedUserId && storedNickname) {
        // Pinia store에 저장
        userStore.setUser(storedNickname, storedUserId);
        await set(userRef, {
          nickname: storedNickname,
          userId: userId,
        });
      }

      gameStore.setRoomId(props.roomId);

      // 방 정보와 사용자 정보를 실시간으로 받아옴
      onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.ownerId) {
          ownerId.value = data.ownerId;
          if (userStore.userId === data.ownerId) {
            selectedUserId.value = data.ownerId;
          }
        }

        if (data && data.gameWin !== undefined) {
          gameStore.setGameWin(data.gameWin);
        }

        if (data && data.wordCards) {
          gameStore.setWordCards(data.wordCards);
        }

        if (data && data.chosenDilemmas) {
          gameStore.setChosenDilemmas(data.chosenDilemmas);
        }

        if (data && data.answerWord) {
          gameStore.setAnswerWord(data.answerWord);
        }

        if (data && data.dilemmaCards) {
          gameStore.setDilemma(data.dilemmaCards);
        }

        if (data) {
          gameStore.setChosenDilemma(data.chosenDilemma);
        }

        if (data && data.wordReady) {
          gameStore.setWordReady(data.wordReady);
        }
      });

      onValue(usersRef, async (snapshot) => {
        const data = snapshot.val();
        if (data) {
          users.value = Object.values(data) as User[];
          const currentOwnerExists = users.value.some(
            (user) => user.userId === ownerId.value
          );
          if (!currentOwnerExists) {
            const newOwnerId = users.value[0]?.userId || null;
            if (newOwnerId) {
              await update(roomRef, { ownerId: newOwnerId }).catch((err) => {
                console.error("Error updating ownerId:", err);
              });
              ownerId.value = newOwnerId;
            }
          }
        }
      });

      onDisconnect(userRef).remove();
    });

    const joinRoom = () => {
      router
        .push({ name: "RoomPage", params: { roomId: props.roomId } })
        .then(() => {
          console.log("Joined Room:", props.roomId);
        })
        .catch((err) => {
          console.error("Join room error:", err);
        });
    };

    return {
      joinRoom,
      userStore,
      users,
      ownerId,
      selectedUserId,
      gameWin,
      isWitness,
    };
  },
});
</script>
