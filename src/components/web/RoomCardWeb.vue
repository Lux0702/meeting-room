<script setup>
import { Delete, Edit, Location } from "@element-plus/icons-vue";
import LaptopComputerIcon from "@iconify-vue/emojione-v1/laptop-computer";
import VideoProjectorIcon from "@iconify-vue/flat-color-icons/video-projector";
import ModernTvCurvyEdgeIcon from "@iconify-vue/streamline-ultimate-color/modern-tv-curvy-edge";
import ZoomIconIcon from "@iconify-vue/logos/zoom-icon";
import { nextTick, onMounted, reactive, ref, watch, watchEffect } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { useRooms } from "@/hooks/useRooms";

const { loading, deleteRoom } = useRooms()

const role = ref(sessionStorage.getItem("Role") || "USER");

const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['loadRoom'])

const referenceImages = ref([]);
const equipmentConfig = {
  PC: {
    label: "PC",
    icon: LaptopComputerIcon,
    classes: "bg-[#DFE4F3] border-[#3454A6] text-[#3454A6]",
  },
  Projector: {
    label: "Projector",
    icon: VideoProjectorIcon,
    classes: "bg-[#DFEBEF] border-[#246A61] text-[#246A61]",
  },
  TV: {
    label: "TV",
    icon: ModernTvCurvyEdgeIcon,
    classes: "bg-[#EDE5E5] border-[#8E4416] text-[#8E4416]",
  },
  Zoom: {
    label: "Zoom",
    icon: ZoomIconIcon,
    classes: "bg-[#f3e8ff] border-[#7e22ce] text-[#7e22ce]",
  },
};

// Toggle the expanded state of the room name
const expandedRooms = reactive({});
const textEl = ref(null);
const showButton = ref(false);

const images = import.meta.glob(
  "../../assets/images/**/*.{jpg,jpeg,png}",
  {
    eager: true,
    import: "default",
  }
);

watch(
  () => props.room?.id_gsbh,
  (val) => {
    if (!val) return;

    const [, room] = val.split("_");

    referenceImages.value = Object.entries(images)
      .filter(([path]) => path.includes(`/${room}/`))
      .map(([, url]) => url);
  },
  { immediate: true }
);
const checkTruncation = () => {
  nextTick(() => {
    const roomId = props.room?.id;
    if (expandedRooms[roomId]) {
      showButton.value = true;
    } else {
      const el = textEl.value;
      if (el) {
        showButton.value = el.scrollWidth > el.clientWidth;
      } else {
        showButton.value = false;
      }
    }
  });
};

const toggleExpand = (roomId) => {
  expandedRooms[roomId] = !expandedRooms[roomId];
};

const getActiveEquipments = (room) => {
  const activeList = [];

  for (const key in equipmentConfig) {
    if (room[key] === true) activeList.push(equipmentConfig[key]);
  }
  return activeList;
};

const handleRoomAction = (command) => {
    if (command === "edit") {
        console.log("Edit room:", props.room);
    } else if (command === "delete") {
       ElMessageBox.confirm(
        "Are you sure you want to delete this room?",
        "Warning",
        {
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          type: "warning",
        })
        .then(() => deleteRoom(props.room?.id))
        .catch(() => ElMessage.info("Deletion is canceled!"))
        .finally(() => emit('loadRoom'))
    }
}

watch(
  () => [props.room?.room_name, expandedRooms[props.room?.id]],
  checkTruncation,
  { immediate: true },
);

onMounted(() => {
  checkTruncation();
});
</script>
<template>
  <div
    class="w-full max-h-100 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm font-sans"
  >
    <!-- Room Images -->
    <div class="relative">
      <el-carousel trigger="click" height="220px" :autoplay="false">
        <el-carousel-item v-for="item in referenceImages" :key="item">
          <img
            :src="item"
            :alt="`Reference image ${referenceImages.indexOf(item) + 1}`"
            class="w-full h-full object-cover"
          />
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- Room Information -->
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-end gap-1 min-w-0">
            <h2
                ref="textEl"
                class="text-lg sm:text-[22px] font-extrabold text-[#001f3f] uppercase tracking-wider leading-tight transition-all duration-300"
                :class="expandedRooms[room?.id] ? 'whitespace-normal' : 'truncate'"
            >
            {{ room?.room_name }}
            </h2>
            <button
                v-if="showButton"
                class="shrink-0 text-gray-400 hover:text-[#001f3f] transition-colors focus:outline-none hover:cursor-pointer text-sm"
                @click="toggleExpand(room?.id)"
            >
                <span>{{ expandedRooms[room?.id] ? "Show Less" : "Show More" }}</span>
            </button>
        </div>

        <el-dropdown v-if="role === 'ADMIN'" trigger="click" @command="handleRoomAction">
            <div class="cursor-pointer p-1.5 rounded-full hover:bg-gray-100 text-[18px]">
                <el-icon><Setting /></el-icon>
            </div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="edit" :icon="Edit">Edit</el-dropdown-item>
                    <el-dropdown-item command="delete" :icon="Delete" class="!text-red-500">Delete</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>

      </div>

      <div class="flex items-center text-[#4b5563] text-sm my-1">
        <el-icon size="16px" color="black"><Location /></el-icon>
        <span class="ml-1 text-[12px] tracking-wider font-light"
          >{{ room?.id_gsbh }}
        </span>
      </div>

      <!-- Divider -->
      <hr class="border-gray-200 my-4" />

      <!-- Room Equiments -->
      <div class="flex flex-wrap gap-2 uppercase font-extrabold tracking-wide">
        <div
          v-for="(equip, index) in getActiveEquipments(room)"
          :key="index"
          :class="[
            'flex items-center gap-1.5 px-2 py-1 border rounded text-[10px] sm:text-xs font-bold whitespace-nowrap',
            equip?.classes,
          ]"
        >
          <el-icon size="16px"><component :is="equip?.icon" /></el-icon>
          {{ equip?.label }}
        </div>
        <!-- No Equipments -->
        <div
          v-if="getActiveEquipments(room).length === 0"
          class="text-xs sm:text-sm text-gray-400 italic"
        >
          No equipment available
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
