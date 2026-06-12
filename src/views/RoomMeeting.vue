<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoomMeeting } from "@/hooks/useRoomMeeting";
import LaptopComputerIcon from '@iconify-vue/emojione-v1/laptop-computer';
import VideoProjectorIcon from '@iconify-vue/flat-color-icons/video-projector';
import ModernTvCurvyEdgeIcon from '@iconify-vue/streamline-ultimate-color/modern-tv-curvy-edge';
import MicrosoftTeamsIcon from '@iconify-vue/logos/microsoft-teams';

const equipmentConfig = {
    PC: { label: 'Laptop', icon: LaptopComputerIcon, classes: 'bg-[#DFE4F3] border-[#3454A6] text-[#3454A6]' },
    Projector: { label: 'Projector', icon: VideoProjectorIcon, classes: 'bg-[#DFEBEF] border-[#246A61] text-[#246A61]' },
    TV: { label: 'TV', icon: ModernTvCurvyEdgeIcon, classes: 'bg-[#EDE5E5] border-[#8E4416] text-[#8E4416]' },
    Zoom: { label: 'Teams', icon: MicrosoftTeamsIcon, classes: 'bg-[#f3e8ff] border-[#7e22ce] text-[#7e22ce]'}
}

const statusOptions = [
  { label: 'Confirmed'.toUpperCase(), value: 'confirmed'.toUpperCase() },
  { label: 'Pending'.toUpperCase(), value: 'pending'.toUpperCase() },
  { label: 'Cancelled'.toUpperCase(), value: 'cancelled'.toUpperCase() },
];

const {
  rooms,
  loading,
  fetchRooms,
  fetchBookingRooms,
  createBooking,
  updateBooking,
  cancelBooking,
} = useRoomMeeting();

const selectRef = ref(null)
const selectedRoom = ref(null);
const roomBookings = ref([]);
const showBookingDialog = ref(false);
const showDetailDialog = ref(false);
const isEditMode = ref(false);
const calendarRef = ref(null);
const currentEditingId = ref(null);

const currentUser = ref({ id: "", email: "", role: "" });
const selectedBooking = ref(null);

const bookingForm = ref({
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  booker: "",
  description: "",
  members: [],
  equipments: [],
  itCreateLink: false,
  meetingUrl: "",
  meetingId: "",
  passcode: "",
  status: "pending", // Default
});

// ========== SAFARI-SAFE DATE PARSING ==========

const safeParseDateString = (dateString) => {
  if (!dateString) return null;
  const isoString = dateString.replace(" ", "T");
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString);
    return null;
  }
  return date;
};

const formatForAPI = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error("Invalid date for API:", date);
    return null;
  }
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// ========== HELPER FUNCTIONS ==========

const isMobile = computed(() => {
  return window.innerWidth <= 768;
});

const loadUserData = () => {
  const storedEmail = sessionStorage.getItem("Email");
  const storedId = sessionStorage.getItem("UserID");
  const storedRole = sessionStorage.getItem("Role");
  currentUser.value.id = storedId || "";
  currentUser.value.email = storedEmail || "";
  currentUser.value.role = storedRole || "";
  bookingForm.value.booker = currentUser.value.email || "";
};

const isUserOwner = (booker) => {
  return String(booker).trim() === String(currentUser.value.email).trim();
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN");
};

const formatTime = (date) => {
  if (!date) return "N/A";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTime = (dateStr, timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date(dateStr);
  date.setHours(h, m, 0, 0);
  return date;
};

const extractDateTime = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return { dateStr, timeStr };
};

// ========== NEW FORM LOGIC ==========

// Lọc các equipment sẵn có của phòng đang chọn
const availableEquipments = computed(() => {
  const room = rooms.value.find((r) => r.id === selectedRoom.value);
  if (!room) return [];
  
  const equips = [];
  if (room.PC) equips.push({ label: 'Laptop', value: 'PC' });
  if (room.Projector) equips.push({ label: 'Projector', value: 'Projector' });
  if (room.TV) equips.push({ label: 'TV', value: 'TV' });
  if (room.Zoom) equips.push({ label: 'Teams', value: 'Zoom' });
  return equips;
});

// Toggle chọn/bỏ chọn Equipment
const toggleEquipment = (equip) => {
  // Nếu tag là Zoom và đang tick "IT Create Link" thì không cho phép click hủy 
  if (equip.value === "Zoom" && bookingForm.value.itCreateLink) {
    return;
  }
  
  const index = bookingForm.value.equipments.indexOf(equip.value);
  if (index > -1) {
    bookingForm.value.equipments.splice(index, 1);
  } else {
    bookingForm.value.equipments.push(equip.value);
  }
};

const handleItCreateChange = (val) => {
  if (val) {
    bookingForm.value.status = "pending";
    
    if (!bookingForm.value.equipments.includes("Zoom")) {
      bookingForm.value.equipments.push("Zoom");
    }
  } else {
    bookingForm.value.status = "confirmed";
    const zoomIndex = bookingForm.value.equipments.indexOf("Zoom");
    if (zoomIndex > -1) {
      bookingForm.value.equipments.splice(zoomIndex, 1);
    }
  }
};

// Hiển thị khung Meeting Detail tuỳ điều kiện
const showMeetingDetails = computed(() => {
  // Nếu tự tạo Zoom => Hiển thị để điền
  if (bookingForm.value.equipments.includes("Zoom") && !bookingForm.value.itCreateLink) return true;
  // Nếu đang Edit và là lịch có yêu cầu IT tạo link => Hiển thị cho IT điền
  if (isEditMode.value && bookingForm.value.itCreateLink) return true;
  return false;
});

// ========== BOOKING OPERATIONS ==========
const statusColorMap = {
  confirmed: "#67C23A", 
  pending: "#909399", 
  cancelled: "#F56C6C", 
  conflicted: "#E6A23C", 
};

const fetchRoomBookings = async (targetDate = null) => {
  if (!selectedRoom.value) {
    calendarOptions.value.events = [];
    roomBookings.value = [];
    return;
  }

  try {
    const calendarApi = calendarRef.value?.getApi();
    if (!calendarApi) return;

    const start = calendarApi.view.activeStart;
    const end = calendarApi.view.activeEnd;

    const response = await fetchBookingRooms(
      start.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10),
      selectedRoom.value,
    );
    const allBookings = response.data || [];

    const events = allBookings
      .map((booking) => {
        const start = safeParseDateString(booking.start_day);
        const end = safeParseDateString(booking.end_day);

        if (!start || !end) return null;
        const eventColor = statusColorMap[booking.status?.toLowerCase()] || "#409EFF";

        return {
          id: booking.id,
          title: booking.name_meeting || "Meeting",
          start,
          end,
          allDay: false,
          backgroundColor: eventColor,
          borderColor: eventColor,
          extendedProps: {
            status: booking.status,
            booker: booking.user_create || "Unknown",
            description: booking.descriptions || "",
            members: booking.members || "",
          },
        };
      })
      .filter((event) => event !== null); 

    calendarOptions.value.events = events;
    roomBookings.value = allBookings;
  } catch (err) {
    console.error("Error fetching bookings:", err);
    ElMessage.error("Failed to load booking calendar");
  }
};

const handleDateClick = (arg) => {
  if (!selectedRoom.value) {
    ElMessage.warning("Please select a room first");
    return;
  }

  isEditMode.value = false;
  currentEditingId.value = null;

  const { dateStr, timeStr } = extractDateTime(arg.date);
  
  // Reset Form
  bookingForm.value = {
    title: "New meeting",
    date: dateStr,
    startTime: timeStr,
    endTime: "",
    booker: currentUser.value.email || "test@tythac.com.vn",
    description: "",
    members: [],
    equipments: [],
    itCreateLink: false,
    meetingUrl: "",
    meetingId: "",
    passcode: "",
    status: "confirmed", // Mặc định là confirmed nếu không chọn IT link
  };
  showBookingDialog.value = true;
};

const validateBookingForm = () => {
  if (!bookingForm.value.title.trim()) {
    ElMessage.warning("Please enter a meeting title");
    return false;
  }
  if (!bookingForm.value.date) {
    ElMessage.warning("Please select a date");
    return false;
  }
  if (!bookingForm.value.startTime) {
    ElMessage.warning("Please select a start time");
    return false;
  }
  if (!bookingForm.value.endTime) {
    ElMessage.warning("Please select an end time");
    return false;
  }

  const startDate = formatDateTime(
    bookingForm.value.date,
    bookingForm.value.startTime,
  );
  const endDate = formatDateTime(
    bookingForm.value.date,
    bookingForm.value.endTime,
  );

  if (startDate >= endDate) {
    ElMessage.warning("End time must be after start time");
    return false;
  }
  return true;
};

const submitBooking = async () => {
  try {
    if (!validateBookingForm()) return;

    const startDate = new Date(`${bookingForm.value.date}T${bookingForm.value.startTime}`);
    const endDate = new Date(`${bookingForm.value.date}T${bookingForm.value.endTime}`);

    const isConflict = isTimeOverlapping(startDate, endDate, roomBookings.value);

    const startFormatted = formatForAPI(startDate);
    const endFormatted = formatForAPI(endDate);

    if (!startFormatted || !endFormatted) {
      ElMessage.error("Invalid time format");
      return;
    }

    // Determine final status
    // let finalStatus = bookingForm.value.status;
    // if (!isEditMode.value) {
    //   if (bookingForm.value.itCreateLink) finalStatus = 'pending';
    //   else finalStatus = 'confirmed';
    // }

    const bookingData = {
      name_meeting: bookingForm.value.title,
      start_day: startFormatted,
      end_day: endFormatted,
      id_room_meeting: selectedRoom.value,
      user_create: bookingForm.value.booker,
      descriptions: bookingForm.value.description,
      members: bookingForm.value.members.join(", "),
      
      // Data bổ sung
      ...Object.keys(equipmentConfig).reduce((acc, key) => {
        acc[key] = bookingForm.value.equipments.includes(key);
        return acc;
      }, {}),
      IT_create_link: bookingForm.value.itCreateLink,
      meeting_url: bookingForm.value.meetingUrl,
      meeting_id: bookingForm.value.meetingId,
      passcode: bookingForm.value.passcode,
      status: isEditMode.value ? bookingForm.value.status : "",
    };

    if (isEditMode.value) {
      await updateBooking(currentEditingId.value, bookingData);
      ElMessage.success("Booking updated successfully");
    } else {
      await createBooking(bookingData);
      ElMessage.success("Booking created successfully");
    }

    showBookingDialog.value = false;
    await fetchRoomBookings();
  } catch (err) {
    ElMessage.error(err.message || "Có lỗi xảy ra");
  }
};

const editBooking = (booking) => {
  // if (!isUserOwner(booking.user_create)) {
  //   ElMessage.error("You can only edit your own bookings");
  //   return;
  // } 

  isEditMode.value = true;
  currentEditingId.value = booking.id;

  const startDate = safeParseDateString(booking.start_day);
  const endDate = safeParseDateString(booking.end_day);

  if (!startDate || !endDate) {
    ElMessage.error("Invalid date format");
    return;
  }

  const { dateStr: startDateStr, timeStr: startTimeStr } = extractDateTime(startDate);
  const { timeStr: endTimeStr } = extractDateTime(endDate);

  // 1. Quét qua dữ liệu API trả về, nếu thiết bị nào có giá trị 'true' thì nhét tên nó vào mảng
  const activeEquipments = Object.keys(equipmentConfig).filter((key) => booking[key] === true);

  // 2. Xử lý lấy thông tin link (Hỗ trợ cả việc bạn tách object meeting_link riêng hoặc gộp chung)
  const linkData = booking.meeting_link || booking;

  bookingForm.value = {
    title: booking.name_meeting,
    date: startDateStr,
    startTime: startTimeStr,
    endTime: endTimeStr,
    booker: booking.user_create,
    description: booking.descriptions || "",
    members: booking.members ? booking.members.split(",").map((m) => m.trim()) : [],
    
    // Đưa mảng vừa lọc được vào UI để hiển thị sáng/tối cho các nút Tag
    equipments: activeEquipments,
    
    itCreateLink: booking.IT_create_link || false,
    meetingUrl: linkData.meeting_url || "",
    meetingId: linkData.meeting_id || "",
    passcode: linkData.passcode || "",
    status: booking.status || "confirmed",
  };

  showBookingDialog.value = true;
};

const confirmCancel = (bookingId) => {
  const booking = roomBookings.value.find((b) => b.id === bookingId);

  if (!isUserOwner(booking.user_create) && currentUser.value.role !== "ADMIN") {
    ElMessage.error("You can only cancel your own bookings");
    return;
  }

  ElMessageBox.confirm(
    "Are you sure you want to cancel this booking?",
    "Confirm Cancel",
    {
      confirmButtonText: "Cancel",
      cancelButtonText: "Exit",
      type: "warning",
    },
  )
    .then(() => cancelBookingConfirmed(bookingId))
    .catch(() => ElMessage.info("Canceling is unconfirmed!"));
};

const cancelBookingConfirmed = async (bookingId) => {
  try {
    await cancelBooking(bookingId);
    ElMessage.success("Booking canceled successfully");
    await fetchRoomBookings();
  } catch (err) {
    console.error("Error canceled booking:", err);
    ElMessage.error(err.message || "Failed to cancel booking");
  }
};

// ========== EVENT HANDLERS ==========

const handleEventClick = (info) => {
  const event = info.event;
  const room = rooms.value.find((r) => r.id === selectedRoom.value);
  const isOwner = isUserOwner(event.extendedProps.booker);

  const rawBooking = roomBookings.value.find(b => b.id === event.id) || {};
  
  selectedBooking.value = {
    event,
    room,
    isOwner,
    ...rawBooking
  };
  console.log("🚀 ~ handleEventClick ~ selectedBooking.value:", selectedBooking.value)

  showDetailDialog.value = true;
};

const handleEditClick = () => {
  showDetailDialog.value = false;
  editBooking(roomBookings.value.find((b) => b.id === selectedBooking.value.event.id));
};

const handleCancelClick = () => {
  showDetailDialog.value = false;
  confirmCancel(selectedBooking.value.event.id);
};

const handleDatesSet = (arg) => {
  if (selectedRoom.value) {
    const middleDate = new Date(
      arg.start.getTime() + (arg.end.getTime() - arg.start.getTime()) / 2,
    );
    fetchRoomBookings(middleDate);
  }
};

// ========== CALENDAR CONFIG ==========

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: "timeGridWeek",
  locale: "en",
  firstDay: 1,
  scrollTime: "07:00:00",
  slotEventOverlap: false,
  headerToolbar: {
    left: "myPrev,myNext",
    center: "title",
    right: "myToday",
  },
  customButtons: {
    myPrev: {
      icon: "chevron-left",
      click: async () => {
        const api = calendarRef.value.getApi();
        api.prev();
        await fetchRoomBookings();
      },
    },
    myNext: {
      icon: "chevron-right",
      click: async () => {
        const api = calendarRef.value.getApi();
        api.next();
        await fetchRoomBookings();
      },
    },
    myToday: {
      text: "Today",
      click: async () => {
        const api = calendarRef.value.getApi();
        api.today();
        await fetchRoomBookings();
      },
    },
  },
  dayMaxEventRows: true,
  dayMaxEvents: 2,
  views: {
    dayGridMonth: { dayMaxEventRows: 3 },
    timeGridWeek: { eventMaxStack: 2 },
    timeGridDay: { dayMaxEvents: 10 },
  },
  eventTimeFormat: {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
  events: [],
  dateClick: handleDateClick,
  eventClick: handleEventClick,
  datesSet: handleDatesSet,
  eventContent: (arg) => {
    const timeText = arg.timeText ? `${arg.timeText} ` : "";
    return {
      html: `
        <div class="fc-event-main" title="${arg.event.title}">
          <div class="fc-event-time">${timeText}</div>
          <div class="fc-event-title">${arg.event.title}</div>
        </div>
      `,
    };
  },
  aspectRatio: 1.5,
});

// ========== WATCHERS & LIFECYCLE ==========

watch(selectedRoom, () => {
  if (selectedRoom.value) fetchRoomBookings();
});

onMounted(async () => {
  try {
    loadUserData();
    await fetchRooms();
    if (rooms.value.length > 0) {
      selectedRoom.value = rooms.value[0].id || "";
    }
  } catch (err) {
    console.error("Failed to load rooms:", err);
    ElMessage.error("Không thể tải danh sách phòng");
  }
});

let resizeObserver;
onMounted(() => {
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize"));
    });
    const container = document.querySelector(".calendar-container");
    if (container) {
      resizeObserver.observe(container);
    }
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

const getStatusTagType = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed': return 'success';
    case 'pending': return 'warning';
    case 'cancelled': return 'danger';
    case 'conflicted': return 'danger';
    default: return 'info';
  }
};


const formatTimeOnly = (dateString) => {
  const date =
    dateString instanceof Date ? dateString : safeParseDateString(dateString);
  if (!date || isNaN(date.getTime())) return "N/A";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDateTimeRange = (start, end) => {
  return `${formatTimeOnly(start)} - ${formatTimeOnly(end)}`;
};

const formatFullDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const calculateDuration = (start, end) => {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return "N/A";
  }

  const diff = (endDate - startDate) / 1000 / 60;
  const hours = Math.floor(diff / 60);
  const minutes = Math.floor(diff % 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
};

const isTimeOverlapping = (newStart, newEnd, existingBookings) => {
  return existingBookings.some((booking) => {
    if (isEditMode.value && booking.id === currentEditingId.value) {
      return false;
    }

    const existingStart = safeParseDateString(booking.start_day);
    const existingEnd = safeParseDateString(booking.end_day);

    if (!existingStart || !existingEnd) return false;

    return newStart < existingEnd && newEnd > existingStart;
  });
};

const handleTagCreation = () => {
  // Directly resets the typed search input field after a tag is confirmed
  if (selectRef.value) {
    selectRef.value.states.inputValue = ''
  }
}

// --- HÀM LẤY DANH SÁCH THIẾT BỊ TỪ DỮ LIỆU BOOLEAN ---
const getDetailEquipments = (booking) => {
  if (!booking) return [];
  // Lọc ra những thiết bị (keys) có giá trị true trong rawBooking
  return Object.keys(equipmentConfig).filter((key) => booking[key] === true);
};
</script>

<template>
  <div class="meeting-container">
    <div class="header-section">
      <div class="room-selection">
        <el-select
          v-model="selectedRoom"
          placeholder="Select meeting room"
          filterable
          clearable
          @change="fetchRoomBookings"
          :loading="loading"
        >
          <el-option
            v-for="room in rooms"
            :key="room.id"
            :label="room.room_name || room.name"
            :value="room.id"
          />
        </el-select>
      </div>
    </div>

    <div class="calendar-container" v-loading="loading">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>

    <el-dialog
      v-model="showBookingDialog"
      :title="isEditMode ? 'Update Booking' : 'Book a Meeting Room'"
      :close-on-click-modal="false"
      destroy-on-close
      width="500"
      align-center
    >
      <el-form :model="bookingForm" label-position="top" class="p-3">

        <el-form-item label="Title" required>
          <el-input
            v-model="bookingForm.title"
            placeholder="Enter meeting title"
          />
        </el-form-item>

        <div class="flex gap-4">
          <el-form-item label="Date" class="flex-1">
            <el-date-picker
              v-model="bookingForm.date"
              type="date"
              placeholder="Select date"
              style="width: 100%"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              disabled
            />
          </el-form-item>
        </div>

        <div class="flex gap-4">
          <el-form-item label="Start time" class="flex-1">
            <el-time-picker
              v-model="bookingForm.startTime"
              format="HH:mm"
              placeholder="Select start time"
              style="width: 100%"
              value-format="HH:mm"
            />
          </el-form-item>

          <el-form-item label="End time" class="flex-1">
            <el-time-picker
              v-model="bookingForm.endTime"
              format="HH:mm"
              placeholder="Select end time"
              style="width: 100%"
              value-format="HH:mm"
            />
          </el-form-item>
        </div>

        <el-form-item>
          <el-checkbox
            v-model="bookingForm.itCreateLink"
            :disabled="bookingForm.equipments.includes('Zoom') && !bookingForm.itCreateLink"
            @change="handleItCreateChange"
            border
            class="w-full flex"
          >
            <span class="font-bold text-[#303133]">IT Create Meeting Link</span>
          </el-checkbox>
        </el-form-item>

        <el-form-item label="Room Equipment" v-if="availableEquipments.length > 0">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="equip in availableEquipments"
              :key="equip.value"
              @click="toggleEquipment(equip)"
              :class="[
                'cursor-pointer select-none transition-all duration-200 flex items-center gap-1.5 px-2  border rounded-md text-[12px] font-bold whitespace-nowrap uppercase',
                
                // Xử lý hiệu ứng vô hiệu hóa (disabled) cho tag Zoom khi đã chọn IT Create Link
                (equip.value === 'Zoom' && bookingForm.itCreateLink) 
                  ? 'opacity-60 cursor-not-allowed pointer-events-none' // Mờ đi và chặn hiệu ứng hover chuột
                  : 'cursor-pointer',
                
                // Xử lý màu nút theo trạng thái của equipments
                bookingForm.equipments.includes(equip.value)
                  ? equipmentConfig[equip.value]?.classes
                  : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
              ]"
            >
              <el-icon size="18px" class="shrink-0">
                <component :is="equipmentConfig[equip.value]?.icon" />
              </el-icon>
              <span class="tracking-wide">{{ equip.label }}</span>
            </div>
          </div>
        </el-form-item>

        <template v-if="showMeetingDetails">
          <div class="p-4 bg-[#f8f9fa] border border-[#ebeef5] rounded-lg mb-4">
            <el-form-item label="Meeting URL" class="mb-3">
              <el-input v-model="bookingForm.meetingUrl" placeholder="https://zoom.us/..." />
            </el-form-item>
            
            <div class="flex gap-4 mb-3">
              <el-form-item label="Meeting ID" class="flex-1 mb-0">
                <el-input v-model="bookingForm.meetingId" />
              </el-form-item>
              <el-form-item label="Passcode" class="flex-1 mb-0">
                <el-input v-model="bookingForm.passcode" />
              </el-form-item>
            </div>
          </div>
        </template>

        <el-form-item label="Participants">
          <el-select
            ref="selectRef"
            v-model="bookingForm.members"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Type and press Enter"
            :suffix-icon="null"
            :popper-options="{ modifiers: [{ name: 'eventListeners', options: { scroll: false, resize: false } }] }"
            popper-class="hidden-dropdown"
            @change="handleTagCreation"
          >
            <!-- Keep options empty or bind to an array if you want autocomplete suggestions -->
            <el-option v-for="member in []" :key="member" :label="member" :value="member" />
          </el-select>
        </el-form-item>

        <el-form-item label="Booked by">
          <el-input v-model="bookingForm.booker" disabled />
        </el-form-item>

        <el-form-item label="Description" class="mb-0">
          <el-input
            v-model="bookingForm.description"
            type="textarea"
            :rows="3"
            placeholder="Enter description (optional)"
          />
        </el-form-item>

        <el-form-item label="Status" v-if="isEditMode">
          <el-select-v2
            v-model="bookingForm.status"
            :options="statusOptions"
            filterable
            placeholder="Please select Status"
          >
            <template #default="{ item }">
              {{ item.label }}
            </template>
          </el-select-v2>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="p-3 pt-0">
          <el-button @click="showBookingDialog = false">Cancel</el-button>
          <el-button type="primary" @click="submitBooking" :loading="loading">
            {{ isEditMode ? "Update" : "Confirm" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showDetailDialog"
      title="Booking details"
      width="500"
      :show-close="true"
      class="booking-detail-dialog"
      align-center
    >
      <div v-if="selectedBooking" class="booking-detail-content">
        <div class="booking-header">
          <div>
            <h3 class="booking-title">
              {{ selectedBooking.event.title || "Không có tiêu đề" }}
            </h3>
            <div class="booking-time">
              {{
                formatDateTimeRange(
                  selectedBooking.event.start,
                  selectedBooking.event.end,
                )
              }}
            </div>
          </div>
        </div>
        
        <el-descriptions :column="1" border class="booking-info">
          
          <el-descriptions-item label="Status">
            <el-tag 
              :type="getStatusTagType(selectedBooking?.status || selectedBooking.event.extendedProps.status)" 
              class="uppercase font-bold" 
              size="small"
            >
              {{ selectedBooking?.status || selectedBooking.event.extendedProps.status || 'UNKNOWN' }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="Room">
            {{
              selectedBooking.room?.room_name ||
              selectedBooking.room?.name ||
              "Not specified"
            }}
            <span v-if="selectedBooking.room?.floor" class="room-floor">
              (Floor {{ selectedBooking.room.floor }})
            </span>
          </el-descriptions-item>
          
          <el-descriptions-item label="Date">
            {{ formatFullDate(selectedBooking.event.start) }}
          </el-descriptions-item>
          
          <el-descriptions-item label="Time">
            {{ formatTime(selectedBooking.event.start) }} -
            {{ formatTime(selectedBooking.event.end) }}
            ({{
              calculateDuration(
                selectedBooking.event.start,
                selectedBooking.event.end,
              )
            }})
          </el-descriptions-item>

          <el-descriptions-item label="Equipments" v-if="getDetailEquipments(selectedBooking).length > 0">
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="(equip, index) in getDetailEquipments(selectedBooking)" 
                :key="index"
                :class="[
                  'flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-bold whitespace-nowrap uppercase',
                  equipmentConfig[equip]?.classes || 'bg-gray-100 border-gray-200 text-gray-700'
                ]"
              >
                <el-icon size="16px" class="shrink-0" v-if="equipmentConfig[equip]?.icon">
                  <component :is="equipmentConfig[equip].icon" />
                </el-icon>
                
                <span class="tracking-wide">{{ equipmentConfig[equip]?.label || equip }}</span>
              </div>
            </div>
          </el-descriptions-item>

          <template v-if="selectedBooking?.Zoom === true">
            <el-descriptions-item label="Meeting URL">
              <a :href="selectedBooking?.meeting_link?.meeting_url" target="_blank" class="text-blue-600 hover:underline break-all font-medium">
                {{ selectedBooking?.meeting_link?.meeting_url }}
              </a>
            </el-descriptions-item>
            
            <el-descriptions-item label="Meeting ID" v-if="selectedBooking?.meeting_link?.meeting_id">
              <span class="font-medium">{{ selectedBooking?.meeting_link?.meeting_id }}</span>
            </el-descriptions-item>
            
            <el-descriptions-item label="Passcode" v-if="selectedBooking?.meeting_link?.passcode">
              <span class="font-medium">{{ selectedBooking?.meeting_link?.passcode }}</span>
            </el-descriptions-item>
          </template>

          <el-descriptions-item label="Booked by">
            <div class="user-info">
              <span>{{
                selectedBooking.event.extendedProps.booker?.trim() ||
                "Not specified"
              }}</span>
              <el-tag
                v-if="selectedBooking.isOwner"
                type="success"
                size="small"
                effect="plain"
              >
                Yours
              </el-tag>
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item
            v-if="selectedBooking.event.extendedProps.members"
            label="Members"
          >
            {{ selectedBooking.event.extendedProps.members }}
          </el-descriptions-item>
          
          <el-descriptions-item
            v-if="selectedBooking.event.extendedProps.description"
            label="Description"
          >
            <div class="description-text">
              {{ selectedBooking.event.extendedProps.description }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="currentUser.role === 'ADMIN'" type="primary" @click="handleEditClick">Edit</el-button>
          <el-button v-if="selectedBooking?.isOwner || currentUser.role === 'ADMIN'" type="danger" @click="handleCancelClick">Cancel Meeting</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
:deep(.fc-timegrid-col-events) {
  overflow: visible !important;
}
:deep(.fc-timegrid-body) {
  min-height: 600px; 
}
:deep(.fc-timegrid-event-harness) {
  padding-right: 4px !important; 
  box-sizing: border-box;
}
:deep(.fc-v-event) {
  border-radius: 6px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.meeting-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
}
.header-section {
  display: flex;
  gap: 20px;
  align-items: center;
  background: #f5f7fa;
  border-radius: 6px;
  flex-wrap: wrap;
  min-height: 35px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.user-info .label {
  font-weight: 600;
  color: #409eff;
}
:deep(.fc-theme-standard .fc-event) {
  padding: 2px 4px;
  margin: 1px 0;
  font-size: 12px;
  cursor: pointer;
  border: none;
  border-left: 3px solid #4e73df;
  background-color: #f8f9fc;
}
.user-info .value {
  color: #303133;
  font-weight: 500;
}
.room-selection {
  min-width: 300px;
  flex: 1;
}
.calendar-container {
  flex: 1;
  min-height: 600px;
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}
:deep(.fc) {
  height: 100%;
}
:deep(.fc-event) {
  cursor: pointer;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin: 2px 0;
}
:deep(.fc-button-active) {
  background: #409eff;
  color: white;
  border-color: #409eff;
}
.custom-booking-dialog {
  padding: 20px;
}
.booking-detail-content {
  padding: 10px 0;
}
.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 2px solid #f0f0f0;
}
.booking-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}
.booking-status {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.status-confirmed {
  background-color: #f0f9eb;
  color: #67c23a;
}
.booking-content,
.info-group {
  padding: 0;
}
.info-section,
.info-item {
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}
.info-section:last-child,
.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.info-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  font-weight: 500;
}
.info-value {
  font-size: 14px;
  color: #303133;
  display: flex;
  align-items: center;
}
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
}
:deep(.action-buttons .el-button) {
  min-width: 80px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
@media screen and (max-width: 768px) {
  :deep(.fc .fc-toolbar.fc-header-toolbar) {
    display: flex;
    font-size: 12px;
  }
  :deep(.fc-dayGridMonth-view) {
    font-size: 14px;
  }
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  :deep(.fc-theme-standard .fc-event) {
    font-size: 10px;
    margin-top: 2px;
  }
  .room-selection {
    width: 100%;
  }
  .calendar-container {
    padding: 10px;
  }
  .action-buttons {
    flex-direction: column;
  }
}
</style>

<style>
/* 1. Fully hide the dropdown list panel globally or via the custom popper-class */
.hidden-dropdown {
  display: none !important;
}

</style>