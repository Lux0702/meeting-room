// src/hooks/useRoomMeeting.js
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { get, patch, post, put, remove } from "@/api/api";
import { Error } from "@/utils/Notification";

export function useRoomMeeting() {
  const rooms = ref([]);
  const bookings = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Fetch all rooms
  const fetchRooms = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await get("room-meeting");
      rooms.value = response.data || response || [];
      console.log("Rooms loaded:", rooms.value);
      return rooms.value;
    } catch (err) {
      error.value = err.message || "Could not load room list";
      ElMessage.error(error.value);
      console.error("Error fetching rooms:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Fetch bookings
  const fetchBookingRooms = async (start, end, roomId) => {
    loading.value = true;
    error.value = null;
    try {
      if (!start || !end) {
        Error("Date not specified !! ");
      }

      const url = `booking-meeting-no-filter-user?start_date=${start}&end_date=${end}&room=${roomId}`;
      const response = await get(url);

      const responseData = response?.data ?? response;
      const bookingData = Array.isArray(responseData) ? responseData : [];

      if (bookingData.length > 0) {
        console.log("Bookings loaded:", bookingData.length);
      }

      return {
        data: bookingData,
      };
    } catch (err) {
      error.value = err.message || "Could not load booking data";
      console.error("Error in fetchBookingRooms:", err);
      return {
        data: [],
      };
    } finally {
      loading.value = false;
    }
  };

  // Create booking
  const createBooking = async (bookingData) => {
    loading.value = true;
    error.value = null;
    try {
      const { meeting_id, meeting_url, passcode, ...meetingInfo } = bookingData;
      const resInfo = await post("booking-meeting", meetingInfo);
      if (resInfo.id) {
        const meetingLinkInfo = { id: resInfo.id.toString(), meeting_id, meeting_url, passcode };
        const resLinkInfo = await post("booking-meeting/link", meetingLinkInfo);
        console.log("🚀 ~ createBooking ~ resLinkInfo:", resLinkInfo)
      }
      
      return resInfo;
    } catch (err) {
      error.value = err.message || "Could not book room";
      ElMessage.error(error.value);
      console.error("Error creating booking:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update booking
  const updateBooking = async (bookingId, bookingData) => {
    loading.value = true;
    error.value = null;
    try {
      const { meeting_id, meeting_url, passcode, ...meetingInfo } = bookingData;
      const url = `booking-meeting/${bookingId}`;
      const resInfo = await put(url, meetingInfo);

      if (resInfo.id) {
        const meetingLinkInfo = { id: resInfo.id.toString(), meeting_id, meeting_url, passcode };
        const resLinkInfo = await post("booking-meeting/link", meetingLinkInfo);
      }

      return resInfo;
    } catch (err) {
      error.value = err.message || "Could not update room";
      ElMessage.error(error.value);
      console.error("Error updating booking:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete booking
  const cancelBooking = async (bookingId) => {
    loading.value = true;
    error.value = null;
    try {
      const url = `booking-meeting/${bookingId}/cancel`;
      const response = await patch(url);
      return response;
    } catch (err) {
      error.value = err.message || "Could not cancel meeting";
      ElMessage.error(error.value);
      console.error("Error cancel meeting:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    rooms,
    bookings,
    loading,
    error,
    fetchRooms,
    createBooking,
    fetchBookingRooms,
    updateBooking,
    cancelBooking,
  };
}
