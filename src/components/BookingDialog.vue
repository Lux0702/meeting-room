<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? 'Đặt phòng họp' : 'Chỉnh sửa đặt phòng'"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="Tiêu đề" required>
        <el-input v-model="form.title" placeholder="Nhập tiêu đề cuộc họp" />
      </el-form-item>

      <el-form-item label="Ngày">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="Chọn ngày"
          style="width: 100%"
          format="DD/MM/YYYY"
        />
      </el-form-item>

      <el-form-item label="Thời gian bắt đầu">
        <el-time-picker
          v-model="form.startTime"
          format="HH:mm"
          placeholder="Chọn giờ bắt đầu"
          style="width: 100%"
          value-format="HH:mm"
          :disabled-hours="disabledHours"
        />
      </el-form-item>

      <el-form-item label="Thời gian kết thúc">
        <el-time-picker
          v-model="form.endTime"
          format="HH:mm"
          placeholder="Chọn giờ kết thúc"
          style="width: 100%"
          value-format="HH:mm"
          :disabled-hours="disabledHours"
        />
      </el-form-item>

      <el-form-item label="Người tham gia">
        <el-input-tag
          v-model="form.members"
          placeholder="Thêm người tham gia"
        />
      </el-form-item>

      <el-form-item label="Người đặt">
        <el-input v-model="form.booker" disabled />
      </el-form-item>

      <el-form-item label="Mô tả">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="Nhập mô tả (nếu có)"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">Hủy</el-button>
        <el-button
          v-if="mode === 'edit'"
          type="danger"
          @click="handleDelete"
          :loading="loading"
        >
          Xóa
        </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ mode === "create" ? "Xác nhận" : "Cập nhật" }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const props = defineProps({
  visible: Boolean,
  form: Object,
  loading: Boolean,
  mode: String, // "create" or "edit"
});

const emit = defineEmits(["update:visible", "submit", "delete"]);

const localForm = ref({ ...props.form });

// Initialize times as strings if they don't exist
const initializeForm = () => {
  localForm.value = {
    ...props.form,
    startTime: props.form.startTime || "09:00",
    endTime: props.form.endTime || "10:00",
  };
};

watch(
  () => props.form,
  (newVal) => {
    if (newVal) {
      initializeForm();
    }
  },
  { deep: true, immediate: true }
);

// disabledHours must be a function that returns array of disabled hour numbers
const disabledHours = (hour) => {
  // Disable hours before 7 AM (0-6) and after 7 PM (19-23)
  return hour < 7 || hour >= 19;
};

const handleSubmit = () => {
  if (!localForm.value.title.trim()) {
    ElMessage.warning("Vui lòng nhập tiêu đề cuộc họp");
    return;
  }

  if (!localForm.value.date) {
    ElMessage.warning("Vui lòng chọn ngày");
    return;
  }

  if (!localForm.value.startTime) {
    ElMessage.warning("Vui lòng chọn thời gian bắt đầu");
    return;
  }

  if (!localForm.value.endTime) {
    ElMessage.warning("Vui lòng chọn thời gian kết thúc");
    return;
  }

  // Parse times - handle both string and Date object formats
  let startTimeStr = localForm.value.startTime;
  let endTimeStr = localForm.value.endTime;

  // If they're Date objects, convert to HH:mm string
  if (startTimeStr instanceof Date) {
    startTimeStr = `${String(startTimeStr.getHours()).padStart(
      2,
      "0"
    )}:${String(startTimeStr.getMinutes()).padStart(2, "0")}`;
  }
  if (endTimeStr instanceof Date) {
    endTimeStr = `${String(endTimeStr.getHours()).padStart(2, "0")}:${String(
      endTimeStr.getMinutes()
    ).padStart(2, "0")}`;
  }

  const [startH, startM] = startTimeStr.split(":").map(Number);
  const [endH, endM] = endTimeStr.split(":").map(Number);

  const startDate = new Date(localForm.value.date);
  startDate.setHours(startH, startM, 0, 0);

  const endDate = new Date(localForm.value.date);
  endDate.setHours(endH, endM, 0, 0);

  if (startDate >= endDate) {
    ElMessage.warning("Thời gian kết thúc phải sau thời gian bắt đầu");
    return;
  }

  const bookingData = {
    name_meeting: localForm.value.title,
    start_day: startDate.toISOString(),
    end_day: endDate.toISOString(),
    descriptions: localForm.value.description,
    members: Array.isArray(localForm.value.members)
      ? localForm.value.members.join(",")
      : localForm.value.members || "",
    user_create: localForm.value.booker,
  };

  emit("submit", bookingData);
};

const handleDelete = () => {
  ElMessageBox.confirm(
    "Bạn có chắc chắn muốn xóa lịch họp này không?",
    "Xác nhận xóa",
    {
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      type: "warning",
    }
  )
    .then(() => {
      emit("delete", localForm.value.id);
    })
    .catch(() => {
      ElMessage.info("Đã hủy xóa");
    });
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
