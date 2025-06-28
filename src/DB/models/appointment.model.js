// models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  
  userName: { type: String, required: true },
 
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'doctor', 
    required: true 
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  
  
  
},
{
  timestamps: true
}
);
 const appointmentModel= mongoose.models.Appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel