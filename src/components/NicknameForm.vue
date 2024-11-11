<template>
  <v-container class="d-flex align-center justify-center fill-height">
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4">
          <v-card-title class="text-center">게임 입장</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="nickname"
                label="닉네임"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="submit">입장</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useUserStore } from "@/store/user"; // Pinia 스토어 import
import { database } from "@/firebase"; // Firebase import
import { ref as dbRef, set } from "firebase/database"; // Firebase database 관련 함수들 import

// 유저 ID 생성 함수
function generateUserId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default defineComponent({
  name: "NicknameForm",
  props: {
    onSubmit: {
      type: Function,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const nickname = ref("");
    const userStore = useUserStore(); // Pinia 스토어 사용

    const submit = async () => {
      if (nickname.value) {
        const userId = generateUserId(); // 유저 ID 생성
        userStore.setUser(nickname.value, userId); // 유저 정보 저장

        // 세션 스토리지에 userId와 nickname 저장
        localStorage.setItem("userId", userId);
        localStorage.setItem("nickname", nickname.value);

        try {
          // 유저 정보를 방에 추가
          const userRef = dbRef(
            database,
            `rooms/${props.roomId}/users/${userId}`
          );
          await set(userRef, {
            nickname: nickname.value,
            userId: userId,
          });

          console.log("User added to room:", props.roomId);
          props.onSubmit();
        } catch (error) {
          console.error("Error adding user to room:", error);
        }
      }
    };

    return {
      nickname,
      submit,
    };
  },
});
</script>
