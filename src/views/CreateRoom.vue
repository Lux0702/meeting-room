<template>
  <div class="room-container">
    <div class="header ml-8">
      <div class="p-0 m-0">
        <h2 class="title text-[25px] font-bold">Meeting Rooms List</h2>
        <span class="text-sm text-gray-400"
          >Manage and view all available meeting spaces across facilities.</span
        >
      </div>
      <el-button
        v-if="currentRole === 'ADMIN'"
        type="primary"
        color="#1F2937"
        @click="openAddDialog"
      >
        <el-icon class="mr-1"><CirclePlusFilled /></el-icon>
        Add Room
      </el-button>
    </div>

    <el-card v-if="rooms.length <= 0" class="no-data-card" shadow="hover">
      <div class="no-data-content">
        <el-icon class="no-data-icon">
          <CircleClose />
        </el-icon>
        <span>No Data</span>
      </div>
    </el-card>

    <el-scrollbar style="flex: 1" v-else>
      <div class="relative">
        <el-tabs v-model="activeFloor">
          <el-tab-pane
            v-for="floor in floorTabs"
            :key="floor"
            :label="`${floor} Floor`"
            :name="floor"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <RoomCardWeb
                v-for="room in roomsByFloor[floor]"
                :key="room.id"
                :room="room"
                @load-room="LoadRoom"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
        <el-button class="absolute top-1 right-0" @click="showPreview = true"
          >Map {{ activeFloor }}</el-button
        >
      </div>
    </el-scrollbar>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit Room' : 'Add Room'"
      width="500"
      align-center
    >
      <el-form :model="form" label-width="100px" class="p-4 pb-0">
        <el-form-item label="Name">
          <el-input
            v-model="form.room_name"
            placeholder="Please enter Room Name"
          />
        </el-form-item>

        <el-form-item label="Factory">
          <!-- <el-select-v2
            v-model="GSBH"
            :options="fillopiton.gsbh"
            filterable
            placeholder="Please select Factory"
            @change="handleChangeFactory"
          /> -->
          <el-input
            v-model="GSBH"
            placeholder="Please enter Factory Name"
            value="DC"
            :disabled="true"
          />
        </el-form-item>

        <el-form-item label="Location">
          <el-select-v2
            v-model="form.id_gsbh"
            :options="fillopiton.depname"
            filterable
            placeholder="Please select Location"
          >
            <template #default="{ item }">
              {{ item.label }}
            </template>
          </el-select-v2>
        </el-form-item>

        <el-form-item label="Equipments" prop="equipments">
          <el-select-v2
            v-model="form.equipments"
            :options="fillopiton.equipments"
            filterable
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="3"
            placeholder="Please select Room Equipments"
          >
            <template #default="{ item }">
              {{ item.label }}
            </template>
          </el-select-v2>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="p-3">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button
            type="primary"
            @click="isEdit ? updateRoom() : addRoom()"
            >{{ isEdit ? "Update" : "Save" }}</el-button
          >
        </div>
      </template>
    </el-dialog>
    <el-image-viewer
      v-if="showPreview"
      :url-list="[url]"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup>
import { get, post, put, remove } from "@/api/api";
import RoomCardWeb from "@/components/web/RoomCardWeb.vue";
import { Success } from "@/utils/Notification";
import { onMounted, reactive, ref, computed } from "vue";

const activeFloor = ref("1");
const showPreview = ref(false);
const floors = {
  1: [101, 102, 103, 105, 106],
  2: [201, 202],
  3: [301, 302, 303, 305, 306, 307, 308, 309, 310], 
};
const floorMap = {
  1: new URL("../assets/images/1floor/map1.jpg", import.meta.url).href,
  2: new URL("../assets/images/2floor/map2.jpg", import.meta.url).href,
  3: new URL("../assets/images/3floor/map3.jpg", import.meta.url).href,
};
const url = computed(() => [floorMap[activeFloor.value]]);
const roomsByFloor = computed(() => ({
  1: rooms.value.filter((room) => room.id_gsbh?.startsWith("1F_")),
  2: rooms.value.filter((room) => room.id_gsbh?.startsWith("2F_")),
  3: rooms.value.filter((room) => room.id_gsbh?.startsWith("3F_")),
}));
const floorTabs = Object.keys(floors);
const floorLocations = Object.entries(floors).flatMap(([floor, rooms]) =>
  rooms.map((room) => ({
    value: `${floor}F_${room}`,
    label: `Floor ${floor} - Room ${room}`,
  })),
);

const currentRole = ref(sessionStorage.getItem("Role") || "USER");
const dialogVisible = ref(false);
const isEdit = ref(false);
const rooms = ref([]);
const GSBH = ref("");
const fillopiton = reactive({
  gsbh: [],
  depname: floorLocations,
  equipments: [
    { value: "PC", label: "PC" },
    { value: "Projector", label: "Projector" },
    { value: "TV", label: "TV" },
    { value: "Zoom", label: "Zoom" },
  ],
});
// const UserID = ref(sessionStorage.getItem("UserID") || "");

const LoadRoom = async () => {
  rooms.value = await get("room-meeting");
};

const form = ref({
  room_name: "",
  id_gsbh: "",
  equipments: [],
});
const openAddDialog = () => {
  form.value = { room_name: "", id_gsbh: "", equipments: [] };
  GSBH.value = "";
  isEdit.value = false;
  dialogVisible.value = true;
};

const openEditDialog = async (room) => {
  GSBH.value = room.gsbh;
  isEdit.value = true;
  if (GSBH.value) {
    await handleChangeFactory();
  }
  form.value = {
    ...room,
    id_gsbh: room.id_gsbh.trim(),
    equipments: room.equipments || [],
  };
  dialogVisible.value = true;
};

const addRoom = async () => {
  const equipmentFlags = form.value.equipments.reduce((acc, equip) => {
    acc[equip] = true;
    return acc;
  }, {});
  const formRoom = { ...form.value, ...equipmentFlags };
  const res = await post("room-meeting", formRoom);
  if (typeof res === "string") {
    Success("Insert Successfully !!");
  }
  dialogVisible.value = false;
  await LoadRoom();
};

const updateRoom = async () => {
  const res = await put(`room-meeting/${form.value.id}`, form.value);
  if (typeof res === "string") {
    Success("Update Successfully !!");
  }
  dialogVisible.value = false;
  await LoadRoom();
};

// const deleteRoom = async (id) => {
//   try {
//     await ElMessageBox.confirm("Are you sure to delete this room?", "Warning", {
//       confirmButtonText: "OK",
//       cancelButtonText: "Cancel",
//       type: "warning",
//     });
//     const res = await remove(`room-meeting/${id}`, { id: id });
//     Success("Deleted Room Successfully !!");
//     await LoadRoom();
//   } catch {

//   }
// };

const handleChangeFactory = async () => {
  const res = await get(`dep-name/${GSBH.value}`, { gsbh: GSBH.value });
  fillopiton.depname = res;
};

onMounted(async () => {
  await LoadRoom();
  // const res = await get("gsbh");
  // fillopiton.gsbh = res.map((item) => ({
  //   value: String(item),
  //   label: item,
  // }));
});
</script>

<style scoped>
.room-container {
  background: #f5f7fa;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  /* font-weight: 600; */
}

.room-item {
  margin-bottom: 12px;
  cursor: pointer;
  /* height: 90px; */
}

.room-name {
  font-weight: 600;
  font-size: 16px;
}

.room-info {
  color: #666;
  font-size: 14px;
}

.no-data-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa, #e4e7ed);
  border: 1px dashed #dcdfe6;
  color: #909399;
  font-size: 16px;
}

.no-data-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.no-data-icon {
  font-size: 20px;
  color: #c0c4cc;
}
.overflow {
  overflow: auto !important;
}

:deep(.no-data-card .el-card__body) {
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.el-card__body) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 12px;
}
</style>
