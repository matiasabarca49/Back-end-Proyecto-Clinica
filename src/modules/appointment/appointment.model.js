import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
import { toothSchema } from "../../shared/schemas/tooth.schema.js";

// Estados en los que el turno ocupa su horario. Un turno cancelado se conserva pero libera sus slots
export const ACTIVE_STATUSES = ["pending", "confirmed", "waiting", "called", "noshow", "rescheduled", "finalized"];

// Creación del Modelo para Appointments
const appointmentSchema = new mongoose.Schema({
    date: {
        type: String,  // Solo se almacenará la fecha, sin hora -> YYYY-MM-DD
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/  // valida formato YYYY-MM-DD
    },
    slots: {
        type: [Number], // Minuto del día en que empieza cada slot (ej: 14:00 y 14:30 → [840, 870])
        required: true,
        validate: {
            validator: function(slots) {
                return slots.every(s => Number.isInteger(s) && s >= 0 && s < 1440);
            },
            message: "Los slots deben ser minutos del día entre 0 y 1439"
            }
    },
    // Duración de cada slot en minutos: la frecuencia del doctor al reservar.
    // Se guarda en el turno para que un cambio de frecuencia no altere los turnos ya reservados
    duration: {
        type: Number,
        required: true,
        min: 5,
        max: 240
    },
    typeAppointment: {
        type: String,
        enum: ["consulta", "cirugia", "control", "tratamiento"],
        required: true,
    },
    room: {
        type: String
    },
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctors',
        required: true
    },
    patientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patients',
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed","waiting","called", "noshow", "rescheduled","finalized", "canceled"],
        required: true
    },
    observations: {
        type: String,
        maxlength: 500
    },
    // Dientes tratados en este turno (estado completo de cada diente). Empieza vacío.
    // Se guarda en el odontograma del paciente al finalizar el turno.
    odontogram: {
        type: [toothSchema],
        default: []
    }
}, {timestamps: {createdAt: 'created', updatedAt: 'lastChange'}});
mongoose.plugin(mongoosePaginate)

// Solo los turnos activos ocupan su horario. Mongo usa estos índices únicamente en consultas
// que filtran por status: { $in: ACTIVE_STATUSES }
const activeOnly = { partialFilterExpression: { status: { $in: ACTIVE_STATUSES } } };

// Constraint para evitar que un doctor tenga dos turnos activos que empiecen a la misma hora
appointmentSchema.index({ doctorID: 1, date: 1, slots: 1 }, { unique: true, ...activeOnly });

//Constraint para evitar que un paciente tenga dos turnos activos que empiecen a la misma hora
appointmentSchema.index({ patientID: 1, date: 1, slots: 1 }, { unique: true, ...activeOnly });

// Population
appointmentSchema.pre("find", function() {
    this.populate("doctorID").populate("patientID");
});
appointmentSchema.pre("findOne", function() {
    this.populate("doctorID").populate("patientID");
});

// Exportación del Modelo
export const Appointment = mongoose.model("appointments", appointmentSchema);
