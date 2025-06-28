import appointmentModel from "../../DB/models/appointment.model.js";
import doctorModel from "../../DB/models/doctor.model.js";
import userModel from "../../DB/models/user.model.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";

export const parseDate = (str) => {
  if (str instanceof Date && !isNaN(str)) return str;

  // If it's in "D/M/YYYY" format
  if (typeof str === "string" && str.includes("/")) {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  // Try to parse ISO or Date string
  const parsed = new Date(str);
  if (isNaN(parsed)) throw new Error("Invalid date format. Use D/M/YYYY");

  return parsed;
};

// Format Date object to "D/M/YYYY"
export const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

// Format time string to "hh:mm AM/PM"
export const formatTime = (timeStr) => {
  const [hour, minute] = timeStr.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return`${hour12}:${minute.toString().padStart(2, "0")} ${suffix}`
};
export const createAppointment = asyncHandler(async (req, res, next) => {
  try {
    const { userName, date, time } = req.body;

    const user = await userModel.findOne({ name: userName });
    if (!user) return next(new Error("User not found"));

    // Parse date from string input
    const parsedDate = parseDate(date);

    // Prevent past booking
    if (parsedDate < new Date()) {
      return next(new Error("Invalid date: You cannot book a past date"));
    }

    const formattedTime = formatTime(time);

    const doctor = await doctorModel.findOne({ userId: req.user._id });
    if (!doctor) return next(new Error("Doctor not found"));

    // Check if appointment exists
    const existing = await appointmentModel.findOne({
      doctorId: req.user._id,
      date: parsedDate,
      time: formattedTime,
    });
    if (existing) return next(new Error("This time slot is already booked"));

    // Create appointment
    const appointment = await appointmentModel.create({
      userName,
      doctorId: req.user._id,
      userId: user._id,
      date: parsedDate,
      time: formattedTime,
    });

    // Response
    res.status(201).json({
      msg: "Appointment booked successfully",
      appointment: {
        ...appointment._doc,
        date: formatDate(appointment.date),
        time: appointment.time,
      },
    });
  } catch (error) {
    next(error);
  }
});
 
  export const addAppointment=asyncHandler(async(req,res,next)=>{
    const appointment = await appointmentModel.create({
      ...req.body,
      doctorId: req.user._id,
    });

    res.status(201).json({msg:"Appointment created successfully", appointment});
  })

   export const updateAppointment=asyncHandler(async(req,res,next)=>{
   if(req.body.date){
     const parsedDate = parseDate(req.body.date);
     if (!parsedDate || isNaN(parsedDate.getTime())) {
       return next(new Error("Invalid date format. Use D/M/YYYY"));
     }
     if (parsedDate < new Date()) {
       return next(new Error("Invalid date: You cannot book a past date"));
     }
     req.body.date = parsedDate;
   }
    if(req.body.time){
      req.body.time = formatTime(req.body.time);
    }
    const appointment = await appointmentModel.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!appointment) return next(new Error("Appointment not found"));
    res.status(201).json({msg:"Appointment updated successfully", appointment:{
      ...appointment._doc,
      date: formatDate(appointment.date),
      time: appointment.time
    }});
  })
  export const deleteAppointment=asyncHandler(async(req,res,next)=>{
    const appointment = await appointmentModel.findOneAndDelete(
      { _id: req.params.id, doctorId: req.user._id }
    );
    if (!appointment) return next(new Error("Appointment not found"));
    
    res.status(201).json({msg:"Appointment deleted successfully", appointment});
  })

  export const getAppointment=asyncHandler(async(req,res,next)=>{
    const appointment =await appointmentModel.find({ doctorId: req.user._id}).populate('userId', 'name email')
    
    if (!appointment) return next(new Error("Appointment not found"));
    
    res.status(201).json({msg:"Appointment deleted successfully", appointment});
  })