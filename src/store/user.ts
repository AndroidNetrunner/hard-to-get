import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const nickname = ref<string>("");
  const userId = ref<string>("");

  // setUser 함수가 외부에서 생성된 userId를 받아 저장하도록 수정
  const setUser = (newNickname: string, newUserId: string) => {
    nickname.value = newNickname;
    userId.value = newUserId;
  };

  return {
    nickname,
    userId,
    setUser,
  };
});

export type UserStore = ReturnType<typeof useUserStore>;
