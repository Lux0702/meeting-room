import { remove } from "@/api/api";
import { ElMessage } from "element-plus";
import { ref } from "vue";

export const useRooms = () => {
    const loading = ref(false);
    const error = ref(null);
    
    const deleteRoom = async (roomId) => {
        loading.value = true;
        error.value = null;
        try {
            const url = `/room-meeting/${roomId}`
            const res  = await remove(url);

            return res;
        } catch (err) {
            error.value = err.message || "Could not delete room";
            ElMessage.error(error.value);
        } finally {
            loading.value = false;
        }
    }
    return { loading, deleteRoom };
}