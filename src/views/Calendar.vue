<template>
  <div class="calendar-container">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>

  <el-dialog v-model="showDetailEvent" title="Meeting details" width="500" align-center>
    <el-descriptions :column="1" border class="meeting-desc">
      <el-descriptions-item label="Meeting name">
        {{ meetingDetail?.name_meeting }}
      </el-descriptions-item>
      <el-descriptions-item label="Meeting room">
        {{ meetingDetail?.room_name }}
      </el-descriptions-item>
      <el-descriptions-item label="Department">
        {{ meetingDetail?.dep_name }}
      </el-descriptions-item>
      <el-descriptions-item label="Meeting date">
        {{ getDate(meetingDetail?.start_day) }}
      </el-descriptions-item>
      <el-descriptions-item label="Time">
        {{ getTime(meetingDetail?.start_day) }} -
        {{ getTime(meetingDetail?.end_day) }}
      </el-descriptions-item>
      <el-descriptions-item label="Participants">
        {{ meetingDetail?.members }}
      </el-descriptions-item>
      <el-descriptions-item label="Description">
        {{ meetingDetail?.descriptions }}
      </el-descriptions-item>
      <el-descriptions-item label="Creator">
        {{ meetingDetail?.user_create }}
      </el-descriptions-item>
      <el-descriptions-item label="Created date">
        {{ meetingDetail?.user_created }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="showDetailEvent = false">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { isCollapse } from "@/hooks/useSidebar";
import { get } from "@/api/api";

const showDetailEvent = ref(false);
const ListEvent = ref([]);
const meetingDetail = ref(null);
const calendarRef = ref(null);

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: "dayGridMonth",
  locale: "en",
  firstDay: 1,
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
        await loadEvents();
      },
    },
    myNext: {
      icon: "chevron-right",
      click: async () => {
        const api = calendarRef.value.getApi();
        api.next();
        await loadEvents();
      },
    },
    myToday: {
      text: "Today",
      click: async () => {
        const api = calendarRef.value.getApi();
        api.today();
        await loadEvents();
      },
    },
  },
  dayMaxEventRows: true,
  dayMaxEvents: 3,
  views: {
    dayGridMonth: {
      dayMaxEventRows: 3,
    },
    timeGridWeek: {
      dayMaxEvents: 5,
    },
    timeGridDay: {
      dayMaxEvents: 10,
    },
  },
  eventTimeFormat: {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
  events: ListEvent.value,
  eventClick: (info) => {
    const event = info.event;
    meetingDetail.value = {
      title: event.title,
      start: event.start,
      end: event.end,
      ...event.extendedProps,
    };
    document.querySelector(".fc-more-popover")?.remove();
    showDetailEvent.value = true;
  },
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
});

const getCurrentYearMonth = () => {
  const api = calendarRef.value?.getApi();
  const start = api.view.activeStart;
  const end = api.view.activeEnd;
  return {
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  };
};

const loadEvents = async () => {
  const Param = getCurrentYearMonth();
  try {
    const res = (await get("booking-meeting", Param)) || [];
    const events = res.map((item) => ({
      ...item,
      title: item.name_meeting,
      start: item.start_day,
      end: item.end_day,
    }));
    ListEvent.value = events;
    calendarOptions.value.events = events;
  } catch (error) {
    console.error("Load booking meetings failed:", error);
  }
};

function getDate(datetime) {
  return datetime?.split(" ")[0] || "";
}

function getTime(datetime) {
  if (!datetime) return "";
  const time = datetime.split(" ")[1];
  return time?.substring(0, 5) || "";
}

const handleResize = () => {
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi) {
    calendarApi.updateSize();
  }
};

let resizeObserver;
onMounted(() => {
  window.addEventListener("resize", handleResize);
  resizeObserver = new ResizeObserver(handleResize);
  const container = document.querySelector(".calendar-container");
  if (container) {
    resizeObserver.observe(container);
  }
  loadEvents();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.calendar-container {
  padding: 10px;
  /* Thay vì 100% hay min-height, hãy dùng calc để khóa chặt chiều cao bằng màn hình */
  height: calc(100vh - 60px); 
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box; /* Cực kỳ quan trọng để padding không cộng dồn vào height */
}

/* Đảm bảo FullCalendar nằm gọn và tự sinh thanh cuộn bên trong nó thay vì container ngoài */
:deep(.fc) {
  height: 100%;
}

/* Bật thanh cuộn dọc cho nội dung của Calendar */
:deep(.fc-scroller-liquid-absolute) {
  overflow-y: auto !important;
}

:deep(.el-dialog) {
  padding: 0px;
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 12px 20px;
  background-color: #f1f1f1 !important;
  font-size: 1.1em;
  position: relative;
  margin: 0;
}

:deep(.el-dialog__headerbtn) {
  top: 12px;
  right: 20px;
}

:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  min-width: 120px;
  background-color: #f8f9fa;
}

/* Event styles */
:deep(.fc-event) {
  padding: 2px 4px;
  margin: 1px 0;
  font-size: 12px;
  cursor: pointer;
  border: none;
  border-left: 3px solid #4e73df;
  background-color: #f8f9fc;
}

:deep(.fc-daygrid-event) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mobile styles */
@media screen and (max-width: 768px) {
  .calendar-container {
    padding: 5px;
    min-height: 85vh;
  }

  :deep(.fc .fc-toolbar.fc-header-toolbar) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    padding: 5px 0;
  }

  :deep(.fc-toolbar-chunk) {
    display: flex;
  }

  :deep(.fc-toolbar-title) {
    font-size: 14px;
    text-align: center;
    margin: 5px 0;
  }

  :deep(.fc-button) {
    padding: 4px 8px;
    font-size: 11px;
    height: auto;
  }

  :deep(.fc-dayGridMonth-view) {
    font-size: 12px;
  }

  :deep(.fc-event) {
    font-size: 10px;
    padding: 1px 3px;
  }

  :deep(.fc-more-popover) {
    max-width: 95vw;
    left: 2.5vw !important;
  }

  :deep(.fc-popover-body) {
    max-height: 60vh;
    overflow-y: auto;
  }
}

/* For very small screens */
@media screen and (max-width: 480px) {
  :deep(.fc-event) {
    font-size: 9px;
    padding: 0 2px;
  }

  :deep(.fc-dayGridMonth-view) {
    font-size: 10px;
  }

  :deep(.fc-col-header-cell-cushion) {
    padding: 2px;
  }
}
</style>
